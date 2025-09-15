import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    console.log('Admin password reset request received')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Supabase client created')

    const body = await req.json()
    console.log('Request body:', body)

    const { action, email, newPassword } = body

    if (action === 'reset_admin_password' && email === 'shc302@g.harvard.edu') {
      console.log('Processing admin password reset for:', email)
      
      const userId = 'a8743e75-d9b7-4b72-af64-e9c1c42f4236'
      
      // First, let's try to get the user directly
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
      
      if (userError) {
        console.error('Error getting user:', userError)
        throw new Error(`Failed to get user: ${userError.message}`)
      }

      console.log('Found user:', userData.user?.email)

      // Update the user's password using the admin API
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { 
          password: newPassword,
          email_confirm: true
        }
      )

      if (updateError) {
        console.error('Error updating password:', updateError)
        throw new Error(`Failed to update password: ${updateError.message}`)
      }

      console.log('Password updated successfully')

      return new Response(JSON.stringify({
        success: true,
        message: 'Admin password reset successfully',
        user_id: userId
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
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})