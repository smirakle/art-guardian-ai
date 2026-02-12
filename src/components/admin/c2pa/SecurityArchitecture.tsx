import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Shield, Server, Key, Lock, Globe } from 'lucide-react';

const ARCHITECTURE_DOC = {
  document_title: 'TSMO Generator Product Security Architecture Document',
  version: '2.2',
  date: new Date().toISOString().slice(0, 10),
  product_name: 'TSMO – The Stop Market Online',
  product_version: '2.0',
  product_role: 'C2PA Generator & Validator',
  spec_version: 'C2PA Specification v2.2',
  assurance_level: 'Level 1 (Software-based signing)',

  section_1_product_overview: {
    description: 'TSMO is a cloud-based content protection platform that applies C2PA Content Credentials to digital images (JPEG, PNG) and detects existing C2PA manifests in images and video (MP4, MOV). It operates as both a Generator (creating, signing, embedding manifests) and a Validator (detecting and parsing existing provenance chains). Conforms to C2PA Specification v2.2.',
    supported_formats_generator: ['image/jpeg', 'image/png'],
    supported_formats_validator: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'],
    claim_generator_identifier: 'TSMO/2.0 ai-protection-system',
    claim_generator_info: [{ name: 'TSMO AI Protection', version: '2.0' }],
    instance_id_format: 'urn:c2pa:<uuid-v4> (per C2PA v2.2 §7.1)',
    ingredient_support: 'Supports parentOf, componentOf, and inputTo relationships per §8.3',
  },

  section_2_target_of_evaluation: {
    components: [
      { name: 'Supabase Edge Functions (Deno Runtime)', type: 'Cloud Compute', description: 'Serverless functions on Deno Deploy that execute signing, embedding, and validation logic. Isolated per-invocation with no shared state.' },
      { name: 'sign-c2pa-manifest', type: 'Edge Function', description: 'Generates ES256 (ECDSA P-256) signatures over C2PA manifest claims using COSE Sign1 envelopes (RFC 9052). Accepts ingredient references. Keys stored in Supabase Secrets vault.' },
      { name: 'embed-c2pa-manifest', type: 'Edge Function', description: 'Constructs ISO 19566-5 JUMBF superboxes including ingredient assertion boxes and writes them into JPEG (APP11 marker) or PNG (caBX chunk) files.' },
      { name: 'validate-c2pa-manifest', type: 'Edge Function', description: 'Binary scanner that detects and parses C2PA JUMBF boxes in JPEG (APP11), PNG (caBX), and MP4/MOV (ISO BMFF uuid box) files. Returns structured ingredient data and trust chain status.' },
      { name: 'Supabase Secrets Vault', type: 'Key Storage', description: 'Encrypted secrets store for C2PA_PRIVATE_KEY, C2PA_SIGNING_CERT, and C2PA_ISSUER_ID. Secrets are only accessible to edge functions at runtime.' },
      { name: 'Supabase Auth (JWT)', type: 'Authentication', description: 'User authentication via JWT tokens. All signing and embedding operations require an authenticated session.' },
      { name: 'Supabase PostgreSQL', type: 'Database', description: 'Stores c2pa_signing_logs and c2pa_validation_logs tables with RLS policies restricting access to the owning user.' },
      { name: 'HTTPS / TLS 1.3', type: 'Transport', description: 'All communication between client and edge functions uses HTTPS with TLS 1.3. No plaintext channels.' },
      { name: 'React SPA (Client)', type: 'Frontend', description: 'Browser application that orchestrates the protection pipeline. Does not hold private keys or perform signing.' },
      { name: 'Adobe UXP Plugin', type: 'Desktop Client', description: 'Photoshop plugin (v2.1.0) that exports documents, calls edge functions for C2PA signing/embedding, and places protected files as layers. Includes ingredient support (parentOf relationship for source PSD).' },
    ],
    boundary_diagram: 'Client (Browser/UXP) → HTTPS → Supabase Edge Functions → Supabase Secrets Vault / PostgreSQL',
  },

  section_3_cryptographic_implementation: {
    signing_algorithm: 'ES256 (ECDSA with P-256 curve and SHA-256)',
    key_format: 'PEM-encoded PKCS#8 private key',
    certificate_format: 'X.509 PEM (self-signed fallback; production CAI-issued)',
    signature_envelope: 'COSE Sign1 (RFC 9052)',
    key_generation: 'Web Crypto API (crypto.subtle.generateKey) in Deno runtime when no production keys are configured',
    key_storage: 'Supabase Secrets – encrypted at rest, accessed only by edge functions',
    key_rotation: 'Manual rotation via Supabase dashboard. Old signing logs retain the certificate fingerprint for audit trail.',
    self_signed_fallback: 'When C2PA_PRIVATE_KEY and C2PA_SIGNING_CERT secrets are not set, the sign-c2pa-manifest function generates an ephemeral ECDSA P-256 keypair per invocation. Manifests are cryptographically valid but do not chain to the CAI trust list.',
    trust_list_integration: 'Certificate fingerprints are verified against the CAI trust list at spec.c2pa.org/conformance-explorer/. Trust status is returned as trusted/untrusted/self-signed/expired.',
  },

  section_4_manifest_construction: {
    spec_version: 'C2PA Specification v2.2',
    jumbf_standard: 'ISO 19566-5 (JPEG Universal Metadata Box Format)',
    superbox_structure: [
      'Box Header: size (4B) + type "jumb" (4B)',
      'Description Box: size + type "jumd" + label "c2pa" + toggles byte',
      'Content Box: CBOR-encoded claim with claim_generator_info',
      'Ingredient Assertion Boxes: c2pa.ingredient with relationship, hash, instanceID',
      'Assertion Store Box: nested assertion JUMBF boxes',
      'Signature Box: COSE Sign1 envelope',
    ],
    instance_id_format: 'urn:c2pa:<uuid-v4>',
    jpeg_embedding: 'APP11 marker segment (0xFFEB) inserted after SOI, before first non-APP marker',
    png_embedding: 'caBX ancillary chunk inserted before IEND',
    integrity: 'SHA-256 hash of the complete JUMBF superbox stored in signing log',
    ingredients: 'Ingredients reference source assets with SHA-256 hashes, format, title, and relationship type (parentOf, componentOf, inputTo) per §8.3',
  },

  section_5_security_controls: {
    authentication: 'Supabase Auth with JWT verification on every edge function invocation',
    authorization: 'Row-Level Security on c2pa_signing_logs and c2pa_validation_logs – users can only access their own records',
    rate_limiting: 'Supabase built-in rate limiting on edge function invocations',
    input_validation: 'File type verification, size limits, binary format validation before processing',
    audit_logging: 'Every signing operation records: user_id, file_name, protection_id, algorithm, certificate_fingerprint, manifest_hash, timestamp',
    data_isolation: 'Edge functions are stateless and isolated per invocation. No keys persist in memory between calls.',
    transport_security: 'TLS 1.3 for all client-server communication. HSTS headers enforced.',
    trust_chain_verification: 'Validator checks signing certificate against CAI trust list anchors. Returns trust status with matched anchor details.',
  },

  section_6_third_party_services: [
    { service: 'Supabase', purpose: 'Backend-as-a-Service: database, auth, edge functions, secrets', data_shared: 'User authentication data, signing logs, file metadata (not file content at rest)' },
    { service: 'Deno Deploy', purpose: 'Runtime for Supabase Edge Functions', data_shared: 'Edge function code and runtime execution' },
    { service: 'Lovable', purpose: 'Development and deployment platform', data_shared: 'Source code, build artifacts' },
    { service: 'CAI Trust List', purpose: 'Certificate trust verification', data_shared: 'Certificate fingerprints for trust chain validation (no user data)' },
  ],

  section_7_threat_model: {
    threats_addressed: [
      'Key compromise: mitigated by encrypted secrets vault with no client-side key access',
      'Manifest tampering: mitigated by COSE Sign1 cryptographic binding (RFC 9052)',
      'Unauthorized signing: mitigated by JWT authentication requirement',
      'Replay attacks: mitigated by unique urn:c2pa:<uuid-v4> instance_id and timestamp per manifest',
      'Privilege escalation: mitigated by RLS policies on all audit tables',
      'Ingredient spoofing: mitigated by SHA-256 hash binding of ingredient assets',
    ],
    residual_risks: [
      'Self-signed certificates do not chain to CAI trust list until production certs are configured',
      'Client-side file manipulation before upload (inherent to web applications)',
      'Trust list availability depends on spec.c2pa.org uptime',
    ],
  },
};

