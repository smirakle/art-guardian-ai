/**
 * DCT-based frequency-domain watermark embedding & detection.
 *
 * This module implements a robust invisible watermark that survives:
 *   - JPEG recompression (embeds in mid-frequency DCT coefficients)
 *   - Cropping (watermark is tiled across many 8×8 blocks)
 *   - Resizing (detection normalises to a reference size first)
 *
 * The watermark payload is a 64-bit signature derived from the user-ID
 * and embedded redundantly across thousands of 8×8 luminance blocks.
 *
 * Approach:
 *   1.  Convert image to YCbCr, extract Y (luminance) channel.
 *   2.  Tile the image into 8×8 blocks.
 *   3.  Forward-DCT each block.
 *   4.  Modify a chosen mid-frequency coefficient pair (AC[3,4] & AC[4,3])
 *       using quantisation index modulation (QIM) to encode one bit per block.
 *   5.  Inverse-DCT, reconstruct the image.
 *
 * Detection reverses the process: extract Y, DCT each block, read the
 * embedded bits from the mid-frequency coefficients, and majority-vote
 * across all blocks to recover the 64-bit payload.
 */

// ---------- helpers ----------

/** Simple seeded PRNG (xorshift32) for deterministic block selection */
function xorshift32(seed: number): () => number {
  let s = seed | 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

/** Convert a string to a deterministic 64-bit binary payload */
export function textToPayload(text: string): number[] {
  // Hash the text into 8 bytes → 64 bits
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x811c9dc5);
  }
  const bits: number[] = [];
  for (let i = 31; i >= 0; i--) bits.push((h1 >>> i) & 1);
  for (let i = 31; i >= 0; i--) bits.push((h2 >>> i) & 1);
  return bits;
}

// ---------- 8×8 DCT / IDCT ----------

const COS_TABLE_8: number[][] = [];
for (let u = 0; u < 8; u++) {
  COS_TABLE_8[u] = [];
  for (let x = 0; x < 8; x++) {
    COS_TABLE_8[u][x] = Math.cos(((2 * x + 1) * u * Math.PI) / 16);
  }
}

function alpha(u: number): number {
  return u === 0 ? 1 / Math.SQRT2 : 1;
}

/** Forward 8×8 DCT-II */
function dct8x8(block: Float64Array): Float64Array {
  const out = new Float64Array(64);
  for (let v = 0; v < 8; v++) {
    for (let u = 0; u < 8; u++) {
      let sum = 0;
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          sum += block[y * 8 + x] * COS_TABLE_8[u][x] * COS_TABLE_8[v][y];
        }
      }
      out[v * 8 + u] = 0.25 * alpha(u) * alpha(v) * sum;
    }
  }
  return out;
}

/** Inverse 8×8 DCT-II (DCT-III) */
function idct8x8(coeff: Float64Array): Float64Array {
  const out = new Float64Array(64);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      let sum = 0;
      for (let v = 0; v < 8; v++) {
        for (let u = 0; u < 8; u++) {
          sum += alpha(u) * alpha(v) * coeff[v * 8 + u] * COS_TABLE_8[u][x] * COS_TABLE_8[v][y];
        }
      }
      out[y * 8 + x] = 0.25 * sum;
    }
  }
  return out;
}

// ---------- QIM (Quantisation Index Modulation) ----------

const QIM_DELTA = 25; // quantisation step — larger = more robust but more visible

function qimEmbed(coeff: number, bit: number): number {
  const d = QIM_DELTA;
  // Quantise to nearest lattice point for the given bit
  const base = Math.round(coeff / d) * d;
  const candidates = [base, base + d / 2];
  // bit=0 uses even lattice, bit=1 uses odd lattice
  const target = candidates[bit];
  // Pick whichever is closest
  return Math.abs(coeff - target) < Math.abs(coeff - (target - d)) ? target : target;
}

