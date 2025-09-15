import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsRequest {
  action: string
  user_id: string
  time_range?: string
  metrics?: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, user_id, time_range = '30d', metrics = ['all'] } = await req.json() as AnalyticsRequest

    console.log(`Real trademark analytics request: ${action} for user: ${user_id}`)

    let analyticsData = {}

    switch (action) {
      case 'portfolio_overview':
        analyticsData = await getPortfolioOverview(supabase, user_id, time_range)
        break
      
      case 'threat_analysis':
        analyticsData = await getThreatAnalysis(supabase, user_id, time_range)
        break
      
      case 'market_intelligence':
        analyticsData = await getMarketIntelligence(supabase, user_id, time_range)
        break
      
      case 'compliance_report':
        analyticsData = await getComplianceReport(supabase, user_id, time_range)
        break
      
      case 'roi_analysis':
        analyticsData = await getROIAnalysis(supabase, user_id, time_range)
        break
      
      default:
        analyticsData = await getComprehensiveAnalytics(supabase, user_id, time_range)
    }

    return new Response(JSON.stringify({
      success: true,
      data: analyticsData,
      generated_at: new Date().toISOString(),
      time_range,
      user_id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Real trademark analytics error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function getPortfolioOverview(supabase: any, userId: string, timeRange: string) {
  const { startDate, endDate } = getDateRange(timeRange)
  
  // Get trademark portfolio stats
  const { data: trademarks } = await supabase
    .from('trademarks')
    .select('*')
    .eq('user_id', userId)
  
  // Get recent search results
  const { data: searchResults } = await supabase
    .from('trademark_search_results')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
  
  // Get monitoring scans
  const { data: scans } = await supabase
    .from('trademark_monitoring_scans')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  const totalScans = scans?.length || 0
  const totalMatches = searchResults?.reduce((sum, result) => sum + (result.total_matches || 0), 0) || 0
  const highRiskMatches = searchResults?.reduce((sum, result) => sum + (result.high_risk_matches || 0), 0) || 0
  
  return {
    portfolio_size: trademarks?.length || 0,
    active_monitoring: trademarks?.filter(t => t.monitoring_enabled).length || 0,
    total_scans: totalScans,
    total_matches_found: totalMatches,
    high_risk_threats: highRiskMatches,
    protection_score: calculateProtectionScore(totalScans, totalMatches, highRiskMatches),
    recent_activity: scans?.slice(0, 10) || [],
    jurisdictions_covered: [...new Set(trademarks?.map(t => t.jurisdiction) || [])],
    classes_covered: [...new Set(trademarks?.flatMap(t => t.classes || []) || [])]
  }
}

async function getThreatAnalysis(supabase: any, userId: string, timeRange: string) {
  const { startDate, endDate } = getDateRange(timeRange)
  
  const { data: searchResults } = await supabase
    .from('trademark_search_results')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  const allMatches = searchResults?.flatMap(result => result.results || []) || []
  
  const threatsByRisk = {
    high: allMatches.filter(m => m.risk_level === 'high').length,
    medium: allMatches.filter(m => m.risk_level === 'medium').length,
    low: allMatches.filter(m => m.risk_level === 'low').length
  }
  
  const threatsByJurisdiction = allMatches.reduce((acc: any, match) => {
    acc[match.jurisdiction] = (acc[match.jurisdiction] || 0) + 1
    return acc
  }, {})
  
  const threatsBySource = allMatches.reduce((acc: any, match) => {
    acc[match.source] = (acc[match.source] || 0) + 1
    return acc
  }, {})

  // AI-powered threat prediction
  const threatPrediction = await generateThreatPrediction(allMatches)
  
  return {
    threat_summary: {
      total_threats: allMatches.length,
      new_threats_this_period: allMatches.length,
      resolved_threats: 0, // TODO: Track resolved threats
      pending_threats: allMatches.filter(m => m.status !== 'resolved').length
    },
    risk_distribution: threatsByRisk,
    geographic_distribution: threatsByJurisdiction,
    source_distribution: threatsBySource,
    trend_analysis: calculateThreatTrends(searchResults || []),
    threat_prediction: threatPrediction,
    recommended_actions: generateRecommendedActions(allMatches)
  }
}

async function getMarketIntelligence(supabase: any, userId: string, timeRange: string) {
  const { startDate, endDate } = getDateRange(timeRange)
  
  // Get user's trademarks for context
  const { data: userTrademarks } = await supabase
    .from('trademarks')
    .select('*')
    .eq('user_id', userId)
  
  // Get all search results for market analysis
  const { data: allSearchResults } = await supabase
    .from('trademark_search_results')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .limit(1000)

  const marketData = analyzeMarketTrends(allSearchResults || [], userTrademarks || [])
  
  return {
    market_overview: {
      total_applications_period: marketData.totalApplications,
      trending_classes: marketData.trendingClasses,
      emerging_jurisdictions: marketData.emergingJurisdictions,
      competitive_landscape: marketData.competitiveLandscape
    },
    industry_insights: await generateIndustryInsights(userTrademarks || []),
    competitor_analysis: marketData.competitorAnalysis,
    opportunity_identification: marketData.opportunities,
    market_predictions: await generateMarketPredictions(marketData)
  }
}

async function getComplianceReport(supabase: any, userId: string, timeRange: string) {
  const { data: userTrademarks } = await supabase
    .from('trademarks')
    .select('*')
    .eq('user_id', userId)
  
  const complianceIssues = []
  const recommendations = []
  
  for (const trademark of userTrademarks || []) {
    // Check renewal dates
    if (trademark.renewal_date && new Date(trademark.renewal_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) {
      complianceIssues.push({
        type: 'renewal_due',
        trademark_id: trademark.id,
        severity: 'high',
        message: `Trademark "${trademark.mark}" renewal due within 90 days`,
        due_date: trademark.renewal_date
      })
    }
    
    // Check usage requirements
    if (!trademark.use_statement_filed && trademark.status === 'REGISTERED') {
      complianceIssues.push({
        type: 'use_statement_required',
        trademark_id: trademark.id,
        severity: 'medium',
        message: `Usage statement required for "${trademark.mark}"`
      })
    }
  }
  
  return {
    compliance_score: calculateComplianceScore(complianceIssues),
    issues_identified: complianceIssues,
    upcoming_deadlines: getUpcomingDeadlines(userTrademarks || []),
    maintenance_requirements: getMaintenanceRequirements(userTrademarks || []),
    recommendations: generateComplianceRecommendations(complianceIssues)
  }
}

async function getROIAnalysis(supabase: any, userId: string, timeRange: string) {
  const { startDate, endDate } = getDateRange(timeRange)
  
  const { data: userSub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  const { data: scans } = await supabase
    .from('trademark_monitoring_scans')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
  
  const { data: threats } = await supabase
    .from('trademark_search_results')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
  
  const subscriptionCost = calculateSubscriptionCost(userSub, timeRange)
  const threatsDetected = threats?.reduce((sum, result) => sum + (result.high_risk_matches || 0), 0) || 0
  const estimatedDamagesPrevented = threatsDetected * 25000 // Estimated $25k per trademark infringement
  const roi = subscriptionCost > 0 ? ((estimatedDamagesPrevented - subscriptionCost) / subscriptionCost) * 100 : 0
  
  return {
    investment_summary: {
      subscription_cost: subscriptionCost,
      period: timeRange,
      cost_per_scan: scans?.length ? subscriptionCost / scans.length : 0
    },
    value_generated: {
      threats_detected: threatsDetected,
      estimated_damages_prevented: estimatedDamagesPrevented,
      cost_savings: estimatedDamagesPrevented - subscriptionCost
    },
    roi_metrics: {
      roi_percentage: roi,
      payback_period: calculatePaybackPeriod(subscriptionCost, estimatedDamagesPrevented),
      value_score: roi > 100 ? 'Excellent' : roi > 50 ? 'Good' : roi > 0 ? 'Positive' : 'Needs Improvement'
    },
    optimization_recommendations: generateROIRecommendations(roi, threatsDetected, scans?.length || 0)
  }
}

async function getComprehensiveAnalytics(supabase: any, userId: string, timeRange: string) {
  const [portfolio, threats, market, compliance, roi] = await Promise.all([
    getPortfolioOverview(supabase, userId, timeRange),
    getThreatAnalysis(supabase, userId, timeRange),
    getMarketIntelligence(supabase, userId, timeRange),
    getComplianceReport(supabase, userId, timeRange),
    getROIAnalysis(supabase, userId, timeRange)
  ])
  
  return {
    executive_summary: generateExecutiveSummary(portfolio, threats, compliance, roi),
    portfolio_overview: portfolio,
    threat_analysis: threats,
    market_intelligence: market,
    compliance_report: compliance,
    roi_analysis: roi,
    action_items: generatePriorityActionItems(threats, compliance)
  }
}

// Helper functions
function getDateRange(timeRange: string) {
  const endDate = new Date()
  const startDate = new Date()
  
  switch (timeRange) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7)
      break
    case '30d':
      startDate.setDate(endDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(endDate.getDate() - 90)
      break
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
    default:
      startDate.setDate(endDate.getDate() - 30)
  }
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  }
}

function calculateProtectionScore(scans: number, matches: number, highRisk: number): number {
  if (scans === 0) return 0
  const riskRatio = highRisk / Math.max(matches, 1)
  return Math.max(0, Math.min(100, 100 - (riskRatio * 100)))
}

async function generateThreatPrediction(matches: any[]) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiApiKey) return { prediction: 'AI analysis unavailable' }
  
  try {
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
          content: 'You are a trademark analytics expert. Analyze threat patterns and predict future risks.'
        }, {
          role: 'user',
          content: `Analyze these trademark threats and predict future risks: ${JSON.stringify(matches.slice(0, 10))}`
        }],
        temperature: 0.3,
        max_tokens: 500
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      return { prediction: data.choices[0].message.content }
    }
  } catch (error) {
    console.error('AI threat prediction failed:', error)
  }
  
  return { prediction: 'Analysis temporarily unavailable' }
}

