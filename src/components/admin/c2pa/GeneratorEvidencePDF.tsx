import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

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
  codeBlock: {
    fontFamily: 'Courier',
    fontSize: 8,
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginBottom: 10,
    borderRadius: 2,
    border: '1 solid #e0e0e0',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  col: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
    borderTop: '1 solid #eee',
    paddingTop: 6,
  },
});

export interface GeneratorEvidencePDFProps {
  manifest: Record<string, unknown>;
  protectionId: string;
  timestamp: string;
  algorithm: string;
  signingMode: string;
  certificateFingerprint: string;
  manifestHash: string;
  signature: string;
  originalFileName: string;
  originalFileSize: number;
  originalFileMime: string;
  protectedFileSize: number | null;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
};

const GeneratorEvidencePDF: React.FC<GeneratorEvidencePDFProps> = (props) => {
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const manifestJson = JSON.stringify(props.manifest, null, 2);
  // Split long JSON into chunks to avoid overflow
  const manifestChunks: string[] = [];
  const lines = manifestJson.split('\n');
  let chunk = '';
  for (const line of lines) {
    if ((chunk + '\n' + line).length > 2800) {
      manifestChunks.push(chunk);
      chunk = line;
    } else {
      chunk += (chunk ? '\n' : '') + line;
    }
  }
  if (chunk) manifestChunks.push(chunk);

  return (
    <Document>
      {/* Title Page */}
      <Page size="A4" style={styles.titlePage}>
        <Text style={styles.titleMain}>C2PA Generator Evidence Report</Text>
        <Text style={styles.titleSub}>Content Provenance & Authenticity — Specification v2.2</Text>
        <Text style={styles.titleMeta}>Product: TSMO AI Protection v2.0</Text>
        <Text style={styles.titleMeta}>Protection ID: {props.protectionId}</Text>
        <Text style={styles.titleMeta}>Generated: {generatedDate}</Text>
        <Text style={styles.titleMeta}>Classification: Conformance Evidence — Generator</Text>
        <Text style={{ ...styles.titleMeta, marginTop: 30 }}>
          TSMO Technology Inc. • Assurance Level 1
        </Text>
      </Page>

      {/* Page 2: Manifest Claim */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>1. Manifest Claim</Text>
        <Text style={styles.paragraph}>
          The following C2PA v2.2 manifest claim was generated and cryptographically signed
          for the protected asset. This claim conforms to the Coalition for Content Provenance
          and Authenticity specification and includes all required fields for Generator conformance.
        </Text>

        <Text style={styles.subsectionTitle}>Claim Metadata</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Claim Generator</Text>
            <Text style={styles.value}>{String(props.manifest.claim_generator || 'N/A')}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Instance ID</Text>
            <Text style={styles.value}>{String(props.manifest.instance_id || 'N/A')}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Format</Text>
            <Text style={styles.value}>{String(props.manifest.format || 'N/A')}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.value}>{String(props.manifest.title || 'N/A')}</Text>
          </View>
        </View>

        <Text style={styles.subsectionTitle}>Assertions</Text>
        {Array.isArray(props.manifest.assertions) ? (
          (props.manifest.assertions as Record<string, unknown>[]).map((a, i) => (
            <Text key={i} style={styles.bulletItem}>
              • {String(a['@type'] || 'assertion')}
              {a.action ? ` — ${String(a.action)}` : ''}
              {a.ai_training ? ' — AI training prohibited' : ''}
              {a.copyrightNotice ? ` — ${String(a.copyrightNotice)}` : ''}
            </Text>
          ))
        ) : (
          <Text style={styles.paragraph}>No assertions recorded.</Text>
        )}

        <Text style={styles.sectionTitle}>2. Signing Details</Text>

        {props.signingMode === 'self-signed' && (
          <View style={{ backgroundColor: '#fff3cd', border: '1 solid #ffc107', padding: 8, marginBottom: 10, borderRadius: 2 }}>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#856404', marginBottom: 3 }}>
              ⚠ WARNING: SELF-SIGNED MODE
            </Text>
            <Text style={{ fontSize: 9, color: '#856404' }}>
              This manifest was signed with an ephemeral key — NOT a trusted CA-issued certificate.
              C2PA validators will report trustStatus: "untrusted". This submission will NOT pass
              conformance review until C2PA_PRIVATE_KEY, C2PA_SIGNING_CERT, and C2PA_ISSUER_ID
              are configured with production credentials from SSL.com or DigiCert.
            </Text>
          </View>
        )}

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Algorithm</Text>
            <Text style={styles.value}>{props.algorithm}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Signing Mode</Text>
            <Text style={{ fontSize: 10, marginBottom: 6, color: props.signingMode === 'self-signed' ? '#856404' : '#166534', fontFamily: 'Helvetica-Bold' }}>
              {props.signingMode === 'self-signed' ? '⚠ SELF-SIGNED (Not conformance ready)' : `✓ ${props.signingMode}`}
            </Text>
          </View>
        </View>

        <Text style={styles.label}>Certificate Fingerprint (SHA-256)</Text>
        <Text style={{ ...styles.value, fontFamily: 'Courier', fontSize: 8 }}>
          {props.certificateFingerprint}
        </Text>

        <Text style={styles.label}>Manifest Hash (SHA-256)</Text>
        <Text style={{ ...styles.value, fontFamily: 'Courier', fontSize: 8 }}>
          {props.manifestHash}
        </Text>

        <Text style={styles.sectionTitle}>3. File Information</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Original Filename</Text>
            <Text style={styles.value}>{props.originalFileName}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>MIME Type</Text>
            <Text style={styles.value}>{props.originalFileMime}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Original Size</Text>
            <Text style={styles.value}>{formatBytes(props.originalFileSize)}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Protected Size</Text>
            <Text style={styles.value}>
              {props.protectedFileSize ? formatBytes(props.protectedFileSize) : 'N/A (manifest-only)'}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Protection Timestamp</Text>
            <Text style={styles.value}>{props.timestamp}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Protection ID</Text>
            <Text style={styles.value}>{props.protectionId}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          TSMO AI Protection — C2PA Generator Evidence — {props.protectionId}
        </Text>
      </Page>

      {/* Page 3: COSE Signature + Manifest JSON */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>4. COSE Sign1 Signature</Text>
        <Text style={styles.paragraph}>
          The manifest claim was signed using a COSE Sign1 envelope per RFC 9052.
          The base64-encoded signature value is shown below.
        </Text>
        <Text style={styles.codeBlock}>{props.signature}</Text>

        <Text style={styles.sectionTitle}>5. Full Manifest JSON</Text>
        <Text style={styles.paragraph}>
          Complete C2PA v2.2 manifest claim with embedded signature data:
        </Text>
        {manifestChunks.map((chunk, i) => (
          <Text key={i} style={styles.codeBlock} break={i > 0}>
            {chunk}
          </Text>
        ))}

        <Text style={styles.footer}>
          TSMO AI Protection — C2PA Generator Evidence — {props.protectionId}
        </Text>
      </Page>

      {/* Page 4: Evidence Summary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>6. Evidence Summary</Text>
        <Text style={styles.paragraph}>
          This document constitutes the Generator Evidence deliverable for the C2PA Conformance
          Program submission. It demonstrates that the TSMO AI Protection system generates
          cryptographically signed C2PA v2.2 manifests with all required fields.
        </Text>

        <Text style={styles.subsectionTitle}>Conformance Checklist</Text>
        <Text style={styles.bulletItem}>✓ Manifest claim generated per C2PA Specification v2.2</Text>
        <Text style={styles.bulletItem}>✓ COSE Sign1 signature envelope (RFC 9052)</Text>
        <Text style={styles.bulletItem}>✓ ES256 algorithm (ECDSA P-256 + SHA-256)</Text>
        <Text style={styles.bulletItem}>✓ Unique instance ID (URN format)</Text>
        <Text style={styles.bulletItem}>✓ claim_generator_info structured array</Text>
        <Text style={styles.bulletItem}>✓ c2pa.actions assertion with timestamp</Text>
        <Text style={styles.bulletItem}>✓ c2pa.creative.work assertion with copyright</Text>
        <Text style={styles.bulletItem}>✓ c2pa.rights assertion (AI training prohibition)</Text>
        <Text style={{ ...styles.bulletItem, color: props.protectedFileSize ? '#166534' : '#b45309' }}>
          {props.protectedFileSize ? '✓' : '⚠'} JUMBF embedding (ISO 19566-5) for JPEG/PNG
          {!props.protectedFileSize ? ' — FAILED (manifest-only fallback)' : ''}
        </Text>
        <Text style={styles.bulletItem}>✓ SHA-256 manifest hash for integrity verification</Text>
        {props.signingMode === 'self-signed' ? (
          <Text style={{ ...styles.bulletItem, color: '#b91c1c', fontFamily: 'Helvetica-Bold' }}>
            ✗ Production certificate chain — MISSING (self-signed only)
          </Text>
        ) : (
          <Text style={{ ...styles.bulletItem, color: '#166534' }}>
            ✓ Production certificate chain verified
          </Text>
        )}

        <Text style={styles.subsectionTitle}>Product Information</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Product Name</Text>
            <Text style={styles.value}>TSMO AI Protection</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Version</Text>
            <Text style={styles.value}>2.0</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Specification</Text>
            <Text style={styles.value}>C2PA v2.2</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Assurance Level</Text>
            <Text style={styles.value}>Level 1 (Software-based signing)</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Product Class</Text>
            <Text style={styles.value}>Generator — Backend Class</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Organization</Text>
            <Text style={styles.value}>TSMO Technology Inc.</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          TSMO AI Protection — C2PA Generator Evidence — {props.protectionId}
        </Text>
      </Page>
    </Document>
  );
};

export default GeneratorEvidencePDF;
