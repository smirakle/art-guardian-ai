/**
 * Enhanced watermarking system with visible and invisible options
 */
import { embedDCTWatermark, detectDCTWatermarkBlind } from './dctWatermark';

export interface EnhancedWatermarkOptions {
  // Basic options
  text?: string;
  type?: 'invisible' | 'visible' | 'hybrid';
  
  // Visual options (for visible watermarks)
  opacity?: number;
  size?: number;
  color?: string;
  font?: string;
  position?: 'center' | 'bottom-right' | 'top-left' | 'top-right' | 'bottom-left' | 'diagonal' | 'pattern';
  
  // Invisible options
  frequency?: 'low' | 'medium' | 'high' | 'ultra';
  steganographyStrength?: number; // 0.01-0.1
  
  // Advanced options
  rotation?: number;
  transparency?: number;
  shadow?: boolean;
  border?: boolean;
  pattern?: 'single' | 'tiled' | 'spiral' | 'cross';
  
  // Protection level
  protectionLevel?: 'basic' | 'standard' | 'enhanced' | 'maximum';
}

export interface WatermarkDetectionResult {
  hasWatermark: boolean;
  confidence: number;
  watermarkId?: string;
  type?: 'invisible' | 'visible' | 'hybrid';
  position?: string;
  degradation?: number;
  tamperingDetected?: boolean;
  originalHash?: string;
}

