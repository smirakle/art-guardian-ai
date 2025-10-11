import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('artwork')
      .download(filePath);

    if (downloadError) throw downloadError;

    // Convert file to base64 for AI analysis
    const buffer = await fileData.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const imageUrl = `data:${fileData.type};base64,${base64Image}`;

    // Use Lovable AI with vision capabilities to analyze the image
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI image analyzer specializing in detecting manipulated images, deepfakes, and AI-generated content. Analyze images for signs of manipulation, inconsistencies, and authenticity markers.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image for signs of deepfake manipulation or AI generation. Look for: 1) Facial inconsistencies 2) Lighting anomalies 3) Edge artifacts 4) Unnatural textures 5) AI generation patterns. Provide a confidence score (0-100) and detailed analysis.'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI analysis failed: ${aiResponse.statusText}`);
    }

    const aiResult = await aiResponse.json();
    const analysis = aiResult.choices[0].message.content;
    
    console.log('AI Analysis:', analysis);

    // Parse confidence from AI response (basic parsing, can be enhanced)
    const confidenceMatch = analysis.match(/confidence.*?(\d+)/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : 0.5;

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
        ai_model_used: 'google/gemini-2.5-flash',
        confidence_score: confidence,
        threat_level: threatLevel,
        status: isDeepfake ? 'detected' : 'clean',
        detection_metadata: {
          analysis,
          file_name: fileName,
          detected_at: new Date().toISOString(),
          indicators: {
            facial_inconsistencies: analysis.includes('facial') || analysis.includes('face'),
            lighting_anomalies: analysis.includes('lighting') || analysis.includes('light'),
            edge_artifacts: analysis.includes('edge') || analysis.includes('artifact'),
            ai_patterns: analysis.includes('AI') || analysis.includes('generated'),
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

    console.log('Deepfake detection completed:', { confidence, isDeepfake, threatLevel });

    return new Response(
      JSON.stringify({
        success: true,
        is_deepfake: isDeepfake,
        confidence,
        threat_level: threatLevel,
        analysis
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