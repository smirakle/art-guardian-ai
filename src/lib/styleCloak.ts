import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

export type CloakOptions = {
  strength?: number;      // 0..1 overall intensity
  frequency?: number;     // 2..16 spatial frequency
  colorJitter?: number;   // 0..1 small color jitter
  useSegmentation?: boolean; // segment subject only
};

const MAX_DIM = 2048;

function clamp(v: number, min = 0, max = 255) {
  return Math.max(min, Math.min(max, v));
}

function prng(x: number, y: number) {
  // Simple hash-based PRNG for stable per-pixel noise
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function resizeToMax(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');
  let { naturalWidth: w, naturalHeight: h } = img;
  if (w > MAX_DIM || h > MAX_DIM) {
    const scale = Math.min(MAX_DIM / w, MAX_DIM / h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  c.width = w; c.height = h;
  ctx.drawImage(img, 0, 0, w, h);
  return c;
}

async function getSegmentationMask(dataUrl: string): Promise<Float32Array | null> {
  try {
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', { device: 'webgpu' });
    const result: any = await segmenter(dataUrl);
    if (!result || !Array.isArray(result) || !result[0]?.mask?.data) return null;
    return result[0].mask.data as Float32Array;
  } catch (e) {
    console.warn('Segmentation unavailable, proceeding without mask', e);
    return null;
  }
}

export async function cloakImageFromFile(file: File, options: CloakOptions = {}): Promise<Blob> {
  const img = document.createElement('img');
  img.src = URL.createObjectURL(file);
  await new Promise((res, rej) => { img.onload = () => res(null); img.onerror = rej; });
  try {
    return await cloakImage(img, options);
  } finally {
    URL.revokeObjectURL(img.src);
  }
}

export async function cloakImage(img: HTMLImageElement, options: CloakOptions = {}): Promise<Blob> {
  const strength = clamp((options.strength ?? 0.35) * 255, 0, 64); // cap subtle perturbation
  const frequency = Math.max(2, Math.min(16, Math.floor(options.frequency ?? 8)));
  const colorJitter = Math.max(0, Math.min(1, options.colorJitter ?? 0.1));

  // Prepare canvas
  const baseCanvas = resizeToMax(img);
  const w = baseCanvas.width, h = baseCanvas.height;
  const ctx = baseCanvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Optional segmentation
  let maskArr: Float32Array | null = null;
  if (options.useSegmentation) {
    const dataURL = baseCanvas.toDataURL('image/jpeg', 0.85);
    maskArr = await getSegmentationMask(dataURL);
  }

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Apply high-frequency perturbations + slight color jitter
  // Pattern: mix of sin/cos grid and hashed blue noise, modulated by segmentation mask
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (maskArr) {
        const m = maskArr[y * w + x] ?? 1; // 0..1
        if (m < 0.3) continue; // focus on subject
      }

      const gx = Math.sin((x / frequency) * 2 * Math.PI) * Math.cos((y / frequency) * 2 * Math.PI);
      const noise = prng(x, y) * 2 - 1; // -1..1
      const hf = (gx * 0.6 + noise * 0.4) * (strength / 6); // perturbation magnitude ~ [-X, X]

      // channel-wise subtle changes
      const jitterR = (prng(x + 11.1, y + 7.7) - 0.5) * 2 * colorJitter * 6;
      const jitterG = (prng(x + 23.3, y + 3.1) - 0.5) * 2 * colorJitter * 6;
      const jitterB = (prng(x + 5.9, y + 19.4) - 0.5) * 2 * colorJitter * 6;

      data[idx]   = clamp(data[idx]   + hf + jitterR);
      data[idx+1] = clamp(data[idx+1] + hf + jitterG);
      data[idx+2] = clamp(data[idx+2] + hf + jitterB);
      // alpha unchanged
    }
  }

  // Slight local contrast normalization to keep perceptual similarity
  // Simple unsharp-mask-like pass
  const copy = new Uint8ClampedArray(data);
  const radius = 1;
  for (let y = radius; y < h - radius; y++) {
    for (let x = radius; x < w - radius; x++) {
      const idx = (y * w + x) * 4;
      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const j = ((y + dy) * w + (x + dx)) * 4;
          sumR += copy[j]; sumG += copy[j+1]; sumB += copy[j+2]; count++;
        }
      }
      const avgR = sumR / count, avgG = sumG / count, avgB = sumB / count;
      data[idx]   = clamp(copy[idx]   + (copy[idx]   - avgR) * 0.08);
      data[idx+1] = clamp(copy[idx+1] + (copy[idx+1] - avgG) * 0.08);
      data[idx+2] = clamp(copy[idx+2] + (copy[idx+2] - avgB) * 0.08);
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return await new Promise<Blob>((resolve, reject) => {
    baseCanvas.toBlob((blob) => {
      if (blob) resolve(blob); else reject(new Error('Failed to create cloaked image blob'));
    }, 'image/png', 0.95);
  });
}
