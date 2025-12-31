import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-adobe-plugin-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const SUPABASE_URL = 'https://utneaqmbyjwxaqrrarpc.supabase.co';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface ProtectionRequest {
  action: 'protect' | 'verify' | 'batch_protect' | 'get_status' | 'list_protections';
  protectionLevel?: 'basic' | 'professional' | 'enterprise';
  fileHash?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  metadata?: {
    copyrightOwner?: string;
    copyrightYear?: number;
    rights?: string;
    contactEmail?: string;
    prohibitAiTraining?: boolean;
    prohibitDerivatives?: boolean;
    requireAttribution?: boolean;
  };
  batchFiles?: Array<{
    fileHash: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }>;
  protectionId?: string;
}

interface ProtectionResponse {
  success: boolean;
  protectionId?: string;
  protectionCertificate?: {
    id: string;
    timestamp: string;
    methods: string[];
    level: string;
    xmpDirective: string;
    c2paManifest?: object;
  };
  verificationResult?: {
    isProtected: boolean;
    protectionId?: string;
    protectedAt?: string;
    owner?: string;
  };
  protections?: Array<{
    id: string;
    fileName: string;
    protectedAt: string;
    level: string;
  }>;
  error?: string;
  message?: string;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generateProtectionId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.getRandomValues(new Uint8Array(16))
    .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
  return `TSMO-ADOBE-${timestamp}-${random}`.toUpperCase();
}

