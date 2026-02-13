import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// PEM sources
const C2PA_TRUST_LIST_URL = 'https://raw.githubusercontent.com/c2pa-org/conformance-public/refs/heads/main/trust-list/C2PA-TRUST-LIST.pem';
const CAI_TRUST_LIST_URL = 'https://contentcredentials.org/trust/anchors.pem';

interface TrustAnchor {
  commonName: string;
  organization: string;
  country: string;
  fingerprint: string;
  validFrom: string;
  validTo: string;
  issuerID: string;
  status: 'active' | 'expired' | 'revoked';
  anchorType: 'root' | 'intermediate' | 'end-entity';
  source: string;
}

// ---- ASN.1 DER parsing helpers ----

function readTag(buf: Uint8Array, offset: number): { tag: number; length: number; headerLen: number } {
  const tag = buf[offset];
  let length = 0;
  let headerLen = 2;
  const lenByte = buf[offset + 1];
  if (lenByte < 0x80) {
    length = lenByte;
  } else {
    const numBytes = lenByte & 0x7f;
    headerLen = 2 + numBytes;
    for (let i = 0; i < numBytes; i++) {
      length = (length << 8) | buf[offset + 2 + i];
    }
  }
  return { tag, length, headerLen };
}

function parseOIDBytes(buf: Uint8Array): string {
  const parts: number[] = [];
  parts.push(Math.floor(buf[0] / 40));
  parts.push(buf[0] % 40);
  let val = 0;
  for (let i = 1; i < buf.length; i++) {
    val = (val << 7) | (buf[i] & 0x7f);
    if ((buf[i] & 0x80) === 0) {
      parts.push(val);
      val = 0;
    }
  }
  return parts.join('.');
}

// Known OIDs
const OID_CN = '2.5.4.3';
const OID_O = '2.5.4.10';
const OID_C = '2.5.4.6';
const OID_BASIC_CONSTRAINTS = '2.5.29.19';

interface ParsedCert {
  cn: string;
  org: string;
  country: string;
  validFrom: string;
  validTo: string;
  isCA: boolean;
}

function parseUTCTime(buf: Uint8Array, offset: number, length: number): string {
  const str = new TextDecoder().decode(buf.slice(offset, offset + length));
  // YYMMDDHHmmSSZ
  const yy = parseInt(str.slice(0, 2));
  const year = yy >= 50 ? 1900 + yy : 2000 + yy;
  return `${year}-${str.slice(2, 4)}-${str.slice(4, 6)}T${str.slice(6, 8)}:${str.slice(8, 10)}:${str.slice(10, 12)}Z`;
}

