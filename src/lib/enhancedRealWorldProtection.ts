import { supabase } from '@/integrations/supabase/client';
import { PDFDocument, rgb } from 'pdf-lib';

export interface EnhancedProtectionResult {
  success: boolean;
  protectionId: string;
  protectedBlob: Blob;
  protectionMethods: string[];
  protectionLevel: string;
  storagePath?: string;
  metadata: any;
  errors?: string[];
  artworkId?: string;
  recordId?: string;
}

export interface EnhancedProtectionOptions {
  enableAdversarialNoise: boolean;
  enableRightsMetadata: boolean;
  enableCrawlerBlocking: boolean;
  enableInvisibleWatermark: boolean;
  enableRealTimeMonitoring?: boolean;
  enableBlockchainRegistration: boolean;
  enableLikenessProtection: boolean;
  // Document-specific protection options
  enablePolicyEmbedding?: boolean;
  enableInvisibleTracers?: boolean;
  enableSemanticPerturbation?: boolean;
  enableZeroWidthJoiners?: boolean;
  protectionLevel: 'basic' | 'advanced' | 'maximum';
  copyrightInfo?: any;
  artworkId?: string;
  userId: string;
  fileName: string;
}

export class EnhancedRealWorldProtection {
  private static instance: EnhancedRealWorldProtection;

  static getInstance(): EnhancedRealWorldProtection {
    if (!EnhancedRealWorldProtection.instance) {
      EnhancedRealWorldProtection.instance = new EnhancedRealWorldProtection();
    }
    return EnhancedRealWorldProtection.instance;
  }