function calculateThreatTrends(searchResults: any[]) {
  // Group by date and calculate trends
  const dailyTrends = searchResults.reduce((acc: any, result) => {
    const date = new Date(result.created_at).toDateString()
    acc[date] = (acc[date] || 0) + (result.high_risk_matches || 0)
    return acc
  }, {})
  
  const dates = Object.keys(dailyTrends).sort()
  const values = dates.map(date => dailyTrends[date])
  
  return {
    trend_direction: calculateTrendDirection(values),
    daily_averages: dailyTrends,
    peak_day: dates[values.indexOf(Math.max(...values))],
    trend_percentage: calculateTrendPercentage(values)
  }
}

function generateRecommendedActions(matches: any[]) {
  const actions = []
  
  const highRiskMatches = matches.filter(m => m.risk_level === 'high')
  if (highRiskMatches.length > 0) {
    actions.push({
      priority: 'high',
      action: 'Review high-risk trademark conflicts',
      count: highRiskMatches.length,
      estimated_time: '2-4 hours'
    })
  }
  
  const exactMatches = matches.filter(m => m.exact_match)
  if (exactMatches.length > 0) {
    actions.push({
      priority: 'critical',
      action: 'Investigate exact trademark matches',
      count: exactMatches.length,
      estimated_time: '4-8 hours'
    })
  }
  
  return actions
}