const SECTIONS = [
  { key: 'section_1_product_overview', title: 'Product Overview', icon: Globe },
  { key: 'section_2_target_of_evaluation', title: 'Target of Evaluation (TOE)', icon: Server },
  { key: 'section_3_cryptographic_implementation', title: 'Cryptographic Implementation', icon: Key },
  { key: 'section_4_manifest_construction', title: 'Manifest Construction', icon: Lock },
  { key: 'section_5_security_controls', title: 'Security Controls', icon: Shield },
] as const;

const SecurityArchitecture: React.FC = () => {
  const exportDocument = () => {
    const blob = new Blob([JSON.stringify(ARCHITECTURE_DOC, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tsmo-c2pa-security-architecture-${ARCHITECTURE_DOC.date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderValue = (val: unknown, depth = 0): React.ReactNode => {
    if (val === null || val === undefined) return <span className="text-muted-foreground">—</span>;
    if (typeof val === 'string') return <span className="text-sm">{val}</span>;
    if (typeof val === 'boolean') return <Badge variant={val ? 'default' : 'outline'}>{val ? 'Yes' : 'No'}</Badge>;
    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-muted-foreground">—</span>;
      if (typeof val[0] === 'string') {
        return <ul className="list-disc list-inside text-sm space-y-0.5">{val.map((v, i) => <li key={i}>{v}</li>)}</ul>;
      }
      return (
        <div className="space-y-2">
          {val.map((item, i) => (
            <div key={i} className="border rounded p-2 text-sm space-y-1">
              {Object.entries(item as Record<string, unknown>).map(([k, v]) => (
                <div key={k}><span className="font-medium text-muted-foreground">{k.replace(/_/g, ' ')}:</span> {renderValue(v, depth + 1)}</div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    if (typeof val === 'object') {
      return (
        <div className={depth > 0 ? 'pl-4 border-l space-y-1' : 'space-y-2'}>
          {Object.entries(val as Record<string, unknown>).map(([k, v]) => (
            <div key={k}>
              <span className="font-medium text-sm text-muted-foreground">{k.replace(/_/g, ' ')}:</span>{' '}
              {renderValue(v, depth + 1)}
            </div>
          ))}
        </div>
      );
    }
    return <span>{String(val)}</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Security Architecture Document</CardTitle>
        <CardDescription>Pre-populated from TSMO's implementation per C2PA Generator Product Requirements (Appendix C).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button onClick={exportDocument} className="gap-2">
          <Download className="h-4 w-4" /> Export Architecture Document (JSON)
        </Button>

        <div className="grid gap-4">
          {SECTIONS.map(({ key, title, icon: Icon }) => (
            <details key={key} className="border rounded-md">
              <summary className="px-4 py-3 cursor-pointer font-medium text-sm flex items-center gap-2">
                <Icon className="h-4 w-4" /> {title}
              </summary>
              <div className="px-4 pb-4 pt-2">
                {renderValue((ARCHITECTURE_DOC as Record<string, unknown>)[key])}
              </div>
            </details>
          ))}

          <details className="border rounded-md">
            <summary className="px-4 py-3 cursor-pointer font-medium text-sm flex items-center gap-2">
              <Server className="h-4 w-4" /> Third-Party Services
            </summary>
            <div className="px-4 pb-4 pt-2">{renderValue(ARCHITECTURE_DOC.section_6_third_party_services)}</div>
          </details>

          <details className="border rounded-md">
            <summary className="px-4 py-3 cursor-pointer font-medium text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" /> Threat Model
            </summary>
            <div className="px-4 pb-4 pt-2">{renderValue(ARCHITECTURE_DOC.section_7_threat_model)}</div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityArchitecture;