function parseGeneralizedTime(buf: Uint8Array, offset: number, length: number): string {
  const str = new TextDecoder().decode(buf.slice(offset, offset + length));
  // YYYYMMDDHHmmSSZ
  return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}T${str.slice(8, 10)}:${str.slice(10, 12)}:${str.slice(12, 14)}Z`;
}

function extractRDNValues(buf: Uint8Array, offset: number, endOffset: number): { cn: string; org: string; country: string } {
  let cn = '';
  let org = '';
  let country = '';
  let pos = offset;

  while (pos < endOffset) {
    const set = readTag(buf, pos);
    if (set.tag !== 0x31) { pos += set.headerLen + set.length; continue; }
    const setEnd = pos + set.headerLen + set.length;
    let seqPos = pos + set.headerLen;

    while (seqPos < setEnd) {
      const seq = readTag(buf, seqPos);
      if (seq.tag !== 0x30) { seqPos += seq.headerLen + seq.length; continue; }
      const seqContentStart = seqPos + seq.headerLen;
      // OID
      const oid = readTag(buf, seqContentStart);
      if (oid.tag !== 0x06) { seqPos += seq.headerLen + seq.length; continue; }
      const oidStr = parseOIDBytes(buf.slice(seqContentStart + oid.headerLen, seqContentStart + oid.headerLen + oid.length));
      // Value
      const valOffset = seqContentStart + oid.headerLen + oid.length;
      const val = readTag(buf, valOffset);
      const valStr = new TextDecoder().decode(buf.slice(valOffset + val.headerLen, valOffset + val.headerLen + val.length));

      if (oidStr === OID_CN) cn = valStr;
      else if (oidStr === OID_O) org = valStr;
      else if (oidStr === OID_C) country = valStr;

      seqPos += seq.headerLen + seq.length;
    }
    pos = setEnd;
  }
  return { cn, org, country };
}

function parseDERCertificate(der: Uint8Array): ParsedCert | null {
  try {
    // Outer SEQUENCE
    const outer = readTag(der, 0);
    if (outer.tag !== 0x30) return null;

    // TBS Certificate SEQUENCE
    const tbsStart = outer.headerLen;
    const tbs = readTag(der, tbsStart);
    if (tbs.tag !== 0x30) return null;
    const tbsContentStart = tbsStart + tbs.headerLen;
    const tbsEnd = tbsContentStart + tbs.length;

    let pos = tbsContentStart;

    // version [0] EXPLICIT (optional)
    let t = readTag(der, pos);
    if (t.tag === 0xa0) {
      pos += t.headerLen + t.length;
      t = readTag(der, pos);
    }

    // serialNumber INTEGER
    pos += t.headerLen + t.length;

    // signature AlgorithmIdentifier SEQUENCE
    t = readTag(der, pos);
    pos += t.headerLen + t.length;

    // issuer Name SEQUENCE
    t = readTag(der, pos);
    pos += t.headerLen + t.length;

    // validity SEQUENCE
    const valSeq = readTag(der, pos);
    const valStart = pos + valSeq.headerLen;

    // notBefore
    const nb = readTag(der, valStart);
    const validFrom = nb.tag === 0x17
      ? parseUTCTime(der, valStart + nb.headerLen, nb.length)
      : parseGeneralizedTime(der, valStart + nb.headerLen, nb.length);

    // notAfter
    const naOffset = valStart + nb.headerLen + nb.length;
    const na = readTag(der, naOffset);
    const validTo = na.tag === 0x17
      ? parseUTCTime(der, naOffset + na.headerLen, na.length)
      : parseGeneralizedTime(der, naOffset + na.headerLen, na.length);

    pos += valSeq.headerLen + valSeq.length;

    // subject Name SEQUENCE
    const subj = readTag(der, pos);
    const subjEnd = pos + subj.headerLen + subj.length;
    const { cn, org, country } = extractRDNValues(der, pos + subj.headerLen, subjEnd);

    pos = subjEnd;

    // subjectPublicKeyInfo SEQUENCE
    t = readTag(der, pos);
    pos += t.headerLen + t.length;

    // Check extensions for Basic Constraints CA flag
    let isCA = false;
    // extensions are in [3] EXPLICIT context tag
    while (pos < tbsEnd) {
      t = readTag(der, pos);
      if (t.tag === 0xa3) {
        // extensions SEQUENCE
        const extSeqStart = pos + t.headerLen;
        const extSeq = readTag(der, extSeqStart);
        let extPos = extSeqStart + extSeq.headerLen;
        const extEnd = extSeqStart + extSeq.headerLen + extSeq.length;

        while (extPos < extEnd) {
          const ext = readTag(der, extPos);
          if (ext.tag === 0x30) {
            const extContentStart = extPos + ext.headerLen;
            const oidTag = readTag(der, extContentStart);
            if (oidTag.tag === 0x06) {
              const oidStr = parseOIDBytes(der.slice(extContentStart + oidTag.headerLen, extContentStart + oidTag.headerLen + oidTag.length));
              if (oidStr === OID_BASIC_CONSTRAINTS) {
                // Look for BOOLEAN TRUE inside the OCTET STRING
                let bcPos = extContentStart + oidTag.headerLen + oidTag.length;
                // skip optional BOOLEAN (critical)
                let bcTag = readTag(der, bcPos);
                if (bcTag.tag === 0x01) {
                  bcPos += bcTag.headerLen + bcTag.length;
                  bcTag = readTag(der, bcPos);
                }
                // OCTET STRING wrapping SEQUENCE
                if (bcTag.tag === 0x04) {
                  const innerPos = bcPos + bcTag.headerLen;
                  const innerSeq = readTag(der, innerPos);
                  if (innerSeq.tag === 0x30 && innerSeq.length > 0) {
                    const boolTag = readTag(der, innerPos + innerSeq.headerLen);
                    if (boolTag.tag === 0x01 && boolTag.length === 1) {
                      isCA = der[innerPos + innerSeq.headerLen + boolTag.headerLen] !== 0;
                    }
                  }
                }
              }
            }
          }
          extPos += ext.headerLen + ext.length;
        }
        break;
      }
      pos += t.headerLen + t.length;
    }

    return { cn, org, country, validFrom, validTo, isCA };
  } catch {
    return null;
  }
}

function base64Decode(b64: string): Uint8Array {
  const binaryStr = atob(b64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function parsePEM(pemText: string, source: string): Promise<TrustAnchor[]> {
  const anchors: TrustAnchor[] = [];
  const blocks = pemText.split('-----BEGIN CERTIFICATE-----');
  const now = new Date();

  for (const block of blocks) {
    const endIdx = block.indexOf('-----END CERTIFICATE-----');
    if (endIdx === -1) continue;

    const b64 = block.slice(0, endIdx).replace(/\s/g, '');
    if (!b64) continue;

    try {
      const der = base64Decode(b64);
      const fingerBuf = await crypto.subtle.digest('SHA-256', der);
      const fingerprint = toHex(fingerBuf);

      const parsed = parseDERCertificate(der);

      // Try to extract label from comment line preceding the PEM block
      let label = '';
      const precedingText = block.split('-----END CERTIFICATE-----')[0];
      const lines = pemText.split('-----BEGIN CERTIFICATE-----');
      const blockIdx = lines.indexOf(block);
      if (blockIdx > 0) {
        const prev = lines[blockIdx - 1] || '';
        const commentLines = prev.trim().split('\n').filter(l => l.trim() && !l.includes('-----'));
        if (commentLines.length > 0) {
          label = commentLines[commentLines.length - 1].replace(/^#\s*/, '').trim();
        }
      }

      const cn = parsed?.cn || label || 'Unknown';
      const org = parsed?.org || '';
      const country = parsed?.country || '';
      const validFrom = parsed?.validFrom || '';
      const validTo = parsed?.validTo || '';
      const isCA = parsed?.isCA ?? true;

      const isExpired = validTo ? new Date(validTo) < now : false;

      anchors.push({
        commonName: cn,
        organization: org,
        country,
        fingerprint,
        validFrom,
        validTo,
        issuerID: fingerprint.slice(0, 16),
        status: isExpired ? 'expired' : 'active',
        anchorType: isCA ? 'root' : 'end-entity',
        source,
      });
    } catch {
      // Skip unparseable blocks
    }
  }

  return anchors;
}

// TSMO self-signed entry
const TSMO_ANCHOR: TrustAnchor = {
  commonName: 'TSMO AI Protection CA (Self-Signed)',
  organization: 'TSMO Technology Inc.',
  country: 'US',
  fingerprint: 'tsmo-self-signed-placeholder',
  validFrom: '2025-01-01T00:00:00Z',
  validTo: '2035-01-01T00:00:00Z',
  issuerID: 'tsmo-self-signed',
  status: 'active',
  anchorType: 'end-entity',
  source: 'Bundled',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const allAnchors: TrustAnchor[] = [];
    const errors: string[] = [];

    // Fetch both PEM lists in parallel
    const [c2paResult, caiResult] = await Promise.allSettled([
      fetch(C2PA_TRUST_LIST_URL, { headers: { 'Accept': 'text/plain' } }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      }),
      fetch(CAI_TRUST_LIST_URL, { headers: { 'Accept': 'text/plain' } }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      }),
    ]);

    if (c2paResult.status === 'fulfilled') {
      const parsed = await parsePEM(c2paResult.value, 'Official C2PA');
      allAnchors.push(...parsed);
      console.log(`[fetch-c2pa-trust-list] Parsed ${parsed.length} anchors from Official C2PA list`);
    } else {
      errors.push(`C2PA list fetch failed: ${c2paResult.reason}`);
      console.warn('[fetch-c2pa-trust-list] C2PA list fetch failed:', c2paResult.reason);
    }

    if (caiResult.status === 'fulfilled') {
      const parsed = await parsePEM(caiResult.value, 'Legacy CAI');
      // Deduplicate by fingerprint
      for (const anchor of parsed) {
        if (!allAnchors.some(a => a.fingerprint === anchor.fingerprint)) {
          allAnchors.push(anchor);
        }
      }
      console.log(`[fetch-c2pa-trust-list] Parsed anchors from Legacy CAI list (after dedup)`);
    } else {
      errors.push(`CAI list fetch failed: ${caiResult.reason}`);
      console.warn('[fetch-c2pa-trust-list] CAI list fetch failed:', caiResult.reason);
    }

    // Always include TSMO self-signed
    allAnchors.push(TSMO_ANCHOR);

    const now = new Date();
    const response = {
      version: '2.2',
      fetchedAt: now.toISOString(),
      specVersion: '2.2',
      totalAnchors: allAnchors.length,
      activeAnchors: allAnchors.filter(a => a.status === 'active').length,
      anchors: allAnchors,
      source: 'CAI Trust List (live)',
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log(`[fetch-c2pa-trust-list] Returning ${allAnchors.length} trust anchors (${response.activeAnchors} active)`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[fetch-c2pa-trust-list] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
