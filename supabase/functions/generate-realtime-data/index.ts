import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action = 'start', duration = 300 } = await req.json();

    if (action === 'start') {
      console.log('Starting real-time monitoring simulation...');
      
      // Create initial monitoring stats
      await createMonitoringStats();
      
      // Start background monitoring (simulate for the duration)
      const monitoringPromise = simulateRealtimeMonitoring(duration);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Real-time monitoring started',
        duration_seconds: duration
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      error: 'Invalid action. Use "start" to begin monitoring.'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in generate-realtime-data:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createMonitoringStats() {
  const stats = {
    sources_scanned: Math.floor(Math.random() * 5000) + 2000,
    deepfakes_detected: Math.floor(Math.random() * 15) + 3,
    surface_web_scans: Math.floor(Math.random() * 3000) + 1500,
    dark_web_scans: Math.floor(Math.random() * 1000) + 500,
    high_threat_count: Math.floor(Math.random() * 3) + 1,
    medium_threat_count: Math.floor(Math.random() * 5) + 2,
    low_threat_count: Math.floor(Math.random() * 8) + 3,
    scan_type: 'realtime'
  };

  const { error } = await supabase
    .from('realtime_monitoring_stats')
    .insert(stats);

  if (error) {
    console.error('Error creating monitoring stats:', error);
  } else {
    console.log('Created initial monitoring stats:', stats);
  }
}

async function simulateRealtimeMonitoring(durationSeconds: number) {
  const intervalMs = 10000; // Update every 10 seconds
  const totalIntervals = Math.floor(durationSeconds / (intervalMs / 1000));
  
  for (let i = 0; i < totalIntervals; i++) {
    await new Promise(resolve => setTimeout(resolve, intervalMs));
    
    // Generate new monitoring stats
    await createMonitoringStats();
    
    // Occasionally generate a deepfake match
    if (Math.random() < 0.3) { // 30% chance per interval
      await generateDeepfakeMatch();
    }
  }
  
  console.log('Real-time monitoring simulation completed');
}

async function generateDeepfakeMatch() {
  const manipulationTypes = [
    'face_swap', 'expression_transfer', 'lip_sync', 'full_synthesis', 
    'age_modification', 'gender_swap', 'identity_transfer'
  ];
  
  const threatLevels = ['low', 'medium', 'high'];
  const sourceTypes = ['surface', 'dark'];
  
  const domains = [
    'social-media-platform.com', 'image-sharing-site.net', 'forum.org',
    'marketplace.dark', 'anonymous-board.onion', 'crypto-exchange.net',
    'news-site.com', 'blog-platform.io', 'video-platform.tv'
  ];

  const titles = [
    'Manipulated celebrity video surfaces',
    'Fake political figure speech detected',
    'Deepfake content in marketplace',
    'AI-generated profile images found',
    'Synthetic media in news article',
    'Fabricated video evidence identified'
  ];

  const artifacts = [
    ['facial_boundary_artifacts', 'skin_tone_inconsistency'],
    ['lip_sync_artifacts', 'temporal_inconsistency'],
    ['pixel_level_artifacts', 'compression_inconsistency'],
    ['micro_expression_artifacts', 'lighting_mismatch'],
    ['noise_pattern_anomaly', 'facial_muscle_inconsistency']
  ];

  const manipulationType = manipulationTypes[Math.floor(Math.random() * manipulationTypes.length)];
  const threatLevel = threatLevels[Math.floor(Math.random() * threatLevels.length)];
  const sourceType = sourceTypes[Math.floor(Math.random() * sourceTypes.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const title = titles[Math.floor(Math.random() * titles.length)];
  const artifactSet = artifacts[Math.floor(Math.random() * artifacts.length)];
  
  // Higher confidence for higher threat levels
  let baseConfidence = 0.7;
  if (threatLevel === 'high') baseConfidence = 0.85;
  if (threatLevel === 'medium') baseConfidence = 0.75;
  
  const confidence = baseConfidence + (Math.random() * 0.15);

  const deepfakeMatch = {
    source_url: `https://${domain}/content/${Math.random().toString(36).substr(2, 9)}`,
    source_domain: domain,
    source_title: title,
    image_url: `https://${domain}/images/${Math.random().toString(36).substr(2, 9)}.jpg`,
    thumbnail_url: `https://${domain}/thumbs/${Math.random().toString(36).substr(2, 9)}.jpg`,
    detection_confidence: confidence,
    manipulation_type: manipulationType,
    threat_level: threatLevel,
    facial_artifacts: artifactSet,
    temporal_inconsistency: manipulationType === 'lip_sync' || Math.random() < 0.3,
    metadata_suspicious: manipulationType === 'full_synthesis' || Math.random() < 0.2,
    claimed_location: Math.random() < 0.4 ? 'Unknown Location' : null,
    claimed_time: Math.random() < 0.3 ? 'Recent' : null,
    scan_type: 'realtime',
    source_type: sourceType,
    context: {
      detection_method: 'ai_analysis',
      processing_time_ms: Math.floor(Math.random() * 2000) + 500,
      model_version: '2.1.0'
    }
  };

  const { error } = await supabase
    .from('deepfake_matches')
    .insert(deepfakeMatch);

  if (error) {
    console.error('Error creating deepfake match:', error);
  } else {
    console.log('Generated deepfake match:', {
      type: manipulationType,
      threat: threatLevel,
      confidence: Math.round(confidence * 100) + '%',
      domain
    });
  }
}