function analyzeMarketTrends(allResults: any[], userTrademarks: any[]) {
  const allMatches = allResults.flatMap(r => r.results || [])
  
  return {
    totalApplications: allMatches.length,
    trendingClasses: calculateTrendingClasses(allMatches),
    emergingJurisdictions: calculateEmergingJurisdictions(allMatches),
    competitiveLandscape: analyzeCompetitors(allMatches, userTrademarks),
    competitorAnalysis: generateCompetitorAnalysis(allMatches),
    opportunities: identifyOpportunities(allMatches, userTrademarks)
  }
}

async function generateIndustryInsights(userTrademarks: any[]) {
  const classes = [...new Set(userTrademarks.flatMap(t => t.classes || []))]
  return {
    primary_industries: classes,
    market_saturation: calculateMarketSaturation(classes),
    growth_opportunities: identifyGrowthOpportunities(classes)
  }
}

async function generateMarketPredictions(marketData: any) {
  return {
    predicted_growth: 'Moderate growth expected in trademark filings',
    emerging_trends: ['AI and technology trademarks increasing', 'Sustainability-focused marks growing'],
    risk_factors: ['Increased competition in core markets']
  }
}

function calculateComplianceScore(issues: any[]): number {
  const highSeverity = issues.filter(i => i.severity === 'high').length
  const mediumSeverity = issues.filter(i => i.severity === 'medium').length
  
  const penalty = (highSeverity * 20) + (mediumSeverity * 10)
  return Math.max(0, 100 - penalty)
}

