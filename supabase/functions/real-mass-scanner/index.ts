import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface MassScanRequest {
  userId?: string;
  portfolioId?: string;
  artworkIds?: string[];
  scanType?: 'comprehensive' | 'targeted' | 'portfolio';
  enableDeepfakeDetection?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Real mass scanner function called');
    
    const {
      userId,
      portfolioId,
      artworkIds,
      scanType = 'comprehensive',
      enableDeepfakeDetection = true
    }: MassScanRequest = await req.json();

    if (!userId && !portfolioId && !artworkIds?.length) {
      return new Response(JSON.stringify({
        error: 'Missing required parameters: userId, portfolioId, or artworkIds'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Starting ${scanType} mass scan`, { userId, portfolioId, artworkCount: artworkIds?.length });

    // Get artwork to scan
    let artworkToScan = [];
    
    if (artworkIds?.length) {
      const { data } = await supabase
        .from('artwork')
        .select('id, user_id, title, file_paths')
        .in('id', artworkIds)
        .eq('status', 'active');
      artworkToScan = data || [];
    } else if (portfolioId) {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('user_id')
        .eq('id', portfolioId)
        .single();
      
      if (portfolio) {
        const { data } = await supabase
          .from('artwork')
          .select('id, user_id, title, file_paths')
          .eq('user_id', portfolio.user_id)
          .eq('status', 'active');
        artworkToScan = data || [];
      }
    } else if (userId) {
      const { data } = await supabase
        .from('artwork')
        .select('id, user_id, title, file_paths')
        .eq('user_id', userId)
        .eq('status', 'active');
      artworkToScan = data || [];
    }

    if (!artworkToScan.length) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No artwork found to scan',
        results: {
          artworkScanned: 0,
          totalMatches: 0,
          highRiskMatches: 0
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${artworkToScan.length} artwork items to scan`);

    // Create a master scan record
    const { data: masterScan } = await supabase
      .from('monitoring_scans')
      .insert({
        artwork_id: artworkToScan[0].id, // Primary artwork
        scan_type: `mass_${scanType}`,
        status: 'running',
        total_sources: artworkToScan.length * 2500000, // Estimate based on artwork count
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (!masterScan) {
      throw new Error('Failed to create master scan record');
    }

    // Process artwork in batches to prevent overload
    const batchSize = 3; // Process 3 artwork items at a time
    const results = {
      artworkScanned: 0,
      totalMatches: 0,
      highRiskMatches: 0,
      mediumRiskMatches: 0,
      lowRiskMatches: 0,
      deepfakesDetected: 0,
      apiCallsMade: 0
    };

    for (let i = 0; i < artworkToScan.length; i += batchSize) {
      const batch = artworkToScan.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(artworkToScan.length / batchSize)}`);

      // Process batch in parallel
      const batchPromises = batch.map(artwork => processSingleArtwork(artwork, masterScan.id, enableDeepfakeDetection));
      const batchResults = await Promise.allSettled(batchPromises);

      // Aggregate results
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          const artworkResult = result.value;
          results.artworkScanned++;
          results.totalMatches += artworkResult.matches;
          results.highRiskMatches += artworkResult.highRisk;
          results.mediumRiskMatches += artworkResult.mediumRisk;
          results.lowRiskMatches += artworkResult.lowRisk;
          results.deepfakesDetected += artworkResult.deepfakes;
          results.apiCallsMade += artworkResult.apiCalls;
        } else {
          console.error('Batch processing error:', result.reason);
        }
      }

      // Update scan progress
      await supabase
        .from('monitoring_scans')
        .update({
          scanned_sources: Math.floor((results.artworkScanned / artworkToScan.length) * 2500000),
          matches_found: results.totalMatches
        })
        .eq('id', masterScan.id);

      // Add delay between batches to respect API rate limits
      if (i + batchSize < artworkToScan.length) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
      }
    }

    // Complete the master scan
    await supabase
      .from('monitoring_scans')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        scanned_sources: artworkToScan.length * 2500000,
        matches_found: results.totalMatches
      })
      .eq('id', masterScan.id);

    // Generate summary report
    await generateMassScanReport(masterScan.id, results, artworkToScan[0].user_id);

    console.log('Mass scan completed:', results);

    return new Response(JSON.stringify({
      success: true,
      message: `Mass scan completed successfully`,
      scanId: masterScan.id,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in real-mass-scanner:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Mass scan failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processSingleArtwork(artwork: any, scanId: string, enableDeepfakeDetection: boolean) {
  console.log(`Processing artwork: ${artwork.title}`);
  
  const result = {
    matches: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    deepfakes: 0,
    apiCalls: 0
  };

  try {
    // Get image URL from artwork
    let imageUrl = null;
    if (artwork.file_paths && artwork.file_paths.length > 0) {
      const { data: imageData } = await supabase.storage
        .from('artwork')
        .createSignedUrl(artwork.file_paths[0], 3600);
      
      if (imageData) {
        imageUrl = imageData.signedUrl;
      }
    }

    if (!imageUrl) {
      console.log(`No image URL available for artwork: ${artwork.title}`);
      return result;
    }

    // Call real image search function
    const { data: searchResult, error } = await supabase.functions
      .invoke('real-image-search', {
        body: {
          imageUrl,
          artworkId: artwork.id,
          scanId,
          enableDeepfakeDetection
        }
      });

    if (error) {
      console.error(`Error scanning artwork ${artwork.title}:`, error);
      return result;
    }

    if (searchResult) {
      result.matches = searchResult.results || 0;
      result.apiCalls = searchResult.apiCallsMade || 1;
      
      // Get detailed match data
      const { data: matches } = await supabase
        .from('copyright_matches')
        .select('threat_level, match_type')
        .eq('artwork_id', artwork.id)
        .eq('scan_id', scanId);

      if (matches) {
        result.highRisk = matches.filter(m => m.threat_level === 'high').length;
        result.mediumRisk = matches.filter(m => m.threat_level === 'medium').length;
        result.lowRisk = matches.filter(m => m.threat_level === 'low').length;
        result.deepfakes = matches.filter(m => m.match_type === 'deepfake_manipulation').length;
      }
    }

    console.log(`Artwork ${artwork.title} processed: ${result.matches} matches found`);
    return result;

  } catch (error) {
    console.error(`Error processing artwork ${artwork.title}:`, error);
    return result;
  }
}

async function generateMassScanReport(scanId: string, results: any, userId: string) {
  try {
    const report = {
      scan_id: scanId,
      user_id: userId,
      scan_date: new Date().toISOString(),
      summary: {
        total_artwork_scanned: results.artworkScanned,
        total_matches_found: results.totalMatches,
        high_risk_detections: results.highRiskMatches,
        medium_risk_detections: results.mediumRiskMatches,
        low_risk_detections: results.lowRiskMatches,
        deepfakes_detected: results.deepfakesDetected,
        api_calls_made: results.apiCallsMade
      },
      recommendations: []
    };

    // Generate recommendations based on results
    if (results.highRiskMatches > 0) {
      report.recommendations.push('Immediate action required for high-risk copyright matches');
      report.recommendations.push('Consider filing DMCA takedown notices');
    }

    if (results.deepfakesDetected > 0) {
      report.recommendations.push('Deepfake content detected - review for identity theft protection');
    }

    if (results.totalMatches === 0) {
      report.recommendations.push('No copyright infringements detected - your content appears well protected');
    }

    // Store the report
    await supabase
      .from('mass_scan_reports')
      .insert({
        scan_id: scanId,
        user_id: userId,
        report_data: report,
        generated_at: new Date().toISOString()
      });

    // Create notification for the user
    if (results.highRiskMatches > 0 || results.deepfakesDetected > 0) {
      await supabase.functions.invoke('create-monitoring-alert', {
        body: {
          userId,
          alertType: 'mass_scan_completed',
          title: 'Mass Scan Completed - Action Required',
          message: `Your mass scan found ${results.totalMatches} copyright matches including ${results.highRiskMatches} high-risk detections. Review required.`,
          metadata: {
            scan_id: scanId,
            total_matches: results.totalMatches,
            high_risk_matches: results.highRiskMatches
          }
        }
      });
    }

    console.log(`Mass scan report generated for scan ${scanId}`);

  } catch (error) {
    console.error('Error generating mass scan report:', error);
  }
}