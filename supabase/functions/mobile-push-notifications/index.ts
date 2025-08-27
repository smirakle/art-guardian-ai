import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      user_ids,
      title,
      body,
      data = {},
      platform = 'both'
    } = await req.json()

    if (!user_ids || !Array.isArray(user_ids) || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_ids (array), title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const notifications = []

    // Create notification records for each user
    for (const user_id of user_ids) {
      const { data: notification, error } = await supabaseClient
        .from('mobile_notifications')
        .insert({
          user_id,
          title,
          body,
          data,
          platform,
          status: 'sent'
        })
        .select()
        .single()

      if (error) {
        console.error(`Error creating notification for user ${user_id}:`, error)
        continue
      }

      notifications.push(notification)
    }

    // In a real implementation, this would integrate with:
    // - Firebase Cloud Messaging (FCM) for Android
    // - Apple Push Notification service (APNs) for iOS
    // For now, we'll simulate the sending process

    const successCount = notifications.length
    const failedCount = user_ids.length - successCount

    // Update notification statuses
    for (const notification of notifications) {
      await supabaseClient
        .from('mobile_notifications')
        .update({ 
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', notification.id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failedCount,
        notification_ids: notifications.map(n => n.id)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in mobile-push-notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})