import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
  const { jurisdiction, case_type } = params

  // Simulate legal action initiation
  const mockCaseId = crypto.randomUUID()
  
  // Find available legal professional in jurisdiction
  const { data: professionals } = await supabase
    .from('legal_professionals')
    .select('*')
    .contains('jurisdictions', [jurisdiction])
    .eq('accepts_new_clients', true)
    .limit(1)

  const assignedProfessional = professionals?.[0]

  return {
    success: true,
    case_id: mockCaseId,
    jurisdiction,
    case_type,
    assigned_professional: assignedProfessional?.full_name,
    estimated_timeline: '2-4 weeks',
    estimated_cost: '$2,500 - $5,000',
    next_steps: [
      'Document collection and review',
      'Legal strategy development',
      'Initial filing preparation',
      'Client consultation scheduling'
    ]
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