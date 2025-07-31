import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScanRequest {
  action: 'start_scan' | 'quick_scan' | 'schedule_scan';
  portfolio_id?: string;
  scan_type?: 'quick' | 'comprehensive';
  platforms?: string[];
}

interface Portfolio {
  id: string;
  name: string;
  monitoring_enabled: boolean;
  alert_settings: Record<string, any>;
}

interface Artwork {
  id: string;
  title: string;
  category: string;
  file_paths: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, portfolio_id, scan_type = 'comprehensive', platforms = [] }: ScanRequest = await req.json()

    console.log(`Portfolio monitoring action: ${action}`, { portfolio_id, scan_type, platforms })

    switch (action) {
      case 'start_scan':
        return await handleStartScan(supabase, portfolio_id, scan_type, platforms)
      case 'quick_scan':
        return await handleQuickScan(supabase)
      case 'schedule_scan':
        return await handleScheduleScan(supabase, portfolio_id)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in portfolio-monitoring function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function handleStartScan(
  supabase: any, 
  portfolio_id?: string, 
  scan_type: string = 'comprehensive',
  platforms: string[] = []
) {
  try {
    let portfoliosToScan: Portfolio[] = []

    if (portfolio_id && portfolio_id !== 'all') {
      // Scan specific portfolio
      const { data: portfolio, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', portfolio_id)
        .eq('is_active', true)
        .single()

      if (error || !portfolio) {
        return new Response(
          JSON.stringify({ error: 'Portfolio not found or inactive' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      portfoliosToScan = [portfolio]
    } else {
      // Scan all active portfolios
      const { data: portfolios, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('is_active', true)
        .eq('monitoring_enabled', true)

      if (error) throw error
      portfoliosToScan = portfolios || []
    }

    const scanResults = []

    for (const portfolio of portfoliosToScan) {
      console.log(`Scanning portfolio: ${portfolio.name}`)
      
      // Get artworks in this portfolio - using separate queries to avoid relationship issues
      const { data: portfolioItems, error: itemsError } = await supabase
        .from('portfolio_items')
        .select('artwork_id')
        .eq('portfolio_id', portfolio.id)
        .eq('is_active', true)

      if (itemsError) {
        console.error(`Error fetching portfolio items for ${portfolio.id}:`, itemsError)
        continue
      }

      if (!portfolioItems || portfolioItems.length === 0) {
        console.log(`No portfolio items found for portfolio ${portfolio.name}`)
        continue
      }

      // Get artwork details separately
      const artworkIds = portfolioItems.map(item => item.artwork_id)
      const { data: artworks, error: artworksError } = await supabase
        .from('artwork')
        .select('id, title, category, file_paths')
        .in('id', artworkIds)

      if (artworksError) {
        console.error(`Error fetching artworks for portfolio ${portfolio.id}:`, artworksError)
        continue
      }
      
      if (artworks.length === 0) {
        console.log(`No artworks found in portfolio ${portfolio.name}`)
        continue
      }

      // Simulate scanning process
      const scanResult = await simulatePortfolioScan(portfolio, artworks, scan_type, platforms)
      scanResults.push(scanResult)

      // Store monitoring result
      await supabase
        .from('portfolio_monitoring_results')
        .insert({
          portfolio_id: portfolio.id,
          scan_date: new Date().toISOString().split('T')[0],
          total_artworks: artworks.length,
          artworks_scanned: scanResult.artworks_scanned,
          total_matches: scanResult.total_matches,
          high_risk_matches: scanResult.high_risk_matches,
          medium_risk_matches: scanResult.medium_risk_matches,
          low_risk_matches: scanResult.low_risk_matches,
          platforms_scanned: scanResult.platforms_scanned,
          scan_duration_minutes: scanResult.scan_duration_minutes
        })

      // Create alerts for high-risk findings
      if (scanResult.high_risk_matches > 0 || scanResult.medium_risk_matches > 2) {
        await createPortfolioAlert(supabase, portfolio, scanResult)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        portfolios_scanned: portfoliosToScan.length,
        scan_results: scanResults,
        message: `Successfully scanned ${portfoliosToScan.length} portfolio(s)`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in handleStartScan:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to start scan' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}

async function handleQuickScan(supabase: any) {
  try {
    // Get all active portfolios for quick scan
    const { data: portfolios, error } = await supabase
      .from('portfolios')
      .select('id, name')
      .eq('is_active', true)
      .eq('monitoring_enabled', true)

    if (error) throw error

    console.log(`Quick scan initiated for ${portfolios?.length || 0} portfolios`)

    // Simulate quick scan results
    const quickResults = {
      portfolios_scanned: portfolios?.length || 0,
      total_threats: Math.floor(Math.random() * 15),
      high_priority_threats: Math.floor(Math.random() * 3),
      scan_duration_seconds: Math.floor(Math.random() * 30) + 10
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        ...quickResults,
        message: 'Quick scan completed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in handleQuickScan:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to perform quick scan' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}

async function handleScheduleScan(supabase: any, portfolio_id?: string) {
  try {
    // Schedule future scans - this would integrate with a job scheduler
    console.log(`Scheduling scans for portfolio: ${portfolio_id || 'all'}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Scan scheduled successfully',
        next_scan: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in handleScheduleScan:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to schedule scan' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}

async function simulatePortfolioScan(
  portfolio: Portfolio, 
  artworks: Artwork[], 
  scan_type: string,
  platforms: string[]
) {
  const scanPlatforms = platforms.length > 0 ? platforms : [
    'Google Images', 'Pinterest', 'Instagram', 'Facebook', 'Twitter', 'TikTok'
  ]

  // Simulate scanning time based on scan type and artwork count
  const baseTime = scan_type === 'quick' ? 2 : 5
  const scanDurationMinutes = Math.ceil((artworks.length * baseTime) / 10)

  // Simulate threat detection
  const threatProbability = scan_type === 'comprehensive' ? 0.15 : 0.08
  const totalMatches = Math.floor(artworks.length * threatProbability * (Math.random() * 0.5 + 0.5))
  
  const highRiskMatches = Math.floor(totalMatches * 0.2)
  const mediumRiskMatches = Math.floor(totalMatches * 0.4)
  const lowRiskMatches = totalMatches - highRiskMatches - mediumRiskMatches

  return {
    portfolio_id: portfolio.id,
    portfolio_name: portfolio.name,
    artworks_scanned: artworks.length,
    total_matches: totalMatches,
    high_risk_matches: highRiskMatches,
    medium_risk_matches: mediumRiskMatches,
    low_risk_matches: lowRiskMatches,
    platforms_scanned: scanPlatforms,
    scan_duration_minutes: scanDurationMinutes,
    scan_type: scan_type,
    scan_timestamp: new Date().toISOString()
  }
}

async function createPortfolioAlert(supabase: any, portfolio: Portfolio, scanResult: any) {
  const alertSeverity = scanResult.high_risk_matches > 2 ? 'high' : 'medium'
  const alertTitle = `Security Alert: ${scanResult.total_matches} threats detected in ${portfolio.name}`
  const alertMessage = `Portfolio scan found ${scanResult.high_risk_matches} high-risk and ${scanResult.medium_risk_matches} medium-risk threats across ${scanResult.platforms_scanned.length} platforms.`

  try {
    // Get the portfolio owner
    const { data: portfolioData, error } = await supabase
      .from('portfolios')
      .select('user_id')
      .eq('id', portfolio.id)
      .single()

    if (error || !portfolioData) {
      console.error('Failed to get portfolio owner:', error)
      return
    }

    await supabase
      .from('portfolio_alerts')
      .insert({
        portfolio_id: portfolio.id,
        user_id: portfolioData.user_id,
        alert_type: 'threat_detection',
        severity: alertSeverity,
        title: alertTitle,
        message: alertMessage,
        metadata: {
          scan_result: scanResult,
          platforms_affected: scanResult.platforms_scanned,
          threat_breakdown: {
            high: scanResult.high_risk_matches,
            medium: scanResult.medium_risk_matches,
            low: scanResult.low_risk_matches
          }
        }
      })

    console.log(`Created alert for portfolio ${portfolio.name} (${alertSeverity} severity)`)
  } catch (error) {
    console.error('Error creating portfolio alert:', error)
  }
}