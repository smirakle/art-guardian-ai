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
    const { filePath, fileName, artworkId } = await req.json();

    console.log('Starting deepfake scan for uploaded file:', fileName);

    // Get the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('artwork')
      .download(filePath);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw new Error('Failed to download file for analysis');
    }

    console.log('File downloaded successfully, starting analysis...');

    // Simulate deepfake detection analysis
    const analysisResults = await performDeepfakeAnalysis(fileName);

    console.log('Analysis completed:', analysisResults);

    // If deepfake detected, create a match record
    if (analysisResults.isDeepfake) {
      const deepfakeMatch = {
        source_url: `storage://artwork/${filePath}`,
        source_domain: 'user-upload',
        source_title: `User Upload: ${fileName}`,
        image_url: `storage://artwork/${filePath}`,
        detection_confidence: analysisResults.confidence,
        manipulation_type: analysisResults.manipulationType,
        threat_level: analysisResults.threatLevel,
        facial_artifacts: analysisResults.artifacts,
        temporal_inconsistency: analysisResults.temporalInconsistency,
        metadata_suspicious: analysisResults.metadataSuspicious,
        scan_type: 'upload',
        source_type: 'surface',
        context: {
          artwork_id: artworkId,
          upload_scan: true,
          file_name: fileName
        }
      };

      const { error: matchError } = await supabase
        .from('deepfake_matches')
        .insert(deepfakeMatch);

      if (matchError) {
        console.error('Error inserting deepfake match:', matchError);
      } else {
        console.log('Deepfake match recorded for uploaded file');
      }
    }

    // Update monitoring stats
    const { error: statsError } = await supabase
      .from('realtime_monitoring_stats')
      .insert({
        sources_scanned: 1,
        deepfakes_detected: analysisResults.isDeepfake ? 1 : 0,
        surface_web_scans: 1,
        high_threat_count: analysisResults.threatLevel === 'high' ? 1 : 0,
        medium_threat_count: analysisResults.threatLevel === 'medium' ? 1 : 0,
        low_threat_count: analysisResults.threatLevel === 'low' ? 1 : 0,
        scan_type: 'upload'
      });

    if (statsError) {
      console.error('Error updating stats:', statsError);
    }

    return new Response(JSON.stringify({
      success: true,
      isDeepfake: analysisResults.isDeepfake,
      confidence: analysisResults.confidence,
      manipulationType: analysisResults.manipulationType,
      threatLevel: analysisResults.threatLevel
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in deepfake-scan-upload:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performDeepfakeAnalysis(fileName: string) {
  // Simulate AI deepfake detection analysis
  // In a real implementation, this would use an actual deepfake detection model
  
  // Generate realistic analysis results
  const random = Math.random();
  const isDeepfake = random < 0.15; // 15% chance of detecting deepfake in uploads
  
  let confidence = 0;
  let manipulationType = 'none';
  let threatLevel = 'low';
  let artifacts: string[] = [];
  let temporalInconsistency = false;
  let metadataSuspicious = false;

  if (isDeepfake) {
    confidence = 75 + Math.random() * 20; // 75-95% confidence for detected deepfakes
    const manipulationTypes = ['face_swap', 'expression_transfer', 'lip_sync', 'full_synthesis'];
    manipulationType = manipulationTypes[Math.floor(Math.random() * manipulationTypes.length)];
    
    // Determine threat level based on confidence
    if (confidence > 90) {
      threatLevel = 'high';
    } else if (confidence > 80) {
      threatLevel = 'medium';
    } else {
      threatLevel = 'low';
    }

    // Generate artifacts based on manipulation type
    switch (manipulationType) {
      case 'face_swap':
        artifacts = ['facial_boundary_artifacts', 'skin_tone_inconsistency', 'lighting_mismatch'];
        break;
      case 'expression_transfer':
        artifacts = ['micro_expression_artifacts', 'facial_muscle_inconsistency'];
        break;
      case 'lip_sync':
        artifacts = ['lip_sync_artifacts', 'audio_visual_mismatch'];
        temporalInconsistency = true;
        break;
      case 'full_synthesis':
        artifacts = ['pixel_level_artifacts', 'compression_inconsistency', 'noise_pattern_anomaly'];
        metadataSuspicious = true;
        break;
    }
  } else {
    confidence = 5 + Math.random() * 15; // 5-20% confidence for authentic images
  }

  return {
    isDeepfake,
    confidence: Math.round(confidence * 100) / 100,
    manipulationType,
    threatLevel,
    artifacts,
    temporalInconsistency,
    metadataSuspicious
  };
}