import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-adobe-plugin-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const SUPABASE_URL = 'https://utneaqmbyjwxaqrrarpc.supabase.co';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// C2PA Signing secrets (optional - falls back to placeholder if not configured)
const C2PA_PRIVATE_KEY = Deno.env.get('C2PA_PRIVATE_KEY') || '';
const C2PA_CERTIFICATE = Deno.env.get('C2PA_CERTIFICATE') || '';

// Rate limiting configuration
const RATE_LIMITS = {
  protect: { maxRequests: 60, windowMs: 3600000 },
  verify: { maxRequests: 120, windowMs: 3600000 },
  batch_protect: { maxRequests: 20, windowMs: 3600000 },
  list_protections: { maxRequests: 100, windowMs: 3600000 },
  get_status: { maxRequests: 200, windowMs: 3600000 },
};

const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

interface ProtectionRequest {
  action: 'protect' | 'verify' | 'batch_protect' | 'get_status' | 'list_protections' | 'health';
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

// ============= HEALTH CHECK (NO AUTH REQUIRED) =============

function handleHealthCheck(): Response {
  const c2paConfigured = C2PA_PRIVATE_KEY.length > 0 && C2PA_CERTIFICATE.length > 0;
  
  const healthResponse = {
    status: 'healthy',
    api: {
      name: 'Adobe Plugin API',
      version: '1.0.0',
      environment: 'production'
    },
    c2pa: {
      configured: c2paConfigured,
      algorithm: 'ES256',
      status: c2paConfigured ? 'real_signing_enabled' : 'placeholder_mode',
      message: c2paConfigured 
        ? 'C2PA signing with real credentials is active'
        : 'C2PA_PRIVATE_KEY and C2PA_CERTIFICATE not configured - using placeholder signatures'
    },
    capabilities: {
      protect: true,
      verify: true,
      batch_protect: true,
      list_protections: true,
      c2pa_signing: c2paConfigured
    },
    rateLimit: {
      protect: '60/hour',
      verify: '120/hour',
      batch_protect: '20/hour',
      list_protections: '100/hour'
    },
    timestamp: new Date().toISOString()
  };

  console.log('Health check requested:', JSON.stringify(healthResponse));
  
  return new Response(JSON.stringify(healthResponse), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
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
    signatureValid?: boolean;
  };
  verificationResult?: {
    isProtected: boolean;
    protectionId?: string;
    protectedAt?: string;
    owner?: string;
    signatureVerified?: boolean;
  };
  protections?: Array<{
    id: string;
    fileName: string;
    protectedAt: string;
    level: string;
  }>;
  error?: string;
  message?: string;
  retryAfter?: number;
}

// ============= C2PA ES256 SIGNING IMPLEMENTATION =============

// Parse PEM-encoded private key to raw bytes
function parsePemPrivateKey(pem: string): Uint8Array {
  const base64 = pem
    .replace(/-----BEGIN[^-]+-----/g, '')
    .replace(/-----END[^-]+-----/g, '')
    .replace(/\s/g, '');
  
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Parse PEM-encoded certificate
function parsePemCertificate(pem: string): Uint8Array {
  const base64 = pem
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/\s/g, '');
  
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Calculate SHA-256 thumbprint of certificate
async function getCertificateThumbprint(certBytes: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', certBytes);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Import ES256 private key for signing
async function importES256PrivateKey(keyBytes: Uint8Array): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
}

// Sign data with ES256 (ECDSA with SHA-256)
async function signES256(data: Uint8Array, privateKey: CryptoKey): Promise<string> {
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    data
  );
  
  // Convert to base64
  const signatureArray = new Uint8Array(signature);
  let binary = '';
  for (let i = 0; i < signatureArray.length; i++) {
    binary += String.fromCharCode(signatureArray[i]);
  }
  return btoa(binary);
}

// Check if real C2PA signing is available
function isC2paSigningAvailable(): boolean {
  return C2PA_PRIVATE_KEY.length > 0 && C2PA_CERTIFICATE.length > 0;
}

// Generate real C2PA manifest with ES256 signature
async function generateC2paManifestWithSignature(
  protectionId: string, 
  metadata: ProtectionRequest['metadata']
): Promise<{ manifest: object; signed: boolean }> {
  const timestamp = new Date().toISOString();
  
  // Base manifest structure following C2PA 2.x spec
  const manifestClaim = {
    '@context': 'https://c2pa.org/claim/1.0/',
    '@type': 'c2pa.claim',
    claim_generator: 'TSMO/1.0.0',
    claim_generator_info: [
      {
        name: 'TSMO AI Protection',
        version: '1.0.0',
        website: 'https://tsmo.io'
      }
    ],
    title: metadata?.copyrightOwner ? `${metadata.copyrightOwner} - Protected Work` : 'Protected Work',
    format: 'application/c2pa',
    instance_id: protectionId,
    dc_title: 'AI Training Protection Manifest',
    signature_info: {
      alg: 'ES256',
      issuer: 'TSMO AI Protection',
      time: timestamp
    },
    assertions: [
      {
        '@type': 'c2pa.actions',
        actions: [
          {
            action: 'c2pa.created',
            when: timestamp,
            softwareAgent: 'TSMO Adobe Plugin',
            parameters: {
              protection_applied: true
            }
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
        author: [
          {
            '@type': 'Person',
            name: metadata?.copyrightOwner || 'Unknown'
          }
        ],
        copyright: `© ${metadata?.copyrightYear || new Date().getFullYear()} ${metadata?.copyrightOwner || 'Unknown'}. ${metadata?.rights || 'All Rights Reserved'}`
      },
      {
        '@type': 'tsmo.ai.protection',
        protection_id: protectionId,
        protection_level: 'enterprise',
        directives: ['noai', 'noimageai', 'noindex', 'nofollow'],
        legal_notice: 'This content is protected against unauthorized use in AI training systems.',
        contact: metadata?.contactEmail || null
      }
    ]
  };

  // Try to sign with real certificate if available
  if (isC2paSigningAvailable()) {
    try {
      console.log('C2PA: Using real ES256 signing with configured certificate');
      
      const privateKeyBytes = parsePemPrivateKey(C2PA_PRIVATE_KEY);
      const certificateBytes = parsePemCertificate(C2PA_CERTIFICATE);
      
      // Import the private key
      const cryptoKey = await importES256PrivateKey(privateKeyBytes);
      
      // Calculate certificate thumbprint
      const thumbprint = await getCertificateThumbprint(certificateBytes);
      
      // Create canonical JSON for signing
      const claimJson = JSON.stringify(manifestClaim, Object.keys(manifestClaim).sort());
      const encoder = new TextEncoder();
      const claimBytes = encoder.encode(claimJson);
      
      // Sign the claim
      const signature = await signES256(claimBytes, cryptoKey);
      
      // Add signature to manifest
      const signedManifest = {
        ...manifestClaim,
        claim_signature: {
          alg: 'ES256',
          sig: signature,
          certificate_thumbprint: thumbprint,
          timestamp: timestamp,
          issuer: 'TSMO AI Protection',
          signed: true
        }
      };
      
      console.log(`C2PA: Successfully signed manifest with thumbprint ${thumbprint.substring(0, 16)}...`);
      
      return { manifest: signedManifest, signed: true };
      
    } catch (error) {
      console.error('C2PA signing failed, falling back to placeholder:', error);
    }
  } else {
    console.log('C2PA: Secrets not configured, using placeholder signature');
  }
  
  // Fallback to placeholder signature
  const unsignedManifest = {
    ...manifestClaim,
    claim_signature: {
      alg: 'ES256',
      sig_placeholder: 'requires_c2pa_certificate',
      timestamp: timestamp,
      note: 'Configure C2PA_PRIVATE_KEY and C2PA_CERTIFICATE secrets for real signing',
      signed: false
    }
  };
  
  return { manifest: unsignedManifest, signed: false };
}

// Legacy function for backward compatibility
async function generateC2paManifest(
  protectionId: string, 
  metadata: ProtectionRequest['metadata']
): Promise<object> {
  const result = await generateC2paManifestWithSignature(protectionId, metadata);
  return result.manifest;
}

// ============= INPUT VALIDATION =============

function validateAction(action: unknown): action is ProtectionRequest['action'] {
  return typeof action === 'string' && 
    ['protect', 'verify', 'batch_protect', 'get_status', 'list_protections'].includes(action);
}

function validateProtectionLevel(level: unknown): level is 'basic' | 'professional' | 'enterprise' {
  return level === undefined || 
    (typeof level === 'string' && ['basic', 'professional', 'enterprise'].includes(level));
}

function validateEmail(email: unknown): boolean {
  if (email === undefined || email === null) return true;
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function validateString(value: unknown, maxLength: number): boolean {
  return value === undefined || value === null || 
    (typeof value === 'string' && value.length <= maxLength);
}

function validateFileHash(hash: unknown): boolean {
  if (hash === undefined || hash === null) return true;
  return typeof hash === 'string' && hash.length >= 1 && hash.length <= 256;
}

function validateBatchFiles(files: unknown): files is ProtectionRequest['batchFiles'] {
  if (!Array.isArray(files)) return false;
  if (files.length > 100) return false;
  return files.every(file => 
    typeof file === 'object' && file !== null &&
    validateFileHash(file.fileHash) &&
    validateString(file.fileName, 500) &&
    validateString(file.fileType, 100) &&
    (file.fileSize === undefined || (typeof file.fileSize === 'number' && file.fileSize >= 0))
  );
}

function validateRequest(request: unknown): { valid: boolean; error?: string } {
  if (typeof request !== 'object' || request === null) {
    return { valid: false, error: 'Invalid request body' };
  }

  const req = request as Record<string, unknown>;

  if (!validateAction(req.action)) {
    return { valid: false, error: 'Invalid or missing action. Must be one of: protect, verify, batch_protect, get_status, list_protections' };
  }

  if (!validateProtectionLevel(req.protectionLevel)) {
    return { valid: false, error: 'Invalid protectionLevel. Must be one of: basic, professional, enterprise' };
  }

  if (!validateFileHash(req.fileHash)) {
    return { valid: false, error: 'Invalid fileHash. Must be a string between 1-256 characters' };
  }

  if (!validateString(req.fileName, 500)) {
    return { valid: false, error: 'Invalid fileName. Must be a string with max 500 characters' };
  }

  if (!validateString(req.fileType, 100)) {
    return { valid: false, error: 'Invalid fileType. Must be a string with max 100 characters' };
  }

  if (!validateString(req.protectionId, 100)) {
    return { valid: false, error: 'Invalid protectionId. Must be a string with max 100 characters' };
  }

  if (req.metadata !== undefined) {
    if (typeof req.metadata !== 'object' || req.metadata === null) {
      return { valid: false, error: 'Invalid metadata. Must be an object' };
    }
    const meta = req.metadata as Record<string, unknown>;
    
    if (!validateString(meta.copyrightOwner, 200)) {
      return { valid: false, error: 'Invalid copyrightOwner. Must be a string with max 200 characters' };
    }
    if (!validateString(meta.rights, 500)) {
      return { valid: false, error: 'Invalid rights. Must be a string with max 500 characters' };
    }
    if (!validateEmail(meta.contactEmail)) {
      return { valid: false, error: 'Invalid contactEmail. Must be a valid email address' };
    }
    if (meta.copyrightYear !== undefined && 
        (typeof meta.copyrightYear !== 'number' || meta.copyrightYear < 1900 || meta.copyrightYear > 2100)) {
      return { valid: false, error: 'Invalid copyrightYear. Must be a number between 1900-2100' };
    }
  }

  if (req.action === 'batch_protect') {
    if (!req.batchFiles) {
      return { valid: false, error: 'batchFiles is required for batch_protect action' };
    }
    if (!validateBatchFiles(req.batchFiles)) {
      return { valid: false, error: 'Invalid batchFiles. Must be an array of max 100 files with valid fileHash, fileName, fileType, and fileSize' };
    }
  }

  return { valid: true };
}

// ============= RATE LIMITING =============

function checkRateLimit(userId: string, action: string): { allowed: boolean; retryAfter?: number } {
  const limit = RATE_LIMITS[action as keyof typeof RATE_LIMITS] || RATE_LIMITS.protect;
  const key = `${userId}:${action}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStart > limit.windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= limit.maxRequests) {
    const retryAfter = Math.ceil((entry.windowStart + limit.windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

// ============= UTILITY FUNCTIONS =============

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...headers },
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
  
  const sanitize = (str: string | undefined) => 
    (str || '').replace(/[<>&"']/g, (c) => ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
    }[c] || c));
  
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
          <rdf:li xml:lang="x-default">${sanitize(metadata?.rights) || 'All Rights Reserved'}</rdf:li>
        </rdf:Alt>
      </dc:rights>
      <dc:creator>
        <rdf:Seq>
          <rdf:li>${sanitize(metadata?.copyrightOwner) || 'Unknown'}</rdf:li>
        </rdf:Seq>
      </dc:creator>
      <xmpRights:Owner>${sanitize(metadata?.copyrightOwner) || 'Unknown'}</xmpRights:Owner>
      <xmpRights:UsageTerms>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">AI Training Prohibited. ${sanitize(metadata?.rights) || 'All Rights Reserved'}</rdf:li>
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

// ============= REQUEST HANDLERS =============

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
        version: '1.0',
        c2pa_signed: request.protectionLevel === 'enterprise' && isC2paSigningAvailable()
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
  
  let c2paManifest: object | undefined;
  let signatureValid = false;
  
  if (request.protectionLevel === 'enterprise') {
    const result = await generateC2paManifestWithSignature(protectionId, request.metadata);
    c2paManifest = result.manifest;
    signatureValid = result.signed;
  }

  console.log(`Protection created: ${protectionId} for user ${userId} (C2PA signed: ${signatureValid})`);

  return {
    success: true,
    protectionId,
    protectionCertificate: {
      id: protectionId,
      timestamp,
      methods: protectionMethods,
      level: request.protectionLevel || 'professional',
      xmpDirective,
      c2paManifest,
      signatureValid
    },
    message: signatureValid 
      ? 'Protection applied with cryptographic C2PA signature' 
      : 'Protection applied successfully'
  };
}

async function handleSaveToPortfolio(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  request: ProtectionRequest
): Promise<ProtectionResponse> {
  const { protectionId, filename, metadata } = request;
  
  if (!protectionId) {
    return { success: false, error: 'Protection ID is required' };
  }
  
  // Find the protection record
  const { data: protectionRecord, error: fetchError } = await supabaseClient
    .from('ai_protection_records')
    .select('*')
    .eq('protection_id', protectionId)
    .eq('user_id', userId)
    .single();
  
  if (fetchError || !protectionRecord) {
    return { success: false, error: 'Protection record not found' };
  }
  
  // Check if artwork already exists for this protection record
  const { data: existingArtwork } = await supabaseClient
    .from('artwork')
    .select('id')
    .eq('protection_record_id', protectionRecord.id)
    .single();
  
  if (existingArtwork) {
    return { 
      success: true, 
      artworkId: existingArtwork.id,
      message: 'Already saved to portfolio'
    };
  }
  
  // Create artwork entry linked to protection
  const { data: artwork, error: artworkError } = await supabaseClient
    .from('artwork')
    .insert({
      user_id: userId,
      title: filename || protectionRecord.original_filename || 'Untitled Artwork',
      category: 'digital-art',
      file_paths: protectionRecord.protected_file_path ? [protectionRecord.protected_file_path] : [],
      ai_protection_enabled: true,
      ai_protection_level: protectionRecord.protection_level,
      ai_protection_methods: protectionRecord.protection_methods,
      protection_record_id: protectionRecord.id,
      status: 'active',
      description: `Protected via Adobe Plugin. Copyright: ${metadata?.copyrightOwner || 'Unknown'} ${metadata?.copyrightYear || new Date().getFullYear()}`
    })
    .select('id')
    .single();
  
  if (artworkError) {
    console.error('Failed to create artwork:', artworkError);
    return { success: false, error: 'Failed to save to portfolio' };
  }
  
  return { 
    success: true, 
    artworkId: artwork.id,
    message: 'Saved to portfolio successfully'
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

  // Check if C2PA signature was valid
  const c2paSigned = data.protection_methods?.c2pa_signed === true;

  return {
    success: true,
    verificationResult: {
      isProtected: true,
      protectionId: data.protection_id,
      protectedAt: data.created_at,
      owner: data.metadata?.copyright_owner || 'Unknown',
      signatureVerified: c2paSigned
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
        protection_methods: { 
          applied: ['XMP Standard', 'EXIF Standard'], 
          source: 'adobe_plugin_batch',
          c2pa_signed: false
        },
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

// ============= MAIN HANDLER =============

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Handle health check BEFORE auth (no auth required)
    const url = new URL(req.url);
    if (url.searchParams.get('action') === 'health') {
      return handleHealthCheck();
    }
    
    // For POST requests, check body for health action before requiring auth
    if (req.method === 'POST') {
      const clonedReq = req.clone();
      try {
        const body = await clonedReq.json();
        if (body && typeof body === 'object' && body.action === 'health') {
          return handleHealthCheck();
        }
      } catch {
        // Not JSON or invalid, continue to normal flow
      }
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return json({ success: false, error: 'Authorization required' }, 401);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return json({ success: false, error: 'Invalid authorization' }, 401);
    }

    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      return json({ success: false, error: 'Invalid JSON body' }, 400);
    }

    const validation = validateRequest(requestBody);
    if (!validation.valid) {
      console.log(`Validation failed: ${validation.error}`);
      return json({ success: false, error: validation.error }, 400);
    }

    const request = requestBody as ProtectionRequest;
    
    const rateLimitResult = checkRateLimit(user.id, request.action);
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for user ${user.id} on action ${request.action}`);
      return json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: rateLimitResult.retryAfter
        }, 
        429,
        { 'Retry-After': String(rateLimitResult.retryAfter) }
      );
    }
    
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
            xmpDirective: 'Available',
            signatureValid: isC2paSigningAvailable()
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
