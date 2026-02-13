import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { action, ...params } = await req.json()

    let result: any = {}

    switch (action) {
      case 'initiate_legal_action':
        result = await initiateLegalAction(supabaseClient, params)
        break
      
      case 'find_legal_professionals':
        result = await findLegalProfessionals(supabaseClient, params)
        break
      
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function initiateLegalAction(supabase: any, params: any) {
  const { jurisdiction, case_type, user_id } = params

  // Find available legal professional in jurisdiction
  const { data: professionals } = await supabase
    .from('legal_professionals')
    .select('*')
    .contains('jurisdictions', [jurisdiction])
    .eq('accepts_new_clients', true)
    .eq('verified_status', 'verified')
    .limit(1)

  const assignedProfessional = professionals?.[0]

  // Create legal action record
  const legalActionData = {
    user_id: user_id,
    jurisdiction: jurisdiction,
    case_type: case_type,
    professional_id: assignedProfessional?.id || null,
    status: 'initiated',
    estimated_timeline: '2-4 weeks',
    estimated_cost: '$2,500 - $5,000',
    metadata: {
      next_steps: [
        'Document collection and review',
        'Legal strategy development',
        'Initial filing preparation',
        'Client consultation scheduling'
      ],
      priority: 'normal',
      urgency: 'standard'
    }
  }

  const { data: legalAction, error } = await supabase
    .from('legal_actions')
    .insert(legalActionData)
    .select()
    .single()

  if (error) {
    console.error('Failed to create legal action:', error)
    throw new Error('Failed to initiate legal action')
  }

  return {
    success: true,
    case_id: legalAction.id,
    case_reference: `TSMO-${legalAction.id.substring(0, 8).toUpperCase()}`,
    jurisdiction,
    case_type,
    assigned_professional: assignedProfessional?.full_name || 'Assigning professional...',
    professional_contact: assignedProfessional?.email || null,
    estimated_timeline: legalAction.estimated_timeline,
    estimated_cost: legalAction.estimated_cost,
    status: legalAction.status,
    next_steps: legalActionData.metadata.next_steps
  }
}

async function findLegalProfessionals(supabase: any, params: any) {
  const { jurisdiction, specialty } = params

  const { data: professionals, error } = await supabase
    .from('legal_professionals')
    .select('*')
    .contains('jurisdictions', [jurisdiction])
    .contains('specialties', [specialty])
    .eq('verified_status', 'verified')
    .order('rating', { ascending: false })

  if (error) throw error

  return {
    success: true,
    professionals: professionals || [],
    total_found: professionals?.length || 0,
    jurisdiction,
    specialty
  }
}