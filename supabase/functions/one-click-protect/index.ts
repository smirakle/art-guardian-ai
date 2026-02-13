import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-extension-token',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const EXT_TOKEN = Deno.env.get('ONE_CLICK_EXTENSION_TOKEN')?.trim()

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

    const body = await req.json()
    const authHeader = req.headers.get('Authorization')
    const extHeader = req.headers.get('x-extension-token')?.trim()

    let userId: string | null = null

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      
      // Try to get user from token, but allow anonymous access
      try {
        const { data, error } = await supabase.auth.getUser(token)
        if (data.user) {
          userId = data.user.id
        }
      } catch (err) {
        console.log('Auth check failed, allowing anonymous access:', err)
      }
      
      // If no user found, continue with anonymous access (userId will be null)
      if (!userId) {
        console.log('No authenticated user, proceeding anonymously')
      }
    } else if (EXT_TOKEN && extHeader && extHeader === EXT_TOKEN) {
      // Allow server-trusted extension to specify target user_id explicitly
      if (!body.user_id) return json({ error: 'user_id required when using extension token' }, 400)
      userId = body.user_id
    }
    
    // Continue processing even without authentication for demo purposes

    // Handle both extension payload and case management payload
    const { title, source, file_url, metadata, caseId, protectionTypes, targetPlatforms, infringingUrls, customMessage, automationSettings } = body
    
    let notifTitle: string
    let notifMsg: string
    
    if (caseId) {
      // Case management payload
      notifTitle = 'Protection Actions Initiated'
      notifMsg = `${protectionTypes?.length || 0} protection actions started for case ${caseId}`
    } else {
      // Extension payload
      notifTitle = title || 'One-Click Protection Initiated'
      notifMsg = source
        ? `Protection requested from ${source}${file_url ? ` for ${file_url}` : ''}`
        : 'Protection request received from extension.'
    }

    // Create high-level notification so the user sees immediate feedback
    await supabase.rpc('create_ai_protection_notification', {
      user_id_param: userId,
      notification_type_param: 'one_click_protect',
      title_param: notifTitle,
      message_param: notifMsg,
      severity_param: 'info',
      action_url_param: '/upload',
      metadata_param: metadata ?? {},
      expires_hours_param: 72,
    })

    // Audit log
    await supabase.rpc('log_ai_protection_action', {
      user_id_param: userId,
      action_param: 'one_click_protect',
      resource_type_param: caseId ? 'case_management' : 'extension',
      resource_id_param: caseId ?? file_url ?? null,
      details_param: caseId ? {
        caseId,
        protectionTypes,
        targetPlatforms,
        infringingUrls,
        customMessage,
        automationSettings
      } : {
        source: source ?? 'unknown',
        file_url: file_url ?? null,
        metadata: metadata ?? {},
      },
      ip_param: null,
      user_agent_param: req.headers.get('user-agent') ?? null,
    })

    return json({ status: 'queued' })
  } catch (e: any) {
    console.error('one-click-protect error', e)
    return json({ error: e.message ?? 'Internal error' }, 500)
  }
})
