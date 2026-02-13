import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader)
    
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const { imageUrl, analysisType = 'comprehensive' } = await req.json()

    if (!imageUrl) {
      return new Response('Image URL is required', { status: 400, headers: corsHeaders })
    }

    console.log('Starting enterprise AI analysis for user:', user.id)

    // Initialize Hugging Face inference
    const HF_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY')
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

    if (!HF_API_KEY || !OPENAI_API_KEY) {
      throw new Error('Required API keys not configured')
    }

    const analyses = []

    // 1. Image Classification with Hugging Face
    console.log('Running Hugging Face image classification...')
    try {
      const hfResponse = await fetch('https://api-inference.huggingface.co/models/google/vit-base-patch16-224', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: imageUrl,
          options: { wait_for_model: true }
        })
      })

      if (hfResponse.ok) {
        const hfResult = await hfResponse.json()
        analyses.push({
          type: 'image_classification',
          provider: 'huggingface',
          result: hfResult,
          confidence: hfResult[0]?.score || 0,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Hugging Face analysis failed:', error)
    }

    // 2. OpenAI Vision Analysis
    console.log('Running OpenAI vision analysis...')
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: analysisType === 'copyright' 
                    ? 'Analyze this image for potential copyright infringement indicators. Look for watermarks, signatures, unique artistic styles, brand logos, or copyrighted characters. Provide a detailed analysis.'
                    : 'Provide a comprehensive analysis of this image including: 1) Visual content description, 2) Artistic style analysis, 3) Technical quality assessment, 4) Potential copyright concerns, 5) Commercial value indicators.'
                },
                {
                  type: 'image_url',
                  image_url: { url: imageUrl }
                }
              ]
            }
          ],
          max_tokens: 1000
        })
      })

      if (openaiResponse.ok) {
        const openaiResult = await openaiResponse.json()
        analyses.push({
          type: 'vision_analysis',
          provider: 'openai',
          result: openaiResult.choices[0].message.content,
          confidence: 0.95,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('OpenAI analysis failed:', error)
    }

    // 3. Content Moderation with Hugging Face
    console.log('Running content moderation analysis...')
    try {
      const moderationResponse = await fetch('https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: imageUrl,
          options: { wait_for_model: true }
        })
      })

      if (moderationResponse.ok) {
        const moderationResult = await moderationResponse.json()
        analyses.push({
          type: 'content_moderation',
          provider: 'huggingface',
          result: moderationResult,
          confidence: Math.max(...(moderationResult.map(r => r.score) || [0])),
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Content moderation failed:', error)
    }

    // 4. Calculate overall risk score
    const riskFactors = []
    let overallRisk = 'low'
    
    // Analyze results for risk factors
    analyses.forEach(analysis => {
      if (analysis.type === 'vision_analysis') {
        const content = analysis.result.toLowerCase()
        if (content.includes('watermark') || content.includes('signature') || content.includes('copyright')) {
          riskFactors.push('Copyright indicators detected')
          overallRisk = 'high'
        }
        if (content.includes('brand') || content.includes('logo') || content.includes('trademark')) {
          riskFactors.push('Trademark concerns identified')
          if (overallRisk !== 'high') overallRisk = 'medium'
        }
      }
      
      if (analysis.type === 'content_moderation') {
        const nsfwScore = analysis.result.find(r => r.label === 'nsfw')?.score || 0
        if (nsfwScore > 0.7) {
          riskFactors.push('Content moderation flags')
          overallRisk = 'high'
        }
      }
    })

    // Store analysis result in database
    const { data: analysisRecord, error: dbError } = await supabaseAdmin
      .from('enterprise_ai_analyses')
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        analysis_type: analysisType,
        analyses: analyses,
        risk_factors: riskFactors,
        overall_risk: overallRisk,
        processed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
    }

    const response = {
      success: true,
      analysisId: analysisRecord?.id,
      analyses,
      summary: {
        totalAnalyses: analyses.length,
        overallRisk,
        riskFactors,
        recommendedActions: overallRisk === 'high' 
          ? ['Consult legal counsel', 'Consider content removal', 'Implement additional protections']
          : overallRisk === 'medium'
          ? ['Monitor for infringement', 'Document ownership', 'Consider registration']
          : ['Continue monitoring', 'Maintain records']
      },
      processingTime: new Date().toISOString()
    }

    console.log('Enterprise AI analysis completed successfully')

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Enterprise AI analysis error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Enterprise AI analysis failed'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})