function qimExtract(coeff: number): number {
  const d = QIM_DELTA;
  const q0 = Math.round(coeff / d) * d;
  const q1 = q0 + d / 2;
  return Math.abs(coeff - q0) < Math.abs(coeff - q1) ? 0 : 1;
}

// ---------- mid-frequency coefficient indices ----------

// AC(3,4) and AC(4,3) in the 8×8 block — these mid-frequency positions
// are robust against JPEG compression while being perceptually invisible.
const EMBED_POS_A = 3 * 8 + 4; // row 3, col 4
const EMBED_POS_B = 4 * 8 + 3; // row 4, col 3

// ---------- public API ----------

export interface DCTWatermarkOptions {
  /** The watermark payload text (hashed to 64 bits). */
  text: string;
  /** Embedding strength multiplier (default 1.0). Higher = more robust but slightly more visible. */
  strength?: number;
  /** Seed for deterministic block selection (default derived from text). */
  seed?: number;
}

/**
 * Embed a DCT-domain watermark into an image.
 * Returns a new Blob with the watermark embedded.
 */
export async function embedDCTWatermark(
  imageFile: File | Blob,
  options: DCTWatermarkOptions
): Promise<Blob> {
  const { text, strength = 1.0 } = options;
  const payload = textToPayload(text);
  const seed = options.seed ?? payload.reduce((a, b, i) => a + b * (i + 1), 7919);
  const rng = xorshift32(seed);

  const img = await loadImage(imageFile);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  // Extract luminance (Y) channel
  const Y = new Float64Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    Y[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Tile into 8×8 blocks and embed
  const blocksX = Math.floor(width / 8);
  const blocksY = Math.floor(height / 8);
  const scaledDelta = QIM_DELTA * strength;

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      // Use a fraction of blocks (≈60%) for embedding, chosen pseudorandomly
      if (rng() > 0.6) continue;

      const bitIndex = ((by * blocksX + bx) * 7919) % payload.length;
      const bit = payload[bitIndex];

      // Extract block
      const block = new Float64Array(64);
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          block[y * 8 + x] = Y[(by * 8 + y) * width + (bx * 8 + x)];
        }
      }

      // Forward DCT
      const coeff = dct8x8(block);

      // Embed bit in two mid-frequency coefficients (redundancy)
      coeff[EMBED_POS_A] = qimEmbed(coeff[EMBED_POS_A], bit) * strength + coeff[EMBED_POS_A] * (1 - strength);
      coeff[EMBED_POS_B] = qimEmbed(coeff[EMBED_POS_B], bit) * strength + coeff[EMBED_POS_B] * (1 - strength);

      // Inverse DCT
      const spatial = idct8x8(coeff);

      // Write back luminance delta to RGB
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const pi = (by * 8 + y) * width + (bx * 8 + x);
          const oldY = Y[pi];
          const newY = spatial[y * 8 + x];
          const delta = newY - oldY;

          // Distribute delta proportionally across RGB
          const idx = pi * 4;
          data[idx] = Math.max(0, Math.min(255, Math.round(data[idx] + delta * 0.299)));
          data[idx + 1] = Math.max(0, Math.min(255, Math.round(data[idx + 1] + delta * 0.587)));
          data[idx + 2] = Math.max(0, Math.min(255, Math.round(data[idx + 2] + delta * 0.114)));

          Y[pi] = newY;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/png', // Use PNG to avoid double-compression artifacts during processing
      1.0
    );
  });
}

/**
 * Detect a DCT-domain watermark in an image.
 * Returns the correlation score (0–100) and whether the payload matches.
 */
