import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";
import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
} from "npm:@imagemagick/magick-wasm@0.0.30";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize ImageMagick WASM at module level
let magickInitialized = false;

async function ensureMagickInitialized() {
  if (!magickInitialized) {
    const wasmUrl = new URL(
      "magick.wasm",
      import.meta.resolve("npm:@imagemagick/magick-wasm@0.0.30")
    );
    const wasmBytes = await fetch(wasmUrl).then(res => res.arrayBuffer());
    await initializeImageMagick(new Uint8Array(wasmBytes));
    magickInitialized = true;
    console.log("ImageMagick WASM initialized");
  }
}

// ============= IMAGE PROCESSING ALGORITHMS =============

function clamp(v: number, min = 0, max = 255): number {
  return Math.max(min, Math.min(max, v));
}

// PRNG for stable per-pixel noise (same as web app)
function prng(x: number, y: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

// Style Cloak: High-frequency perturbations that confuse AI models
function applyStyleCloak(
  data: Uint8Array,
  width: number,
  height: number,
  options: { strength: number; frequency: number; colorJitter: number }
): void {
  const { strength, frequency, colorJitter } = options;
  const perturbStrength = clamp(strength * 255, 0, 64) / 6;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // High-frequency grid pattern (sin/cos)
      const gx = Math.sin((x / frequency) * 2 * Math.PI) *
                 Math.cos((y / frequency) * 2 * Math.PI);
      
      // Blue noise from PRNG
      const noise = prng(x, y) * 2 - 1;
      
      // Combined perturbation
      const hf = (gx * 0.6 + noise * 0.4) * perturbStrength;

      // Per-channel color jitter
      const jitterR = (prng(x + 11.1, y + 7.7) - 0.5) * 2 * colorJitter * 6;
      const jitterG = (prng(x + 23.3, y + 3.1) - 0.5) * 2 * colorJitter * 6;
      const jitterB = (prng(x + 5.9, y + 19.4) - 0.5) * 2 * colorJitter * 6;

      data[idx] = clamp(data[idx] + hf + jitterR);
      data[idx + 1] = clamp(data[idx + 1] + hf + jitterG);
      data[idx + 2] = clamp(data[idx + 2] + hf + jitterB);
    }
  }
}

// Local contrast normalization (unsharp mask-like pass)
function applyContrastNormalization(
  data: Uint8Array,
  width: number,
  height: number
): void {
  const copy = new Uint8Array(data);
  const radius = 1;

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const idx = (y * width + x) * 4;
      let sumR = 0, sumG = 0, sumB = 0, count = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const j = ((y + dy) * width + (x + dx)) * 4;
          sumR += copy[j];
          sumG += copy[j + 1];
          sumB += copy[j + 2];
          count++;
        }
      }

      const avgR = sumR / count;
      const avgG = sumG / count;
      const avgB = sumB / count;

      data[idx] = clamp(copy[idx] + (copy[idx] - avgR) * 0.08);
      data[idx + 1] = clamp(copy[idx + 1] + (copy[idx + 1] - avgG) * 0.08);
      data[idx + 2] = clamp(copy[idx + 2] + (copy[idx + 2] - avgB) * 0.08);
    }
  }
}

// Invisible Watermark: LSB pattern embedding
function applyInvisibleWatermark(
  data: Uint8Array,
  width: number,
  height: number,
  watermarkId: string
): void {
  const pattern = watermarkId.split('').map(c => c.charCodeAt(0) % 2);
  const patternLength = pattern.length;
  const gridSize = 16;
  let patternIdx = 0;

  for (let y = 0; y < height; y += gridSize) {
    for (let x = 0; x < width; x += gridSize) {
      const idx = (y * width + x) * 4;
      if (idx + 2 < data.length) {
        const bit = pattern[patternIdx % patternLength];
        data[idx + 2] = (data[idx + 2] & 0xFE) | bit;
        patternIdx++;
      }
    }
  }
}

