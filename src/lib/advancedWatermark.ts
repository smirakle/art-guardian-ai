/**
 * Advanced multi-format watermarking system
 * Supports images, videos, audio, text, and documents
 */

export interface AdvancedWatermarkOptions {
  // Basic options
  text?: string;
  type?: 'invisible' | 'visible' | 'hybrid';
  fileType?: 'image' | 'video' | 'audio' | 'text' | 'document' | 'other';
  
  // Visual options (for visible watermarks)
  opacity?: number;
  size?: number;
  color?: string;
  font?: string;
  position?: 'center' | 'bottom-right' | 'top-left' | 'top-right' | 'bottom-left' | 'diagonal' | 'pattern';
  rotation?: number;
  
  // Advanced protection
  protectionLevel?: 'basic' | 'standard' | 'enhanced' | 'maximum';
  encryption?: boolean;
  digitalSignature?: boolean;
  timestamping?: boolean;
  blockchainVerification?: boolean;
  
  // Format-specific options
  videoOptions?: {
    frameInterval?: number; // Frames to watermark
    quality?: 'high' | 'medium' | 'low';
    preserveAudio?: boolean;
  };
  
  audioOptions?: {
    frequency?: 'inaudible' | 'low' | 'medium';
    embedMethod?: 'lsb' | 'frequency' | 'echo';
  };
  
  textOptions?: {
    embedMethod?: 'metadata' | 'invisible_chars' | 'formatting';
    preserveFormatting?: boolean;
  };
  
  documentOptions?: {
    embedLocation?: 'metadata' | 'header' | 'footer' | 'hidden_text';
    preserveLayout?: boolean;
  };
}

export interface WatermarkResult {
  success: boolean;
  watermarkedBlob?: Blob;
  watermarkId: string;
  timestamp: string;
  fileType: string;
  originalSize: number;
  watermarkedSize: number;
  protectionLevel: string;
  error?: string;
}

