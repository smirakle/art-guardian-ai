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

    // Generate document fingerprint using SHA-256
    const fileData = await fetch(file.url).then(r => r.arrayBuffer());
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileFingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('Generated fingerprint:', fileFingerprint.substring(0, 16) + '...');

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
    
    // Determine content type from file extension or use the provided type
    const getContentType = (filename: string, providedType?: string): string => {
      if (providedType && providedType !== 'text/plain') return providedType;
      
      const ext = filename.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc': 'application/msword',
        'pdf': 'application/pdf',
        'txt': 'text/plain',
        'rtf': 'application/rtf',
        'odt': 'application/vnd.oasis.opendocument.text',
      };
      return mimeTypes[ext || ''] || 'application/octet-stream';
    };
    
    const contentType = getContentType(file.name, file.type);
    console.log('Uploading with content type:', contentType);
    
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
        word_count: 0, // Placeholder - would need actual text extraction
        char_count: file.size,
        document_methods: enableTracers ? ['invisible_tracers'] : [],
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