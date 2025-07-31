import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action } = await req.json();

    if (action === 'start_realtime_simulation') {
      // Start continuous portfolio monitoring simulation
      await startRealtimePortfolioSimulation(supabase);
      
      return new Response(
        JSON.stringify({ success: true, message: 'Real-time portfolio simulation started' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'generate_portfolio_data') {
      // Generate a single set of portfolio monitoring data
      await generatePortfolioMonitoringData(supabase);
      
      return new Response(
        JSON.stringify({ success: true, message: 'Portfolio monitoring data generated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in portfolio-realtime-data function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function startRealtimePortfolioSimulation(supabase: any) {
  console.log('Starting real-time portfolio monitoring simulation...');
  
  // Run simulation for 1 hour, generating data every 2-5 minutes
  const simulationEndTime = Date.now() + (60 * 60 * 1000); // 1 hour
  
  const runSimulation = async () => {
    while (Date.now() < simulationEndTime) {
      try {
        await generatePortfolioMonitoringData(supabase);
        
        // Random delay between 2-5 minutes
        const delay = Math.random() * (5 - 2) + 2;
        await new Promise(resolve => setTimeout(resolve, delay * 60 * 1000));
      } catch (error) {
        console.error('Error in portfolio simulation loop:', error);
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds on error
      }
    }
  };

  // Run simulation in background
  runSimulation().catch(console.error);
}

async function generatePortfolioMonitoringData(supabase: any) {
  console.log('Generating portfolio monitoring data...');

  // Get active portfolios
  const { data: portfolios, error: portfoliosError } = await supabase
    .from('portfolios')
    .select('id, name, monitoring_enabled')
    .eq('is_active', true)
    .eq('monitoring_enabled', true);

  if (portfoliosError || !portfolios?.length) {
    console.log('No active portfolios found for monitoring');
    return;
  }

  for (const portfolio of portfolios) {
    // Get portfolio items count
    const { count: artworkCount } = await supabase
      .from('portfolio_items')
      .select('*', { count: 'exact', head: true })
      .eq('portfolio_id', portfolio.id)
      .eq('is_active', true);

    const totalArtworks = artworkCount || 0;
    
    if (totalArtworks === 0) continue;

    // Generate realistic monitoring result
    const scanResult = generateRealisticScanResult(totalArtworks);
    
    // Insert monitoring result
    const { error: resultError } = await supabase
      .from('portfolio_monitoring_results')
      .insert({
        portfolio_id: portfolio.id,
        scan_date: new Date().toISOString().split('T')[0],
        total_artworks: scanResult.total_artworks,
        artworks_scanned: scanResult.artworks_scanned,
        total_matches: scanResult.total_matches,
        high_risk_matches: scanResult.high_risk_matches,
        medium_risk_matches: scanResult.medium_risk_matches,
        low_risk_matches: scanResult.low_risk_matches,
        scan_duration_minutes: scanResult.scan_duration_minutes,
        platforms_scanned: scanResult.platforms_scanned
      });

    if (resultError) {
      console.error('Error inserting monitoring result:', resultError);
      continue;
    }

    // Generate alerts for high-risk findings
    if (scanResult.high_risk_matches > 0) {
      await generatePortfolioAlert(supabase, portfolio.id, scanResult);
    }

    console.log(`Generated monitoring data for portfolio: ${portfolio.name}`);
  }
}

function generateRealisticScanResult(totalArtworks: number) {
  const artworksScanned = Math.min(totalArtworks, Math.floor(Math.random() * totalArtworks) + 1);
  
  // Realistic threat detection rates (2-15% of scanned artworks have matches)
  const matchRate = Math.random() * 0.13 + 0.02; // 2-15%
  const totalMatches = Math.floor(artworksScanned * matchRate);
  
  // Distribute threat levels (60% low, 30% medium, 10% high)
  const highRiskMatches = Math.floor(totalMatches * 0.1);
  const mediumRiskMatches = Math.floor(totalMatches * 0.3);
  const lowRiskMatches = totalMatches - highRiskMatches - mediumRiskMatches;
  
  const platforms = [
    'Google Images', 'Bing Visual Search', 'TinEye', 'Instagram', 'Pinterest',
    'DeviantArt', 'Behance', 'ArtStation', 'Etsy', 'Amazon', 'eBay',
    'Facebook', 'Twitter/X', 'Reddit', 'Tumblr'
  ];
  
  // Select 3-8 platforms randomly
  const platformsScanned = platforms
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 6) + 3);

  return {
    total_artworks: totalArtworks,
    artworks_scanned: artworksScanned,
    total_matches: totalMatches,
    high_risk_matches: highRiskMatches,
    medium_risk_matches: mediumRiskMatches,
    low_risk_matches: lowRiskMatches,
    scan_duration_minutes: Math.floor(Math.random() * 45) + 15, // 15-60 minutes
    platforms_scanned: platformsScanned
  };
}

async function generatePortfolioAlert(supabase: any, portfolioId: string, scanResult: any) {
  // Get the user_id for this portfolio
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('user_id, name')
    .eq('id', portfolioId)
    .single();

  if (!portfolio) return;

  const alertTypes = [
    'copyright_infringement',
    'unauthorized_use',
    'potential_theft',
    'commercial_use',
    'deep_web_listing'
  ];

  const severity = scanResult.high_risk_matches > 5 ? 'high' : 
                  scanResult.high_risk_matches > 2 ? 'medium' : 'low';

  const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
  
  let title = '';
  let message = '';
  
  switch (alertType) {
    case 'copyright_infringement':
      title = 'Copyright Infringement Detected';
      message = `${scanResult.high_risk_matches} high-risk copyright violations found across ${scanResult.platforms_scanned.length} platforms.`;
      break;
    case 'unauthorized_use':
      title = 'Unauthorized Use Alert';
      message = `Your artwork is being used without permission on ${scanResult.total_matches} websites.`;
      break;
    case 'potential_theft':
      title = 'Potential Art Theft';
      message = `Suspicious activity detected: ${scanResult.high_risk_matches} instances of potential artwork theft.`;
      break;
    case 'commercial_use':
      title = 'Unauthorized Commercial Use';
      message = `Your artwork appears to be used commercially without license on ${scanResult.high_risk_matches} platforms.`;
      break;
    case 'deep_web_listing':
      title = 'Deep Web Marketplace Alert';
      message = `Your artwork has been found listed on unauthorized marketplaces.`;
      break;
  }

  await supabase
    .from('portfolio_alerts')
    .insert({
      portfolio_id: portfolioId,
      user_id: portfolio.user_id,
      alert_type: alertType,
      severity: severity,
      title: title,
      message: message,
      metadata: {
        scan_results: scanResult,
        detection_timestamp: new Date().toISOString(),
        platforms_affected: scanResult.platforms_scanned,
        recommended_actions: [
          'Review detected matches',
          'File DMCA notices',
          'Contact platform administrators',
          'Document violations for legal action'
        ]
      }
    });

  console.log(`Generated ${severity} severity alert for portfolio: ${portfolio.name}`);
}