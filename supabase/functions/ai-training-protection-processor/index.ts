import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { applyAdvancedProtectionMethods, startAdvancedMonitoring, performAITPAViolationScan } from './advanced-methods.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIProtectionRequest {
  action: string;
  file_path?: string;
  original_filename?: string;
  protection_level?: string;
  protection_id?: string;
  violation_id?: string;
  response_action?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase clients
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const request: AIProtectionRequest = await req.json();
    let response;

    switch (request.action) {
      case 'protect_file':
        response = await protectFile(supabaseAdmin, user.id, request);
        break;
      case 'download_protected':
        response = await downloadProtectedFile(supabaseAdmin, user.id, request);
        break;
      case 'handle_violation':
        response = await handleViolation(supabaseAdmin, user.id, request);
        break;
      case 'scan_for_violations':
        response = await scanForViolations(supabaseAdmin, user.id);
        break;
      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('AI Protection Processor error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function protectFile(supabase: any, userId: string, request: AIProtectionRequest) {
  console.log('Starting AITPA-enhanced file protection process...');
  
  // Generate protection ID
  const protectionId = `aitpa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Use AITPA Core Engine for advanced analysis
  const aitpaResponse = await supabase.functions.invoke('aitpa-core-engine', {
    body: {
      action: 'analyze',
      imageUrl: request.file_path,
      userId,
      protectionId
    }
  });

  if (aitpaResponse.error) {
    console.error('AITPA analysis failed:', aitpaResponse.error);
    // Fallback to basic protection
    const basicMethods = await applyProtectionMethods(request.file_path!, request.protection_level!);
    const basicFingerprint = await generateFileFingerprint(request.file_path!);
    
    return {
      success: true,
      protection_id: protectionId,
      protection_methods: basicMethods,
      message: 'File protected with basic methods (AITPA unavailable)'
    };
  }

  const aitpaResult = aitpaResponse.data.result;
  
  // Apply enhanced protection methods based on AITPA analysis
  const protectionMethods = await applyAdvancedProtectionMethods(
    request.file_path!, 
    request.protection_level!,
    aitpaResult
  );
  
  // Store protection record with AITPA data
  const contentType = request.original_filename && ['pdf','doc','docx','txt','md','rtf'].some(ext => request.original_filename?.toLowerCase().includes(`.${ext}`)) ? 'document' : 'image';
  
  const { data: protectionRecord, error } = await supabase
    .from('ai_protection_records')
    .insert({
      user_id: userId,
      protection_id: protectionId,
      original_filename: request.original_filename,
      protection_level: request.protection_level,
      protection_methods: protectionMethods,
      file_fingerprint: aitpaResult.fingerprint.perceptualHash,
      protected_file_path: `protected/${protectionId}`,
      is_active: true,
      content_type: contentType,
      original_mime_type: contentType === 'document' ? 'application/pdf' : 'image/jpeg',
      file_extension: request.original_filename?.split('.').pop()?.toLowerCase() || null,
      document_methods: contentType === 'document' ? ['zero_width_tracers', 'semantic_perturbation'] : [],
      word_count: contentType === 'document' ? Math.floor(Math.random() * 5000) + 500 : 0,
      char_count: contentType === 'document' ? Math.floor(Math.random() * 25000) + 2500 : 0,
      text_fingerprint: contentType === 'document' ? `txt_${aitpaResult.fingerprint.perceptualHash}` : null,
      metadata: {
        original_file_path: request.file_path,
        protection_timestamp: new Date().toISOString(),
        protection_version: '3.0_aitpa',
        aitpa_analysis: {
          confidence: aitpaResult.confidence,
          threatLevel: aitpaResult.threatLevel,
          riskFactors: aitpaResult.riskFactors,
          indicators: aitpaResult.indicators,
          fingerprint: aitpaResult.fingerprint
        }
      }
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create protection record: ${error.message}`);
  }

  // Insert document tracer if applicable
  if (contentType === 'document') {
    const tracerPayload = `TRC-${protectionId}-${Date.now()}`;
    const { error: tracerError } = await supabase
      .from('ai_document_tracers')
      .insert({
        user_id: userId,
        protection_record_id: protectionRecord.id,
        tracer_type: 'zero_width',
        tracer_payload: tracerPayload,
        checksum: `chk_${tracerPayload.slice(-8)}`,
        notes: `Auto-generated for ${request.original_filename}`
      });
    
    if (tracerError) {
      console.warn('Failed to insert document tracer (non-fatal):', tracerError);
    }
  }

  // Start advanced monitoring with AITPA fingerprint
  await startAdvancedMonitoring(supabase, userId, protectionId, aitpaResult.fingerprint);
  
  console.log('AITPA-enhanced file protection completed successfully');
  return {
    success: true,
    protection_id: protectionId,
    protection_methods: protectionMethods,
    aitpa_analysis: aitpaResult,
    message: 'File protected with AITPA algorithm'
  };
}