// AI Training Block: Steganographic markers
function applyAiTrainingBlock(
  data: Uint8Array,
  width: number,
  height: number,
  protectionId: string
): void {
  const signature = `TSMO-NO-AI-TRAIN-${protectionId}`;
  const signatureBytes = new TextEncoder().encode(signature);

  const embedPoints = [
    { x: 10, y: 10 },
    { x: width - 20, y: 10 },
    { x: 10, y: height - 20 },
    { x: width - 20, y: height - 20 },
    { x: Math.floor(width / 2), y: Math.floor(height / 2) }
  ];

  for (let p = 0; p < embedPoints.length; p++) {
    const { x, y } = embedPoints[p];
    if (x >= 0 && x < width && y >= 0 && y < height) {
      for (let i = 0; i < Math.min(signatureBytes.length, 32); i++) {
        const px = x + (i % 8);
        const py = y + Math.floor(i / 8);
        if (px < width && py < height) {
          const idx = (py * width + px) * 4;
          const bits = signatureBytes[i];
          data[idx] = (data[idx] & 0xFC) | ((bits >> 6) & 0x03);
          data[idx + 1] = (data[idx + 1] & 0xFC) | ((bits >> 4) & 0x03);
          data[idx + 2] = (data[idx + 2] & 0xFC) | ((bits >> 2) & 0x03);
        }
      }
    }
  }
}

// Process image with ImageMagick WASM
async function processImageWithMagick(
  base64Data: string,
  protectionId: string,
  options: {
    strength?: number;
    frequency?: number;
    colorJitter?: number;
    applyStyleCloak?: boolean;
    applyWatermark?: boolean;
    applyAiBlock?: boolean;
  }
): Promise<{ success: boolean; protectedImage?: string; width?: number; height?: number; error?: string }> {
  const {
    strength = 0.35,
    frequency = 8,
    colorJitter = 0.1,
    applyStyleCloak: doStyleCloak = true,
    applyWatermark = true,
    applyAiBlock = true
  } = options;

  // Decode base64 to bytes
  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  console.log(`Input image size: ${bytes.length} bytes`);

  return new Promise((resolve) => {
    try {
      ImageMagick.read(bytes, (img) => {
        const width = img.width;
        const height = img.height;
        console.log(`Processing image: ${width}x${height}`);

        // Get pixel data for manipulation
        img.getPixels((pixels) => {
          // Get RGBA data
          const pixelData = pixels.toByteArray(0, 0, width, height, "RGBA");
          const data = new Uint8Array(pixelData);

          // Apply Style Cloak
          if (doStyleCloak) {
            console.log('Applying Style Cloak...');
            applyStyleCloak(data, width, height, { strength, frequency, colorJitter });
            applyContrastNormalization(data, width, height);
          }

          // Apply Invisible Watermark
          if (applyWatermark) {
            console.log('Applying Invisible Watermark...');
            applyInvisibleWatermark(data, width, height, protectionId);
          }

          // Apply AI Training Block
          if (applyAiBlock) {
            console.log('Applying AI Training Block...');
            applyAiTrainingBlock(data, width, height, protectionId);
          }

          // Write modified pixels back
          pixels.setArea(0, 0, width, height, data);
        });

        // Encode to PNG
        img.write(MagickFormat.Png, (outputBytes) => {
          // Convert to base64
          let binary = '';
          for (let i = 0; i < outputBytes.length; i++) {
            binary += String.fromCharCode(outputBytes[i]);
          }
          const protectedImage = btoa(binary);

          console.log(`Output image size: ${outputBytes.length} bytes`);

          resolve({
            success: true,
            protectedImage,
            width,
            height
          });
        });
      });
    } catch (error) {
      console.error('ImageMagick processing error:', error);
      resolve({
        success: false,
        error: error.message || 'Image processing failed'
      });
    }
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize ImageMagick if needed
    await ensureMagickInitialized();

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { imageData, protectionId, options = {} } = body;

    if (!imageData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Image data required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check image size (max 5MB for edge function memory limits)
    const base64Size = imageData.replace(/^data:image\/\w+;base64,/, '').length;
    const estimatedBytes = base64Size * 0.75; // Base64 is ~33% larger than binary
    if (estimatedBytes > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ success: false, error: 'Image too large (max 5MB)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await processImageWithMagick(
      imageData,
      protectionId || `TSMO-${Date.now()}`,
      options
    );

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
