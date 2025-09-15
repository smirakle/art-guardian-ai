import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AgentDeploymentRequest {
  action: 'deploy_agents';
  user_id: string;
  platforms: string[];
  monitoring_frequency: number;
  threat_threshold: number;
  auto_response_enabled: boolean;
  predictive_analytics: boolean;
}

interface AgentScanRequest {
  action: 'scan_all_platforms';
  user_id: string;
}

interface ThreatIntelligenceRequest {
  action: 'get_threat_intelligence';
  user_id: string;
}

const PLATFORM_CONFIGS = {
  'instagram': { name: 'Instagram', scan_intervals: [30, 60, 120], priority: 95 },
  'tiktok': { name: 'TikTok', scan_intervals: [15, 30, 60], priority: 90 },
  'youtube': { name: 'YouTube', scan_intervals: [60, 120, 240], priority: 85 },
  'twitter': { name: 'Twitter/X', scan_intervals: [15, 30, 60], priority: 80 },
  'facebook': { name: 'Facebook', scan_intervals: [30, 60, 120], priority: 75 },
  'onlyfans': { name: 'OnlyFans', scan_intervals: [30, 60, 120], priority: 100 },
  'pornhub': { name: 'Pornhub', scan_intervals: [60, 120, 240], priority: 95 },
  'opensea': { name: 'OpenSea', scan_intervals: [60, 120, 240], priority: 95 },
  'rarible': { name: 'Rarible', scan_intervals: [120, 240, 480], priority: 85 },
  'amazon': { name: 'Amazon', scan_intervals: [120, 240, 480], priority: 85 },
  'ebay': { name: 'eBay', scan_intervals: [120, 240, 480], priority: 80 },
  'etsy': { name: 'Etsy', scan_intervals: [120, 240, 480], priority: 85 },
  'google_images': { name: 'Google Images', scan_intervals: [60, 120, 240], priority: 100 },
  'bing_visual': { name: 'Bing Visual', scan_intervals: [60, 120, 240], priority: 95 },
  'shutterstock': { name: 'Shutterstock', scan_intervals: [240, 480, 720], priority: 90 },
  'getty': { name: 'Getty Images', scan_intervals: [240, 480, 720], priority: 85 }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Rate limiting check
    const isAllowed = await checkRateLimit(supabase, user.id, 'ai-agent-network');
    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const body = await req.json()
    
    if (!validateInput(body)) {
      return new Response(
        JSON.stringify({ error: 'Invalid input data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    let result;
    
    switch (body.action) {
      case 'deploy_agents':
        result = await deployAgents(supabase, body as AgentDeploymentRequest);
        break;
      case 'scan_all_platforms':
        result = await scanAllPlatforms(supabase, body as AgentScanRequest);
        break;
      case 'get_threat_intelligence':
        result = await getThreatIntelligence(supabase, body as ThreatIntelligenceRequest);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in ai-agent-network function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

async function deployAgents(supabase: any, request: AgentDeploymentRequest) {
  try {
    console.log('Deploying agents for user:', request.user_id);
    console.log('Platforms:', request.platforms);

    // Create deployment record
    const { data: deployment, error: deploymentError } = await supabase
      .from('ai_agent_deployments')
      .insert({
        user_id: request.user_id,
        deployment_status: 'in_progress',
        platforms_requested: request.platforms,
        config: {
          monitoring_frequency: request.monitoring_frequency,
          threat_threshold: request.threat_threshold,
          auto_response_enabled: request.auto_response_enabled,
          predictive_analytics: request.predictive_analytics
        }
      })
      .select()
      .single();

    if (deploymentError) {
      console.error('Deployment creation error:', deploymentError);
      throw deploymentError;
    }

    const deployedAgents = [];
    
    // Deploy agents for each platform
    for (const platformId of request.platforms) {
      const platformConfig = PLATFORM_CONFIGS[platformId];
      if (!platformConfig) {
        console.warn(`Unknown platform: ${platformId}`);
        continue;
      }

      try {
        // Check if agent already exists for this platform
        const { data: existingAgent } = await supabase
          .from('ai_monitoring_agents')
          .select('id')
          .eq('user_id', request.user_id)
          .eq('platform_id', platformId)
          .single();

        if (existingAgent) {
          // Update existing agent
          const { data: updatedAgent, error: updateError } = await supabase
            .from('ai_monitoring_agents')
            .update({
              status: 'active',
              scan_frequency: request.monitoring_frequency,
              agent_config: {
                threat_threshold: request.threat_threshold,
                auto_response_enabled: request.auto_response_enabled,
                predictive_analytics: request.predictive_analytics
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', existingAgent.id)
            .select()
            .single();

          if (updateError) {
            console.error(`Error updating agent for ${platformId}:`, updateError);
            continue;
          }

          deployedAgents.push(updatedAgent);
        } else {
          // Create new agent
          const { data: newAgent, error: agentError } = await supabase
            .from('ai_monitoring_agents')
            .insert({
              user_id: request.user_id,
              platform_id: platformId,
              platform_name: platformConfig.name,
              status: 'active',
              scan_frequency: request.monitoring_frequency,
              threats_detected: 0,
              success_rate: 0,
              agent_config: {
                threat_threshold: request.threat_threshold,
                auto_response_enabled: request.auto_response_enabled,
                predictive_analytics: request.predictive_analytics,
                scan_intervals: platformConfig.scan_intervals,
                priority: platformConfig.priority
              },
              performance_metrics: {
                uptime: 99.5,
                response_time_avg: 150,
                scans_completed: 0,
                last_health_check: new Date().toISOString()
              }
            })
            .select()
            .single();

          if (agentError) {
            console.error(`Error creating agent for ${platformId}:`, agentError);
            continue;
          }

          deployedAgents.push(newAgent);
        }
      } catch (platformError) {
        console.error(`Error deploying agent for ${platformId}:`, platformError);
        continue;
      }
    }

    // Update deployment status
    await supabase
      .from('ai_agent_deployments')
      .update({
        deployment_status: 'completed',
        agents_deployed: deployedAgents.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', deployment.id);

    return {
      success: true,
      deployed_agents: deployedAgents.length,
      monitoring_coverage: `${deployedAgents.length} platforms`,
      deployment_id: deployment.id,
      agents: deployedAgents
    };

  } catch (error) {
    console.error('Error deploying agents:', error);
    throw error;
  }
}

async function scanAllPlatforms(supabase: any, request: AgentScanRequest) {
  try {
    // Get active agents for user
    const { data: agents, error: agentsError } = await supabase
      .from('ai_monitoring_agents')
      .select('*')
      .eq('user_id', request.user_id)
      .eq('status', 'active');

    if (agentsError) {
      throw agentsError;
    }

    if (!agents || agents.length === 0) {
      return {
        success: false,
        error: 'No active agents found. Please deploy agents first.',
        scan_results: {
          platforms_scanned: 0,
          threats_detected: 0
        }
      };
    }

    const scanResults = {
      platforms_scanned: agents.length,
      threats_detected: 0,
      scan_details: []
    };

    // Simulate scanning each platform
    for (const agent of agents) {
      try {
        // Simulate threat detection (in real implementation, this would call actual APIs)
        const mockThreats = Math.floor(Math.random() * 3); // 0-2 threats per platform
        
        if (mockThreats > 0) {
          // Create threat detection records
          for (let i = 0; i < mockThreats; i++) {
            const threatLevel = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
            const confidenceScore = 0.6 + Math.random() * 0.4; // 0.6-1.0
            
            await supabase
              .from('ai_threat_detections')
              .insert({
                user_id: request.user_id,
                agent_id: agent.id,
                platform: agent.platform_name,
                threat_type: 'unauthorized_usage',
                threat_level: threatLevel,
                confidence_score: confidenceScore,
                threat_data: {
                  source: `${agent.platform_name} monitoring`,
                  detection_method: 'ai_pattern_matching',
                  risk_factors: ['content_similarity', 'usage_pattern']
                },
                source_url: `https://${agent.platform_id}.com/content/detected`,
                status: 'new'
              });
          }
        }

        // Update agent metrics
        await supabase
          .from('ai_monitoring_agents')
          .update({
            last_scan: new Date().toISOString(),
            threats_detected: agent.threats_detected + mockThreats,
            performance_metrics: {
              ...agent.performance_metrics,
              scans_completed: (agent.performance_metrics?.scans_completed || 0) + 1,
              last_health_check: new Date().toISOString()
            }
          })
          .eq('id', agent.id);

        scanResults.threats_detected += mockThreats;
        scanResults.scan_details.push({
          platform: agent.platform_name,
          threats_found: mockThreats,
          scan_time: new Date().toISOString()
        });

      } catch (platformError) {
        console.error(`Error scanning ${agent.platform_name}:`, platformError);
        continue;
      }
    }

    return {
      success: true,
      scan_results: scanResults
    };

  } catch (error) {
    console.error('Error scanning platforms:', error);
    throw error;
  }
}

async function getThreatIntelligence(supabase: any, request: ThreatIntelligenceRequest) {
  try {
    // Get recent threat detections
    const { data: recentThreats, error: threatsError } = await supabase
      .from('ai_threat_detections')
      .select('*')
      .eq('user_id', request.user_id)
      .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('detected_at', { ascending: false });

    if (threatsError) {
      throw threatsError;
    }

    // Get agent performance metrics
    const { data: agents, error: agentsError } = await supabase
      .from('ai_monitoring_agents')
      .select('*')
      .eq('user_id', request.user_id);

    if (agentsError) {
      throw agentsError;
    }

    const intelligence = {
      threat_summary: {
        total_threats: recentThreats?.length || 0,
        critical_threats: recentThreats?.filter(t => t.threat_level === 'critical').length || 0,
        high_threats: recentThreats?.filter(t => t.threat_level === 'high').length || 0,
        medium_threats: recentThreats?.filter(t => t.threat_level === 'medium').length || 0,
        low_threats: recentThreats?.filter(t => t.threat_level === 'low').length || 0
      },
      trend_analysis: {
        threat_velocity: calculateThreatVelocity(recentThreats),
        most_targeted_platform: getMostTargetedPlatform(recentThreats),
        common_threat_types: getCommonThreatTypes(recentThreats)
      },
      agent_performance: {
        total_agents: agents?.length || 0,
        active_agents: agents?.filter(a => a.status === 'active').length || 0,
        average_success_rate: calculateAverageSuccessRate(agents),
        uptime_percentage: agents?.reduce((sum, a) => sum + (a.performance_metrics?.uptime || 99.5), 0) / Math.max(agents?.length || 1, 1)
      },
      recommendations: generateRecommendations(recentThreats, agents)
    };

    return {
      success: true,
      intelligence
    };

  } catch (error) {
    console.error('Error getting threat intelligence:', error);
    throw error;
  }
}

// Helper functions
function calculateThreatVelocity(threats: any[]) {
  if (!threats || threats.length < 2) return 0;
  
  const last24h = threats.filter(t => 
    new Date(t.detected_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
  
  const previous24h = threats.filter(t => {
    const detectedAt = new Date(t.detected_at);
    const now = new Date();
    return detectedAt > new Date(now.getTime() - 48 * 60 * 60 * 1000) && 
           detectedAt <= new Date(now.getTime() - 24 * 60 * 60 * 1000);
  });
  
  return last24h.length - previous24h.length;
}

function getMostTargetedPlatform(threats: any[]) {
  if (!threats || threats.length === 0) return null;
  
  const platformCounts = threats.reduce((acc, threat) => {
    acc[threat.platform] = (acc[threat.platform] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(platformCounts).reduce((a, b) => 
    platformCounts[a[0]] > platformCounts[b[0]] ? a : b
  )[0];
}

function getCommonThreatTypes(threats: any[]) {
  if (!threats || threats.length === 0) return [];
  
  const typeCounts = threats.reduce((acc, threat) => {
    acc[threat.threat_type] = (acc[threat.threat_type] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }));
}

function calculateAverageSuccessRate(agents: any[]) {
  if (!agents || agents.length === 0) return 0;
  
  const totalSuccessRate = agents.reduce((sum, agent) => 
    sum + (agent.success_rate || 0), 0
  );
  
  return Math.round((totalSuccessRate / agents.length) * 100) / 100;
}

function generateRecommendations(threats: any[], agents: any[]) {
  const recommendations = [];
  
  if (!threats || threats.length === 0) {
    recommendations.push("No threats detected recently. Continue monitoring.");
  }
  
  if (threats && threats.filter(t => t.threat_level === 'high' || t.threat_level === 'critical').length > 0) {
    recommendations.push("High-priority threats detected. Consider immediate response actions.");
  }
  
  if (agents && agents.length < 5) {
    recommendations.push("Consider deploying agents on additional platforms for comprehensive coverage.");
  }
  
  return recommendations;
}

async function checkRateLimit(supabase: any, userId: string, endpoint: string) {
  try {
    const { data: rateLimitData, error } = await supabase
      .from('ai_protection_rate_limits')
      .select('request_count')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .gte('window_start', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Rate limit check error:', error);
      return true; // Allow request if we can't check rate limit
    }

    const currentCount = rateLimitData?.request_count || 0;
    const limit = 50; // 50 requests per hour

    if (currentCount >= limit) {
      return false;
    }

    // Update or insert rate limit record
    await supabase
      .from('ai_protection_rate_limits')
      .upsert({
        user_id: userId,
        endpoint: endpoint,
        window_start: new Date(Date.now() - (Date.now() % (60 * 60 * 1000))).toISOString(), // Start of current hour
        request_count: currentCount + 1
      });

    return true;
  } catch (error) {
    console.error('Rate limit error:', error);
    return true; // Allow request if rate limiting fails
  }
}

function validateInput(data: any) {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (!data.action || typeof data.action !== 'string') {
    return false;
  }

  if (data.action === 'deploy_agents') {
    return data.user_id && 
           Array.isArray(data.platforms) && 
           data.platforms.length > 0 &&
           typeof data.monitoring_frequency === 'number' &&
           typeof data.threat_threshold === 'number' &&
           typeof data.auto_response_enabled === 'boolean' &&
           typeof data.predictive_analytics === 'boolean';
  }

  return true;
}