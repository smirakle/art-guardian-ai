import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  try {
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing authorization header' }, 401)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    // Rate limiting check
    const canProceed = await checkRateLimit(supabase, user.id, 'ai_agent_network')
    if (!canProceed) {
      return json({ error: 'Rate limit exceeded. Please try again later.' }, 429)
    }

    const body = await req.json()
    const { action, platforms, artworkId, config } = body

    console.log('AI Agent Network request:', { action, platforms, artworkId, userId: user.id })

    switch (action) {
      case 'deploy':
        return await deployAgents(supabase, user.id, platforms, artworkId, config)
      case 'status':
        return await getAgentStatus(supabase, user.id, artworkId)
      case 'stop':
        return await stopAgents(supabase, user.id, artworkId)
      default:
        return json({ error: 'Invalid action' }, 400)
    }

  } catch (e: any) {
    console.error('ai-agent-network error:', e)
    return json({ error: e.message || 'Internal server error' }, 500)
  }
})

async function checkRateLimit(supabase: any, userId: string, endpoint: string): Promise<boolean> {
  const { data } = await supabase.rpc('check_ai_protection_rate_limit', {
    user_id_param: userId,
    endpoint_param: endpoint,
    max_requests_param: 50,
    window_minutes_param: 60
  })
  return data === true
}

async function deployAgents(
  supabase: any,
  userId: string,
  platforms: string[],
  artworkId: string | null,
  config: any
) {
  try {
    // Create deployment record
    const { data: deployment, error: deployError } = await supabase
      .from('ai_agent_deployments')
      .insert({
        user_id: userId,
        platforms_requested: platforms,
        deployment_status: 'deploying',
        config: config || {},
        agents_deployed: 0
      })
      .select()
      .single()

    if (deployError) throw deployError

    // Create monitoring agents for each platform
    const agentPromises = platforms.map(async (platform) => {
      const { data: agent, error: agentError } = await supabase
        .from('ai_monitoring_agents')
        .insert({
          user_id: userId,
          platform_name: platform,
          platform_id: `${platform}_${Date.now()}`,
          status: 'active',
          scan_frequency: config?.scanFrequency || 60,
          agent_config: {
            artworkId: artworkId,
            alertOnMatch: true,
            autoTakedown: config?.autoTakedown || false,
            ...config
          },
          last_scan: new Date().toISOString()
        })
        .select()
        .single()

      if (agentError) {
        console.error('Error creating agent for', platform, agentError)
        return null
      }

      return agent
    })

    const agents = await Promise.all(agentPromises)
    const successfulAgents = agents.filter(a => a !== null)

    // Update deployment status
    await supabase
      .from('ai_agent_deployments')
      .update({
        deployment_status: 'active',
        agents_deployed: successfulAgents.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', deployment.id)

    // Log action
    await supabase.rpc('log_ai_protection_action', {
      user_id_param: userId,
      action_param: 'deploy_agents',
      resource_type_param: 'ai_agent_network',
      resource_id_param: deployment.id,
      details_param: {
        platforms,
        artworkId,
        agentsDeployed: successfulAgents.length
      },
      ip_param: null,
      user_agent_param: null
    })

    // Create notification
    await supabase.rpc('create_ai_protection_notification', {
      user_id_param: userId,
      notification_type_param: 'agents_deployed',
      title_param: 'AI Monitoring Agents Deployed',
      message_param: `${successfulAgents.length} agents are now monitoring ${platforms.join(', ')} for copyright infringement.`,
      severity_param: 'info',
      action_url_param: '/protection-hub',
      metadata_param: { deploymentId: deployment.id },
      expires_hours_param: 168
    })

    return json({
      success: true,
      deployment,
      agents: successfulAgents,
      message: `Deployed ${successfulAgents.length} agents across ${platforms.length} platforms`
    })

  } catch (error: any) {
    console.error('Deploy agents error:', error)
    return json({ error: error.message }, 500)
  }
}

async function getAgentStatus(supabase: any, userId: string, artworkId: string | null) {
  try {
    let query = supabase
      .from('ai_monitoring_agents')
      .select('*')
      .eq('user_id', userId)

    if (artworkId) {
      query = query.eq('agent_config->>artworkId', artworkId)
    }

    const { data: agents, error } = await query

    if (error) throw error

    // Get recent threat detections
    const { data: threats } = await supabase
      .from('ai_threat_detections')
      .select('*')
      .eq('user_id', userId)
      .order('detected_at', { ascending: false })
      .limit(10)

    return json({
      success: true,
      agents: agents || [],
      activeAgents: agents?.filter((a: any) => a.status === 'active').length || 0,
      totalThreats: threats?.length || 0,
      recentThreats: threats || []
    })

  } catch (error: any) {
    console.error('Get status error:', error)
    return json({ error: error.message }, 500)
  }
}

async function stopAgents(supabase: any, userId: string, artworkId: string | null) {
  try {
    let query = supabase
      .from('ai_monitoring_agents')
      .update({ status: 'inactive' })
      .eq('user_id', userId)

    if (artworkId) {
      query = query.eq('agent_config->>artworkId', artworkId)
    }

    const { data, error } = await query.select()

    if (error) throw error

    await supabase.rpc('log_ai_protection_action', {
      user_id_param: userId,
      action_param: 'stop_agents',
      resource_type_param: 'ai_agent_network',
      resource_id_param: artworkId,
      details_param: { agentsStopped: data?.length || 0 },
      ip_param: null,
      user_agent_param: null
    })

    return json({
      success: true,
      agentsStopped: data?.length || 0,
      message: `Stopped ${data?.length || 0} monitoring agents`
    })

  } catch (error: any) {
    console.error('Stop agents error:', error)
    return json({ error: error.message }, 500)
  }
}
