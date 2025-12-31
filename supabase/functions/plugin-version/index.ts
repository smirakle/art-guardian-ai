const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

interface VersionInfo {
  version: string;
  minVersion: string;
  downloadUrl: string;
  changelog: string;
  releaseDate: string;
  updateRequired: boolean;
  features: string[];
  compatibility: {
    photoshop: string;
    illustrator: string;
    indesign?: string;
  };
}

const CURRENT_VERSION: VersionInfo = {
  version: '1.0.0',
  minVersion: '1.0.0',
  downloadUrl: 'https://utneaqmbyjwxaqrrarpc.supabase.co/storage/v1/object/public/plugin-assets/tsmo-adobe-plugin-1.0.0.ccx',
  changelog: `
## Version 1.0.0 (Initial Release)
- One-click AI training protection from within Adobe apps
- XMP metadata injection for AI training prohibition
- C2PA manifest generation with ES256 cryptographic signing
- Batch protection for multiple artboards/files
- Auto-protect on export feature
- Real-time sync with TSMO dashboard
- Support for Photoshop and Illustrator 2024+
`.trim(),
  releaseDate: '2025-01-01',
  updateRequired: false,
  features: [
    'one-click-protect',
    'batch-protect',
    'auto-export-protect',
    'xmp-injection',
    'c2pa-manifest',
    'cloud-sync'
  ],
  compatibility: {
    photoshop: '24.0.0',
    illustrator: '27.0.0'
  }
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const url = new URL(req.url);
    const clientVersion = url.searchParams.get('current_version');
    const platform = url.searchParams.get('platform') || 'unknown';

    console.log(`Version check from ${platform}, current version: ${clientVersion || 'unknown'}`);

    // Determine if update is needed
    let updateAvailable = false;
    let updateRequired = false;

    if (clientVersion) {
      // Check if update is available
      updateAvailable = compareVersions(CURRENT_VERSION.version, clientVersion) > 0;
      
      // Check if update is required (current version below minimum)
      updateRequired = compareVersions(CURRENT_VERSION.minVersion, clientVersion) > 0;
    }

    const response = {
      ...CURRENT_VERSION,
      updateAvailable,
      updateRequired,
      clientVersion: clientVersion || null,
      checkedAt: new Date().toISOString()
    };

    return json(response);

  } catch (error) {
    console.error('Plugin version check error:', error);
    return json({ 
      error: 'Version check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