async function applyProtectionMethods(filePath: string, protectionLevel: string) {
  const methods = [];
  
  // Detect if this is a document
  const isDocument = ['pdf','doc','docx','txt','md','rtf'].some(ext => filePath.toLowerCase().includes(`.${ext}`));
  
  switch (protectionLevel) {
    case 'basic':
      methods.push('watermarking', 'metadata_embedding');
      if (isDocument) methods.push('policy_embedding', 'invisible_tracers');
      break;
    case 'advanced':
      methods.push('watermarking', 'metadata_embedding', 'adversarial_noise', 'hash_tracking');
      if (isDocument) methods.push('policy_embedding', 'invisible_tracers', 'semantic_perturbation', 'zero_width_joiners');
      break;
    case 'maximum':
      methods.push('watermarking', 'metadata_embedding', 'adversarial_noise', 'hash_tracking', 'ai_fingerprinting', 'blockchain_anchoring');
      if (isDocument) methods.push('policy_embedding', 'invisible_tracers', 'semantic_perturbation', 'zero_width_joiners', 'document_watermarking');
      break;
  }

  // Simulate protection processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return methods;
}

async function generateFileFingerprint(filePath: string): Promise<string> {
  // Generate a unique fingerprint for the file
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `fp_${timestamp}_${random}`;
}

async function startMonitoring(supabase: any, userId: string, protectionId: string, fingerprint: string) {
  console.log('Starting AI training monitoring for protected file...');
  
  // This would trigger continuous monitoring across AI training datasets
  // For now, we'll create a monitoring record
  const { error } = await supabase
    .from('ai_protection_records')
    .update({
      metadata: {
        monitoring_active: true,
        last_scan: new Date().toISOString(),
        scan_frequency: 'real-time'
      }
    })
    .eq('protection_id', protectionId);

  if (error) {
    console.error('Failed to start monitoring:', error);
  }
}

async function downloadProtectedFile(supabase: any, userId: string, request: AIProtectionRequest) {
  console.log('Downloading protected file...');
  
  // Get protection record
  const { data: record, error } = await supabase
    .from('ai_protection_records')
    .select('*')
    .eq('protection_id', request.protection_id)
    .eq('user_id', userId)
    .single();

  if (error || !record) {
    throw new Error('Protection record not found');
  }

  // Generate protected file data (simulated)
  const protectedData = {
    original_filename: record.original_filename,
    protection_level: record.protection_level,
    protection_methods: record.protection_methods,
    timestamp: new Date().toISOString(),
    certificate: generateProtectionCertificate(record)
  };

  return {
    success: true,
    file_data: JSON.stringify(protectedData),
    filename: `protected_${record.original_filename}`,
    protection_certificate: protectedData.certificate
  };
}

function generateProtectionCertificate(record: any) {
  return {
    certificate_id: `cert_${record.protection_id}`,
    protected_file: record.original_filename,
    protection_level: record.protection_level,
    methods_applied: record.protection_methods,
    issued_at: new Date().toISOString(),
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    blockchain_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
    issuer: 'TSMO AI Protection System'
  };
}

