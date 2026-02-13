import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { 
      file, 
      protectionLevel, 
      enableTracers, 
      enableFingerprinting,
      extractedText,
      fingerprint,
      wordCount,
      characterCount,
      extractionMethod,
      pageCount,
      protectionId,
      isGuest,
      guestSessionId,
      isBlueprint,
      hasWatermark
    } = await req.json();
    
    console.log('Processing document protection request:', {
      fileName: file.name,
      protectionLevel,
      enableTracers,
      enableFingerprinting,
      extractionMethod,
      wordCount,
      pageCount,
      hasExtractedText: !!extractedText,
      isGuest,
      hasGuestSession: !!guestSessionId,
      isBlueprint: isBlueprint || false,
      hasWatermark: hasWatermark || false
    });

    // Get user (optional for guests)
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    // Validate: either authenticated user or guest with session ID
    if (!user && (!isGuest || !guestSessionId)) {
      throw new Error('Authentication or guest session required');
    }

    // Create job record (only for authenticated users)
    let job = null;
    if (user) {
      const { data: jobData, error: jobError } = await supabaseClient
        .from('document_protection_jobs')
        .insert({
          user_id: user.id,
          original_filename: file.name,
          file_size: file.size,
          protection_level: protectionLevel,
          status: 'processing'
        })
        .select()
        .single();

      if (jobError) throw jobError;
      job = jobData;
    }

    // Convert data URL to ArrayBuffer
    let fileData: ArrayBuffer;
    let fileMimeType: string;
    
    if (file.url.startsWith('data:')) {
      // Parse data URL: data:mime/type;base64,actual-data
      const [header, base64Data] = file.url.split(',');
      const mimeMatch = header.match(/data:([^;]+)/);
      fileMimeType = mimeMatch ? mimeMatch[1] : file.type;
      
      // Decode base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      fileData = bytes.buffer;
    } else {
      // If not a data URL, fetch it
      fileData = await fetch(file.url).then(r => r.arrayBuffer());
      fileMimeType = file.type;
    }

    // Generate document fingerprint using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileFingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('Generated fingerprint:', fileFingerprint.substring(0, 16) + '...');

    // Use the text that was already extracted on the client side
    const finalExtractedText = extractedText || '';
    const extractionStatus = extractedText ? 'completed' : 'pending';
    
    console.log('Using client-extracted text:', {
      length: finalExtractedText.length,
      wordCount: wordCount || 0,
      method: extractionMethod || 'unknown'
    });

    // Update progress: 30% (only for authenticated users)
    if (job) {
      await supabaseClient.rpc('update_protection_job_progress', {
        job_id_param: job.id,
        progress_param: 30
      });
    }

    // Determine protection methods
    const protectionMethods = [];
    if (protectionLevel === 'basic') {
      protectionMethods.push('basic_fingerprinting');
    } else if (protectionLevel === 'standard') {
      protectionMethods.push('basic_fingerprinting', 'metadata_embedding');
      if (isBlueprint && hasWatermark) {
        protectionMethods.push('invisible_watermark');
      }
    } else {
      protectionMethods.push(
        'basic_fingerprinting',
        'metadata_embedding',
        'invisible_tracers',
        'pattern_injection'
      );
      if (isBlueprint && hasWatermark) {
        protectionMethods.push('invisible_watermark');
      }
    }

    // Generate protection ID
    const protectionId = `DOC-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Update progress: 60% (only for authenticated users)
    if (job) {
      await supabaseClient.rpc('update_protection_job_progress', {
        job_id_param: job.id,
        progress_param: 60
      });
    }

    // Upload protected file to storage
    const timestamp = Date.now();
    const userId = user?.id || 'guest';
    const fileName = `${userId}/${timestamp}-${file.name}`;
    
    // Determine content type from file extension or parsed mime type
    const getContentType = (filename: string, parsedMime: string): string => {
      const ext = filename.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc': 'application/msword',
        'pdf': 'application/pdf',
        'txt': 'text/plain',
        'rtf': 'application/rtf',
        'odt': 'application/vnd.oasis.opendocument.text',
        // Image/Blueprint formats
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'tiff': 'image/tiff',
        'tif': 'image/tiff',
        'bmp': 'image/bmp',
        'svg': 'image/svg+xml',
        'webp': 'image/webp',
      };
      
      // Use extension-based mime type if available, otherwise use parsed (without charset)
      const baseMime = parsedMime.split(';')[0].trim();
      return mimeTypes[ext || ''] || baseMime || 'application/octet-stream';
    };
    
    const contentType = getContentType(file.name, fileMimeType);
    console.log('Uploading with content type:', contentType, 'for file:', file.name);
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('protected-documents')
      .upload(fileName, fileData, {
        cacheControl: '3600',
        upsert: false,
        contentType: contentType,
      });

    if (uploadError) throw uploadError;

    // Update progress: 80% (only for authenticated users)
    if (job) {
      await supabaseClient.rpc('update_protection_job_progress', {
        job_id_param: job.id,
        progress_param: 80
      });
    }

    // Create protection record or guest upload
    const wordCount = extractedText ? extractedText.split(/\s+/).filter(w => w.length > 0).length : 0;
    const fileExtForCheck = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (isGuest && guestSessionId) {
      // Create guest upload record
      const { data: guestUpload, error: guestError } = await supabaseClient
        .from('guest_uploads')
        .insert({
          session_id: guestSessionId,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          content_type: file.type,
          protection_level: protectionLevel,
          protection_id: protectionId,
          fingerprint: fileFingerprint,
          word_count: wordCount,
          char_count: extractedText.length
        })
        .select('id')
        .single();

      if (guestError) throw guestError;

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Guest document protected successfully',
          guestUploadId: guestUpload.id,
          protectionId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Authenticated user flow
    const { data: protectionRecord, error: protectionError } = await supabaseClient
      .from('ai_protection_records')
      .insert({
        user_id: user!.id,
        protection_id: protectionId,
        content_type: 'document',
        original_filename: file.name,
        file_fingerprint: fileFingerprint,
        protection_level: protectionLevel,
        protection_methods: protectionMethods,
        protected_file_path: uploadData.path,
        original_mime_type: file.type,
        file_extension: file.name.split('.').pop() || '',
        word_count: wordCount,
        char_count: extractedText.length,
        document_methods: enableTracers ? ['invisible_tracers'] : [],
        metadata: {
          original_text: extractedText,
          file_size: file.size,
          uploaded_at: new Date().toISOString(),
          extraction_status: ['pdf', 'docx', 'doc'].includes(fileExtForCheck) && !extractedText ? 'pending' : 'completed'
        }
      })
      .select('id, protection_id')
      .single();

    if (protectionError) throw protectionError;

    // Trigger async text extraction for PDF/DOCX files if no text was extracted
    if (['pdf', 'docx', 'doc'].includes(fileExtForCheck) && !extractedText) {
      console.log('Triggering async text extraction for:', fileExtForCheck);
      
      // Invoke extract-document-text function asynchronously (don't wait)
      supabaseClient.functions.invoke('extract-document-text', {
        body: {
          protectionRecordId: protectionRecord.id,
          filePath: uploadData.path
        }
      }).then(({ error: extractError }) => {
        if (extractError) {
          console.error('Text extraction invocation error:', extractError);
        } else {
          console.log('Text extraction triggered successfully for record:', protectionRecord.id);
        }
      }).catch(err => {
        console.error('Text extraction promise error:', err);
      });
    }

    // Create document tracer if enabled
    let tracerId: string | undefined;
    if (enableTracers && protectionRecord) {
      const tracerPayload = btoa(JSON.stringify({
        protection_id: protectionRecord.protection_id,
        user_id: user!.id,
        timestamp: Date.now(),
        fingerprint: fileFingerprint.substring(0, 16),
      }));

      const { data: tracerData, error: tracerError } = await supabaseClient
        .from('ai_document_tracers')
        .insert({
          user_id: user!.id,
          protection_record_id: protectionRecord.id,
          tracer_type: 'invisible_marker',
          tracer_payload: tracerPayload,
          checksum: fileFingerprint.substring(0, 32),
        })
        .select('id')
        .single();

      if (!tracerError && tracerData) {
        tracerId = tracerData.id;
      }
    }

    // Update job to completed (only for authenticated users)
    if (job) {
      await supabaseClient.rpc('update_protection_job_progress', {
        job_id_param: job.id,
        progress_param: 100,
        status_param: 'completed'
      });

      await supabaseClient
        .from('document_protection_jobs')
        .update({ protection_record_id: protectionRecord.id })
        .eq('id', job.id);
    }

    console.log('Document protection completed:', {
      protectionId: protectionRecord.protection_id,
      tracerId
    });

    // Trigger background text extraction for PDF/DOCX files
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    if (['pdf', 'docx', 'doc'].includes(fileExt)) {
      console.log('Triggering background text extraction for:', fileExt);
      supabaseClient.functions.invoke('extract-document-text', {
        body: {
          protectionRecordId: protectionRecord.id,
          filePath: uploadData.path
        }
      }).catch(err => console.error('Background extraction error:', err));
    }

    return new Response(
      JSON.stringify({
        success: true,
        protectionRecordId: protectionRecord.id,
        documentPath: uploadData.path,
        tracerId,
        protectionId: protectionRecord.protection_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in process-document-protection:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});