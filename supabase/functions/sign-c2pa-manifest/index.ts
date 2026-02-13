import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * C2PA Manifest Signing Edge Function
 * Performs ES256 (ECDSA P-256) cryptographic signing with COSE Sign1 envelope.
 * Falls back to self-signed keypair if production CAI certificates are not configured.
 */

// COSE Sign1 structure constants
const COSE_SIGN1_TAG = 18; // CBOR tag for COSE_Sign1

interface SigningRequest {
  claim: Record<string, unknown>;
  protectionId: string;
  fileName: string;
}

interface SigningResponse {
  signature: string; // base64-encoded COSE Sign1 envelope
  certificateFingerprint: string;
  algorithm: string;
  signingMode: 'production' | 'self-signed';
  manifestHash: string;
}

// Simple CBOR encoder for the subset we need
function encodeCBOR(value: unknown): Uint8Array {
  if (value === null || value === undefined) {
    return new Uint8Array([0xf6]); // CBOR null
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value) && value >= 0 && value < 24) {
      return new Uint8Array([value]);
    }
    if (Number.isInteger(value) && value >= 0 && value < 256) {
      return new Uint8Array([0x18, value]);
    }
    if (Number.isInteger(value) && value < 0 && value >= -24) {
      return new Uint8Array([0x20 + (-1 - value)]);
    }
    // For larger numbers, encode as float64
    const buf = new ArrayBuffer(9);
    const view = new DataView(buf);
    view.setUint8(0, 0xfb);
    view.setFloat64(1, value);
    return new Uint8Array(buf);
  }
  if (typeof value === 'string') {
    const encoded = new TextEncoder().encode(value);
    const header = encodeLength(3, encoded.length); // Major type 3 = text string
    const result = new Uint8Array(header.length + encoded.length);
    result.set(header);
    result.set(encoded, header.length);
    return result;
  }
  if (value instanceof Uint8Array) {
    const header = encodeLength(2, value.length); // Major type 2 = byte string
    const result = new Uint8Array(header.length + value.length);
    result.set(header);
    result.set(value, header.length);
    return result;
  }
  if (Array.isArray(value)) {
    const header = encodeLength(4, value.length); // Major type 4 = array
    const parts = value.map(encodeCBOR);
    const totalLen = parts.reduce((s, p) => s + p.length, 0);
    const result = new Uint8Array(header.length + totalLen);
    result.set(header);
    let offset = header.length;
    for (const part of parts) {
      result.set(part, offset);
      offset += part.length;
    }
    return result;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    const header = encodeLength(5, entries.length); // Major type 5 = map
    const parts: Uint8Array[] = [];
    for (const [k, v] of entries) {
      parts.push(encodeCBOR(k));
      parts.push(encodeCBOR(v));
    }
    const totalLen = parts.reduce((s, p) => s + p.length, 0);
    const result = new Uint8Array(header.length + totalLen);
    result.set(header);
    let offset = header.length;
    for (const part of parts) {
      result.set(part, offset);
      offset += part.length;
    }
    return result;
  }
  if (typeof value === 'boolean') {
    return new Uint8Array([value ? 0xf5 : 0xf4]);
  }
  return new Uint8Array([0xf6]); // fallback null
}

function encodeLength(majorType: number, length: number): Uint8Array {
  const major = majorType << 5;
  if (length < 24) return new Uint8Array([major | length]);
  if (length < 256) return new Uint8Array([major | 24, length]);
  if (length < 65536) {
    const buf = new Uint8Array(3);
    buf[0] = major | 25;
    buf[1] = (length >> 8) & 0xff;
    buf[2] = length & 0xff;
    return buf;
  }
  const buf = new Uint8Array(5);
  buf[0] = major | 26;
  buf[1] = (length >> 24) & 0xff;
  buf[2] = (length >> 16) & 0xff;
  buf[3] = (length >> 8) & 0xff;
  buf[4] = length & 0xff;
  return buf;
}

// Add CBOR tag
function addCBORTag(tag: number, content: Uint8Array): Uint8Array {
  const tagBytes = encodeLength(6, tag); // Major type 6 = tag
  const result = new Uint8Array(tagBytes.length + content.length);
  result.set(tagBytes);
  result.set(content, tagBytes.length);
  return result;
}

async function generateSelfSignedKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
}