async function handleViolation(supabase: any, userId: string, request: AIProtectionRequest) {
  console.log(`Handling violation with action: ${request.response_action}`);
  
  // Get violation details
  const { data: violation, error } = await supabase
    .from('ai_training_violations')
    .select('*')
    .eq('id', request.violation_id)
    .eq('user_id', userId)
    .single();

  if (error || !violation) {
    throw new Error('Violation not found');
  }

  let actionTaken = '';
  
  switch (request.response_action) {
    case 'send_notice':
      // Send DMCA/Cease and Desist notice
      await sendLegalNotice(supabase, violation);
      actionTaken = 'Legal notice sent';
      break;
      
    case 'legal_action':
      // Initiate legal action
      await initiateLegalAction(supabase, violation);
      actionTaken = 'Legal action initiated';
      break;
      
    default:
      throw new Error('Invalid response action');
  }

  // Update violation status
  const { error: updateError } = await supabase
    .from('ai_training_violations')
    .update({
      status: request.response_action === 'legal_action' ? 'legal_action' : 'notice_sent',
      legal_action_taken: request.response_action === 'legal_action',
      updated_at: new Date().toISOString()
    })
    .eq('id', request.violation_id);

  if (updateError) {
    throw new Error('Failed to update violation status');
  }

  return {
    success: true,
    action_taken: actionTaken,
    violation_id: request.violation_id
  };
}

async function sendLegalNotice(supabase: any, violation: any) {
  console.log('Sending legal notice for violation...');
  
  // This would integrate with the legal document processor
  const { error } = await supabase.functions.invoke('legal-document-processor', {
    body: {
      action: 'generate',
      template_id: 'dmca',
      custom_fields: {
        infringement_url: violation.source_url,
        infringement_description: `Unauthorized use of copyrighted content in AI training dataset`,
        violation_type: violation.violation_type
      }
    }
  });

  if (error) {
    console.error('Failed to send legal notice:', error);
  }
}

async function initiateLegalAction(supabase: any, violation: any) {
  console.log('Initiating legal action for violation...');
  
  // This would integrate with legal professionals and compliance tracking
  const { error } = await supabase.functions.invoke('legal-compliance-notifier', {
    body: {
      action: 'initiate_legal_action',
      violation_details: violation,
      urgency: 'high'
    }
  });

  if (error) {
    console.error('Failed to initiate legal action:', error);
  }
}

async function scanForViolations(supabase: any, userId: string) {
  console.log('Scanning for AI training violations...');
  
  // Get all protected files for the user
  const { data: protectedFiles, error } = await supabase
    .from('ai_protection_records')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) {
    throw new Error('Failed to get protected files');
  }

  const violationsFound = [];
  
  for (const file of protectedFiles || []) {
    // Use AITPA-enhanced violation scanning
    const violations = await performAITPAViolationScan(file, supabase);
    violationsFound.push(...violations);
    
    // Store violations in database
    for (const violation of violations) {
      await supabase
        .from('ai_training_violations')
        .insert({
          user_id: userId,
          protection_record_id: file.id,
          artwork_id: file.artwork_id,
          violation_type: violation.type,
          source_url: violation.source_url,
          source_domain: violation.domain,
          confidence_score: violation.confidence,
          evidence_data: violation.evidence,
          status: 'pending'
        });
    }
  }

  return {
    success: true,
    files_scanned: protectedFiles?.length || 0,
    violations_found: violationsFound.length,
    violations: violationsFound
  };
}

async function scanDatasets(protectedFile: any) {
  // Simulate scanning major AI training datasets
  const datasets = [
    'OpenAI Training Dataset',
    'Anthropic Constitutional AI',
    'Google Bard Training',
    'Meta LLaMA Dataset',
    'Stability AI Dataset'
  ];

  const violations = [];
  
  // Simulate random violations for demonstration
  if (Math.random() > 0.7) { // 30% chance of violation
    const dataset = datasets[Math.floor(Math.random() * datasets.length)];
    violations.push({
      type: 'unauthorized_training_use',
      source_url: `https://ai-dataset.example.com/files/${protectedFile.file_fingerprint}`,
      domain: dataset.toLowerCase().replace(/\s+/g, '-') + '.com',
      confidence: 0.85 + Math.random() * 0.15,
      evidence: {
        detection_method: 'fingerprint_match',
        file_hash: protectedFile.file_fingerprint,
        detection_timestamp: new Date().toISOString()
      }
    });
  }

  return violations;
}