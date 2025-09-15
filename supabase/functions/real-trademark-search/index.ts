import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TrademarkSearchRequest {
  action: string
  query: string
  jurisdictions?: string[]
  classifications?: string[]
  similarity_threshold?: number
  platforms?: string[]
  user_id?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, query, jurisdictions = ['US'], classifications = [], similarity_threshold = 0.8, platforms = ['USPTO', 'EUIPO', 'WIPO'], user_id } = await req.json() as TrademarkSearchRequest

    console.log(`Real trademark search initiated: ${action} for query: ${query}`)

    if (action === 'search') {
      const results = await performRealTrademarkSearch(query, jurisdictions, classifications, platforms, similarity_threshold)
      
      // Store search results in database
      if (user_id) {
        await supabase.from('trademark_search_results').insert({
          user_id,
          query,
          jurisdictions,
          classifications,
          platforms,
          results: results.matches,
          total_matches: results.total_matches,
          high_risk_matches: results.high_risk_matches,
          search_metadata: {
            similarity_threshold,
            search_duration_ms: results.search_duration_ms,
            apis_used: results.apis_used
          }
        })
      }

      return new Response(JSON.stringify({
        success: true,
        data: results,
        timestamp: new Date().toISOString()
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
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function performRealTrademarkSearch(query: string, jurisdictions: string[], classifications: string[], platforms: string[], threshold: number) {
  const startTime = Date.now()
  const apis_used: string[] = []
  const matches: any[] = []

  // USPTO Search
  if (platforms.includes('USPTO') && jurisdictions.includes('US')) {
    try {
      const usptoResults = await searchUSPTO(query, classifications)
      matches.push(...usptoResults)
      apis_used.push('USPTO')
      console.log(`USPTO search returned ${usptoResults.length} results`)
    } catch (error) {
      console.error('USPTO search failed:', error)
    }
  }

  // EUIPO Search (European Union)
  if (platforms.includes('EUIPO') && (jurisdictions.includes('EU') || jurisdictions.includes('EUROPE'))) {
    try {
      const euipoResults = await searchEUIPO(query, classifications)
      matches.push(...euipoResults)
      apis_used.push('EUIPO')
      console.log(`EUIPO search returned ${euipoResults.length} results`)
    } catch (error) {
      console.error('EUIPO search failed:', error)
    }
  }

  // WIPO Global Database Search
  if (platforms.includes('WIPO')) {
    try {
      const wipoResults = await searchWIPO(query, jurisdictions, classifications)
      matches.push(...wipoResults)
      apis_used.push('WIPO')
      console.log(`WIPO search returned ${wipoResults.length} results`)
    } catch (error) {
      console.error('WIPO search failed:', error)
    }
  }

  // AI-powered similarity analysis using OpenAI
  const enhancedMatches = await performAISimilarityAnalysis(query, matches, threshold)

  const high_risk_matches = enhancedMatches.filter(match => 
    match.similarity_score >= 0.9 || 
    match.exact_match || 
    match.risk_level === 'high'
  ).length

  return {
    matches: enhancedMatches,
    total_matches: enhancedMatches.length,
    high_risk_matches,
    search_duration_ms: Date.now() - startTime,
    apis_used,
    jurisdictions_searched: jurisdictions,
    platforms_searched: platforms,
    query_analyzed: query
  }
}

async function searchUSPTO(query: string, classifications: string[]) {
  const usptoApiKey = Deno.env.get('USPTO_API_KEY')
  if (!usptoApiKey) throw new Error('USPTO API key not configured')

  try {
    // USPTO TESS API search
    const searchUrl = `https://developer.uspto.gov/api/v1/trademark/search`
    const searchParams = new URLSearchParams({
      query: `mark:${query}`,
      limit: '100',
      sort: 'relevance'
    })

    if (classifications.length > 0) {
      searchParams.append('class', classifications.join(','))
    }

    const response = await fetch(`${searchUrl}?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${usptoApiKey}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`USPTO API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return (data.results || []).map((trademark: any) => ({
      id: trademark.serial_number || trademark.registration_number,
      mark: trademark.mark_identification || trademark.word_mark,
      owner: trademark.owner_name || trademark.applicant_name,
      status: trademark.status_type || trademark.mark_status,
      filing_date: trademark.filing_date,
      registration_date: trademark.registration_date,
      classes: trademark.international_class_codes || [],
      jurisdiction: 'US',
      source: 'USPTO',
      source_url: `https://tsdr.uspto.gov/documentviewer?caseId=${trademark.serial_number || trademark.registration_number}&docId=SER`,
      similarity_score: calculateBasicSimilarity(query, trademark.mark_identification || trademark.word_mark),
      exact_match: (trademark.mark_identification || trademark.word_mark)?.toLowerCase() === query.toLowerCase(),
      risk_level: determineRiskLevel(trademark, query)
    }))
  } catch (error) {
    console.error('USPTO search error:', error)
    return []
  }
}

async function searchEUIPO(query: string, classifications: string[]) {
  try {
    // EUIPO eSearch plus API (public access)
    const searchUrl = 'https://euipo.europa.eu/eSearch/plus'
    const params = {
      term: query,
      type: 'trademark',
      limit: 100
    }

    // Note: EUIPO doesn't require API key for basic searches
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      throw new Error(`EUIPO API error: ${response.status}`)
    }

    const data = await response.json()
    
    return (data.trademarks || []).map((trademark: any) => ({
      id: trademark.application_number || trademark.registration_number,
      mark: trademark.mark,
      owner: trademark.owner,
      status: trademark.status,
      filing_date: trademark.filing_date,
      registration_date: trademark.registration_date,
      classes: trademark.nice_classes || [],
      jurisdiction: 'EU',
      source: 'EUIPO',
      source_url: `https://euipo.europa.eu/eSearch/#details/trademarks/${trademark.application_number}`,
      similarity_score: calculateBasicSimilarity(query, trademark.mark),
      exact_match: trademark.mark?.toLowerCase() === query.toLowerCase(),
      risk_level: determineRiskLevel(trademark, query)
    }))
  } catch (error) {
    console.error('EUIPO search error:', error)
    return []
  }
}

async function searchWIPO(query: string, jurisdictions: string[], classifications: string[]) {
  try {
    // WIPO Global Brand Database API
    const searchUrl = 'https://www.wipo.int/branddb/search'
    const params = {
      query: query,
      countries: jurisdictions.filter(j => j !== 'US' && j !== 'EU'),
      limit: 100
    }

    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      throw new Error(`WIPO API error: ${response.status}`)
    }

    const data = await response.json()
    
    return (data.marks || []).map((trademark: any) => ({
      id: trademark.registration_number,
      mark: trademark.mark_text,
      owner: trademark.holder,
      status: trademark.status,
      filing_date: trademark.filing_date,
      registration_date: trademark.registration_date,
      classes: trademark.nice_classes || [],
      jurisdiction: trademark.designated_contracting_parties?.[0] || 'WIPO',
      source: 'WIPO',
      source_url: `https://www.wipo.int/branddb/en/showData.jsp?ID=${trademark.registration_number}`,
      similarity_score: calculateBasicSimilarity(query, trademark.mark_text),
      exact_match: trademark.mark_text?.toLowerCase() === query.toLowerCase(),
      risk_level: determineRiskLevel(trademark, query)
    }))
  } catch (error) {
    console.error('WIPO search error:', error)
    return []
  }
}

async function performAISimilarityAnalysis(query: string, matches: any[], threshold: number) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiApiKey || matches.length === 0) return matches

  try {
    // Analyze similarity using OpenAI for better accuracy
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: 'You are a trademark similarity expert. Analyze trademark similarity considering phonetic similarity, visual similarity, conceptual similarity, and legal precedent. Return only a JSON array with similarity scores (0-1) and risk assessments.'
        }, {
          role: 'user',
          content: `Analyze similarity between "${query}" and these trademarks: ${matches.slice(0, 20).map(m => m.mark).join(', ')}. Return JSON: [{"mark": "trademark", "similarity_score": 0.85, "risk_level": "high|medium|low", "reasoning": "brief explanation"}]`
        }],
        temperature: 0.2,
        max_tokens: 2000
      })
    })

    if (response.ok) {
      const aiData = await response.json()
      const aiAnalysis = JSON.parse(aiData.choices[0].message.content)
      
      // Enhance matches with AI analysis
      return matches.map(match => {
        const aiResult = aiAnalysis.find((ai: any) => ai.mark === match.mark)
        if (aiResult) {
          return {
            ...match,
            similarity_score: aiResult.similarity_score,
            risk_level: aiResult.risk_level,
            ai_reasoning: aiResult.reasoning,
            ai_enhanced: true
          }
        }
        return match
      })
    }
  } catch (error) {
    console.error('AI similarity analysis failed:', error)
  }

  return matches
}

function calculateBasicSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0
  
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  if (s1 === s2) return 1.0
  
  // Levenshtein distance based similarity
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null))
  
  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      )
    }
  }
  
  const maxLength = Math.max(s1.length, s2.length)
  return (maxLength - matrix[s2.length][s1.length]) / maxLength
}

function determineRiskLevel(trademark: any, query: string): string {
  const similarity = calculateBasicSimilarity(query, trademark.mark || trademark.mark_identification || trademark.word_mark || '')
  
  if (similarity >= 0.9 || trademark.status === 'REGISTERED') return 'high'
  if (similarity >= 0.7 || trademark.status === 'PENDING') return 'medium'
  return 'low'
}