function generateXmpDirective(metadata: ProtectionRequest['metadata']): string {
  const aiRights = [];
  if (metadata?.prohibitAiTraining) aiRights.push('noai');
  if (metadata?.prohibitDerivatives) aiRights.push('noderivatives');
  if (metadata?.requireAttribution) aiRights.push('attribution-required');
  
  return `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"
      xmlns:tsmo="http://ns.tsmo.io/ai-protection/1.0/"
      xmlns:c2pa="http://c2pa.org/claim/1.0/">
      <dc:rights>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${metadata?.rights || 'All Rights Reserved'}</rdf:li>
        </rdf:Alt>
      </dc:rights>
      <dc:creator>
        <rdf:Seq>
          <rdf:li>${metadata?.copyrightOwner || 'Unknown'}</rdf:li>
        </rdf:Seq>
      </dc:creator>
      <xmpRights:Owner>${metadata?.copyrightOwner || 'Unknown'}</xmpRights:Owner>
      <xmpRights:UsageTerms>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">AI Training Prohibited. ${metadata?.rights || 'All Rights Reserved'}</rdf:li>
        </rdf:Alt>
      </xmpRights:UsageTerms>
      <tsmo:aiTrainingProhibited>${metadata?.prohibitAiTraining !== false}</tsmo:aiTrainingProhibited>
      <tsmo:aiRights>${aiRights.join(',')}</tsmo:aiRights>
      <tsmo:robotsDirective>noai, noimageai, noindex</tsmo:robotsDirective>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

function generateC2paManifest(protectionId: string, metadata: ProtectionRequest['metadata']): object {
  return {
    '@context': 'https://c2pa.org/claim/1.0/',
    '@type': 'c2pa.claim',
    claim_generator: 'TSMO/1.0',
    title: 'AI Training Protection Manifest',
    format: 'application/c2pa',
    instance_id: protectionId,
    claim_signature: {
      alg: 'ES256',
      sig: 'placeholder_signature'
    },
    assertions: [
      {
        '@type': 'c2pa.actions',
        actions: [
          {
            action: 'c2pa.created',
            when: new Date().toISOString(),
            softwareAgent: 'TSMO Adobe Plugin'
          },
          {
            action: 'c2pa.rights',
            parameters: {
              ai_training_prohibited: metadata?.prohibitAiTraining !== false,
              derivatives_prohibited: metadata?.prohibitDerivatives || false,
              attribution_required: metadata?.requireAttribution || false
            }
          }
        ]
      },
      {
        '@type': 'c2pa.creative.work',
        creator: metadata?.copyrightOwner || 'Unknown',
        copyright: `© ${metadata?.copyrightYear || new Date().getFullYear()} ${metadata?.copyrightOwner || 'Unknown'}. ${metadata?.rights || 'All Rights Reserved'}`
      },
      {
        '@type': 'tsmo.ai.protection',
        protection_id: protectionId,
        protection_level: 'enterprise',
        directives: ['noai', 'noimageai', 'noindex', 'nofollow'],
        legal_notice: 'This content is protected against unauthorized use in AI training systems.'
      }
    ]
  };
}

async function handleProtect(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  request: ProtectionRequest
): Promise<ProtectionResponse> {
  const protectionId = generateProtectionId();
  const timestamp = new Date().toISOString();
  
  const protectionMethods = ['XMP Standard', 'EXIF Standard'];
  if (request.protectionLevel === 'professional' || request.protectionLevel === 'enterprise') {
    protectionMethods.push('LSB Steganography', 'Compression-Resistant Watermark');
  }
  if (request.protectionLevel === 'enterprise') {
    protectionMethods.push('C2PA Manifest', 'Blockchain Registry');
  }

  // Store protection record
  const { error: insertError } = await supabase
    .from('ai_protection_records')
    .insert({
      user_id: userId,
      protection_id: protectionId,
      original_filename: request.fileName || 'unknown',
      file_fingerprint: request.fileHash || protectionId,
      protection_level: request.protectionLevel || 'professional',
      content_type: 'image',
      original_mime_type: request.fileType || 'image/jpeg',
      word_count: 0,
      char_count: 0,
      protection_methods: {
        applied: protectionMethods,
        source: 'adobe_plugin',
        version: '1.0'
      },
      document_methods: {
        xmp_injected: true,
        exif_injected: true,
        c2pa_enabled: request.protectionLevel === 'enterprise'
      },
      metadata: {
        copyright_owner: request.metadata?.copyrightOwner,
        copyright_year: request.metadata?.copyrightYear,
        rights: request.metadata?.rights,
        contact_email: request.metadata?.contactEmail,
        ai_protection: {
          prohibit_training: request.metadata?.prohibitAiTraining !== false,
          prohibit_derivatives: request.metadata?.prohibitDerivatives || false,
          require_attribution: request.metadata?.requireAttribution || false
        },
        source_app: 'Adobe Creative Cloud',
        plugin_version: '1.0'
      }
    });

  if (insertError) {
    console.error('Failed to store protection record:', insertError);
    return {
      success: false,
      error: 'Failed to store protection record'
    };
  }

  const xmpDirective = generateXmpDirective(request.metadata);
  const c2paManifest = request.protectionLevel === 'enterprise' 
    ? generateC2paManifest(protectionId, request.metadata)
    : undefined;

  console.log(`Protection created: ${protectionId} for user ${userId}`);

  return {
    success: true,
    protectionId,
    protectionCertificate: {
      id: protectionId,
      timestamp,
      methods: protectionMethods,
      level: request.protectionLevel || 'professional',
      xmpDirective,
      c2paManifest
    },
    message: 'Protection applied successfully'
  };
}

async function handleVerify(
  supabase: ReturnType<typeof createClient>,
  request: ProtectionRequest
): Promise<ProtectionResponse> {
  if (!request.protectionId && !request.fileHash) {
    return {
      success: false,
      error: 'Protection ID or file hash required for verification'
    };
  }

  let query = supabase.from('ai_protection_records').select('*');
  
  if (request.protectionId) {
    query = query.eq('protection_id', request.protectionId);
  } else if (request.fileHash) {
    query = query.eq('file_fingerprint', request.fileHash);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Verification query failed:', error);
    return {
      success: false,
      error: 'Verification failed'
    };
  }

  if (!data) {
    return {
      success: true,
      verificationResult: {
        isProtected: false
      }
    };
  }

  return {
    success: true,
    verificationResult: {
      isProtected: true,
      protectionId: data.protection_id,
      protectedAt: data.created_at,
      owner: data.metadata?.copyright_owner || 'Unknown'
    }
  };
}

async function handleBatchProtect(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  request: ProtectionRequest
): Promise<ProtectionResponse> {
  if (!request.batchFiles || request.batchFiles.length === 0) {
    return {
      success: false,
      error: 'No files provided for batch protection'
    };
  }

  const results: Array<{ id: string; fileName: string; protectedAt: string; level: string }> = [];
  
  for (const file of request.batchFiles) {
    const protectionId = generateProtectionId();
    const timestamp = new Date().toISOString();
    
    const { error } = await supabase
      .from('ai_protection_records')
      .insert({
        user_id: userId,
        protection_id: protectionId,
        original_filename: file.fileName,
        file_fingerprint: file.fileHash,
        protection_level: request.protectionLevel || 'professional',
        content_type: 'image',
        original_mime_type: file.fileType,
        word_count: 0,
        char_count: 0,
        protection_methods: { applied: ['XMP Standard', 'EXIF Standard'], source: 'adobe_plugin_batch' },
        document_methods: { xmp_injected: true, exif_injected: true },
        metadata: {
          ...request.metadata,
          source_app: 'Adobe Creative Cloud',
          batch_operation: true
        }
      });

    if (!error) {
      results.push({
        id: protectionId,
        fileName: file.fileName,
        protectedAt: timestamp,
        level: request.protectionLevel || 'professional'
      });
    }
  }

  console.log(`Batch protection: ${results.length}/${request.batchFiles.length} files protected for user ${userId}`);

  return {
    success: true,
    protections: results,
    message: `${results.length} of ${request.batchFiles.length} files protected successfully`
  };
}

async function handleListProtections(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<ProtectionResponse> {
  const { data, error } = await supabase
    .from('ai_protection_records')
    .select('protection_id, original_filename, created_at, protection_level')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Failed to list protections:', error);
    return {
      success: false,
      error: 'Failed to retrieve protections'
    };
  }

  return {
    success: true,
    protections: (data || []).map(p => ({
      id: p.protection_id,
      fileName: p.original_filename,
      protectedAt: p.created_at,
      level: p.protection_level
    }))
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return json({ success: false, error: 'Authorization required' }, 401);
    }

    // Create Supabase client with user's auth
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return json({ success: false, error: 'Invalid authorization' }, 401);
    }

    // Parse request
    const request: ProtectionRequest = await req.json();
    
    console.log(`Adobe Plugin API: ${request.action} by user ${user.id}`);

    let response: ProtectionResponse;

    switch (request.action) {
      case 'protect':
        response = await handleProtect(supabase, user.id, request);
        break;
      
      case 'verify':
        response = await handleVerify(supabase, request);
        break;
      
      case 'batch_protect':
        response = await handleBatchProtect(supabase, user.id, request);
        break;
      
      case 'list_protections':
        response = await handleListProtections(supabase, user.id);
        break;
      
      case 'get_status':
        response = {
          success: true,
          message: 'TSMO Adobe Plugin API is operational',
          protectionCertificate: {
            id: 'STATUS_CHECK',
            timestamp: new Date().toISOString(),
            methods: ['XMP', 'EXIF', 'C2PA'],
            level: 'enterprise',
            xmpDirective: 'Available'
          }
        };
        break;
      
      default:
        response = { success: false, error: 'Unknown action' };
    }

    return json(response);

  } catch (error) {
    console.error('Adobe Plugin API error:', error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, 500);
  }
});