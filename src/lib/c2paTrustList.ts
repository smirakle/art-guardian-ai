/**
 * C2PA v2.2 Trust List Integration
 * Fetches trust anchors from the edge function proxy and caches locally.
 * Reference: https://spec.c2pa.org/conformance-explorer/
 */

import { supabase } from '@/integrations/supabase/client';

export interface TrustAnchor {
  commonName: string;
  organization: string;
  country?: string;
  fingerprint: string;  // SHA-256 hex
  validFrom: string;
  validTo: string;
  issuerID?: string;
  status?: 'active' | 'expired' | 'revoked';
  anchorType?: 'root' | 'intermediate' | 'end-entity';
  source?: string;
}

export interface TrustListData {
  version: string;
  fetchedAt: string;
  anchors: TrustAnchor[];
  specVersion: string;
  totalAnchors?: number;
  activeAnchors?: number;
  source?: string;
  errors?: string[];
}

export type TrustStatus = 'trusted' | 'untrusted' | 'self-signed' | 'unknown' | 'expired';

export interface TrustVerificationResult {
  status: TrustStatus;
  matchedAnchor?: TrustAnchor;
  reason: string;
}

const CACHE_KEY = 'c2pa_trust_list_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Bundled fallback snapshot (used if edge function fetch fails)
const FALLBACK_ANCHORS: TrustAnchor[] = [
  {
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
  },
];

/**
 * Fetch trust list from the edge function, with localStorage caching.
 */
export async function getTrustList(forceRefresh = false): Promise<TrustListData> {
  // Check cache first (unless forced refresh)
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: TrustListData = JSON.parse(cached);
        const age = Date.now() - new Date(parsed.fetchedAt).getTime();
        if (age < CACHE_TTL_MS) {
          return parsed;
        }
      }
    } catch {
      // Cache miss or parse error
    }
  }

  // Fetch from edge function
  try {
    const { data, error } = await supabase.functions.invoke('fetch-c2pa-trust-list');

    if (error) {
      console.warn('[c2paTrustList] Edge function error, using fallback:', error.message);
      return buildFallbackList();
    }

    const trustList = data as TrustListData;

    // Cache the result
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(trustList));
    } catch {
      // Storage full or unavailable
    }

    return trustList;
  } catch (e) {
    console.warn('[c2paTrustList] Fetch failed, using fallback:', e);
    return buildFallbackList();
  }
}

function buildFallbackList(): TrustListData {
  const fallback: TrustListData = {
    version: '2.2',
    fetchedAt: new Date().toISOString(),
    anchors: FALLBACK_ANCHORS,
    specVersion: '2.2',
    source: 'bundled-fallback',
  };

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(fallback));
  } catch { /* ignore */ }

  return fallback;
}

/**
 * Verify a certificate fingerprint against the trust list.
 */
export async function verifyCertificateChain(
  certificateFingerprint: string,
  signingMode: 'production' | 'self-signed'
): Promise<TrustVerificationResult> {
  if (signingMode === 'self-signed') {
    return {
      status: 'self-signed',
      reason: 'Certificate is self-signed and does not chain to any trust anchor. Configure production CAI-issued certificates for trusted status.',
    };
  }

  if (!certificateFingerprint) {
    return {
      status: 'unknown',
      reason: 'No certificate fingerprint provided for trust verification.',
    };
  }

  const trustList = await getTrustList();
  const normalizedFP = certificateFingerprint.toLowerCase().replace(/[: ]/g, '');

  for (const anchor of trustList.anchors) {
    if (!anchor.fingerprint) continue;
    const anchorFP = anchor.fingerprint.toLowerCase().replace(/[: ]/g, '');
    if (normalizedFP === anchorFP || normalizedFP.startsWith(anchorFP)) {
      const now = new Date();
      if (new Date(anchor.validTo) < now) {
        return {
          status: 'expired',
          matchedAnchor: anchor,
          reason: `Certificate matches trust anchor "${anchor.commonName}" but the anchor has expired.`,
        };
      }
      return {
        status: 'trusted',
        matchedAnchor: anchor,
        reason: `Certificate chains to trusted anchor "${anchor.commonName}" (${anchor.organization}).`,
      };
    }
  }

  return {
    status: 'untrusted',
    reason: `Certificate fingerprint does not match any known trust anchor in the CAI trust list (${trustList.anchors.length} anchors checked).`,
  };
}

/**
 * Clear the cached trust list.
 */
export function clearTrustListCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore
  }
}
