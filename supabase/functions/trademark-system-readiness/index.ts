import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if all required API keys are configured
    const requiredKeys = [
      'GOOGLE_CUSTOM_SEARCH_API_KEY',
      'GOOGLE_SEARCH_ENGINE_ID',
      'BING_VISUAL_SEARCH_API_KEY',
      'TINEYE_API_KEY',
      'TINEYE_API_SECRET',
      'OPENAI_API_KEY',
      'SERPAPI_KEY',
      'USPTO_API_KEY'
    ]

    const keyStatus = {}
    const missingKeys = []

    for (const key of requiredKeys) {
      const value = Deno.env.get(key)
      const isPresent = Boolean(value?.trim())
      keyStatus[key] = {
        present: isPresent,
        configured: isPresent
      }
      
      if (!isPresent) {
        missingKeys.push(key)
      }
    }

    // Test API connectivity for configured keys
    const apiTestResults = {}

    // Test USPTO API
    if (keyStatus['USPTO_API_KEY'].present) {
      try {
        const testResponse = await fetch('https://developer.uspto.gov/api/v1/trademark/search?query=test&limit=1', {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('USPTO_API_KEY')}`,
            'Accept': 'application/json'
          }
        })
        apiTestResults['USPTO'] = {
          status: testResponse.ok ? 'working' : 'error',
          response_code: testResponse.status,
          message: testResponse.ok ? 'Connected successfully' : `HTTP ${testResponse.status}`
        }
      } catch (error) {
        apiTestResults['USPTO'] = {
          status: 'error',
          message: 'Connection failed'
        }
      }
    }

    // Test OpenAI API
    if (keyStatus['OPENAI_API_KEY'].present) {
      try {
        const testResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json'
          }
        })
        apiTestResults['OpenAI'] = {
          status: testResponse.ok ? 'working' : 'error',
          response_code: testResponse.status,
          message: testResponse.ok ? 'Connected successfully' : `HTTP ${testResponse.status}`
        }
      } catch (error) {
        apiTestResults['OpenAI'] = {
          status: 'error',
          message: 'Connection failed'
        }
      }
    }

    // Test Google Custom Search API
    if (keyStatus['GOOGLE_CUSTOM_SEARCH_API_KEY'].present && keyStatus['GOOGLE_SEARCH_ENGINE_ID'].present) {
      try {
        const testUrl = `https://www.googleapis.com/customsearch/v1?key=${Deno.env.get('GOOGLE_CUSTOM_SEARCH_API_KEY')}&cx=${Deno.env.get('GOOGLE_SEARCH_ENGINE_ID')}&q=test&num=1`
        const testResponse = await fetch(testUrl)
        apiTestResults['Google Search'] = {
          status: testResponse.ok ? 'working' : 'error',
          response_code: testResponse.status,
          message: testResponse.ok ? 'Connected successfully' : `HTTP ${testResponse.status}`
        }
      } catch (error) {
        apiTestResults['Google Search'] = {
          status: 'error',
          message: 'Connection failed'
        }
      }
    }

    // Test TinEye API
    if (keyStatus['TINEYE_API_KEY'].present && keyStatus['TINEYE_API_SECRET'].present) {
      try {
        const testResponse = await fetch('https://api.tineye.com/rest/search/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('TINEYE_API_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: 'https://tineye.com/images/meloncat.jpg',
            limit: 1
          })
        })
        apiTestResults['TinEye'] = {
          status: testResponse.ok ? 'working' : 'error',
          response_code: testResponse.status,
          message: testResponse.ok ? 'Connected successfully' : `HTTP ${testResponse.status}`
        }
      } catch (error) {
        apiTestResults['TinEye'] = {
          status: 'error',
          message: 'Connection failed'
        }
      }
    }

    const workingAPIs = Object.values(apiTestResults).filter(result => result.status === 'working').length
    const totalConfiguredAPIs = Object.keys(apiTestResults).length
    
    const systemStatus = {
      overall_status: missingKeys.length === 0 ? 'ready' : 'partial',
      market_ready: workingAPIs >= 3, // Need at least 3 working APIs to be market ready
      configured_apis: totalConfiguredAPIs,
      working_apis: workingAPIs,
      missing_keys: missingKeys,
      api_status: apiTestResults,
      key_status: keyStatus,
      recommendations: generateRecommendations(missingKeys, apiTestResults),
      last_checked: new Date().toISOString()
    }

    return new Response(JSON.stringify(systemStatus), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('System readiness check error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      overall_status: 'error',
      market_ready: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function generateRecommendations(missingKeys: string[], apiResults: any): string[] {
  const recommendations = []
  
  if (missingKeys.length > 0) {
    recommendations.push(`Configure missing API keys: ${missingKeys.join(', ')}`)
  }
  
  const errorAPIs = Object.entries(apiResults)
    .filter(([_, result]: [string, any]) => result.status === 'error')
    .map(([api, _]) => api)
  
  if (errorAPIs.length > 0) {
    recommendations.push(`Fix API connection issues for: ${errorAPIs.join(', ')}`)
  }
  
  if (missingKeys.includes('USPTO_API_KEY')) {
    recommendations.push('USPTO API is critical for US trademark searches - high priority')
  }
  
  if (missingKeys.includes('OPENAI_API_KEY')) {
    recommendations.push('OpenAI API enables AI-powered similarity analysis - recommended')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All systems operational - trademark monitoring is market ready!')
  }
  
  return recommendations
}