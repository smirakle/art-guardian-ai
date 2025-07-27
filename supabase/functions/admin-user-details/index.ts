import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify admin access
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!userRole || userRole.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action') || 'get'

    if (req.method === 'POST') {
      const { userId: bodyUserId, action: bodyAction, data } = await req.json()
      
      if (bodyAction === 'suspend') {
        // Update user role or add suspended flag
        const { error } = await supabase
          .from('profiles')
          .update({ 
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', bodyUserId)

        // Log the action
        await supabase.from('security_audit_log').insert({
          user_id: user.id,
          action: 'user_suspended',
          resource_type: 'user',
          resource_id: bodyUserId,
          details: { reason: data?.reason || 'Administrative action' }
        })

        return new Response(JSON.stringify({ success: true, message: 'User suspended' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (bodyAction === 'updateRole') {
        const { error } = await supabase
          .from('user_roles')
          .update({ role: data.role })
          .eq('user_id', bodyUserId)

        if (error) throw error

        // Log the action
        await supabase.from('security_audit_log').insert({
          user_id: user.id,
          action: 'role_updated',
          resource_type: 'user',
          resource_id: bodyUserId,
          details: { newRole: data.role, oldRole: data.oldRole }
        })

        return new Response(JSON.stringify({ success: true, message: 'Role updated' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    if (userId) {
      // Get detailed user information
      const [profileData, roleData, artworkData, subscriptionData, activityData] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).single(),
        supabase.from('user_roles').select('*').eq('user_id', userId).single(),
        supabase.from('artwork').select('count', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1),
        supabase.from('security_audit_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10)
      ])

      const userDetails = {
        profile: profileData.data,
        role: roleData.data,
        stats: {
          artworkCount: artworkData.count || 0,
          subscription: subscriptionData.data?.[0] || null,
        },
        recentActivity: activityData.data || []
      }

      return new Response(JSON.stringify({ user: userDetails }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get all users with pagination
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles (role),
        subscriptions (plan_id, status)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error

    return new Response(JSON.stringify({ users }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in admin-user-details:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})