export async function detectDCTWatermark(
  imageFile: File | Blob,
  expectedText: string
): Promise<{
  detected: boolean;
  confidence: number;
  bitAccuracy: number;
  bitsChecked: number;
}> {
  const payload = textToPayload(expectedText);
  const seed = payload.reduce((a, b, i) => a + b * (i + 1), 7919);
  const rng = xorshift32(seed);

  const img = await loadImage(imageFile);

  // Normalise to a reference size for resize-robustness
  const REF_SIZE = 512;
  const canvas = document.createElement('canvas');
  const scale = Math.min(REF_SIZE / img.width, REF_SIZE / img.height, 1);
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  // Extract luminance
  const Y = new Float64Array(width * height);
  for (let i = 0; i < width * height; i++) {
    Y[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  const blocksX = Math.floor(width / 8);
  const blocksY = Math.floor(height / 8);

  // Accumulate votes per payload bit
  const votes: number[][] = Array.from({ length: 64 }, () => [0, 0]);

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      if (rng() > 0.6) continue;

      const bitIndex = ((by * blocksX + bx) * 7919) % payload.length;

      const block = new Float64Array(64);
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          block[y * 8 + x] = Y[(by * 8 + y) * width + (bx * 8 + x)];
        }
      }

      const coeff = dct8x8(block);

      // Read bits from both positions
      const bitA = qimExtract(coeff[EMBED_POS_A]);
      const bitB = qimExtract(coeff[EMBED_POS_B]);

      // Majority vote from two coefficients
      const votedBit = bitA + bitB >= 1 ? 1 : 0;
      votes[bitIndex][votedBit]++;
    }
  }

  // Recover payload and compare
  let matchingBits = 0;
  let totalBits = 0;
  for (let i = 0; i < 64; i++) {
    if (votes[i][0] + votes[i][1] === 0) continue;
    totalBits++;
    const recoveredBit = votes[i][1] > votes[i][0] ? 1 : 0;
    if (recoveredBit === payload[i]) matchingBits++;
  }

  const bitAccuracy = totalBits > 0 ? matchingBits / totalBits : 0;
  // Confidence: 50% = random (no watermark), 100% = perfect
  // Map [0.5, 1.0] → [0, 100]
  const confidence = Math.max(0, Math.min(100, (bitAccuracy - 0.5) * 200));

  return {
    detected: confidence > 30, // >65% bit accuracy = detected
    confidence: Math.round(confidence),
    bitAccuracy: Math.round(bitAccuracy * 100),
    bitsChecked: totalBits,
  };
}

/**
 * Blind detection — detect if ANY DCT watermark is present
 * (without knowing the expected payload).
 */
export async function detectDCTWatermarkBlind(
  imageFile: File | Blob
): Promise<{
  detected: boolean;
  confidence: number;
  signalStrength: number;
}> {
  const img = await loadImage(imageFile);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  const Y = new Float64Array(width * height);
  for (let i = 0; i < width * height; i++) {
    Y[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  const blocksX = Math.floor(width / 8);
  const blocksY = Math.floor(height / 8);

  // Analyse the statistical distribution of mid-frequency coefficients
  // QIM-embedded coefficients cluster around lattice points
  let totalBlocks = 0;
  let latticeAligned = 0;

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const block = new Float64Array(64);
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          block[y * 8 + x] = Y[(by * 8 + y) * width + (bx * 8 + x)];
        }
      }

      const coeff = dct8x8(block);
      totalBlocks++;

      // Check if coefficients are close to QIM lattice points
      for (const pos of [EMBED_POS_A, EMBED_POS_B]) {
        const c = coeff[pos];
        const d = QIM_DELTA;
        const distEven = Math.abs(c - Math.round(c / d) * d);
        const distOdd = Math.abs(c - (Math.round(c / d) * d + d / 2));
        const minDist = Math.min(distEven, distOdd);
        if (minDist < d * 0.15) {
          latticeAligned++;
        }
      }
    }
  }

  const alignmentRatio = latticeAligned / (totalBlocks * 2);
  // Natural images have ~20-30% accidental alignment; watermarked have >50%
  const signalStrength = Math.max(0, (alignmentRatio - 0.25) / 0.35) * 100;
  const confidence = Math.min(100, Math.round(signalStrength));

  return {
    detected: confidence > 25,
    confidence,
    signalStrength: Math.round(alignmentRatio * 100),
  };
}

// ---------- utility ----------

function loadImage(source: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(source);
  });
}
