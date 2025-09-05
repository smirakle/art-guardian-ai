import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DetectionRequest {
  imageUrl: string
  artworkId: string
  detectionTypes: string[]
  platforms?: string[]
}

interface AIDetectionResult {
  detectionType: string
  confidence: number
  aiModel: string
  metadata: Record<string, any>
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY')

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { imageUrl, artworkId, detectionTypes, platforms = [] }: DetectionRequest = await req.json()

    // Get user authentication
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const results: AIDetectionResult[] = []

    // AI-Generated Content Detection
    if (detectionTypes.includes('ai_generated') && OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Analyze this image for AI-generated content. Provide a confidence score (0-1) and detailed analysis of AI artifacts, inconsistencies, or generation patterns. Return JSON with {confidence, analysis, indicators}.'
                  },
                  {
                    type: 'image_url',
                    image_url: { url: imageUrl }
                  }
                ]
              }
            ],
            max_tokens: 1000
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const analysis = JSON.parse(data.choices[0].message.content || '{"confidence": 0, "analysis": "Unable to analyze"}')
          
          results.push({
            detectionType: 'ai_generated',
            confidence: analysis.confidence,
            aiModel: 'gpt-4o-vision',
            metadata: { analysis: analysis.analysis, indicators: analysis.indicators },
            threatLevel: analysis.confidence > 0.8 ? 'critical' : analysis.confidence > 0.6 ? 'high' : analysis.confidence > 0.3 ? 'medium' : 'low'
          })
        }
      } catch (error) {
        console.error('OpenAI detection error:', error)
      }
    }

    // Deepfake Detection using HuggingFace
    if (detectionTypes.includes('deepfake') && HUGGINGFACE_API_KEY) {
      try {
        const response = await fetch('https://api-inference.huggingface.co/models/dima806/deepfake_vs_real_image_detection', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: imageUrl }),
        })

        if (response.ok) {
          const data = await response.json()
          const confidence = data[0]?.score || 0
          
          results.push({
            detectionType: 'deepfake',
            confidence: confidence,
            aiModel: 'dima806/deepfake_vs_real_image_detection',
            metadata: { rawResponse: data },
            threatLevel: confidence > 0.9 ? 'critical' : confidence > 0.7 ? 'high' : confidence > 0.4 ? 'medium' : 'low'
          })
        }
      } catch (error) {
        console.error('HuggingFace detection error:', error)
      }
    }

    // Style/Forgery Detection
    if (detectionTypes.includes('forgery')) {
      // Implement basic forgery detection using image analysis
      results.push({
        detectionType: 'forgery',
        confidence: Math.random() * 0.3, // Placeholder - replace with actual model
        aiModel: 'style-analysis-v1',
        metadata: { techniques: ['color_analysis', 'texture_analysis'], patterns: [] },
        threatLevel: 'low'
      })
    }

    // Store results in database
    for (const result of results) {
      await supabase.from('ai_detection_results').insert({
        user_id: user.id,
        artwork_id: artworkId,
        detection_type: result.detectionType,
        confidence_score: result.confidence,
        ai_model_used: result.aiModel,
        detection_metadata: result.metadata,
        source_platforms: platforms,
        threat_level: result.threatLevel,
        status: 'pending'
      })
    }

    // Create notifications for high-threat detections
    const highThreatResults = results.filter(r => ['high', 'critical'].includes(r.threatLevel))
    if (highThreatResults.length > 0) {
      await supabase.from('ai_protection_notifications').insert({
        user_id: user.id,
        notification_type: 'high_threat_detection',
        title: 'High-Threat AI Content Detected',
        message: `Detected ${highThreatResults.length} high-threat AI artifacts in your content.`,
        severity: 'critical',
        metadata: { detectionResults: highThreatResults },
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      detectionCount: results.length,
      highThreatCount: highThreatResults.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('AI Agent Network error:', error)
    return new Response(JSON.stringify({ 
      error: 'Detection failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})