import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register a monospace font for fingerprints/code
Font.register({
  family: 'Courier',
  src: 'https://fonts.gstatic.com/s/courierprime/v9/u-450q2lgwslOqpF_6gQ8kELWwZjW-_-tvg.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  titlePage: {
    padding: 50,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  titleMain: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleSub: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
  },
  titleMeta: {
    fontSize: 10,
    color: '#777',
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
    marginTop: 20,
    color: '#1a1a1a',
    borderBottom: '1 solid #ddd',
    paddingBottom: 4,
  },
  subsectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    marginTop: 12,
    color: '#333',
  },
  paragraph: {
    fontSize: 10,
    marginBottom: 8,
    color: '#333',
  },
  bulletItem: {
    fontSize: 10,
    marginBottom: 4,
    paddingLeft: 12,
    color: '#333',
  },
  label: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#555',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    marginBottom: 6,
    color: '#333',
  },
  componentBox: {
    border: '1 solid #e0e0e0',
    borderRadius: 3,
    padding: 8,
    marginBottom: 6,
  },
  componentName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  componentType: {
    fontSize: 8,
    color: '#888',
    marginBottom: 3,
  },
  componentDesc: {
    fontSize: 9,
    color: '#444',
  },
  mono: {
    fontFamily: 'Courier',
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
    borderTop: '0.5 solid #ddd',
    paddingTop: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5 solid #eee',
    paddingVertical: 4,
  },
  tableCell: {
    fontSize: 9,
    color: '#333',
    flex: 1,
    paddingRight: 6,
  },
  tableHeader: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#555',
    flex: 1,
    paddingRight: 6,
  },
});

const date = new Date().toISOString().slice(0, 10);

