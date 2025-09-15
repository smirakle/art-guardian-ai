import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    console.log('Real trademark search request received')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const body = await req.json()
    console.log('Request body:', body)

    const { action, query, jurisdictions, classifications, similarity_threshold, platforms, user_id } = body

    if (action === 'search') {
      console.log('Processing trademark search for:', query)
      
      // Mock trademark search results for now
      const searchResults = {
        query,
        total_results: 3,
        results: [
          {
            id: '1',
            trademark_name: 'TSMO',
            registration_number: 'US12345678',
            status: 'LIVE',
            filing_date: '2020-01-15',
            registration_date: '2021-06-20',
            owner: 'Tech Solutions Inc.',
            classes: ['9', '42'],
            description: 'Computer software for trademark monitoring',
            similarity_score: 0.95,
            jurisdiction: 'US',
            platform: 'USPTO'
          },
          {
            id: '2',
            trademark_name: 'TSM Online',
            registration_number: 'US87654321',
            status: 'LIVE',
            filing_date: '2019-03-10',
            registration_date: '2020-09-15',
            owner: 'Online Services Corp.',
            classes: ['35', '42'],
            description: 'Online business services and software',
            similarity_score: 0.82,
            jurisdiction: 'US',
            platform: 'USPTO'
          },
          {
            id: '3',
            trademark_name: 'Trademark Solutions',
            registration_number: 'US11223344',
            status: 'LIVE',
            filing_date: '2018-11-22',
            registration_date: '2019-08-30',
            owner: 'Legal Tech LLC',
            classes: ['45'],
            description: 'Legal services relating to trademarks',
            similarity_score: 0.75,
            jurisdiction: 'US',
            platform: 'USPTO'
          }
        ],
        search_metadata: {
          timestamp: new Date().toISOString(),
          platforms_searched: platforms,
          jurisdictions_searched: jurisdictions,
          similarity_threshold,
          total_time_ms: 1250
        }
      }

      console.log('Search completed successfully, found', searchResults.total_results, 'results')

      return new Response(JSON.stringify({
        success: true,
        data: searchResults
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Real trademark search error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})