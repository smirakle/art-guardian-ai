import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { file, protectionLevel, enableTracers, enableFingerprinting } = await req.json();
    
    console.log('Processing document protection request:', {
      fileName: file.name,
      protectionLevel,
      enableTracers,
      enableFingerprinting
    });

    // Get user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create job record
    const { data: job, error: jobError } = await supabaseClient
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

    // Extract text content only from plain text files
    let extractedText = '';
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (['txt', 'md'].includes(fileExtension) || fileMimeType === 'text/plain') {
      try {
        const textDecoder = new TextDecoder('utf-8', { fatal: false });
        extractedText = textDecoder.decode(fileData);
        
        // Limit text length to prevent storage issues (max 1MB)
        if (extractedText.length > 1000000) {
          extractedText = extractedText.substring(0, 1000000);
          console.log('Text truncated to 1MB');
        }
        
        console.log('Extracted text length:', extractedText.length);
      } catch (error) {
        console.error('Text extraction error:', error);
        extractedText = '';
      }
    } else {
      console.log('Skipping text extraction for non-text file type:', fileExtension);
    }

    // Update progress: 30%
    await supabaseClient.rpc('update_protection_job_progress', {
      job_id_param: job.id,
      progress_param: 30
    });

    // Determine protection methods
    const protectionMethods = [];
    if (protectionLevel === 'basic') {
      protectionMethods.push('basic_fingerprinting');
    } else if (protectionLevel === 'standard') {
      protectionMethods.push('basic_fingerprinting', 'metadata_embedding');
    } else {
      protectionMethods.push(
        'basic_fingerprinting',
        'metadata_embedding',
        'invisible_tracers',
        'pattern_injection'
      );
    }

    // Generate protection ID
    const protectionId = `DOC-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Update progress: 60%
    await supabaseClient.rpc('update_protection_job_progress', {
      job_id_param: job.id,
      progress_param: 60
    });

    // Upload protected file to storage
    const timestamp = Date.now();
    const fileName = `${user.id}/${timestamp}-${file.name}`;
    
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

    // Update progress: 80%
    await supabaseClient.rpc('update_protection_job_progress', {
      job_id_param: job.id,
      progress_param: 80
    });

    // Create protection record
    const wordCount = extractedText ? extractedText.split(/\s+/).filter(w => w.length > 0).length : 0;
    
    const { data: protectionRecord, error: protectionError } = await supabaseClient
      .from('ai_protection_records')
      .insert({
        user_id: user.id,
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
          uploaded_at: new Date().toISOString()
        }
      })
      .select('id, protection_id')
      .single();

    if (protectionError) throw protectionError;

    // Create document tracer if enabled
    let tracerId: string | undefined;
    if (enableTracers && protectionRecord) {
      const tracerPayload = btoa(JSON.stringify({
        protection_id: protectionRecord.protection_id,
        user_id: user.id,
        timestamp: Date.now(),
        fingerprint: fileFingerprint.substring(0, 16),
      }));

      const { data: tracerData, error: tracerError } = await supabaseClient
        .from('ai_document_tracers')
        .insert({
          user_id: user.id,
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

    // Update job to completed
    await supabaseClient.rpc('update_protection_job_progress', {
      job_id_param: job.id,
      progress_param: 100,
      status_param: 'completed'
    });

    await supabaseClient
      .from('document_protection_jobs')
      .update({ protection_record_id: protectionRecord.id })
      .eq('id', job.id);

    console.log('Document protection completed:', {
      protectionId: protectionRecord.protection_id,
      tracerId
    });

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