import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractionResult {
  text: string;
  pageCount?: number;
  wordCount: number;
  characterCount: number;
  extractionMethod: 'pdf' | 'docx' | 'ocr' | 'plaintext';
  processingTime: number;
}

export class DocumentProcessor {
  /**
   * Main entry point for text extraction
   */
  static async extractText(
    file: File,
    onProgress?: (progress: number, status: string) => void
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    try {
      onProgress?.(10, 'Analyzing document...');

      let extractedText: string;
      let pageCount: number | undefined;
      let method: ExtractionResult['extractionMethod'];

      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        onProgress?.(20, 'Extracting text from PDF...');
        const result = await this.extractPdfText(file, onProgress);
        extractedText = result.text;
        pageCount = result.pageCount;
        method = 'pdf';
      } else if (
        fileType.includes('word') ||
        fileName.endsWith('.docx') ||
        fileName.endsWith('.doc')
      ) {
        onProgress?.(20, 'Extracting text from Word document...');
        extractedText = await this.extractDocxText(file);
        method = 'docx';
      } else if (fileType.includes('image') || this.isImageFile(fileName)) {
        onProgress?.(20, 'Performing OCR on image...');
        extractedText = await this.extractOcrText(file, onProgress);
        method = 'ocr';
      } else {
        onProgress?.(20, 'Reading text file...');
        extractedText = await file.text();
        method = 'plaintext';
      }

      onProgress?.(90, 'Finalizing extraction...');

      const wordCount = this.countWords(extractedText);
      const characterCount = extractedText.length;
      const processingTime = Date.now() - startTime;

      onProgress?.(100, 'Complete');

      return {
        text: extractedText,
        pageCount,
        wordCount,
        characterCount,
        extractionMethod: method,
        processingTime,
      };
    } catch (error) {
      console.error('Error extracting text:', error);
      throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from PDF files
   */
  private static async extractPdfText(
    file: File,
    onProgress?: (progress: number, status: string) => void
  ): Promise<{ text: string; pageCount: number }> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    
    let fullText = '';
    
    for (let i = 1; i <= Math.min(pageCount, 50); i++) {
      // Limit to first 50 pages
      onProgress?.(20 + (i / pageCount) * 60, `Extracting page ${i} of ${pageCount}...`);
      
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }

    if (pageCount > 50) {
      fullText += `\n\n[Note: Document has ${pageCount} pages. Only first 50 pages extracted.]`;
    }

    return { text: fullText.trim(), pageCount };
  }

  /**
   * Extract text from DOCX files
   */
  private static async extractDocxText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (result.messages.length > 0) {
      console.warn('Mammoth conversion warnings:', result.messages);
    }
    
    return result.value;
  }

  /**
   * Extract text from images using OCR
   */
  private static async extractOcrText(
    file: File,
    onProgress?: (progress: number, status: string) => void
  ): Promise<string> {
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && m.progress) {
          onProgress?.(20 + m.progress * 60, `OCR: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const imageUrl = URL.createObjectURL(file);
    
    try {
      const { data: { text } } = await worker.recognize(imageUrl);
      return text;
    } finally {
      URL.revokeObjectURL(imageUrl);
      await worker.terminate();
    }
  }

  /**
   * Check if file is an image based on extension
   */
  private static isImageFile(fileName: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];
    return imageExtensions.some(ext => fileName.endsWith(ext));
  }

  /**
   * Count words in text
   */
  private static countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }

  /**
   * Generate a perceptual hash of the document content
   */
  static generateFingerprint(text: string, userId: string): string {
    // Simple hash - in production, use a proper perceptual hashing algorithm
    const contentHash = this.simpleHash(text);
    const timestamp = Date.now().toString(36);
    const userSignature = userId.substring(0, 8);
    
    return `fp_${contentHash}_${timestamp}_${userSignature}`;
  }

  /**
   * Simple hash function (for demo - replace with crypto.subtle.digest in production)
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).padStart(8, '0');
  }

  /**
   * Inject invisible tracers into text (zero-width characters)
   */
  static injectTracers(text: string, protectionId: string): string {
    // Convert protection ID to binary
    const binary = Array.from(protectionId)
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('');

    // Use zero-width characters to encode the ID
    const ZERO_WIDTH_SPACE = '\u200B';
    const ZERO_WIDTH_NON_JOINER = '\u200C';
    
    let tracerString = '';
    for (let bit of binary) {
      tracerString += bit === '0' ? ZERO_WIDTH_SPACE : ZERO_WIDTH_NON_JOINER;
    }

    // Inject tracers at strategic positions
    const words = text.split(' ');
    const positions = [
      Math.floor(words.length * 0.1),
      Math.floor(words.length * 0.5),
      Math.floor(words.length * 0.9),
    ];

    positions.forEach(pos => {
      if (pos < words.length) {
        words[pos] += tracerString;
      }
    });

    return words.join(' ');
  }

  /**
   * Detect tracers in text
   */
  static detectTracers(text: string): string | null {
    const ZERO_WIDTH_SPACE = '\u200B';
    const ZERO_WIDTH_NON_JOINER = '\u200C';
    
    // Extract zero-width characters
    const tracerChars = text.match(/[\u200B\u200C]+/g);
    
    if (!tracerChars || tracerChars.length === 0) {
      return null;
    }

    // Convert back to binary
    let binary = '';
    for (let char of tracerChars[0]) {
      binary += char === ZERO_WIDTH_SPACE ? '0' : '1';
    }

    // Convert binary to string
    const chunks = binary.match(/.{1,8}/g) || [];
    const protectionId = chunks
      .map(chunk => String.fromCharCode(parseInt(chunk, 2)))
      .join('');

    return protectionId;
  }

  /**
   * Validate file size (max 20MB)
   */
  static validateFileSize(file: File): boolean {
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    return file.size <= MAX_SIZE;
  }

  /**
   * Get supported file types
   */
  static getSupportedTypes(): string[] {
    return [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/webp',
    ];
  }
}