function getUpcomingDeadlines(trademarks: any[]) {
  return trademarks
    .filter(t => t.renewal_date)
    .map(t => ({
      trademark: t.mark,
      deadline: t.renewal_date,
      type: 'renewal',
      days_remaining: Math.ceil((new Date(t.renewal_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => a.days_remaining - b.days_remaining)
}

function getMaintenanceRequirements(trademarks: any[]) {
  return trademarks.map(t => ({
    trademark: t.mark,
    status: t.status,
    next_action: determineNextAction(t),
    priority: calculatePriority(t)
  }))
}

function generateComplianceRecommendations(issues: any[]) {
  return issues.map(issue => ({
    issue_type: issue.type,
    recommendation: getRecommendationForIssue(issue.type),
    urgency: issue.severity,
    estimated_cost: getEstimatedCost(issue.type)
  }))
}

function calculateSubscriptionCost(subscription: any, timeRange: string): number {
  if (!subscription) return 0
  
  const monthlyPrices = {
    free: 0,
    starter: 49,
    professional: 149,
    enterprise: 399
  }
  
  const monthlyPrice = monthlyPrices[subscription.plan_id as keyof typeof monthlyPrices] || 0
  
  switch (timeRange) {
    case '7d': return monthlyPrice * 0.25
    case '30d': return monthlyPrice
    case '90d': return monthlyPrice * 3
    case '1y': return monthlyPrice * 12
    default: return monthlyPrice
  }
}

function calculatePaybackPeriod(cost: number, value: number): string {
  if (value <= cost) return 'N/A'
  const months = Math.ceil(cost / (value / 12))
  return `${months} months`
}

function generateROIRecommendations(roi: number, threats: number, scans: number) {
  const recommendations = []
  
  if (roi < 50) {
    recommendations.push('Consider increasing monitoring frequency for better threat detection')
  }
  
  if (threats > 10) {
    recommendations.push('High threat volume detected - consider legal consultation')
  }
  
  if (scans < 5) {
    recommendations.push('Increase monitoring coverage across more platforms')
  }
  
  return recommendations
}

function generateExecutiveSummary(portfolio: any, threats: any, compliance: any, roi: any) {
  return {
    key_metrics: {
      portfolio_size: portfolio.portfolio_size,
      protection_score: portfolio.protection_score,
      threats_detected: threats.threat_summary.total_threats,
      compliance_score: compliance.compliance_score,
      roi_percentage: roi.roi_metrics.roi_percentage
    },
    status_overview: determineOverallStatus(portfolio, threats, compliance, roi),
    priority_actions: 3,
    next_review_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
}

function generatePriorityActionItems(threats: any, compliance: any) {
  const actions = []
  
  if (threats.threat_summary.total_threats > 0) {
    actions.push({
      priority: 1,
      action: 'Review and respond to trademark threats',
      category: 'threat_management',
      estimated_time: '2-4 hours'
    })
  }
  
  if (compliance.issues_identified.length > 0) {
    actions.push({
      priority: 2,
      action: 'Address compliance issues',
      category: 'compliance',
      estimated_time: '1-2 hours'
    })
  }
  
  return actions.slice(0, 5)
}

// Additional helper functions for calculations
function calculateTrendDirection(values: number[]): string {
  if (values.length < 2) return 'stable'
  const recent = values.slice(-3).reduce((a, b) => a + b, 0) / 3
  const earlier = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3
  
  if (recent > earlier * 1.1) return 'increasing'
  if (recent < earlier * 0.9) return 'decreasing'
  return 'stable'
}

function calculateTrendPercentage(values: number[]): number {
  if (values.length < 2) return 0
  const first = values[0]
  const last = values[values.length - 1]
  if (first === 0) return last > 0 ? 100 : 0
  return ((last - first) / first) * 100
}

function calculateTrendingClasses(matches: any[]): string[] {
  const classCounts = matches.reduce((acc: any, match) => {
    (match.classes || []).forEach((cls: string) => {
      acc[cls] = (acc[cls] || 0) + 1
    })
    return acc
  }, {})
  
  return Object.entries(classCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([cls]) => cls)
}

function calculateEmergingJurisdictions(matches: any[]): string[] {
  const jurisdictionCounts = matches.reduce((acc: any, match) => {
    acc[match.jurisdiction] = (acc[match.jurisdiction] || 0) + 1
    return acc
  }, {})
  
  return Object.keys(jurisdictionCounts).slice(0, 3)
}

function analyzeCompetitors(matches: any[], userTrademarks: any[]): any {
  const competitors = matches.reduce((acc: any, match) => {
    if (match.owner && !userTrademarks.some(t => t.owner === match.owner)) {
      acc[match.owner] = (acc[match.owner] || 0) + 1
    }
    return acc
  }, {})
  
  return Object.entries(competitors)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .reduce((acc, [owner, count]) => {
      acc[owner] = count
      return acc
    }, {})
}

function generateCompetitorAnalysis(matches: any[]): any[] {
  return Object.entries(
    matches.reduce((acc: any, match) => {
      if (match.owner) {
        if (!acc[match.owner]) {
          acc[match.owner] = { count: 0, recent_activity: 0, risk_level: 'low' }
        }
        acc[match.owner].count++
        if (new Date(match.filing_date || match.registration_date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) {
          acc[match.owner].recent_activity++
        }
        if (match.risk_level === 'high') {
          acc[match.owner].risk_level = 'high'
        }
      }
      return acc
    }, {})
  ).slice(0, 5)
}

function identifyOpportunities(matches: any[], userTrademarks: any[]): any[] {
  const userClasses = new Set(userTrademarks.flatMap(t => t.classes || []))
  const availableClasses = new Set()
  
  // Identify underrepresented classes
  for (let i = 1; i <= 45; i++) {
    if (!userClasses.has(i.toString()) && matches.filter(m => m.classes?.includes(i.toString())).length < 10) {
      availableClasses.add(i.toString())
    }
  }
  
  return Array.from(availableClasses).slice(0, 5).map(cls => ({
    class: cls,
    opportunity_type: 'underrepresented_class',
    competition_level: 'low',
    recommendation: `Consider trademark protection in class ${cls}`
  }))
}

function calculateMarketSaturation(classes: string[]): any {
  return classes.reduce((acc: any, cls) => {
    acc[cls] = Math.random() * 100 // Placeholder - would use real market data
    return acc
  }, {})
}

function identifyGrowthOpportunities(classes: string[]): string[] {
  return classes.filter(() => Math.random() > 0.5).slice(0, 3)
}

function determineNextAction(trademark: any): string {
  if (trademark.status === 'PENDING') return 'Monitor application status'
  if (trademark.renewal_date && new Date(trademark.renewal_date) < new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)) {
    return 'Prepare renewal documentation'
  }
  return 'Continue monitoring'
}

function calculatePriority(trademark: any): string {
  if (trademark.renewal_date && new Date(trademark.renewal_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) {
    return 'high'
  }
  if (trademark.status === 'PENDING') return 'medium'
  return 'low'
}

function getRecommendationForIssue(issueType: string): string {
  const recommendations = {
    renewal_due: 'File renewal application with USPTO/relevant authority',
    use_statement_required: 'Submit declaration of continued use with evidence',
    maintenance_overdue: 'Immediately file required maintenance documents'
  }
  return recommendations[issueType as keyof typeof recommendations] || 'Consult trademark attorney'
}

function getEstimatedCost(issueType: string): number {
  const costs = {
    renewal_due: 500,
    use_statement_required: 300,
    maintenance_overdue: 750
  }
  return costs[issueType as keyof typeof costs] || 1000
}

function determineOverallStatus(portfolio: any, threats: any, compliance: any, roi: any): string {
  const scores = [portfolio.protection_score, compliance.compliance_score, Math.min(100, roi.roi_metrics.roi_percentage)]
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
  
  if (avgScore >= 80) return 'excellent'
  if (avgScore >= 60) return 'good'
  if (avgScore >= 40) return 'needs_attention'
  return 'critical'
}