async function importPrivateKey(pemKey: string): Promise<CryptoKey> {
  // Strip PEM headers and decode base64
  const pemBody = pemKey
    .replace(/-----BEGIN EC PRIVATE KEY-----/g, '')
    .replace(/-----END EC PRIVATE KEY-----/g, '')
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');
  
  const binaryStr = atob(pemBody);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  return await crypto.subtle.importKey(
    'pkcs8',
    bytes.buffer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
}

async function computeFingerprint(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  const hash = await crypto.subtle.digest('SHA-256', exported);
  const hashArray = new Uint8Array(hash);
  return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join(':').substring(0, 59);
}

async function signPayload(privateKey: CryptoKey, payload: Uint8Array): Promise<Uint8Array> {
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    payload
  );
  return new Uint8Array(signature);
}

function buildCoseSign1(protectedHeaders: Uint8Array, payload: Uint8Array, signature: Uint8Array): Uint8Array {
  // COSE_Sign1 = [protected, unprotected, payload, signature]
  const structure = encodeCBOR([
    protectedHeaders,     // protected headers (serialized)
    {},                   // unprotected headers (empty map)
    payload,              // payload
    signature             // signature
  ]);
  return addCBORTag(COSE_SIGN1_TAG, structure);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: SigningRequest = await req.json();
    const { claim, protectionId, fileName } = body;

    if (!claim || !protectionId) {
      return new Response(
        JSON.stringify({ error: 'Missing claim or protectionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[sign-c2pa-manifest] Signing manifest for: ${fileName} (protection: ${protectionId})`);

    // Determine signing mode
    const privatePem = Deno.env.get('C2PA_PRIVATE_KEY');
    const certPem = Deno.env.get('C2PA_SIGNING_CERT');
    let signingMode: 'production' | 'self-signed' = 'self-signed';
    let privateKey: CryptoKey;
    let publicKey: CryptoKey | null = null;

    if (privatePem && certPem) {
      // Production mode with CAI-issued credentials
      signingMode = 'production';
      privateKey = await importPrivateKey(privatePem);
      console.log('[sign-c2pa-manifest] Using production signing credentials');
    } else {
      // Self-signed fallback
      const keyPair = await generateSelfSignedKeyPair();
      privateKey = keyPair.privateKey;
      publicKey = keyPair.publicKey;
      console.log('[sign-c2pa-manifest] Using self-signed keypair (production certs not configured)');
    }

    // Encode the claim as CBOR payload
    const claimCbor = encodeCBOR(claim);

    // Compute manifest hash
    const claimHash = await crypto.subtle.digest('SHA-256', claimCbor);
    const manifestHash = arrayBufferToBase64(claimHash);

    // Build protected headers (alg: ES256 = -7)
    const protectedHeadersMap = { '1': -7 }; // 1 = alg, -7 = ES256
    const protectedHeadersCbor = encodeCBOR(protectedHeadersMap);

    // Build Sig_structure for signing: ["Signature1", protected, external_aad, payload]
    const sigStructure = encodeCBOR([
      'Signature1',
      protectedHeadersCbor,
      new Uint8Array(0), // external_aad
      claimCbor
    ]);

    // Sign
    const signature = await signPayload(privateKey, sigStructure);

    // Build COSE Sign1 envelope
    const coseSign1 = buildCoseSign1(protectedHeadersCbor, claimCbor, signature);
    const signatureBase64 = arrayBufferToBase64(coseSign1);

    // Compute certificate fingerprint
    let certFingerprint: string;
    if (publicKey) {
      certFingerprint = await computeFingerprint(publicKey);
    } else {
      // Use cert hash for production mode
      const certHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(certPem || ''));
      certFingerprint = arrayBufferToBase64(certHash).substring(0, 40);
    }

    // Log signing operation
    await supabase.from('c2pa_signing_logs').insert({
      user_id: user.id,
      file_name: fileName,
      protection_id: protectionId,
      signing_algorithm: 'ES256',
      certificate_fingerprint: certFingerprint,
      manifest_hash: manifestHash,
      signing_mode: signingMode,
      metadata: {
        claim_generator: claim.claim_generator || 'TSMO/2.0',
        claim_generator_info: claim.claim_generator_info || [{ name: 'TSMO AI Protection', version: '2.0' }],
        assertions_count: Array.isArray(claim.assertions) ? claim.assertions.length : 0,
        ingredients_count: Array.isArray(claim.ingredients) ? claim.ingredients.length : 0,
        spec_version: '2.2',
      }
    });

    const response: SigningResponse = {
      signature: signatureBase64,
      certificateFingerprint: certFingerprint,
      algorithm: 'ES256',
      signingMode,
      manifestHash,
    };

    console.log(`[sign-c2pa-manifest] Successfully signed manifest (mode: ${signingMode})`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[sign-c2pa-manifest] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