const SecurityArchitecturePDF: React.FC = () => (
  <Document>
    {/* Title Page */}
    <Page size="A4" style={styles.titlePage}>
      <Text style={styles.titleMain}>Security Architecture Document</Text>
      <Text style={styles.titleSub}>C2PA Generator & Validator Product</Text>
      <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 30, color: '#333' }}>
        TSMO – The Stop Market Online
      </Text>
      <Text style={styles.titleMeta}>Product Version: 2.0</Text>
      <Text style={styles.titleMeta}>Specification: C2PA v2.2</Text>
      <Text style={styles.titleMeta}>Assurance Level: Level 1 (Software-based signing)</Text>
      <Text style={styles.titleMeta}>Date: {date}</Text>
      <Text style={{ ...styles.titleMeta, marginTop: 20 }}>CONFIDENTIAL</Text>
    </Page>

    {/* Section 1: Product Overview */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>1. Product Overview</Text>
      <Text style={styles.paragraph}>
        TSMO is a cloud-based content protection platform that applies C2PA Content Credentials
        to digital images (JPEG, PNG) and detects existing C2PA manifests in images and video
        (MP4, MOV). It operates as both a Generator (creating, signing, embedding manifests)
        and a Validator (detecting and parsing existing provenance chains).
        Conforms to C2PA Specification v2.2.
      </Text>

      <Text style={styles.subsectionTitle}>Supported Formats</Text>
      <Text style={styles.label}>Generator:</Text>
      <Text style={styles.value}>image/jpeg, image/png</Text>
      <Text style={styles.label}>Validator:</Text>
      <Text style={styles.value}>image/jpeg, image/png, image/webp, video/mp4, video/quicktime</Text>

      <Text style={styles.subsectionTitle}>Identifiers</Text>
      <Text style={styles.label}>Claim Generator:</Text>
      <Text style={styles.value}>TSMO/2.0 ai-protection-system</Text>
      <Text style={styles.label}>Claim Generator Info:</Text>
      <Text style={styles.value}>name: "TSMO AI Protection", version: "2.0"</Text>
      <Text style={styles.label}>Instance ID Format:</Text>
      <Text style={{ ...styles.value, ...styles.mono }}>urn:c2pa:&lt;uuid-v4&gt; (per C2PA v2.2 §7.1)</Text>

      <Text style={styles.subsectionTitle}>Ingredient Support</Text>
      <Text style={styles.paragraph}>
        Supports parentOf, componentOf, and inputTo relationships per §8.3.
        Each ingredient includes SHA-256 hash, dc:title, dc:format, instanceID, and relationship type.
      </Text>

      <Text style={styles.footer}>TSMO Security Architecture — C2PA v2.2 — Page 1</Text>
    </Page>

    {/* Section 2: Target of Evaluation */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>2. Target of Evaluation (TOE)</Text>
      <Text style={styles.paragraph}>
        The TOE comprises the server-side edge functions, client application, key storage, and
        database components that together implement the C2PA Generator and Validator pipeline.
      </Text>

      <Text style={styles.subsectionTitle}>Architecture Boundary</Text>
      <Text style={{ ...styles.paragraph, ...styles.mono }}>
        Client (Browser/UXP) → HTTPS/TLS 1.3 → Supabase Edge Functions → Secrets Vault / PostgreSQL
      </Text>

      <Text style={styles.subsectionTitle}>Components</Text>

      <View style={styles.componentBox}>
        <Text style={styles.componentName}>sign-c2pa-manifest (Edge Function)</Text>
        <Text style={styles.componentType}>Cloud Compute — Deno Runtime</Text>
        <Text style={styles.componentDesc}>
          Generates ES256 (ECDSA P-256) signatures over C2PA manifest claims using COSE Sign1
          envelopes (RFC 9052). Accepts ingredient references. Keys stored in Supabase Secrets vault.
        </Text>
      </View>

      <View style={styles.componentBox}>
        <Text style={styles.componentName}>embed-c2pa-manifest (Edge Function)</Text>
        <Text style={styles.componentType}>Cloud Compute — Deno Runtime</Text>
        <Text style={styles.componentDesc}>
          Constructs ISO 19566-5 JUMBF superboxes including ingredient assertion boxes and writes
          them into JPEG (APP11 marker) or PNG (caBX chunk) files.
        </Text>
      </View>

      <View style={styles.componentBox}>
        <Text style={styles.componentName}>validate-c2pa-manifest (Edge Function)</Text>
        <Text style={styles.componentType}>Cloud Compute — Deno Runtime</Text>
        <Text style={styles.componentDesc}>
          Binary scanner that detects and parses C2PA JUMBF boxes in JPEG (APP11), PNG (caBX),
          and MP4/MOV (ISO BMFF uuid box) files. Returns structured ingredient data and trust chain status.
        </Text>
      </View>

      <View style={styles.componentBox}>
        <Text style={styles.componentName}>Supabase Secrets Vault</Text>
        <Text style={styles.componentType}>Key Storage</Text>
        <Text style={styles.componentDesc}>
          Encrypted secrets store for C2PA_PRIVATE_KEY, C2PA_SIGNING_CERT, and C2PA_ISSUER_ID.
          Secrets are only accessible to edge functions at runtime.
        </Text>
      </View>

      <View style={styles.componentBox}>
        <Text style={styles.componentName}>Supabase Auth & PostgreSQL</Text>
        <Text style={styles.componentType}>Authentication & Database</Text>
        <Text style={styles.componentDesc}>
          JWT authentication for all operations. c2pa_signing_logs and c2pa_validation_logs tables
          with Row-Level Security policies restricting access to the owning user.
        </Text>
      </View>

      <Text style={styles.footer}>TSMO Security Architecture — C2PA v2.2 — Page 2</Text>
    </Page>

    {/* Section 3: Cryptographic Implementation */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>3. Cryptographic Implementation</Text>

      <Text style={styles.label}>Signing Algorithm:</Text>
      <Text style={styles.value}>ES256 (ECDSA with P-256 curve and SHA-256)</Text>

      <Text style={styles.label}>Key Format:</Text>
      <Text style={styles.value}>PEM-encoded PKCS#8 private key</Text>

      <Text style={styles.label}>Certificate Format:</Text>
      <Text style={styles.value}>X.509 PEM (self-signed fallback; production CAI-issued)</Text>

      <Text style={styles.label}>Signature Envelope:</Text>
      <Text style={styles.value}>COSE Sign1 (RFC 9052)</Text>

      <Text style={styles.label}>Key Generation:</Text>
      <Text style={styles.value}>
        Web Crypto API (crypto.subtle.generateKey) in Deno runtime when no production keys are configured
      </Text>

      <Text style={styles.label}>Key Storage:</Text>
      <Text style={styles.value}>Supabase Secrets — encrypted at rest, accessed only by edge functions</Text>

      <Text style={styles.label}>Key Rotation:</Text>
      <Text style={styles.value}>
        Manual rotation via Supabase dashboard. Old signing logs retain the certificate fingerprint for audit trail.
      </Text>

      <Text style={styles.subsectionTitle}>Self-Signed Fallback</Text>
      <Text style={styles.paragraph}>
        When C2PA_PRIVATE_KEY and C2PA_SIGNING_CERT secrets are not set, the sign-c2pa-manifest
        function generates an ephemeral ECDSA P-256 keypair per invocation. Manifests are
        cryptographically valid but do not chain to the CAI trust list.
      </Text>

      <Text style={styles.subsectionTitle}>Trust List Integration</Text>
      <Text style={styles.paragraph}>
        Certificate fingerprints are verified against the CAI trust list via the
        fetch-c2pa-trust-list edge function. Trust status is returned as
        trusted/untrusted/self-signed/expired. Trust list is cached client-side with 24h TTL.
      </Text>

      <Text style={styles.subsectionTitle}>Dependency Management</Text>
      <Text style={styles.paragraph}>
        All edge function imports are version-pinned to exact versions: deno.land/std@0.192.0,
        @supabase/supabase-js@2.50.5, stripe@14.21.0, resend@2.0.0. GitHub Dependabot is configured
        (.github/dependabot.yml) for weekly vulnerability scanning. A CycloneDX SBOM manifest is
        maintained at scripts/generate-sbom.json. The dependency-inventory edge function serves a
        live audit-ready inventory.
      </Text>

      {/* Section 4: Manifest Construction */}
      <Text style={styles.sectionTitle}>4. Manifest Construction</Text>

      <Text style={styles.label}>Specification:</Text>
      <Text style={styles.value}>C2PA v2.2, ISO 19566-5 (JUMBF)</Text>

      <Text style={styles.subsectionTitle}>JUMBF Superbox Structure</Text>
      <Text style={styles.bulletItem}>• Box Header: size (4B) + type "jumb" (4B)</Text>
      <Text style={styles.bulletItem}>• Description Box (jumd): C2PA UUID + label "c2pa" + toggles</Text>
      <Text style={styles.bulletItem}>• Assertion Store: nested c2pa.actions, c2pa.hash.data, c2pa.ingredient boxes</Text>
      <Text style={styles.bulletItem}>• Claim Box (c2cl): CBOR-encoded claim with claim_generator_info</Text>
      <Text style={styles.bulletItem}>• Claim Signature Box (c2cs): COSE Sign1 envelope</Text>

      <Text style={styles.subsectionTitle}>Embedding</Text>
      <Text style={styles.bulletItem}>• JPEG: APP11 marker segment (0xFFEB) after SOI</Text>
      <Text style={styles.bulletItem}>• PNG: caBX ancillary chunk before IEND</Text>

      <Text style={styles.subsectionTitle}>Integrity</Text>
      <Text style={styles.paragraph}>
        SHA-256 hash of the asset bytes (c2pa.hash.data assertion) binds manifest to content.
        Ingredient assets are also hash-bound via SHA-256.
      </Text>

      <Text style={styles.footer}>TSMO Security Architecture — C2PA v2.2 — Page 3</Text>
    </Page>

    {/* Section 5-7 */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>5. Security Controls</Text>

      <Text style={styles.label}>Authentication:</Text>
      <Text style={styles.value}>Supabase Auth with JWT verification on every edge function invocation</Text>

      <Text style={styles.label}>Authorization:</Text>
      <Text style={styles.value}>Row-Level Security on c2pa_signing_logs and c2pa_validation_logs</Text>

      <Text style={styles.label}>Rate Limiting:</Text>
      <Text style={styles.value}>Supabase built-in rate limiting on edge function invocations</Text>

      <Text style={styles.label}>Input Validation:</Text>
      <Text style={styles.value}>File type verification, size limits, binary format validation before processing</Text>

      <Text style={styles.label}>Audit Logging:</Text>
      <Text style={styles.value}>
        Every signing operation records: user_id, file_name, protection_id, algorithm,
        certificate_fingerprint, manifest_hash, timestamp
      </Text>

      <Text style={styles.label}>Data Isolation:</Text>
      <Text style={styles.value}>Edge functions are stateless and isolated per invocation. No keys persist in memory.</Text>

      <Text style={styles.label}>Transport Security:</Text>
      <Text style={styles.value}>TLS 1.3 for all client-server communication. HSTS headers enforced.</Text>

      <Text style={styles.label}>Software Composition Analysis (SCA):</Text>
      <Text style={styles.value}>
        GitHub Dependabot is configured (.github/dependabot.yml) for weekly automated CVE scanning.
        The dependency-inventory edge function provides a live JSON inventory of all pinned Deno
        imports for on-demand audit. deno info --json is used per-build for dependency graphs.
      </Text>

      <Text style={styles.label}>SBOM Generation:</Text>
      <Text style={styles.value}>
        CycloneDX v1.5 JSON SBOM maintained at scripts/generate-sbom.json, listing all edge function
        dependencies with exact version pins, PURLs, and scope classification. Updated per release.
      </Text>

      <Text style={styles.label}>Vulnerability Patch Policy:</Text>
      <Text style={styles.value}>
        Critical/High CVEs: 90-day remediation. Medium: 180-day. Low/Informational: quarterly review.
        Escalation: automated alert → 48h triage → patch within SLA → post-remediation verification.
        Policy owner: Engineering Lead.
      </Text>

      <Text style={styles.sectionTitle}>6. Third-Party Services</Text>

      <View style={styles.tableRow}>
        <Text style={styles.tableHeader}>Service</Text>
        <Text style={styles.tableHeader}>Purpose</Text>
        <Text style={styles.tableHeader}>Data Shared</Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={styles.tableCell}>Supabase</Text>
        <Text style={styles.tableCell}>BaaS: database, auth, edge functions, secrets</Text>
        <Text style={styles.tableCell}>Auth data, signing logs, file metadata</Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={styles.tableCell}>Deno Deploy</Text>
        <Text style={styles.tableCell}>Edge function runtime</Text>
        <Text style={styles.tableCell}>Function code, runtime execution</Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={styles.tableCell}>CAI Trust List</Text>
        <Text style={styles.tableCell}>Certificate trust verification</Text>
        <Text style={styles.tableCell}>Certificate fingerprints (no user data)</Text>
      </View>

      <Text style={styles.sectionTitle}>7. Threat Model</Text>

      <Text style={styles.subsectionTitle}>Threats Addressed</Text>
      <Text style={styles.bulletItem}>• Key compromise: encrypted secrets vault, no client-side key access</Text>
      <Text style={styles.bulletItem}>• Manifest tampering: COSE Sign1 cryptographic binding (RFC 9052)</Text>
      <Text style={styles.bulletItem}>• Unauthorized signing: JWT authentication requirement</Text>
      <Text style={styles.bulletItem}>• Replay attacks: unique urn:c2pa:uuid instance_id + timestamp per manifest</Text>
      <Text style={styles.bulletItem}>• Privilege escalation: RLS policies on all audit tables</Text>
      <Text style={styles.bulletItem}>• Ingredient spoofing: SHA-256 hash binding of ingredient assets</Text>

      <Text style={styles.subsectionTitle}>Residual Risks</Text>
      <Text style={styles.bulletItem}>• Self-signed certificates until production CAI certs configured</Text>
      <Text style={styles.bulletItem}>• Client-side file manipulation before upload (inherent to web apps)</Text>
      <Text style={styles.bulletItem}>• Trust list availability depends on edge function uptime</Text>

      <Text style={styles.footer}>TSMO Security Architecture — C2PA v2.2 — Page 4</Text>
    </Page>
  </Document>
);

export default SecurityArchitecturePDF;