export class AdvancedWatermarkSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private audioContext?: AudioContext;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Main watermark application method for all file types
   */
  async applyWatermark(
    file: File,
    options: AdvancedWatermarkOptions = {}
  ): Promise<WatermarkResult> {
    const watermarkId = this.generateWatermarkId();
    const timestamp = new Date().toISOString();
    const fileType = this.detectFileType(file);

    try {
      let watermarkedBlob: Blob;

      switch (fileType) {
        case 'image':
          watermarkedBlob = await this.watermarkImage(file, options);
          break;
        case 'video':
          watermarkedBlob = await this.watermarkVideo(file, options);
          break;
        case 'audio':
          watermarkedBlob = await this.watermarkAudio(file, options);
          break;
        case 'text':
          watermarkedBlob = await this.watermarkText(file, options);
          break;
        case 'document':
          watermarkedBlob = await this.watermarkDocument(file, options);
          break;
        default:
          watermarkedBlob = await this.watermarkGenericFile(file, options);
      }

      return {
        success: true,
        watermarkedBlob,
        watermarkId,
        timestamp,
        fileType,
        originalSize: file.size,
        watermarkedSize: watermarkedBlob.size,
        protectionLevel: options.protectionLevel || 'standard'
      };
    } catch (error) {
      return {
        success: false,
        watermarkId,
        timestamp,
        fileType,
        originalSize: file.size,
        watermarkedSize: 0,
        protectionLevel: options.protectionLevel || 'standard',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Image watermarking (enhanced from existing system)
   */
  private async watermarkImage(file: File, options: AdvancedWatermarkOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          this.ctx.drawImage(img, 0, 0);

          // Apply watermark based on type
          if (options.type === 'visible' || options.type === 'hybrid') {
            this.applyVisibleImageWatermark(options);
          }

          if (options.type === 'invisible' || options.type === 'hybrid') {
            this.applyInvisibleImageWatermark(options);
          }

          this.canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create watermarked image'));
          }, file.type || 'image/png');
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Video watermarking
   */
  private async watermarkVideo(file: File, options: AdvancedWatermarkOptions): Promise<Blob> {
    // For video watermarking, we'll need to process frames
    // This is a simplified implementation - in production, you'd use FFmpeg or similar
    
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        try {
          // Create a watermarked video by adding metadata and overlay frames
          const metadata = this.createVideoMetadata(options);
          
          // For now, we'll add metadata to the file
          // In a full implementation, you'd process video frames
          const reader = new FileReader();
          reader.onload = (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const watermarkedBuffer = this.addMetadataToBuffer(arrayBuffer, metadata);
            resolve(new Blob([watermarkedBuffer], { type: file.type }));
          };
          reader.readAsArrayBuffer(file);
        } catch (error) {
          reject(error);
        }
      };
      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Audio watermarking
   */
  private async watermarkAudio(file: File, options: AdvancedWatermarkOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          // Initialize audio context if needed
          if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          }

          // Decode audio data
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer.slice(0));
          
          // Apply audio watermarking (simplified - would use LSB or frequency domain)
          const watermarkedBuffer = this.applyAudioWatermark(audioBuffer, options);
          
          // Convert back to blob
          const blob = this.audioBufferToBlob(watermarkedBuffer, file.type);
          resolve(blob);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Text file watermarking
   */
  private async watermarkText(file: File, options: AdvancedWatermarkOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let text = e.target?.result as string;
          
          switch (options.textOptions?.embedMethod) {
            case 'invisible_chars':
              text = this.embedInvisibleChars(text, options);
              break;
            case 'formatting':
              text = this.embedInFormatting(text, options);
              break;
            default:
              text = this.embedInMetadata(text, options);
          }

          resolve(new Blob([text], { type: file.type || 'text/plain' }));
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }

  /**
   * Document watermarking (PDF, DOCX, etc.)
   */
  private async watermarkDocument(file: File, options: AdvancedWatermarkOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const metadata = this.createDocumentMetadata(options);
          const watermarkedBuffer = this.addMetadataToBuffer(arrayBuffer, metadata);
          resolve(new Blob([watermarkedBuffer], { type: file.type }));
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Generic file watermarking (adds metadata)
   */
  private async watermarkGenericFile(file: File, options: AdvancedWatermarkOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const metadata = this.createGenericMetadata(options);
          const watermarkedBuffer = this.addMetadataToBuffer(arrayBuffer, metadata);
          resolve(new Blob([watermarkedBuffer], { type: file.type }));
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // Helper methods
  private detectFileType(file: File): string {
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.startsWith('text/')) return 'text';
    if (type.includes('pdf') || type.includes('document') || type.includes('word')) return 'document';
    return 'other';
  }

  private generateWatermarkId(): string {
    return `TSMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private applyVisibleImageWatermark(options: AdvancedWatermarkOptions): void {
    const text = options.text || 'TSMO Protected';
    this.ctx.save();
    
    // Set font and style
    this.ctx.font = `${options.size || 16}px ${options.font || 'Arial'}`;
    this.ctx.fillStyle = options.color || '#ffffff';
    this.ctx.globalAlpha = options.opacity || 0.3;
    
    // Apply positioning
    const { x, y } = this.calculateTextPosition(text, options.position || 'center');
    
    if (options.rotation) {
      this.ctx.translate(x, y);
      this.ctx.rotate((options.rotation * Math.PI) / 180);
      this.ctx.fillText(text, 0, 0);
    } else {
      this.ctx.fillText(text, x, y);
    }
    
    this.ctx.restore();
  }

  private applyInvisibleImageWatermark(options: AdvancedWatermarkOptions): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    // LSB watermarking - embed data in least significant bits
    const watermarkData = this.stringToBinary(options.text || 'TSMO');
    let dataIndex = 0;
    
    for (let i = 0; i < data.length && dataIndex < watermarkData.length; i += 4) {
      if (dataIndex < watermarkData.length) {
        data[i] = (data[i] & 0xFE) | parseInt(watermarkData[dataIndex]);
        dataIndex++;
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  private calculateTextPosition(text: string, position: string): { x: number; y: number } {
    const metrics = this.ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = parseInt(this.ctx.font) || 16;
    
    switch (position) {
      case 'top-left':
        return { x: 20, y: 30 };
      case 'top-right':
        return { x: this.canvas.width - textWidth - 20, y: 30 };
      case 'bottom-left':
        return { x: 20, y: this.canvas.height - 20 };
      case 'bottom-right':
        return { x: this.canvas.width - textWidth - 20, y: this.canvas.height - 20 };
      case 'center':
      default:
        return { 
          x: (this.canvas.width - textWidth) / 2, 
          y: (this.canvas.height + textHeight) / 2 
        };
    }
  }

  private stringToBinary(str: string): string {
    return str.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
  }

  private createVideoMetadata(options: AdvancedWatermarkOptions): any {
    return {
      watermark: options.text || 'TSMO Protected',
      timestamp: new Date().toISOString(),
      protection_level: options.protectionLevel,
      type: 'video_watermark'
    };
  }

  private createDocumentMetadata(options: AdvancedWatermarkOptions): any {
    return {
      watermark: options.text || 'TSMO Protected',
      timestamp: new Date().toISOString(),
      protection_level: options.protectionLevel,
      type: 'document_watermark'
    };
  }

  private createGenericMetadata(options: AdvancedWatermarkOptions): any {
    return {
      watermark: options.text || 'TSMO Protected',
      timestamp: new Date().toISOString(),
      protection_level: options.protectionLevel,
      type: 'generic_watermark'
    };
  }

  private addMetadataToBuffer(buffer: ArrayBuffer, metadata: any): ArrayBuffer {
    // Simple metadata embedding - in production you'd use proper format-specific methods
    const metadataString = JSON.stringify(metadata);
    const metadataBytes = new TextEncoder().encode(metadataString);
    const result = new ArrayBuffer(buffer.byteLength + metadataBytes.length + 4);
    const view = new Uint8Array(result);
    
    // Write original data
    view.set(new Uint8Array(buffer), 0);
    
    // Write metadata length
    const lengthView = new DataView(result, buffer.byteLength, 4);
    lengthView.setUint32(0, metadataBytes.length, true);
    
    // Write metadata
    view.set(metadataBytes, buffer.byteLength + 4);
    
    return result;
  }

  private applyAudioWatermark(audioBuffer: AudioBuffer, options: AdvancedWatermarkOptions): AudioBuffer {
    // Simplified audio watermarking - would use proper DSP techniques in production
    const channelData = audioBuffer.getChannelData(0);
    const watermarkData = this.stringToBinary(options.text || 'TSMO');
    
    // Embed in LSBs of audio samples (very simplified)
    for (let i = 0; i < Math.min(channelData.length, watermarkData.length * 100); i++) {
      if (i % 100 < watermarkData.length) {
        const bit = parseInt(watermarkData[i % 100]);
        const sample = channelData[i];
        channelData[i] = Math.sign(sample) * (Math.floor(Math.abs(sample) * 32767) & 0xFFFE | bit) / 32767;
      }
    }
    
    return audioBuffer;
  }

  private audioBufferToBlob(audioBuffer: AudioBuffer, mimeType: string): Blob {
    // Simplified conversion - in production you'd use proper audio encoding
    const channelData = audioBuffer.getChannelData(0);
    const samples = new Int16Array(channelData.length);
    
    for (let i = 0; i < channelData.length; i++) {
      samples[i] = Math.max(-1, Math.min(1, channelData[i])) * 0x7FFF;
    }
    
    return new Blob([samples.buffer], { type: mimeType });
  }

  private embedInvisibleChars(text: string, options: AdvancedWatermarkOptions): string {
    const watermark = options.text || 'TSMO';
    const invisibleChars = ['\u200B', '\u200C', '\u200D', '\u2060'];
    let result = text;
    
    // Embed watermark using invisible Unicode characters
    for (let i = 0; i < watermark.length; i++) {
      const charCode = watermark.charCodeAt(i);
      const binaryStr = charCode.toString(2).padStart(8, '0');
      
      for (let j = 0; j < binaryStr.length; j++) {
        const bit = parseInt(binaryStr[j]);
        const insertPos = Math.floor((i * 8 + j) * text.length / (watermark.length * 8));
        result = result.slice(0, insertPos) + invisibleChars[bit] + result.slice(insertPos);
      }
    }
    
    return result;
  }

  private embedInFormatting(text: string, options: AdvancedWatermarkOptions): string {
    // Use whitespace and formatting to embed watermark
    return text + `\n\n<!-- TSMO Watermark: ${options.text || 'Protected'} -->`;
  }

  private embedInMetadata(text: string, options: AdvancedWatermarkOptions): string {
    const metadata = `---
watermark: ${options.text || 'TSMO Protected'}
timestamp: ${new Date().toISOString()}
protection_level: ${options.protectionLevel || 'standard'}
---

${text}`;
    return metadata;
  }
}

export const advancedWatermarkService = new AdvancedWatermarkSystem();