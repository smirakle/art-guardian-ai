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
      console.error('Auth error:', authError, 'User:', user)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Authenticated user ID:', user.id)

    // Check if user is admin - use service role client to bypass RLS
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    console.log('User role lookup result:', { userRole, roleError, userId: user.id })

    if (!userRole || userRole.role !== 'admin') {
      console.error('Admin check failed:', { userRole, roleError, userId: user.id })
      return new Response(JSON.stringify({ error: 'Admin access required', debug: { userId: user.id, roleFound: userRole } }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    console.log('Admin access verified for user:', user.id)

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action') || 'get'

    if (req.method === 'POST') {
      const body = await req.json()
      const { userId: bodyUserId, action: bodyAction, data, userIds } = body
      
      // Batch fetch user emails for multiple users
      if (bodyAction === 'batchGetEmails' && userIds && Array.isArray(userIds)) {
        const emailMap: Record<string, string> = {}
        
        for (const uid of userIds) {
          try {
            const { data: authUser } = await supabase.auth.admin.getUserById(uid)
            emailMap[uid] = authUser?.user?.email || 'Unknown'
          } catch (e) {
            emailMap[uid] = 'Unknown'
          }
        }
        
        return new Response(JSON.stringify({ emails: emailMap }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
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
      // Get user email from auth.users using service role
      const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(userId)
      
      if (authUserError) {
        console.error('Error fetching auth user:', authUserError)
      }

      const userMetadata = authUser?.user?.user_metadata || {}
      const fullName = userMetadata.full_name || userMetadata.username || authUser?.user?.email || 'Unknown'

      // Get detailed user information
      const [roleData, artworkData, subscriptionData, activityData] = await Promise.all([
        supabase.from('user_roles').select('*').eq('user_id', userId).single(),
        supabase.from('artwork').select('count', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1),
        supabase.from('security_audit_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10)
      ])

      const userDetails = {
        id: userId,
        email: authUser?.user?.email || 'Unknown',
        full_name: fullName,
        role: roleData.data?.role || 'user',
        stats: {
          artworkCount: artworkData.count || 0,
          subscription: subscriptionData.data?.[0] || null,
        },
        recentActivity: activityData.data || []
      }

      return new Response(JSON.stringify(userDetails), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get all users with pagination
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get all users from auth.users
    const { data: authUsersData, error: listUsersError } = await supabase.auth.admin.listUsers({
      page: Math.floor(offset / limit) + 1,
      perPage: limit
    })

    if (listUsersError) {
      console.error('Error listing auth users:', listUsersError)
      throw listUsersError
    }

    const users = authUsersData?.users || []

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