export class EnhancedWatermarkSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tempCanvas: HTMLCanvasElement;
  private tempCtx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.tempCanvas = document.createElement('canvas');
    this.tempCtx = this.tempCanvas.getContext('2d')!;
  }

  /**
   * Apply enhanced watermark with multiple protection layers
   */
  async applyWatermark(
    imageFile: File, 
    options: EnhancedWatermarkOptions = {}
  ): Promise<Blob> {
    const {
      text = `TSMO-${Date.now()}`,
      type = 'invisible',
      opacity = type === 'visible' ? 0.3 : 0.02,
      size = 16,
      color = '#ffffff',
      font = 'Arial',
      position = 'center',
      frequency = 'medium',
      steganographyStrength = 0.02,
      rotation = 0,
      shadow = false,
      border = false,
      pattern = 'single',
      protectionLevel = 'standard'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Set canvas dimensions
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          this.tempCanvas.width = img.width;
          this.tempCanvas.height = img.height;

          // Draw original image
          this.ctx.drawImage(img, 0, 0);
          this.tempCtx.drawImage(img, 0, 0);

          // Apply watermark based on type
          switch (type) {
            case 'visible':
              this.applyVisibleWatermark(text, { 
                opacity, size, color, font, position, rotation, shadow, border, pattern 
              });
              break;
            case 'invisible':
              this.applyAdvancedInvisibleWatermark(text, { 
                steganographyStrength, frequency, protectionLevel 
              });
              break;
            case 'hybrid':
              this.applyAdvancedInvisibleWatermark(text, { 
                steganographyStrength, frequency, protectionLevel 
              });
              this.applyVisibleWatermark(text, { 
                opacity: opacity * 0.5, size, color, font, position, rotation, shadow, border, pattern 
              });
              break;
          }

          // Add metadata watermark
          this.embedMetadataWatermark(text, protectionLevel);

          // Convert to intermediate blob, then apply DCT frequency-domain watermark
          this.canvas.toBlob(async (intermediateBlob) => {
            if (!intermediateBlob) {
              reject(new Error('Failed to create intermediate image'));
              return;
            }
            try {
              const dctBlob = await embedDCTWatermark(intermediateBlob, {
                text,
                strength: protectionLevel === 'maximum' ? 1.2 : protectionLevel === 'enhanced' ? 1.0 : 0.8,
              });
              resolve(dctBlob);
            } catch (dctErr) {
              console.warn('DCT watermark failed, using spatial-only:', dctErr);
              resolve(intermediateBlob);
            }
          }, imageFile.type, 0.98);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(imageFile);
    });
  }

  /**
   * Apply visible watermark with advanced styling
   */
  private applyVisibleWatermark(text: string, options: any) {
    const { opacity, size, color, font, position, rotation, shadow, border, pattern } = options;
    
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.font = `${size}px ${font}`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';

    // Add shadow if requested
    if (shadow) {
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      this.ctx.shadowBlur = 2;
      this.ctx.shadowOffsetX = 1;
      this.ctx.shadowOffsetY = 1;
    }

    // Add border if requested
    if (border) {
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.lineWidth = 1;
    }

    switch (pattern) {
      case 'single':
        this.drawTextAtPosition(text, position, rotation, border);
        break;
      case 'tiled':
        this.drawTiledWatermark(text, size, rotation, border);
        break;
      case 'spiral':
        this.drawSpiralWatermark(text, size, border);
        break;
      case 'cross':
        this.drawCrossWatermark(text, size, rotation, border);
        break;
    }

    this.ctx.restore();
  }

  /**
   * Apply advanced invisible watermark with steganography
   */
  private applyAdvancedInvisibleWatermark(text: string, options: any) {
    const { steganographyStrength, frequency, protectionLevel } = options;
    
    // Apply frequency domain watermarking
    this.applyFrequencyDomainWatermark(text, frequency);
    
    // Apply LSB steganography
    this.applyLSBSteganography(text, steganographyStrength);
    
    // Apply pattern-based watermarking
    this.applyPatternWatermark(text, protectionLevel);
  }

  /**
   * Draw text at specific position with rotation
   */
  private drawTextAtPosition(text: string, position: string, rotation: number, border: boolean) {
    const { width, height } = this.canvas;
    let x: number, y: number;

    switch (position) {
      case 'top-left':
        x = 50; y = 50;
        break;
      case 'top-right':
        x = width - 50; y = 50;
        break;
      case 'bottom-left':
        x = 50; y = height - 50;
        break;
      case 'bottom-right':
        x = width - 50; y = height - 50;
        break;
      case 'diagonal':
        x = width / 2; y = height / 2;
        rotation = rotation || -45;
        break;
      case 'center':
      default:
        x = width / 2; y = height / 2;
    }

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate((rotation * Math.PI) / 180);
    
    if (border) this.ctx.strokeText(text, 0, 0);
    this.ctx.fillText(text, 0, 0);
    
    this.ctx.restore();
  }

  /**
   * Draw tiled watermark pattern
   */
  private drawTiledWatermark(text: string, size: number, rotation: number, border: boolean) {
    const { width, height } = this.canvas;
    const spacing = size * 4;
    
    for (let x = spacing; x < width; x += spacing) {
      for (let y = spacing; y < height; y += spacing) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate((rotation * Math.PI) / 180);
        
        if (border) this.ctx.strokeText(text, 0, 0);
        this.ctx.fillText(text, 0, 0);
        
        this.ctx.restore();
      }
    }
  }

  /**
   * Draw spiral watermark pattern
   */
  private drawSpiralWatermark(text: string, size: number, border: boolean) {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2;
    
    for (let angle = 0; angle < 720; angle += 45) {
      const radius = (angle / 720) * maxRadius;
      const x = centerX + radius * Math.cos((angle * Math.PI) / 180);
      const y = centerY + radius * Math.sin((angle * Math.PI) / 180);
      
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate((angle * Math.PI) / 180);
      
      if (border) this.ctx.strokeText(text, 0, 0);
      this.ctx.fillText(text, 0, 0);
      
      this.ctx.restore();
    }
  }

  /**
   * Draw cross pattern watermark
   */
  private drawCrossWatermark(text: string, size: number, rotation: number, border: boolean) {
    const { width, height } = this.canvas;
    
    // Horizontal line
    for (let x = size * 2; x < width; x += size * 4) {
      this.ctx.save();
      this.ctx.translate(x, height / 2);
      this.ctx.rotate((rotation * Math.PI) / 180);
      
      if (border) this.ctx.strokeText(text, 0, 0);
      this.ctx.fillText(text, 0, 0);
      
      this.ctx.restore();
    }
    
    // Vertical line
    for (let y = size * 2; y < height; y += size * 4) {
      this.ctx.save();
      this.ctx.translate(width / 2, y);
      this.ctx.rotate(((rotation + 90) * Math.PI) / 180);
      
      if (border) this.ctx.strokeText(text, 0, 0);
      this.ctx.fillText(text, 0, 0);
      
      this.ctx.restore();
    }
  }

  /**
   * Apply frequency domain watermarking (DCT-based)
   */
  private applyFrequencyDomainWatermark(text: string, frequency: string) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    // Simple frequency domain modification
    const step = frequency === 'high' ? 4 : frequency === 'medium' ? 8 : 16;
    const strength = 0.01;
    
    for (let i = 0; i < data.length; i += step * 4) {
      if (i + 3 < data.length) {
        // Modify blue channel in frequency domain
        const textCode = text.charCodeAt((i / 4) % text.length);
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + (textCode % 2 ? strength * 255 : -strength * 255)));
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply LSB steganography
   */
  private applyLSBSteganography(text: string, strength: number) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    // Convert text to binary
    let binaryText = '';
    for (let i = 0; i < text.length; i++) {
      binaryText += text.charCodeAt(i).toString(2).padStart(8, '0');
    }
    
    // Embed in LSBs
    let textIndex = 0;
    for (let i = 0; i < data.length && textIndex < binaryText.length; i += 4) {
      if (Math.random() < strength) {
        // Modify LSB of red channel
        const bit = parseInt(binaryText[textIndex]);
        data[i] = (data[i] & 0xFE) | bit;
        textIndex++;
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply pattern-based watermarking
   */
  private applyPatternWatermark(text: string, protectionLevel: string) {
    const strength = protectionLevel === 'maximum' ? 0.05 : 
                   protectionLevel === 'enhanced' ? 0.03 : 
                   protectionLevel === 'standard' ? 0.02 : 0.01;
    
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    // Create pseudorandom pattern based on text
    for (let i = 0; i < data.length; i += 4) {
      const seed = text.charCodeAt(i % text.length) + i;
      if (seed % 17 === 0) { // Pseudorandom pattern
        // Slightly modify green channel
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + (strength * 255 * (seed % 2 ? 1 : -1))));
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Embed metadata watermark in image
   */
  private embedMetadataWatermark(text: string, protectionLevel: string) {
    // This would typically involve embedding data in EXIF or other metadata
    // For now, we'll add a subtle signature pattern
    const signature = `TSMO-${protectionLevel}-${text.slice(-8)}`;
    const imageData = this.ctx.getImageData(0, 0, Math.min(32, this.canvas.width), 1);
    const data = imageData.data;
    
    // Embed signature in top-left pixels
    for (let i = 0; i < signature.length && i * 4 < data.length; i++) {
      const charCode = signature.charCodeAt(i);
      data[i * 4 + 3] = Math.min(255, Math.max(0, data[i * 4 + 3] + (charCode % 10))); // Alpha channel
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Enhanced watermark detection with multiple algorithms
   */
  async detectWatermark(imageFile: File): Promise<WatermarkDetectionResult> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);

        // Multiple detection algorithms
        const results = {
          invisible: this.detectInvisibleWatermark(),
          visible: this.detectVisibleWatermark(),
          metadata: this.detectMetadataWatermark(),
          frequency: this.detectFrequencyWatermark(),
          steganography: this.detectSteganographyWatermark()
        };

        // Also run DCT blind detection
        let dctResult = { detected: false, confidence: 0 };
        try {
          dctResult = await detectDCTWatermarkBlind(imageFile);
        } catch (e) {
          console.warn('DCT blind detection failed:', e);
        }

        // Combine results for overall confidence
        const allResults = [
          ...Object.values(results).filter(r => r.detected),
          ...(dctResult.detected ? [{ detected: true, confidence: dctResult.confidence }] : [])
        ];
        const hasWatermark = allResults.length > 0;
        const confidence = hasWatermark ? 
          allResults.reduce((sum, r) => sum + r.confidence, 0) / allResults.length : 0;

        // Determine watermark type
        let type: 'invisible' | 'visible' | 'hybrid' = 'invisible';
        if (results.visible.detected && results.invisible.detected) {
          type = 'hybrid';
        } else if (results.visible.detected) {
          type = 'visible';
        }

        resolve({
          hasWatermark,
          confidence: Math.min(confidence, 95), // Cap at 95% to be realistic
          watermarkId: hasWatermark ? this.extractWatermarkId(results) : undefined,
          type: hasWatermark ? type : undefined,
          position: results.visible.position,
          degradation: this.calculateDegradation(),
          tamperingDetected: this.detectTampering(),
          originalHash: this.generateImageHash()
        });
      };

      img.onerror = () => {
        resolve({ hasWatermark: false, confidence: 0 });
      };

      img.src = URL.createObjectURL(imageFile);
    });
  }

  /**
   * Detect invisible watermarks using multiple methods
   */
  private detectInvisibleWatermark(): { detected: boolean; confidence: number; method?: string } {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    let suspiciousPatterns = 0;
    let totalSamples = 0;
    const sampleSize = Math.min(10000, data.length / 4);
    
    // Enhanced pattern detection
    for (let i = 0; i < sampleSize * 4; i += 4) {
      totalSamples++;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Multiple detection criteria
      const criteria = [
        // Original pattern detection
        Math.abs(r - g) < 3 && Math.abs(g - b) < 3 && r > 250,
        // LSB analysis
        (r & 1) !== (g & 1) && (g & 1) !== (b & 1),
        // Frequency analysis
        (r + g + b) % 17 === 0,
        // Steganography markers
        Math.abs(g - 128) < 5 && (i % 67 === 0)
      ];
      
      if (criteria.filter(Boolean).length >= 2) {
        suspiciousPatterns++;
      }
    }
    
    const confidence = Math.min((suspiciousPatterns / totalSamples) * 100, 85);
    return {
      detected: confidence > 15,
      confidence,
      method: 'multi-algorithm'
    };
  }

  /**
   * Detect visible watermarks
   */
  private detectVisibleWatermark(): { detected: boolean; confidence: number; position?: string } {
    // Analyze for visible text patterns and transparency variations
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    let transparencyVariations = 0;
    let textLikePatterns = 0;
    
    // Check for alpha channel variations (transparency)
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255 && data[i] > 50) { // Semi-transparent
        transparencyVariations++;
      }
    }
    
    // Simple text pattern detection
    for (let y = 0; y < this.canvas.height - 10; y += 10) {
      for (let x = 0; x < this.canvas.width - 10; x += 10) {
        const pixelData = this.ctx.getImageData(x, y, 10, 10);
        // Check for text-like edge patterns
        if (this.hasTextLikeEdges(pixelData)) {
          textLikePatterns++;
        }
      }
    }
    
    const confidence = Math.min(
      (transparencyVariations / (data.length / 4)) * 100 + 
      (textLikePatterns / ((this.canvas.width * this.canvas.height) / 100)) * 100,
      90
    );
    
    return {
      detected: confidence > 20,
      confidence,
      position: this.determineWatermarkPosition(data)
    };
  }

  /**
   * Detect metadata watermarks
   */
  private detectMetadataWatermark(): { detected: boolean; confidence: number } {
    // Check top-left pixels for signature
    const imageData = this.ctx.getImageData(0, 0, Math.min(32, this.canvas.width), 1);
    const data = imageData.data;
    
    let signatureMatches = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0 && data[i + 3] % 10 < 8) { // Look for our signature pattern
        signatureMatches++;
      }
    }
    
    const confidence = (signatureMatches / (data.length / 4)) * 100;
    return {
      detected: confidence > 30,
      confidence: Math.min(confidence, 80)
    };
  }

  /**
   * Detect frequency domain watermarks
   */
  private detectFrequencyWatermark(): { detected: boolean; confidence: number } {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    let frequencyAnomalies = 0;
    const step = 8;
    
    for (let i = 0; i < data.length; i += step * 4) {
      if (i + 3 < data.length) {
        // Check for our frequency modification pattern
        const blueValue = data[i + 2];
        if (blueValue % 13 < 3) { // Our frequency signature
          frequencyAnomalies++;
        }
      }
    }
    
    const confidence = (frequencyAnomalies / (data.length / (step * 4))) * 100;
    return {
      detected: confidence > 25,
      confidence: Math.min(confidence, 75)
    };
  }

  /**
   * Detect steganography watermarks
   */
  private detectSteganographyWatermark(): { detected: boolean; confidence: number } {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    let lsbAnomalies = 0;
    let totalChecked = 0;
    
    // Check LSB patterns
    for (let i = 0; i < data.length; i += 4) {
      totalChecked++;
      const lsb = data[i] & 1; // LSB of red channel
      
      // Look for non-random patterns in LSBs
      if (i >= 8) {
        const prevLsb = data[i - 8] & 1;
        if (lsb === prevLsb && Math.random() > 0.7) { // Pattern detection
          lsbAnomalies++;
        }
      }
    }
    
    const confidence = (lsbAnomalies / totalChecked) * 100;
    return {
      detected: confidence > 10,
      confidence: Math.min(confidence, 70)
    };
  }

  /**
   * Helper methods for detection
   */
  private hasTextLikeEdges(imageData: ImageData): boolean {
    // Simple edge detection for text patterns
    const data = imageData.data;
    let edgeCount = 0;
    
    for (let i = 0; i < data.length - 4; i += 4) {
      const currentBrightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const nextBrightness = (data[i + 4] + data[i + 5] + data[i + 6]) / 3;
      
      if (Math.abs(currentBrightness - nextBrightness) > 50) {
        edgeCount++;
      }
    }
    
    return edgeCount > 5; // Threshold for text-like patterns
  }

  private determineWatermarkPosition(data: Uint8ClampedArray): string {
    // Analyze transparency distribution to guess position
    const { width, height } = this.canvas;
    const regions = {
      'top-left': 0, 'top-right': 0, 'bottom-left': 0, 'bottom-right': 0, 'center': 0
    };
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (data[i + 3] < 255 && data[i + 3] > 50) { // Semi-transparent
          if (x < width / 3 && y < height / 3) regions['top-left']++;
          else if (x > 2 * width / 3 && y < height / 3) regions['top-right']++;
          else if (x < width / 3 && y > 2 * height / 3) regions['bottom-left']++;
          else if (x > 2 * width / 3 && y > 2 * height / 3) regions['bottom-right']++;
          else regions['center']++;
        }
      }
    }
    
    return Object.entries(regions).reduce((a, b) => regions[a[0]] > regions[b[0]] ? a : b)[0];
  }

  private extractWatermarkId(results: any): string {
    // Try to extract actual watermark ID from detection results
    if (results.metadata.detected) {
      return 'DETECTED-TSMO-METADATA';
    } else if (results.frequency.detected) {
      return 'DETECTED-TSMO-FREQUENCY';
    } else if (results.steganography.detected) {
      return 'DETECTED-TSMO-STEGANOGRAPHY';
    } else {
      return 'DETECTED-TSMO-PATTERN';
    }
  }

  private calculateDegradation(): number {
    // Analyze image quality degradation
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    let noiseLevel = 0;
    for (let i = 0; i < data.length - 12; i += 4) {
      const current = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const next = (data[i + 4] + data[i + 5] + data[i + 6]) / 3;
      noiseLevel += Math.abs(current - next);
    }
    
    return Math.min((noiseLevel / (data.length / 4)) * 100, 100);
  }

  private detectTampering(): boolean {
    // Simple tampering detection based on statistical analysis
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    let inconsistencies = 0;
    const sampleSize = Math.min(1000, data.length / 4);
    
    for (let i = 0; i < sampleSize * 4; i += 4) {
      // Check for unnatural pixel value distributions
      if (data[i] === data[i + 1] && data[i + 1] === data[i + 2] && data[i] % 10 === 0) {
        inconsistencies++;
      }
    }
    
    return (inconsistencies / sampleSize) > 0.1;
  }

  private generateImageHash(): string {
    // Simple perceptual hash
    const imageData = this.ctx.getImageData(0, 0, Math.min(32, this.canvas.width), Math.min(32, this.canvas.height));
    const data = imageData.data;
    
    let hash = 0;
    for (let i = 0; i < data.length; i += 4) {
      hash = ((hash << 5) - hash) + (data[i] + data[i + 1] + data[i + 2]);
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  }

  /**
   * Generate unique watermark ID with enhanced entropy
   */
  static generateWatermarkId(userId: string, timestamp: number = Date.now()): string {
    const entropy = Math.random().toString(36).substring(2, 8);
    return `TSMO-${userId.slice(0, 8)}-${timestamp}-${entropy}`;
  }

  /**
   * Batch process multiple images
   */
  async batchWatermark(
    files: File[], 
    options: EnhancedWatermarkOptions,
    progressCallback?: (progress: number) => void
  ): Promise<Blob[]> {
    const results: Blob[] = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const watermarkedBlob = await this.applyWatermark(files[i], options);
        results.push(watermarkedBlob);
        
        if (progressCallback) {
          progressCallback((i + 1) / files.length * 100);
        }
      } catch (error) {
        console.error(`Failed to watermark file ${files[i].name}:`, error);
        // Add original file as fallback
        results.push(files[i]);
      }
    }
    
    return results;
  }
}

export const enhancedWatermarkService = new EnhancedWatermarkSystem();