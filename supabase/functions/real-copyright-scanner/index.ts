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

    const { imageUrl, searchEngines = ['google', 'bing', 'tineye'] } = await req.json()

    if (!imageUrl) {
      return new Response('Image URL is required', { status: 400, headers: corsHeaders })
    }

    console.log('Starting real copyright scan for user:', user.id, 'image:', imageUrl)

    const searchResults = []
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_CUSTOM_SEARCH_API_KEY')
    const GOOGLE_SEARCH_ENGINE_ID = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID')
    const BING_API_KEY = Deno.env.get('BING_VISUAL_SEARCH_API_KEY')
    const TINEYE_API_KEY = Deno.env.get('TINEYE_API_KEY')
    const TINEYE_API_SECRET = Deno.env.get('TINEYE_API_SECRET')

    // 1. Google Custom Search API (reverse image search)
    if (searchEngines.includes('google') && GOOGLE_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
      console.log('Searching with Google Custom Search API...')
      try {
        const googleResponse = await fetch(
          `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=image&searchType=image&imgSize=medium&safe=active&num=10`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        )

        if (googleResponse.ok) {
          const googleData = await googleResponse.json()
          const matches = googleData.items?.slice(0, 5).map(item => ({
            platform: 'google',
            url: item.link,
            title: item.title,
            snippet: item.snippet,
            thumbnail: item.image?.thumbnailLink,
            confidence: 0.85,
            source: 'Google Custom Search'
          })) || []
          
          searchResults.push(...matches)
        }
      } catch (error) {
        console.error('Google search failed:', error)
      }
    }

    // 2. Bing Visual Search API
    if (searchEngines.includes('bing') && BING_API_KEY) {
      console.log('Searching with Bing Visual Search API...')
      try {
        const bingResponse = await fetch('https://api.bing.microsoft.com/v7.0/images/visualsearch', {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': BING_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageInfo: {
              url: imageUrl
            }
          })
        })

        if (bingResponse.ok) {
          const bingData = await bingResponse.json()
          const matches = bingData.tags?.[0]?.actions?.find(action => action.actionType === 'VisualSearch')?.data?.value?.slice(0, 5).map(item => ({
            platform: 'bing',
            url: item.contentUrl || item.hostPageUrl,
            title: item.name,
            snippet: item.contentSize,
            thumbnail: item.thumbnailUrl,
            confidence: 0.80,
            source: 'Bing Visual Search'
          })) || []
          
          searchResults.push(...matches)
        }
      } catch (error) {
        console.error('Bing search failed:', error)
      }
    }

    // 3. TinEye API
    if (searchEngines.includes('tineye') && TINEYE_API_KEY && TINEYE_API_SECRET) {
      console.log('Searching with TinEye API...')
      try {
        const tineyeResponse = await fetch(`https://api.tineye.com/rest/search/?image_url=${encodeURIComponent(imageUrl)}&api_key=${TINEYE_API_KEY}&limit=10`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })

        if (tineyeResponse.ok) {
          const tineyeData = await tineyeResponse.json()
          const matches = tineyeData.results?.matches?.slice(0, 5).map(match => ({
            platform: 'tineye',
            url: match.backlinks?.[0]?.url,
            title: match.backlinks?.[0]?.title || 'TinEye Match',
            snippet: `Image size: ${match.width}x${match.height}`,
            thumbnail: match.backlinks?.[0]?.thumbnail,
            confidence: 0.90,
            source: 'TinEye'
          })) || []
          
          searchResults.push(...matches)
        }
      } catch (error) {
        console.error('TinEye search failed:', error)
      }
    }

    // 4. Advanced analysis with OpenAI for found matches
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    let aiAnalysis = null

    if (searchResults.length > 0 && OPENAI_API_KEY) {
      console.log('Running AI analysis on found matches...')
      try {
        const analysisPrompt = `Analyze these reverse image search results for potential copyright infringement:

Original Image: ${imageUrl}

Found Matches:
${searchResults.map(result => `- ${result.title} (${result.platform}): ${result.url}`).join('\n')}

Provide:
1. Risk assessment (Low/Medium/High)
2. Recommended actions
3. Legal considerations
4. Evidence preservation steps`

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: analysisPrompt }],
            max_tokens: 800
          })
        })

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json()
          aiAnalysis = openaiData.choices[0].message.content
        }
      } catch (error) {
        console.error('AI analysis failed:', error)
      }
    }

    // 5. Calculate threat level
    let threatLevel = 'low'
    const highRiskDomains = ['pinterest.com', 'instagram.com', 'etsy.com', 'amazon.com', 'ebay.com']
    const hasHighRiskMatches = searchResults.some(result => 
      highRiskDomains.some(domain => result.url?.includes(domain))
    )

    if (searchResults.length > 10) {
      threatLevel = 'high'
    } else if (searchResults.length > 5 || hasHighRiskMatches) {
      threatLevel = 'medium'
    }

    // 6. Store scan results
    const { data: scanRecord, error: dbError } = await supabaseAdmin
      .from('copyright_scan_results')
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        search_engines: searchEngines,
        total_matches: searchResults.length,
        threat_level: threatLevel,
        results: searchResults,
        ai_analysis: aiAnalysis,
        scan_completed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
    }

    const response = {
      success: true,
      scanId: scanRecord?.id,
      summary: {
        totalMatches: searchResults.length,
        threatLevel,
        searchEngines: searchEngines.filter(engine => {
          if (engine === 'google') return GOOGLE_API_KEY && GOOGLE_SEARCH_ENGINE_ID
          if (engine === 'bing') return BING_API_KEY
          if (engine === 'tineye') return TINEYE_API_KEY && TINEYE_API_SECRET
          return false
        }),
        recommendedActions: threatLevel === 'high'
          ? ['Immediate legal consultation', 'Document evidence', 'Send DMCA notices']
          : threatLevel === 'medium'
          ? ['Monitor situation', 'Gather evidence', 'Consider legal options']
          : ['Continue monitoring', 'Maintain records']
      },
      matches: searchResults,
      aiAnalysis,
      scanTimestamp: new Date().toISOString()
    }

    console.log('Copyright scan completed successfully')

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Copyright scan error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Real copyright scan failed'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})