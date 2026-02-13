import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, fileName, artworkId } = await req.json();
    
    console.log('Starting deepfake detection for:', fileName);
    
    const startTime = Date.now();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleApiKey = Deno.env.get('GOOGLE_AI_STUDIO_API_KEY')!;
    
    if (!googleApiKey) {
      throw new Error('GOOGLE_AI_STUDIO_API_KEY not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const genAI = new GoogleGenerativeAI(googleApiKey);

    // Get the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('artwork')
      .download(filePath);

    if (downloadError) throw downloadError;

    // Convert file to base64 for Google AI Studio
    const buffer = await fileData.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    // Use Google AI Studio Gemini API directly
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: fileData.type || 'image/jpeg'
      }
    };

    const prompt = `Analyze this image for signs of deepfake manipulation or AI generation. Look for:
1) Facial inconsistencies (unnatural expressions, misaligned features)
2) Lighting anomalies (inconsistent shadows, unrealistic lighting)
3) Edge artifacts (blurring, distortion around edges)
4) Unnatural textures (overly smooth skin, repetitive patterns)
5) AI generation patterns (typical GAN artifacts, unusual color distributions)

Provide your analysis in the following format:
- Confidence Score: [0-100 number representing likelihood of being a deepfake]
- Detailed Analysis: [Your findings]

Be specific about what you observe.`;

    const aiStartTime = Date.now();
    let result;
    
    try {
      result = await model.generateContent([prompt, imagePart]);
    } catch (error: any) {
      console.error('Google AI API error:', error);
      
      // Handle specific error types
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      if (error.message?.includes('invalid') || error.message?.includes('API key')) {
        throw new Error('Invalid API key configuration');
      }
      throw new Error(`AI analysis failed: ${error.message}`);
    }

    const aiEndTime = Date.now();
    const aiResponseTime = aiEndTime - aiStartTime;
    
    const response = await result.response;
    const analysis = response.text();
    
    console.log('Google AI Analysis completed in', aiResponseTime, 'ms');
    console.log('Analysis:', analysis);
    // Parse confidence from AI response with improved extraction
    const confidenceMatch = analysis.match(/confidence\s*(?:score)?[\s:]*(\d+)/i);
    let confidence = 0.5; // Default fallback
    
    if (confidenceMatch) {
      const score = parseInt(confidenceMatch[1]);
      confidence = score > 1 ? score / 100 : score; // Handle both 0-1 and 0-100 formats
    } else {
      // Try alternative patterns
      const percentMatch = analysis.match(/(\d+)%/);
      if (percentMatch) {
        confidence = parseInt(percentMatch[1]) / 100;
      }
    }
    
    // Ensure confidence is within valid range
    confidence = Math.max(0, Math.min(1, confidence));

    // Determine detection status
    const isDeepfake = confidence > 0.6;
    const threatLevel = confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low';

    // Store detection result
    const { error: insertError } = await supabase
      .from('ai_detection_results')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        artwork_id: artworkId,
        detection_type: 'deepfake',
        ai_model_used: 'gemini-2.0-flash-exp',
        confidence_score: confidence,
        threat_level: threatLevel,
        status: isDeepfake ? 'detected' : 'clean',
        detection_metadata: {
          analysis,
          file_name: fileName,
          detected_at: new Date().toISOString(),
          api_response_time_ms: aiResponseTime,
          indicators: {
            facial_inconsistencies: analysis.toLowerCase().includes('facial') || analysis.toLowerCase().includes('face'),
            lighting_anomalies: analysis.toLowerCase().includes('lighting') || analysis.toLowerCase().includes('light'),
            edge_artifacts: analysis.toLowerCase().includes('edge') || analysis.toLowerCase().includes('artifact'),
            ai_patterns: analysis.toLowerCase().includes('ai') || analysis.toLowerCase().includes('generated'),
          }
        }
      });

    if (insertError) throw insertError;

    // Update scan status
    await supabase
      .from('monitoring_scans')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        results_data: { confidence, is_deepfake: isDeepfake, threat_level: threatLevel }
      })
      .eq('artwork_id', artworkId)
      .eq('scan_type', 'deepfake');

    // Record performance metrics
    const totalTime = Date.now() - startTime;
    await supabase.from('production_metrics').insert({
      metric_type: 'deepfake_detection',
      metric_name: 'detection_completed',
      metric_value: totalTime,
      metadata: {
        ai_response_time_ms: aiResponseTime,
        total_time_ms: totalTime,
        confidence,
        threat_level: threatLevel,
        model: 'gemini-2.0-flash-exp'
      }
    }).catch(err => console.error('Metrics logging failed:', err));

    console.log('Deepfake detection completed:', { confidence, isDeepfake, threatLevel, totalTime, aiResponseTime });

    return new Response(
      JSON.stringify({
        success: true,
        is_deepfake: isDeepfake,
        confidence,
        threat_level: threatLevel,
        analysis,
        performance: {
          total_time_ms: totalTime,
          ai_response_time_ms: aiResponseTime
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in deepfake detection:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});