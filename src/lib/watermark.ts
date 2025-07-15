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
   * Detect if image has TSMO watermark (basic detection)
   */
  async detectWatermark(imageFile: File): Promise<{
    hasWatermark: boolean;
    confidence: number;
    watermarkId?: string;
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);

        // Simple detection by analyzing pixel patterns
        // In a real implementation, this would use advanced algorithms
        const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
        const pixels = imageData.data;
        
        let suspiciousPatterns = 0;
        const sampleSize = Math.min(10000, pixels.length / 4);
        
        for (let i = 0; i < sampleSize * 4; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          // Look for subtle variations that might indicate watermarking
          if (Math.abs(r - g) < 3 && Math.abs(g - b) < 3 && r > 250) {
            suspiciousPatterns++;
          }
        }
        
        const confidence = Math.min((suspiciousPatterns / sampleSize) * 100, 85);
        const hasWatermark = confidence > 15;
        
        resolve({
          hasWatermark,
          confidence,
          watermarkId: hasWatermark ? 'DETECTED-TSMO-PATTERN' : undefined
        });
      };

      img.onerror = () => {
        resolve({ hasWatermark: false, confidence: 0 });
      };

      img.src = URL.createObjectURL(imageFile);
    });
  }
}

export const watermarkService = new InvisibleWatermark();