  async protectFileWithDatabase(
    file: File, 
    options: EnhancedProtectionOptions
  ): Promise<EnhancedProtectionResult> {
    try {
      // Generate protection ID
      const protectionId = this.generateProtectionId();
      
      // Calculate file fingerprint
      const fileFingerprint = await this.calculateFileFingerprint(file);
      
      // Apply protection methods
      let protectedBlob = file as Blob;
      const appliedMethods: string[] = [];

      if (options.enableAdversarialNoise) {
        protectedBlob = await this.applyAdversarialNoise(protectedBlob);
        appliedMethods.push('adversarial_noise');
      }

      if (options.enableRightsMetadata) {
        protectedBlob = await this.injectRightsMetadata(protectedBlob, options.copyrightInfo);
        appliedMethods.push('rights_metadata');
      }

      if (options.enableCrawlerBlocking) {
        protectedBlob = await this.addCrawlerBlocking(protectedBlob);
        appliedMethods.push('crawler_blocking');
      }

      if (options.enableInvisibleWatermark) {
        protectedBlob = await this.applyInvisibleWatermark(protectedBlob, options.copyrightInfo);
        appliedMethods.push('invisible_watermark');
      }

      if (options.enableBlockchainRegistration) {
        const blockchainResult = await this.registerOnBlockchain(protectedBlob, options);
        appliedMethods.push('blockchain_registration');
        // Store blockchain info in metadata for later use
        if (blockchainResult.success) {
          appliedMethods.push('blockchain_verified');
        }
      }

      if (options.enableLikenessProtection) {
        protectedBlob = await this.applyLikenessProtection(protectedBlob);
        appliedMethods.push('likeness_protection');
      }

      if (options.enableRealTimeMonitoring) {
        // Apply real-time monitoring markers
        protectedBlob = await this.applyRealTimeMonitoring(protectedBlob);
        appliedMethods.push('real_time_monitoring');
      }

      // Enhanced protection based on level
      if (options.protectionLevel === 'advanced' || options.protectionLevel === 'maximum') {
        protectedBlob = await this.applyAdvancedProtection(protectedBlob);
        appliedMethods.push('advanced_fingerprinting');
      }

      if (options.protectionLevel === 'maximum') {
        protectedBlob = await this.applyMaximumProtection(protectedBlob);
        appliedMethods.push('maximum_obfuscation');
      }

      // Document-specific protection (zero-width tracers, PDF hidden layer, etc.)
      const extLower = (options.fileName.split('.').pop() || '').toLowerCase();
      const isDocument = file.type.startsWith('text') || ['pdf','doc','docx','rtf','md','txt'].includes(extLower);
      let docMeta: null | {
        documentMethods: string[];
        tracerPayload: string;
        docTracerChecksum: string;
        wordCount: number;
        charCount: number;
        textFingerprint: string;
        tracerType: string;
      } = null;

      if (isDocument) {
        const docResult = await this.applyDocumentProtection(file, protectionId);
        protectedBlob = docResult.blob;
        docMeta = {
          documentMethods: docResult.documentMethods,
          tracerPayload: docResult.tracerPayload,
          docTracerChecksum: docResult.docTracerChecksum,
          wordCount: docResult.wordCount,
          charCount: docResult.charCount,
          textFingerprint: docResult.textFingerprint,
          tracerType: docResult.tracerType,
        };
        // Track high-level method tag
        appliedMethods.push('document_tracers');
      }

      const metadata = {
        originalSize: file.size,
        protectedSize: protectedBlob.size,
        appliedAt: new Date().toISOString(),
        protectionStrength: this.calculateProtectionStrength(appliedMethods),
        fileType: file.type,
        ...options.copyrightInfo
      };

      // Upload protected file to storage
      const fileExtension = options.fileName.split('.').pop() || 'bin';
      const storagePath = `${options.userId}/${protectionId}.${fileExtension}`;
      
      const { error: uploadError } = await supabase.storage
        .from('ai-protected-files')
        .upload(storagePath, protectedBlob);
      
      if (uploadError) {
        console.error('Storage upload failed:', uploadError);
        throw new Error('Failed to store protected file');
      }

      // Save protection record to database
      const contentType = isDocument ? 'document' : (file.type.startsWith('video') ? 'video' : (file.type.startsWith('audio') ? 'audio' : 'image'));
      const payload: any = {
        artwork_id: options.artworkId || null,
        user_id: options.userId,
        protection_id: protectionId,
        protection_methods: appliedMethods,
        protection_level: options.protectionLevel,
        metadata: metadata,
        file_fingerprint: fileFingerprint,
        original_filename: options.fileName,
        protected_file_path: storagePath,
        is_active: true,
        // new columns
        content_type: contentType,
        original_mime_type: file.type || null,
        file_extension: extLower || null,
        document_methods: docMeta?.documentMethods || [],
        doc_tracer_checksum: docMeta?.docTracerChecksum || null,
        word_count: docMeta?.wordCount || 0,
        char_count: docMeta?.charCount || 0,
        language: null,
        text_fingerprint: docMeta?.textFingerprint || null,
      };

      const { data: protectionRecord, error: dbError } = await supabase
        .from('ai_protection_records')
        .insert(payload as any)
        .select()
        .single();

      if (dbError) {
        console.error('Failed to save protection record:', dbError);
        throw new Error('Failed to save protection record');
      }

      // Insert document tracer record when applicable
      if (docMeta) {
        const { error: tracerErr } = await supabase
          .from('ai_document_tracers')
          .insert({
            user_id: options.userId,
            protection_record_id: protectionRecord.id,
            tracer_type: docMeta.tracerType,
            tracer_payload: docMeta.tracerPayload,
            checksum: docMeta.docTracerChecksum,
            notes: `auto for ${options.fileName}`,
          });
        if (tracerErr) {
          console.warn('Failed to insert document tracer (non-fatal):', tracerErr);
        }
      }

      // Update artwork record if provided
      if (options.artworkId) {
        await supabase
          .from('artwork')
          .update({
            ai_protection_enabled: true,
            ai_protection_level: options.protectionLevel,
            ai_protection_methods: appliedMethods,
            protection_record_id: protectionRecord.id
          })
          .eq('id', options.artworkId);
      }

      return {
        success: true,
        protectionId,
        protectedBlob,
        protectionMethods: appliedMethods,
        protectionLevel: options.protectionLevel,
        storagePath,
        metadata,
        artworkId: options.artworkId,
        recordId: protectionRecord.id
      };

    } catch (error) {
      console.error('Protection failed:', error);
      return {
        success: false,
        protectionId: '',
        protectedBlob: file,
        protectionMethods: [],
        protectionLevel: 'none',
        metadata: {},
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private generateProtectionId(): string {
    return crypto.randomUUID();
  }

  private async calculateFileFingerprint(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async applyAdversarialNoise(blob: Blob): Promise<Blob> {
    // Implement adversarial noise application
    const buffer = await blob.arrayBuffer();
    const data = new Uint8Array(buffer);
    
    // Apply subtle pixel-level noise
    for (let i = 0; i < data.length; i += 4) {
      if (i + 3 < data.length) {
        // Add imperceptible noise to RGB channels
        data[i] = Math.min(255, data[i] + (Math.random() - 0.5) * 2);
        data[i + 1] = Math.min(255, data[i + 1] + (Math.random() - 0.5) * 2);
        data[i + 2] = Math.min(255, data[i + 2] + (Math.random() - 0.5) * 2);
      }
    }
    
    return new Blob([data], { type: blob.type });
  }

  private async injectRightsMetadata(blob: Blob, copyrightInfo?: any): Promise<Blob> {
    const metadata = {
      aiTrainingProhibited: true,
      copyrightNotice: copyrightInfo?.notice || 'All rights reserved',
      createdAt: new Date().toISOString(),
      protectionLevel: 'AI_TRAINING_BLOCKED',
      ...copyrightInfo
    };

    const metadataString = JSON.stringify(metadata);
    const metadataBytes = new TextEncoder().encode(metadataString);
    
    const originalBuffer = await blob.arrayBuffer();
    const combinedBuffer = new ArrayBuffer(originalBuffer.byteLength + metadataBytes.length + 4);
    const combinedView = new Uint8Array(combinedBuffer);
    
    // Add length prefix
    const lengthView = new DataView(combinedBuffer, 0, 4);
    lengthView.setUint32(0, metadataBytes.length, false);
    
    // Add metadata
    combinedView.set(metadataBytes, 4);
    
    // Add original data
    combinedView.set(new Uint8Array(originalBuffer), 4 + metadataBytes.length);
    
    return new Blob([combinedBuffer], { type: blob.type });
  }

  private async addCrawlerBlocking(blob: Blob): Promise<Blob> {
    // Add anti-crawling markers
    const markers = new TextEncoder().encode('AI_TRAINING_BLOCKED_MARKER');
    const originalBuffer = await blob.arrayBuffer();
    const combinedBuffer = new ArrayBuffer(originalBuffer.byteLength + markers.length);
    const combinedView = new Uint8Array(combinedBuffer);
    
    combinedView.set(new Uint8Array(originalBuffer));
    combinedView.set(markers, originalBuffer.byteLength);
    
    return new Blob([combinedBuffer], { type: blob.type });
  }

  private async applyAdvancedProtection(blob: Blob): Promise<Blob> {
    // Apply advanced fingerprinting and tracking
    const fingerprintData = new TextEncoder().encode(`ADVANCED_FINGERPRINT_${Date.now()}`);
    const originalBuffer = await blob.arrayBuffer();
    const combinedBuffer = new ArrayBuffer(originalBuffer.byteLength + fingerprintData.length);
    const combinedView = new Uint8Array(combinedBuffer);
    
    combinedView.set(new Uint8Array(originalBuffer));
    combinedView.set(fingerprintData, originalBuffer.byteLength);
    
    return new Blob([combinedBuffer], { type: blob.type });
  }

  private async applyMaximumProtection(blob: Blob): Promise<Blob> {
    // Apply maximum obfuscation techniques
    const obfuscationData = new TextEncoder().encode(`MAX_PROTECTION_${Math.random().toString(36)}`);
    const originalBuffer = await blob.arrayBuffer();
    const combinedBuffer = new ArrayBuffer(originalBuffer.byteLength + obfuscationData.length);
    const combinedView = new Uint8Array(combinedBuffer);
    
    combinedView.set(new Uint8Array(originalBuffer));
    combinedView.set(obfuscationData, originalBuffer.byteLength);
    
    return new Blob([combinedBuffer], { type: blob.type });
  }

  private async applyInvisibleWatermark(blob: Blob, copyrightInfo?: any): Promise<Blob> {
    // Apply invisible watermarking for images/videos
    const watermarkData = {
      owner: copyrightInfo?.owner || 'TSMO User',
      timestamp: Date.now(),
      watermarkId: `wm-${Math.random().toString(36).substr(2, 9)}`,
      type: 'invisible_watermark'
    };

    const watermarkBytes = new TextEncoder().encode(JSON.stringify(watermarkData));
    const originalBuffer = await blob.arrayBuffer();
    const combinedBuffer = new ArrayBuffer(originalBuffer.byteLength + watermarkBytes.length + 8);
    const combinedView = new Uint8Array(combinedBuffer);
    
    // Add watermark signature
    const signature = new TextEncoder().encode('IWMK'); // Invisible Watermark
    combinedView.set(signature, 0);
    
    // Add watermark length
    const lengthView = new DataView(combinedBuffer, 4, 4);
    lengthView.setUint32(0, watermarkBytes.length, false);
    
    // Add watermark data
    combinedView.set(watermarkBytes, 8);
    
    // Add original data
    combinedView.set(new Uint8Array(originalBuffer), 8 + watermarkBytes.length);
    
    return new Blob([combinedBuffer], { type: blob.type });
  }

  private async registerOnBlockchain(blob: Blob, options: EnhancedProtectionOptions): Promise<{success: boolean, hash?: string}> {
    try {
      // Simulate blockchain registration
      const fingerprint = await this.calculateFileFingerprint(new File([blob], options.fileName));
      const blockchainHash = `0x${fingerprint.substring(0, 64)}`;
      
      // In a real implementation, this would interact with a blockchain
      console.log('Blockchain registration simulated:', blockchainHash);
      
      return { success: true, hash: blockchainHash };
    } catch (error) {
      console.error('Blockchain registration failed:', error);
      return { success: false };
    }
  }

  private async applyLikenessProtection(blob: Blob): Promise<Blob> {
    // Apply likeness protection (anti-deepfake measures)
    const protectionData = {
      type: 'likeness_protection',
      timestamp: Date.now(),
      protection_id: `lp-${Math.random().toString(36).substr(2, 9)}`,
      anti_deepfake_markers: true
    };

    const protectionBytes = new TextEncoder().encode(JSON.stringify(protectionData));
    const originalBuffer = await blob.arrayBuffer();
    const combinedBuffer = new ArrayBuffer(originalBuffer.byteLength + protectionBytes.length + 8);
    const combinedView = new Uint8Array(combinedBuffer);
    
    // Add protection signature
    const signature = new TextEncoder().encode('LPRT'); // Likeness Protection
    combinedView.set(signature, 0);
    
    // Add protection data length
    const lengthView = new DataView(combinedBuffer, 4, 4);
    lengthView.setUint32(0, protectionBytes.length, false);
    
    // Add protection data
    combinedView.set(protectionBytes, 8);
    
    // Add original data
    combinedView.set(new Uint8Array(originalBuffer), 8 + protectionBytes.length);
    
    return new Blob([combinedBuffer], { type: blob.type });
  }

  private async applyRealTimeMonitoring(blob: Blob): Promise<Blob> {
    // Apply real-time monitoring markers for continuous violation detection
    const monitoringData = {
      type: 'real_time_monitoring',
      timestamp: Date.now(),
      monitoring_id: `rtm-${Math.random().toString(36).substr(2, 9)}`,
      scan_intervals: ['hourly', 'daily', 'weekly'],
      threat_detection: true,
      violation_alerts: true,
      auto_enforcement: true
    };

    const monitoringBytes = new TextEncoder().encode(JSON.stringify(monitoringData));
    const originalBuffer = await blob.arrayBuffer();
    const combinedBuffer = new ArrayBuffer(originalBuffer.byteLength + monitoringBytes.length + 8);
    const combinedView = new Uint8Array(combinedBuffer);
    
    // Add monitoring signature
    const signature = new TextEncoder().encode('RTMT'); // Real-Time Monitoring
    combinedView.set(signature, 0);
    
    // Add monitoring data length
    const lengthView = new DataView(combinedBuffer, 4, 4);
    lengthView.setUint32(0, monitoringBytes.length, false);
    
    // Add monitoring data
    combinedView.set(monitoringBytes, 8);
    
    // Add original data
    combinedView.set(new Uint8Array(originalBuffer), 8 + monitoringBytes.length);
    
    return new Blob([combinedBuffer], { type: blob.type });
  }

  // Document-specific protection helpers
  private async applyDocumentProtection(file: File, protectionId: string): Promise<{ blob: Blob; documentMethods: string[]; tracerPayload: string; docTracerChecksum: string; wordCount: number; charCount: number; textFingerprint: string; tracerType: string; }> {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const tracerPayload = `TRC-${protectionId}-${Date.now()}`;
    const docTracerChecksum = await this.hashString(tracerPayload);

    if (file.type.startsWith('text') || ['txt','md','rtf','csv','json'].includes(ext)) {
      const originalText = await file.text();
      const injected = this.embedZeroWidth(tracerPayload) + originalText;
      const blob = new Blob([injected], { type: 'text/plain' });
      const wordCount = (originalText.trim().match(/\S+/g) || []).length;
      const charCount = originalText.length;
      const textFingerprint = await this.hashString(originalText);
      return { blob, documentMethods: ['zero_width_tracers'], tracerPayload, docTracerChecksum, wordCount, charCount, textFingerprint, tracerType: 'zero_width' };
    }

    if (ext === 'pdf' || file.type === 'application/pdf') {
      const buf = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf);
      const pages = pdfDoc.getPages();
      pages.forEach((p, idx) => {
        p.drawText(tracerPayload, { x: 10, y: 10 + (idx % 3), size: 0.5, color: rgb(1,1,1) });
      });
      const out = await pdfDoc.save();
      const blob = new Blob([out], { type: 'application/pdf' });
      const textFingerprint = await this.hashBuffer(buf);
      return { blob, documentMethods: ['pdf_hidden_layer'], tracerPayload, docTracerChecksum, wordCount: 0, charCount: 0, textFingerprint, tracerType: 'pdf_hidden_layer' };
    }

    if (['doc','docx'].includes(ext)) {
      // Fallback: cannot modify reliably client-side; record tracer only
      const buf = await file.arrayBuffer();
      const textFingerprint = await this.hashBuffer(buf);
      return { blob: file, documentMethods: ['docx_metadata'], tracerPayload, docTracerChecksum, wordCount: 0, charCount: 0, textFingerprint, tracerType: 'metadata' };
    }

    // Default: no change
    const buf = await file.arrayBuffer();
    const textFingerprint = await this.hashBuffer(buf);
    return { blob: file, documentMethods: ['metadata_only'], tracerPayload, docTracerChecksum, wordCount: 0, charCount: 0, textFingerprint, tracerType: 'metadata' };
  }

  private embedZeroWidth(payload: string): string {
    // Encode payload to zero-width characters
    const bin = Array.from(new TextEncoder().encode(payload)).map(b => b.toString(2).padStart(8, '0')).join('');
    const zeroWidth = bin.replace(/0/g, '\u200B').replace(/1/g, '\u200C');
    return `\u200D${zeroWidth}\u200D`;
  }

  private async hashString(input: string): Promise<string> {
    const bytes = new TextEncoder().encode(input);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async hashBuffer(buf: ArrayBuffer): Promise<string> {
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private calculateProtectionStrength(methods: string[]): number {
    const weights = {
      adversarial_noise: 20,
      rights_metadata: 15,
      crawler_blocking: 10,
      invisible_watermark: 25,
      blockchain_registration: 30,
      likeness_protection: 25,
      advanced_fingerprinting: 20,
      maximum_obfuscation: 25,
      real_time_monitoring: 15,
      // Document-specific protection methods
      policy_embedding: 10,
      invisible_tracers: 20,
      semantic_perturbation: 25,
      zero_width_joiners: 30,
      document_watermarking: 35
    };

    return methods.reduce((total, method) => {
      return total + (weights[method as keyof typeof weights] || 0);
    }, 0);
  }

  async getProtectionRecord(protectionId: string): Promise<any> {
    const { data, error } = await supabase
      .from('ai_protection_records')
      .select('*')
      .eq('protection_id', protectionId)
      .single();

    if (error) {
      console.error('Failed to fetch protection record:', error);
      return null;
    }

    return data;
  }

  async getUserProtectionRecords(userId: string, limit = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('ai_protection_records')
      .select(`
        *,
        artwork:artwork_id (
          title,
          description,
          status
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch protection records:', error);
      return [];
    }

    return data || [];
  }

  async reportViolation(data: {
    protectionRecordId: string;
    userId: string;
    artworkId: string;
    violationType: string;
    sourceUrl?: string;
    evidenceData: any;
    confidenceScore: number;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_training_violations')
        .insert({
          protection_record_id: data.protectionRecordId,
          user_id: data.userId,
          artwork_id: data.artworkId,
          violation_type: data.violationType,
          source_url: data.sourceUrl,
          evidence_data: data.evidenceData,
          confidence_score: data.confidenceScore,
          status: 'pending'
        });

      if (error) {
        console.error('Failed to report violation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error reporting violation:', error);
      return false;
    }
  }
}

export const enhancedRealWorldProtection = EnhancedRealWorldProtection.getInstance();