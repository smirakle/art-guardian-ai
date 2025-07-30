import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { protectionRecordId, violationType, sourceUrl, evidenceData, confidenceScore } = await req.json()

    // Create violation record
    const { data: violation, error: violationError } = await supabaseClient
      .from('ai_training_violations')
      .insert({
        protection_record_id: protectionRecordId,
        violation_type: violationType,
        source_url: sourceUrl,
        evidence_data: evidenceData,
        confidence_score: confidenceScore,
        status: 'pending'
      })
      .select()
      .single()

    if (violationError) {
      throw violationError
    }

    // Get protection record details
    const { data: protectionRecord } = await supabaseClient
      .from('ai_protection_records')
      .select(`
        *,
        artwork:artwork_id (
          title,
          user_id
        )
      `)
      .eq('id', protectionRecordId)
      .single()

    if (protectionRecord?.artwork?.user_id) {
      // Create alert for user
      await supabaseClient
        .from('portfolio_alerts')
        .insert({
          portfolio_id: protectionRecord.artwork_id,
          user_id: protectionRecord.artwork.user_id,
          alert_type: 'ai_training_violation',
          severity: confidenceScore > 80 ? 'high' : 'medium',
          title: 'AI Training Violation Detected',
          message: `Potential ${violationType.replace('_', ' ')} detected for "${protectionRecord.artwork.title}"`,
          metadata: {
            violation_id: violation.id,
            source_url: sourceUrl,
            confidence_score: confidenceScore
          }
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        violation_id: violation.id,
        message: 'Violation recorded and user notified'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})