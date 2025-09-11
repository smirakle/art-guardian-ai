import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AgentDeploymentRequest {
  action: string
  user_id: string
  platforms: string[]
  monitoring_frequency: number
  threat_threshold: number
  auto_response_enabled: boolean
  predictive_analytics: boolean
}

interface AgentScanRequest {
  action: string
  user_id: string
}

interface ThreatIntelligenceRequest {
  action: string
  user_id: string
}

const PLATFORM_CONFIGS = {
  'instagram': { name: 'Instagram', api_endpoint: 'graph.instagram.com', priority: 95 },
  'tiktok': { name: 'TikTok', api_endpoint: 'tiktok-scraper.p.rapidapi.com', priority: 90 },
  'youtube': { name: 'YouTube', api_endpoint: 'www.googleapis.com/youtube/v3', priority: 85 },
  'twitter': { name: 'Twitter/X', api_endpoint: 'api.twitter.com/2', priority: 80 },
  'facebook': { name: 'Facebook', api_endpoint: 'graph.facebook.com', priority: 75 },
  'onlyfans': { name: 'OnlyFans', api_endpoint: 'onlyfans.com/api2/v2', priority: 100 },
  'pornhub': { name: 'Pornhub', api_endpoint: 'pornhub.com/webmasters', priority: 95 },
  'opensea': { name: 'OpenSea', api_endpoint: 'api.opensea.io/v1', priority: 95 },
  'rarible': { name: 'Rarible', api_endpoint: 'api.rarible.org/v0.1', priority: 85 },
  'amazon': { name: 'Amazon', api_endpoint: 'advertising-api.amazon.com', priority: 85 },
  'ebay': { name: 'eBay', api_endpoint: 'api.ebay.com/ws/api', priority: 80 },
  'etsy': { name: 'Etsy', api_endpoint: 'openapi.etsy.com/v3', priority: 85 },
  'google_images': { name: 'Google Images', api_endpoint: 'customsearch.googleapis.com/customsearch/v1', priority: 100 },
  'bing_visual': { name: 'Bing Visual', api_endpoint: 'api.cognitive.microsoft.com/bing/v7.0', priority: 95 },
  'shutterstock': { name: 'Shutterstock', api_endpoint: 'api.shutterstock.com/v2', priority: 90 },
  'getty': { name: 'Getty Images', api_endpoint: 'api.gettyimages.com/v3', priority: 85 }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_CUSTOM_SEARCH_API_KEY')

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

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

    // Rate limiting check
    const rateLimitResult = await checkRateLimit(supabase, user.id, req.url)
    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded', 
        details: `Max ${rateLimitResult.limit} requests per hour. Try again in ${rateLimitResult.resetTime} minutes.`
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const requestData = await req.json()
    
    // Validate input
    validateInput(requestData)
    
    const { action } = requestData

    console.log(`AI Agent Network action: ${action}`, { action, user_id: requestData.user_id, timestamp: new Date().toISOString() })

    switch (action) {
      case 'deploy_agents':
        return await deployAgents(supabase, requestData as AgentDeploymentRequest)
      
      case 'scan_all_platforms':
        return await scanAllPlatforms(supabase, requestData as AgentScanRequest)
      
      case 'get_threat_intelligence':
        return await getThreatIntelligence(supabase, requestData as ThreatIntelligenceRequest)
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

  } catch (error) {
    console.error('AI Agent Network error:', error)
    return new Response(JSON.stringify({ 
      error: 'Request failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function deployAgents(supabase: any, request: AgentDeploymentRequest) {
  console.log('Deploying AI agents for user:', request.user_id)
  
  try {
    // Create deployment record
    const { data: deployment } = await supabase
      .from('ai_agent_deployments')
      .insert({
        user_id: request.user_id,
        deployment_config: {
          platforms: request.platforms,
          monitoring_frequency: request.monitoring_frequency,
          threat_threshold: request.threat_threshold,
          auto_response_enabled: request.auto_response_enabled,
          predictive_analytics: request.predictive_analytics
        },
        deployment_status: 'in_progress'
      })
      .select()
      .single()

    const deployedAgents = []
    
    // Deploy agents for each platform
    for (const platformId of request.platforms) {
      const platformConfig = PLATFORM_CONFIGS[platformId as keyof typeof PLATFORM_CONFIGS]
      if (!platformConfig) {
        console.warn(`Unknown platform: ${platformId}`)
        continue
      }

      try {
        const agentData = {
          user_id: request.user_id,
          platform_id: platformId,
          platform_name: platformConfig.name,
          status: 'active',
          scan_frequency: request.monitoring_frequency,
          agent_config: {
            threat_threshold: request.threat_threshold,
            auto_response_enabled: request.auto_response_enabled,
            predictive_analytics: request.predictive_analytics,
            api_endpoint: platformConfig.api_endpoint,
            priority: platformConfig.priority
          },
          performance_metrics: {
            uptime: 0,
            scans_performed: 0,
            threats_detected: 0,
            false_positives: 0
          }
        }

        console.log('Creating agent:', agentData)

        const { data: agent, error } = await supabase
          .from('ai_monitoring_agents')
          .insert(agentData)
          .select()
          .single()

        if (error) {
          console.error('Error storing agent config:', error)
          continue
        }

        deployedAgents.push(agent)
        console.log(`Agent deployed for ${platformConfig.name}:`, agent.id)

      } catch (agentError) {
        console.error(`Error deploying agent for ${platformId}:`, agentError)
      }
    }

    // Update deployment status
    await supabase
      .from('ai_agent_deployments')
      .update({
        deployed_agents: deployedAgents.length,
        deployment_status: deployedAgents.length > 0 ? 'completed' : 'failed',
        completed_at: new Date().toISOString(),
        error_message: deployedAgents.length === 0 ? 'No agents could be deployed' : null
      })
      .eq('id', deployment.id)

    const platformNames = deployedAgents.map(a => a.platform_name).join(', ')
    
    return new Response(JSON.stringify({
      success: true,
      deployed_agents: deployedAgents.length,
      monitoring_coverage: platformNames,
      agents: deployedAgents
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Agent deployment error:', error)
    return new Response(JSON.stringify({ 
      error: 'Deployment failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function scanAllPlatforms(supabase: any, request: AgentScanRequest) {
  console.log('Scanning all platforms for user:', request.user_id)
  
  try {
    // Get active agents for this user
    const { data: agents } = await supabase
      .from('ai_monitoring_agents')
      .select('*')
      .eq('user_id', request.user_id)
      .eq('status', 'active')

    if (!agents || agents.length === 0) {
      return new Response(JSON.stringify({
        error: 'No active agents found. Please deploy agents first.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const scanResults = {
      platforms_scanned: agents.length,
      threats_detected: 0,
      scan_timestamp: new Date().toISOString(),
      platform_results: []
    }

    // Simulate scanning each platform
    for (const agent of agents) {
      const threatCount = Math.floor(Math.random() * 3) // Simulate 0-2 threats per platform
      
      // Update agent scan timestamp and threat count
      await supabase
        .from('ai_monitoring_agents')
        .update({
          last_scan: new Date().toISOString(),
          threats_detected: agent.threats_detected + threatCount
        })
        .eq('id', agent.id)

      // Create mock threat detections if any found
      for (let i = 0; i < threatCount; i++) {
        const threatLevels = ['low', 'medium', 'high', 'critical']
        const threatTypes = ['copyright_violation', 'deepfake', 'impersonation', 'unauthorized_use']
        
        await supabase
          .from('ai_threat_detections')
          .insert({
            user_id: request.user_id,
            agent_id: agent.id,
            platform: agent.platform_id,
            threat_type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
            threat_level: threatLevels[Math.floor(Math.random() * threatLevels.length)],
            confidence_score: 0.6 + Math.random() * 0.4, // 0.6-1.0
            threat_data: {
              detected_content: `Suspicious content found on ${agent.platform_name}`,
              similarity_score: Math.random(),
              detection_method: 'ai_analysis'
            },
            source_url: `https://${agent.platform_id}.com/content/${Math.random().toString(36).substring(7)}`
          })
      }

      scanResults.threats_detected += threatCount
      scanResults.platform_results.push({
        platform: agent.platform_name,
        threats_found: threatCount,
        status: 'completed'
      })
    }

    return new Response(JSON.stringify({
      success: true,
      scan_results: scanResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Platform scan error:', error)
    return new Response(JSON.stringify({ 
      error: 'Scan failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function getThreatIntelligence(supabase: any, request: ThreatIntelligenceRequest) {
  console.log('Getting threat intelligence for user:', request.user_id)
  
  try {
    // Get recent threat detections
    const { data: threats } = await supabase
      .from('ai_threat_detections')
      .select('*')
      .eq('user_id', request.user_id)
      .order('detected_at', { ascending: false })
      .limit(100)

    // Get agent performance metrics
    const { data: agents } = await supabase
      .from('ai_monitoring_agents')
      .select('*')
      .eq('user_id', request.user_id)

    const intelligence = {
      threat_summary: {
        total_threats: threats?.length || 0,
        critical_threats: threats?.filter(t => t.threat_level === 'critical').length || 0,
        high_threats: threats?.filter(t => t.threat_level === 'high').length || 0,
        platforms_affected: new Set(threats?.map(t => t.platform) || []).size
      },
      trend_analysis: {
        threat_velocity: calculateThreatVelocity(threats || []),
        most_targeted_platform: getMostTargetedPlatform(threats || []),
        common_threat_types: getCommonThreatTypes(threats || [])
      },
      agent_performance: {
        total_agents: agents?.length || 0,
        active_agents: agents?.filter(a => a.status === 'active').length || 0,
        average_success_rate: calculateAverageSuccessRate(agents || [])
      },
      recommendations: generateRecommendations(threats || [], agents || [])
    }

    return new Response(JSON.stringify({
      success: true,
      intelligence
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Threat intelligence error:', error)
    return new Response(JSON.stringify({ 
      error: 'Intelligence gathering failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

function calculateThreatVelocity(threats: any[]) {
  const last24h = threats.filter(t => 
    new Date(t.detected_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  )
  return last24h.length
}

function getMostTargetedPlatform(threats: any[]) {
  const platformCounts = threats.reduce((acc, t) => {
    acc[t.platform] = (acc[t.platform] || 0) + 1
    return acc
  }, {})
  
  return Object.keys(platformCounts).reduce((a, b) => 
    platformCounts[a] > platformCounts[b] ? a : b, 'none'
  )
}

function getCommonThreatTypes(threats: any[]) {
  const typeCounts = threats.reduce((acc, t) => {
    acc[t.threat_type] = (acc[t.threat_type] || 0) + 1
    return acc
  }, {})
  
  return Object.entries(typeCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([type]) => type)
}

function calculateAverageSuccessRate(agents: any[]) {
  if (agents.length === 0) return 0
  return agents.reduce((sum, a) => sum + (a.success_rate || 0), 0) / agents.length
}

function generateRecommendations(threats: any[], agents: any[]) {
  const recommendations = []
  
  if (threats.length > 10) {
    recommendations.push("Consider enabling auto-response for high-confidence threats")
  }
  
  if (agents.filter(a => a.status === 'active').length < 5) {
    recommendations.push("Deploy more agents to increase monitoring coverage")
  }
  
  const criticalThreats = threats.filter(t => t.threat_level === 'critical')
  if (criticalThreats.length > 0) {
    recommendations.push("Immediate action required for critical threats")
  }
  
  return recommendations
}

async function checkRateLimit(supabase: any, userId: string, endpoint: string) {
  const now = new Date()
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  
  try {
    // Check current usage in the last hour
    const { data: usage } = await supabase
      .from('ai_protection_rate_limits')
      .select('request_count')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .gte('window_start', hourAgo.toISOString())
      .single()

    const currentCount = usage?.request_count || 0
    const limit = 50 // 50 requests per hour for AI Agent Network
    
    if (currentCount >= limit) {
      return {
        allowed: false,
        limit,
        resetTime: Math.ceil((60 - (now.getMinutes())) / 1)
      }
    }

    // Update or create rate limit record
    const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())
    
    await supabase
      .from('ai_protection_rate_limits')
      .upsert({
        user_id: userId,
        endpoint,
        window_start: windowStart.toISOString(),
        request_count: currentCount + 1
      })

    return { allowed: true }
  } catch (error) {
    console.error('Rate limit check error:', error)
    // Allow request if rate limiting check fails
    return { allowed: true }
  }
}

function validateInput(data: any) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request data')
  }
  
  if (!data.action || typeof data.action !== 'string') {
    throw new Error('Missing or invalid action')
  }
  
  if (!data.user_id || typeof data.user_id !== 'string') {
    throw new Error('Missing or invalid user_id')
  }
  
  // Additional validation based on action
  if (data.action === 'deploy_agents') {
    if (!Array.isArray(data.platforms) || data.platforms.length === 0) {
      throw new Error('Invalid platforms array')
    }
    
    if (data.platforms.length > 16) {
      throw new Error('Too many platforms selected (max 16)')
    }
    
    const validPlatforms = Object.keys(PLATFORM_CONFIGS)
    const invalidPlatforms = data.platforms.filter((p: string) => !validPlatforms.includes(p))
    if (invalidPlatforms.length > 0) {
      throw new Error(`Invalid platforms: ${invalidPlatforms.join(', ')}`)
    }
  }
  
  return true
}