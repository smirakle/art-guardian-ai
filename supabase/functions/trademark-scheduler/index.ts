import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScheduledScanRequest {
  action: string
  schedule_id?: string
  user_id?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, schedule_id, user_id } = await req.json() as ScheduledScanRequest

    console.log(`Scheduled scan executor: ${action}`)

    if (action === 'execute_due_scans') {
      return await executeDueScans(supabase)
    }

    if (action === 'execute_single_scan' && schedule_id) {
      return await executeSingleScan(supabase, schedule_id)
    }

    if (action === 'manual_trigger') {
      return await executeAllActiveScans(supabase)
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Scheduled scan executor error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function executeDueScans(supabase: any) {
  const now = new Date().toISOString()
  
  // Get all schedules that are due for execution
  const { data: dueSchedules, error: scheduleError } = await supabase
    .from('trademark_monitoring_schedules')
    .select('*')
    .eq('is_active', true)
    .lte('next_execution', now)
    .limit(50)

  if (scheduleError) {
    throw new Error(`Failed to fetch due schedules: ${scheduleError.message}`)
  }

  console.log(`Found ${dueSchedules?.length || 0} due schedules`)

  const results = []
  
  for (const schedule of dueSchedules || []) {
    try {
      const result = await executeScheduledScan(supabase, schedule)
      results.push({
        schedule_id: schedule.id,
        status: 'success',
        result
      })
    } catch (error) {
      console.error(`Failed to execute schedule ${schedule.id}:`, error)
      results.push({
        schedule_id: schedule.id,
        status: 'error',
        error: error.message
      })
    }
  }

  return new Response(JSON.stringify({
    success: true,
    executed_scans: results.length,
    results,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function executeSingleScan(supabase: any, scheduleId: string) {
  const { data: schedule, error: scheduleError } = await supabase
    .from('trademark_monitoring_schedules')
    .select('*')
    .eq('id', scheduleId)
    .single()

  if (scheduleError || !schedule) {
    throw new Error(`Schedule not found: ${scheduleId}`)
  }

  const result = await executeScheduledScan(supabase, schedule)

  return new Response(JSON.stringify({
    success: true,
    schedule_id: scheduleId,
    result,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function executeAllActiveScans(supabase: any) {
  const { data: allSchedules, error: scheduleError } = await supabase
    .from('trademark_monitoring_schedules')
    .select('*')
    .eq('is_active', true)
    .limit(100)

  if (scheduleError) {
    throw new Error(`Failed to fetch schedules: ${scheduleError.message}`)
  }

  console.log(`Executing ${allSchedules?.length || 0} active schedules manually`)

  const results = []
  
  for (const schedule of allSchedules || []) {
    try {
      const result = await executeScheduledScan(supabase, schedule)
      results.push({
        schedule_id: schedule.id,
        status: 'success',
        result
      })
    } catch (error) {
      console.error(`Failed to execute schedule ${schedule.id}:`, error)
      results.push({
        schedule_id: schedule.id,
        status: 'error',
        error: error.message
      })
    }
  }

  return new Response(JSON.stringify({
    success: true,
    manual_trigger: true,
    executed_scans: results.length,
    results,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function executeScheduledScan(supabase: any, schedule: any) {
  console.log(`Executing scheduled scan for: ${schedule.search_query}`)
  
  // Call the real trademark search function
  const searchResponse = await supabase.functions.invoke('real-trademark-search', {
    body: {
      action: 'search',
      query: schedule.search_query,
      jurisdictions: schedule.jurisdictions || ['US'],
      classifications: [],
      similarity_threshold: 0.8,
      platforms: schedule.platforms || ['USPTO', 'EUIPO', 'WIPO'],
      user_id: schedule.user_id
    }
  })

  if (searchResponse.error) {
    throw new Error(`Search failed: ${searchResponse.error.message}`)
  }

  const searchData = searchResponse.data?.data
  const totalMatches = searchData?.total_matches || 0
  const highRiskMatches = searchData?.high_risk_matches || 0

  // Update schedule execution time
  const nextExecution = new Date()
  nextExecution.setHours(nextExecution.getHours() + schedule.frequency_hours)

  await supabase
    .from('trademark_monitoring_schedules')
    .update({
      last_executed: new Date().toISOString(),
      next_execution: nextExecution.toISOString()
    })
    .eq('id', schedule.id)

  // Create alerts for significant findings
  if (highRiskMatches > 0) {
    await supabase.from('trademark_alerts').insert({
      user_id: schedule.user_id,
      trademark_id: schedule.trademark_id,
      alert_type: 'scheduled_monitoring',
      severity: highRiskMatches >= 3 ? 'high' : 'medium',
      title: `Scheduled Monitoring Alert: ${schedule.search_query}`,
      message: `Scheduled scan found ${highRiskMatches} high-risk matches for "${schedule.search_query}"`,
      source_data: {
        search_results: searchData,
        schedule_info: {
          schedule_id: schedule.id,
          schedule_name: schedule.schedule_name,
          frequency_hours: schedule.frequency_hours
        }
      }
    })
  }

  // Store detailed results
  const { error: resultError } = await supabase
    .from('trademark_search_results')
    .insert({
      user_id: schedule.user_id,
      query: schedule.search_query,
      jurisdictions: schedule.jurisdictions || ['US'],
      classifications: [],
      platforms: schedule.platforms || ['USPTO', 'EUIPO', 'WIPO'],
      results: searchData?.matches || [],
      total_matches: totalMatches,
      high_risk_matches: highRiskMatches,
      search_metadata: {
        scheduled_scan: true,
        schedule_id: schedule.id,
        schedule_name: schedule.schedule_name,
        search_duration_ms: searchData?.search_duration_ms || 0,
        apis_used: searchData?.apis_used || []
      }
    })

  if (resultError) {
    console.error('Failed to store search results:', resultError)
  }

  return {
    schedule_name: schedule.schedule_name,
    query: schedule.search_query,
    total_matches: totalMatches,
    high_risk_matches: highRiskMatches,
    alerts_created: highRiskMatches > 0 ? 1 : 0,
    next_execution: nextExecution.toISOString(),
    search_duration_ms: searchData?.search_duration_ms || 0
  }
}