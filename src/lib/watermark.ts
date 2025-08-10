/**
 * Invisible watermarking utilities for enhanced detection during real-time monitoring
 */

export interface WatermarkOptions {
  text?: string;
  opacity?: number;
  size?: number;
  position?: 'center' | 'bottom-right' | 'top-left' | 'top-right' | 'bottom-left';
  frequency?: 'low' | 'medium' | 'high';
}

export class InvisibleWatermark {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Apply invisible watermark to an image for enhanced detection
   */
  async applyWatermark(
    imageFile: File, 
    options: WatermarkOptions = {}
  ): Promise<Blob> {
    const {
      text = `TSMO-${Date.now()}`,
      opacity = 0.02, // Very low opacity for invisibility
      size = 12,
      position = 'center',
      frequency = 'medium'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Set canvas dimensions
          this.canvas.width = img.width;
          this.canvas.height = img.height;

          // Draw original image
          this.ctx.drawImage(img, 0, 0);

          // Apply invisible watermark pattern
          this.applyInvisiblePattern(text, opacity, size, position, frequency);

          // Convert to blob
          this.canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create watermarked image'));
            }
          }, imageFile.type, 0.98); // High quality
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(imageFile);
    });
  }

  /**
   * Apply subtle pattern across the image for detection purposes
   */
  private applyInvisiblePattern(
    text: string, 
    opacity: number, 
    size: number, 
    position: string,
    frequency: string
  ) {
    const { width, height } = this.canvas;
    
    // Set invisible watermark style
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.font = `${size}px Arial`;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';

    // Calculate pattern spacing based on frequency
    const spacing = frequency === 'high' ? 100 : frequency === 'medium' ? 150 : 200;

    // Apply pattern across image
    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(-Math.PI / 8); // Slight rotation
        this.ctx.fillText(text, 0, 0);
        this.ctx.restore();
      }
    }

    // Add position-specific watermark
    this.addPositionalWatermark(text, position, size);
    
    this.ctx.restore();
  }

  /**
   * Add watermark at specific position for verification
   */
  private addPositionalWatermark(text: string, position: string, size: number) {
    const { width, height } = this.canvas;
    let x: number, y: number;

    switch (position) {
      case 'top-left':
        x = 50;
        y = 50;
        break;
      case 'top-right':
        x = width - 50;
        y = 50;
        break;
      case 'bottom-left':
        x = 50;
        y = height - 50;
        break;
      case 'bottom-right':
        x = width - 50;
        y = height - 50;
        break;
      case 'center':
      default:
        x = width / 2;
        y = height / 2;
    }

    this.ctx.save();
    this.ctx.globalAlpha = 0.01; // Extra invisible
    this.ctx.font = `${size * 1.5}px Arial`;
    this.ctx.fillStyle = '#000000';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${text}-ENHANCED`, x, y);
    this.ctx.restore();
  }

  /**
   * Generate unique watermark ID for tracking
   */
  static generateWatermarkId(userId: string, timestamp: number = Date.now()): string {
    return `TSMO-${userId.slice(0, 8)}-${timestamp}`;
  }

  /**
   * Enhanced watermark detection for various types including visible watermarks
   */
  async detectWatermark(imageFile: File): Promise<{
    hasWatermark: boolean;
    confidence: number;
    watermarkId?: string;
    watermarkType?: string;
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);

        const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
        const pixels = imageData.data;
        
        // Multiple detection methods
        const detectionResults = [
          this.detectVisibleWatermark(pixels, img.width, img.height),
          this.detectTransparencyWatermark(pixels, img.width, img.height),
          this.detectPatternWatermark(pixels, img.width, img.height),
          this.detectEdgeWatermark(pixels, img.width, img.height),
          this.detectTSMOWatermark(pixels, img.width, img.height)
        ];

        // Find the highest confidence detection
        const bestDetection = detectionResults.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        );

        resolve({
          hasWatermark: bestDetection.confidence > 20,
          confidence: Math.min(bestDetection.confidence, 95),
          watermarkId: bestDetection.confidence > 20 ? bestDetection.id : undefined,
          watermarkType: bestDetection.type
        });
      };

      img.onerror = () => {
        resolve({ hasWatermark: false, confidence: 0 });
      };

      img.src = URL.createObjectURL(imageFile);
    });
  }

  private detectVisibleWatermark(pixels: Uint8ClampedArray, width: number, height: number) {
    let watermarkScore = 0;
    let semiTransparentPixels = 0;
    let edgeContrast = 0;
    
    // Check for semi-transparent overlays and high contrast text
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      
      // Look for semi-transparent pixels (common in watermarks)
      if (a < 255 && a > 100) {
        semiTransparentPixels++;
      }
      
      // Check for high contrast (white/black text on background)
      const brightness = (r + g + b) / 3;
      if (brightness > 240 || brightness < 15) {
        watermarkScore++;
      }
    }
    
    const confidence = Math.min((semiTransparentPixels / (width * height)) * 500 + 
                               (watermarkScore / (width * height)) * 200, 90);
    
    return {
      confidence,
      type: 'visible_overlay',
      id: 'VISIBLE-WATERMARK-DETECTED'
    };
  }

  private detectTransparencyWatermark(pixels: Uint8ClampedArray, width: number, height: number) {
    let transparencyPatterns = 0;
    
    // Look for repeated transparency patterns
    for (let y = 0; y < height - 50; y += 10) {
      for (let x = 0; x < width - 50; x += 10) {
        const idx = (y * width + x) * 4;
        const a1 = pixels[idx + 3];
        const idx2 = ((y + 25) * width + (x + 25)) * 4;
        const a2 = pixels[idx2 + 3];
        
        if (Math.abs(a1 - a2) > 20 && (a1 < 200 || a2 < 200)) {
          transparencyPatterns++;
        }
      }
    }
    
    const confidence = Math.min((transparencyPatterns / 100) * 60, 85);
    
    return {
      confidence,
      type: 'transparency_pattern',
      id: 'TRANSPARENCY-WATERMARK'
    };
  }

  private detectPatternWatermark(pixels: Uint8ClampedArray, width: number, height: number) {
    let repeatedPatterns = 0;
    const blockSize = 50;
    
    // Look for repeated blocks (tiled watermarks)
    for (let y = 0; y < height - blockSize * 2; y += blockSize) {
      for (let x = 0; x < width - blockSize * 2; x += blockSize) {
        let similarity = 0;
        
        for (let dy = 0; dy < blockSize; dy += 5) {
          for (let dx = 0; dx < blockSize; dx += 5) {
            const idx1 = ((y + dy) * width + (x + dx)) * 4;
            const idx2 = ((y + dy + blockSize) * width + (x + dx + blockSize)) * 4;
            
            const diff = Math.abs(pixels[idx1] - pixels[idx2]) +
                        Math.abs(pixels[idx1 + 1] - pixels[idx2 + 1]) +
                        Math.abs(pixels[idx1 + 2] - pixels[idx2 + 2]);
            
            if (diff < 30) similarity++;
          }
        }
        
        if (similarity > 80) repeatedPatterns++;
      }
    }
    
    const confidence = Math.min((repeatedPatterns / 10) * 70, 88);
    
    return {
      confidence,
      type: 'repeated_pattern',
      id: 'PATTERN-WATERMARK'
    };
  }

  private detectEdgeWatermark(pixels: Uint8ClampedArray, width: number, height: number) {
    let edgeWatermarkScore = 0;
    const margin = 50;
    
    // Check edges for watermarks (common placement)
    const regions = [
      { x: 0, y: 0, w: margin, h: height }, // left edge
      { x: width - margin, y: 0, w: margin, h: height }, // right edge
      { x: 0, y: 0, w: width, h: margin }, // top edge
      { x: 0, y: height - margin, w: width, h: margin } // bottom edge
    ];
    
    regions.forEach(region => {
      let textLikePixels = 0;
      
      for (let y = region.y; y < region.y + region.h; y += 2) {
        for (let x = region.x; x < region.x + region.w; x += 2) {
          const idx = (y * width + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          
          // Look for text-like high contrast
          const brightness = (r + g + b) / 3;
          if (brightness > 230 || brightness < 25) {
            textLikePixels++;
          }
        }
      }
      
      if (textLikePixels > 20) edgeWatermarkScore += textLikePixels;
    });
    
    const confidence = Math.min((edgeWatermarkScore / 1000) * 60, 80);
    
    return {
      confidence,
      type: 'edge_watermark',
      id: 'EDGE-WATERMARK'
    };
  }

  private detectTSMOWatermark(pixels: Uint8ClampedArray, width: number, height: number) {
    // Original TSMO detection algorithm
    let suspiciousPatterns = 0;
    const sampleSize = Math.min(10000, pixels.length / 4);
    
    for (let i = 0; i < sampleSize * 4; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      if (Math.abs(r - g) < 3 && Math.abs(g - b) < 3 && r > 250) {
        suspiciousPatterns++;
      }
    }
    
    const confidence = Math.min((suspiciousPatterns / sampleSize) * 100, 85);
    
    return {
      confidence,
      type: 'tsmo_invisible',
      id: 'TSMO-PATTERN'
    };
  }
}

export const watermarkService = new InvisibleWatermark();