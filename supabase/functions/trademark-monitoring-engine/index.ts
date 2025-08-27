import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TrademarkScanRequest {
  action: string
  trademark_id: string
  scan_type: 'surface' | 'deep' | 'comprehensive'
  platforms: string[]
  search_terms: string[]
  jurisdictions: string[]
  similarity_threshold: number
  fuzzy_matching: boolean
  include_expired: boolean
  search_type: 'text' | 'image' | 'phonetic' | 'semantic'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, trademark_id, scan_type, platforms, search_terms, jurisdictions, similarity_threshold, fuzzy_matching, include_expired, search_type: searchType } = await req.json() as TrademarkScanRequest

    console.log(`Trademark monitoring action: ${action} for trademark: ${trademark_id}`)

    if (action === 'scan_trademark') {
      // Simulate trademark scanning across multiple platforms
      const scanResults = await performTrademarkScan({
        trademark_id,
        scan_type,
        platforms,
        search_terms,
        jurisdictions,
        similarity_threshold,
        fuzzy_matching,
        include_expired,
        search_type: searchType
      })

      // Store scan results in database
      const { data: scanRecord, error: scanError } = await supabase
        .from('trademark_monitoring_scans')
        .insert({
          trademark_id,
          scan_type,
          platforms_scanned: platforms,
          jurisdictions_covered: jurisdictions,
          similarity_threshold,
          fuzzy_matching_enabled: fuzzy_matching,
          total_results_found: scanResults.total_matches,
          high_risk_matches: scanResults.high_risk_matches,
          scan_metadata: {
            search_terms,
            include_expired,
            search_type: searchType,
            scan_duration_ms: scanResults.scan_duration_ms,
            platforms_data: scanResults.platform_results
          }
        })
        .select()
        .single()

      if (scanError) {
        console.error('Error storing scan results:', scanError)
        throw scanError
      }

      // Update trademark last monitored timestamp
      await supabase
        .from('trademarks')
        .update({ last_monitored_at: new Date().toISOString() })
        .eq('id', trademark_id)

      return new Response(
        JSON.stringify({
          success: true,
          scan_id: scanRecord.id,
          results: scanResults,
          message: `Trademark scan completed successfully. Found ${scanResults.total_matches} potential matches.`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action specified' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )

  } catch (error) {
    console.error('Trademark monitoring error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function performTrademarkScan(params: {
  trademark_id: string
  scan_type: string
  platforms: string[]
  search_terms: string[]
  jurisdictions: string[]
  similarity_threshold: number
  fuzzy_matching: boolean
  include_expired: boolean
  search_type: string
}) {
  const startTime = Date.now()
  
  // Simulate comprehensive trademark scanning
  const platforms = params.platforms.length > 0 ? params.platforms : [
    'USPTO', 'EUIPO', 'WIPO', 'UKIPO', 'CIPO', 'JPO', 'KIPO', 'SAIC',
    'Amazon', 'eBay', 'Alibaba', 'Social Media', 'Domain Names', 'App Stores'
  ]

  const platformResults = []
  let totalMatches = 0
  let highRiskMatches = 0

  for (const platform of platforms) {
    // Simulate platform-specific scanning
    const platformMatches = await simulatePlatformScan(platform, params.search_terms, params.similarity_threshold)
    platformResults.push({
      platform,
      matches_found: platformMatches.length,
      high_risk_count: platformMatches.filter(m => m.risk_level === 'high').length,
      results: platformMatches.slice(0, 10) // Limit results for demo
    })
    
    totalMatches += platformMatches.length
    highRiskMatches += platformMatches.filter(m => m.risk_level === 'high').length
  }

  const scanDuration = Date.now() - startTime

  return {
    total_matches: totalMatches,
    high_risk_matches: highRiskMatches,
    medium_risk_matches: Math.floor(totalMatches * 0.3),
    low_risk_matches: totalMatches - highRiskMatches - Math.floor(totalMatches * 0.3),
    platform_results: platformResults,
    scan_duration_ms: scanDuration,
    jurisdictions_covered: params.jurisdictions,
    scan_timestamp: new Date().toISOString()
  }
}

async function simulatePlatformScan(platform: string, searchTerms: string[], similarityThreshold: number) {
  // Simulate realistic trademark matching results
  const matches = []
  const baseMatches = Math.floor(Math.random() * 15) + 2

  for (let i = 0; i < baseMatches; i++) {
    const similarity = Math.random() * (1 - similarityThreshold) + similarityThreshold
    const riskLevel = similarity > 0.8 ? 'high' : similarity > 0.6 ? 'medium' : 'low'
    
    matches.push({
      id: `${platform.toLowerCase()}_${i}_${Date.now()}`,
      trademark_name: generateSimilarTrademark(searchTerms[0] || 'SAMPLE'),
      owner: `${platform} Trademark Owner ${i + 1}`,
      status: Math.random() > 0.7 ? 'registered' : 'pending',
      similarity_score: similarity,
      risk_level: riskLevel,
      jurisdiction: getRandomJurisdiction(),
      registration_number: `${platform.substring(0,3).toUpperCase()}${Math.floor(Math.random() * 1000000)}`,
      filing_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 5).toISOString(),
      classes: [Math.floor(Math.random() * 45) + 1],
      source_url: `https://${platform.toLowerCase()}.example.com/trademark/${i}`,
      platform
    })
  }

  return matches
}

function generateSimilarTrademark(original: string): string {
  const variations = [
    original,
    original.replace(/[aeiou]/gi, 'X'),
    original + 'X',
    'X' + original,
    original.split('').reverse().join(''),
    original.replace(/\s/g, ''),
    original + ' COMPANY',
    original + ' CORP'
  ]
  
  return variations[Math.floor(Math.random() * variations.length)]
}

function getRandomJurisdiction(): string {
  const jurisdictions = ['US', 'EU', 'UK', 'CA', 'AU', 'JP', 'KR', 'CN', 'IN', 'BR']
  return jurisdictions[Math.floor(Math.random() * jurisdictions.length)]
}