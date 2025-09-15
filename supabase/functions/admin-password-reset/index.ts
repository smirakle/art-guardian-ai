import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const { action, email, newPassword } = await req.json()

    if (action === 'reset_admin_password' && email === 'shc302@g.harvard.edu') {
      // Get the user ID
      const { data: users } = await supabase.auth.admin.listUsers()
      const adminUser = users.users.find(user => user.email === email)
      
      if (!adminUser) {
        throw new Error('Admin user not found')
      }

      // Update the user's password
      const { data, error } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { 
          password: newPassword,
          email_confirm: true // Ensure email is confirmed
        }
      )

      if (error) throw error

      return new Response(JSON.stringify({
        success: true,
        message: 'Admin password reset successfully',
        user_id: adminUser.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action or email' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Admin password reset error:', error)
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})