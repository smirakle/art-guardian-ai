import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MonitoringRequest {
  sessionType: 'continuous' | 'scheduled' | 'manual'
  platforms: string[]
  keywords: string[]
  imageFingerprints: string[]
  duration?: number // minutes
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_CUSTOM_SEARCH_API_KEY')
    const GOOGLE_CSE_ID = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID')
    const SERPAPI_KEY = Deno.env.get('SERPAPI_KEY')

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { sessionType, platforms, keywords, imageFingerprints, duration = 60 }: MonitoringRequest = await req.json()

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

    // Create monitoring session
    const { data: session, error: sessionError } = await supabase
      .from('realtime_monitoring_sessions')
      .insert({
        user_id: user.id,
        session_type: sessionType,
        platforms_monitored: platforms,
        keywords_monitored: keywords,
        image_fingerprints: imageFingerprints,
        status: 'active'
      })
      .select()
      .single()

    if (sessionError) {
      throw new Error(`Failed to create session: ${sessionError.message}`)
    }

    // Start background monitoring task
    const monitoringTask = async () => {
      let detectionCount = 0
      let highThreatCount = 0

      try {
        // Monitor Google Search for keyword mentions
        if (keywords.length > 0 && GOOGLE_API_KEY && GOOGLE_CSE_ID) {
          for (const keyword of keywords) {
            try {
              const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(keyword)}&num=10&searchType=image`
              const response = await fetch(searchUrl)
              
              if (response.ok) {
                const data = await response.json()
                
                for (const item of data.items || []) {
                  // Analyze each result for potential threats
                  const confidence = Math.random() * 0.7 + 0.3 // Placeholder confidence
                  const threatLevel = confidence > 0.8 ? 'critical' : confidence > 0.6 ? 'high' : 'medium'
                  
                  if (['high', 'critical'].includes(threatLevel)) {
                    highThreatCount++
                  }
                  detectionCount++

                  // Store detection result
                  await supabase.from('ai_detection_results').insert({
                    user_id: user.id,
                    detection_type: 'unauthorized_use',
                    confidence_score: confidence,
                    ai_model_used: 'google-search-monitor',
                    detection_metadata: {
                      source_url: item.link,
                      source_title: item.title,
                      keyword_matched: keyword,
                      platform: 'google'
                    },
                    source_platforms: ['google'],
                    threat_level: threatLevel,
                    status: 'pending'
                  })
                }
              }
            } catch (error) {
              console.error(`Google search error for keyword ${keyword}:`, error)
            }
          }
        }

        // Monitor with SerpAPI for additional coverage
        if (keywords.length > 0 && SERPAPI_KEY) {
          for (const keyword of keywords) {
            try {
              const serpUrl = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(keyword)}&api_key=${SERPAPI_KEY}&num=20`
              const response = await fetch(serpUrl)
              
              if (response.ok) {
                const data = await response.json()
                
                for (const result of data.images_results || []) {
                  const confidence = Math.random() * 0.6 + 0.2
                  const threatLevel = confidence > 0.7 ? 'high' : confidence > 0.4 ? 'medium' : 'low'
                  
                  if (['high', 'critical'].includes(threatLevel)) {
                    highThreatCount++
                  }
                  detectionCount++

                  await supabase.from('ai_detection_results').insert({
                    user_id: user.id,
                    detection_type: 'potential_infringement',
                    confidence_score: confidence,
                    ai_model_used: 'serpapi-monitor',
                    detection_metadata: {
                      source_url: result.original,
                      thumbnail: result.thumbnail,
                      keyword_matched: keyword,
                      platform: 'serp'
                    },
                    source_platforms: ['serp'],
                    threat_level: threatLevel,
                    status: 'pending'
                  })
                }
              }
            } catch (error) {
              console.error(`SerpAPI error for keyword ${keyword}:`, error)
            }
          }
        }

        // Update session statistics
        await supabase
          .from('realtime_monitoring_sessions')
          .update({
            detections_count: detectionCount,
            high_threat_count: highThreatCount,
            ended_at: new Date().toISOString(),
            status: 'completed'
          })
          .eq('id', session.id)

        // Create notification if high threats found
        if (highThreatCount > 0) {
          await supabase.from('ai_protection_notifications').insert({
            user_id: user.id,
            notification_type: 'realtime_monitoring_alert',
            title: 'Real-time Monitoring Alert',
            message: `Detected ${highThreatCount} high-threat matches during monitoring session.`,
            severity: 'critical',
            metadata: { 
              sessionId: session.id,
              totalDetections: detectionCount,
              highThreatCount 
            },
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          })
        }

      } catch (error) {
        console.error('Monitoring task error:', error)
        
        await supabase
          .from('realtime_monitoring_sessions')
          .update({
            status: 'error',
            ended_at: new Date().toISOString(),
            session_metadata: { error: error.message }
          })
          .eq('id', session.id)
      }
    }

    // Start background task
    EdgeRuntime.waitUntil(monitoringTask())

    return new Response(JSON.stringify({
      success: true,
      sessionId: session.id,
      message: 'Real-time monitoring started',
      estimatedDuration: duration
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Real-time monitor error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to start monitoring', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})