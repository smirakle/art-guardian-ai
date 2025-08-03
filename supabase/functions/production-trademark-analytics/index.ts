import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsRequest {
  type: 'portfolio' | 'trends' | 'performance' | 'risks' | 'jurisdictions';
  user_id?: string;
  time_range?: 'week' | 'month' | 'quarter' | 'year';
  trademark_id?: string;
  jurisdiction?: string;
  start_date?: string;
  end_date?: string;
}

function logError(error: any, context: string, userId?: string) {
  console.error(`[TRADEMARK_ANALYTICS] ${context}:`, {
    error: error.message,
    stack: error.stack,
    userId,
    timestamp: new Date().toISOString(),
  });
}

function getDateRange(timeRange: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  
  switch (timeRange) {
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setMonth(end.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(end.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      start.setMonth(end.getMonth() - 1);
  }
  
  return { start, end };
}

async function getUserFromToken(authHeader: string): Promise<{ id: string; role: string } | null> {
  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) return null;
    
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    return { id: user.id, role: roleData?.role || 'user' };
  } catch (error) {
    logError(error, 'getUserFromToken');
    return null;
  }
}

async function getPortfolioAnalytics(userId: string, timeRange: string): Promise<any> {
  const { start, end } = getDateRange(timeRange);
  
  try {
    // Get user's trademarks
    const { data: trademarks } = await supabase
      .from('trademarks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (!trademarks || trademarks.length === 0) {
      return {
        total_trademarks: 0,
        monitored_trademarks: 0,
        portfolio_value_score: 0,
        geographic_coverage: [],
        class_distribution: [],
        risk_assessment: { low: 0, medium: 0, high: 0 }
      };
    }

    // Get scans in time range
    const { data: scans } = await supabase
      .from('trademark_monitoring_scans')
      .select('*')
      .eq('user_id', userId)
      .gte('started_at', start.toISOString())
      .lte('started_at', end.toISOString())
      .eq('scan_status', 'completed');

    // Get alerts in time range
    const { data: alerts } = await supabase
      .from('trademark_alerts')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    // Calculate portfolio metrics
    const monitoredTrademarks = trademarks.filter(t => t.monitoring_enabled).length;
    
    // Geographic coverage
    const jurisdictions = [...new Set(trademarks.map(t => t.jurisdiction))];
    const geoCoverage = jurisdictions.map(jurisdiction => ({
      jurisdiction,
      count: trademarks.filter(t => t.jurisdiction === jurisdiction).length,
      percentage: (trademarks.filter(t => t.jurisdiction === jurisdiction).length / trademarks.length) * 100
    }));

    // Class distribution
    const allClasses = trademarks.flatMap(t => t.trademark_class || []);
    const classDistribution = [...new Set(allClasses)].map(cls => ({
      class_number: cls,
      count: allClasses.filter(c => c === cls).length,
      percentage: (allClasses.filter(c => c === cls).length / allClasses.length) * 100
    }));

    // Risk assessment
    const riskAssessment = {
      low: alerts?.filter(a => a.severity === 'low').length || 0,
      medium: alerts?.filter(a => a.severity === 'medium').length || 0,
      high: alerts?.filter(a => a.severity === 'high').length || 0
    };

    // Portfolio value score (0-100)
    const valueFactors = {
      coverage: Math.min(jurisdictions.length * 10, 30), // Max 30 points for geographic coverage
      monitoring: (monitoredTrademarks / trademarks.length) * 20, // Max 20 points for monitoring coverage
      classes: Math.min(classDistribution.length * 5, 25), // Max 25 points for class diversity
      risk: Math.max(25 - (riskAssessment.high * 5 + riskAssessment.medium * 2), 0) // Max 25 points, deducted for risks
    };
    
    const portfolioValueScore = Math.round(
      valueFactors.coverage + valueFactors.monitoring + valueFactors.classes + valueFactors.risk
    );

    return {
      total_trademarks: trademarks.length,
      monitored_trademarks: monitoredTrademarks,
      portfolio_value_score: portfolioValueScore,
      geographic_coverage: geoCoverage,
      class_distribution: classDistribution,
      risk_assessment: riskAssessment,
      recent_scans: scans?.length || 0,
      recent_alerts: alerts?.length || 0,
      value_factors: valueFactors
    };
    
  } catch (error) {
    logError(error, 'getPortfolioAnalytics', userId);
    throw error;
  }
}

async function getTrendAnalytics(userId: string, timeRange: string): Promise<any> {
  const { start, end } = getDateRange(timeRange);
  
  try {
    // Get historical data for trend analysis
    const { data: scanHistory } = await supabase
      .from('trademark_monitoring_scans')
      .select('started_at, total_results_found, high_risk_matches, medium_risk_matches, low_risk_matches')
      .eq('user_id', userId)
      .gte('started_at', start.toISOString())
      .lte('started_at', end.toISOString())
      .eq('scan_status', 'completed')
      .order('started_at', { ascending: true });

    const { data: alertHistory } = await supabase
      .from('trademark_alerts')
      .select('created_at, severity, alert_type')
      .eq('user_id', userId)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: true });

    // Group data by time periods
    const timeGrouping = timeRange === 'week' ? 'day' : timeRange === 'month' ? 'week' : 'month';
    
    // Process scan trends
    const scanTrends = (scanHistory || []).reduce((acc: any, scan) => {
      const date = new Date(scan.started_at);
      const key = timeGrouping === 'day' 
        ? date.toISOString().split('T')[0]
        : timeGrouping === 'week'
        ? `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[key]) {
        acc[key] = { 
          period: key, 
          scans: 0, 
          total_results: 0, 
          high_risk: 0, 
          medium_risk: 0, 
          low_risk: 0 
        };
      }
      
      acc[key].scans += 1;
      acc[key].total_results += scan.total_results_found || 0;
      acc[key].high_risk += scan.high_risk_matches || 0;
      acc[key].medium_risk += scan.medium_risk_matches || 0;
      acc[key].low_risk += scan.low_risk_matches || 0;
      
      return acc;
    }, {});

    // Process alert trends
    const alertTrends = (alertHistory || []).reduce((acc: any, alert) => {
      const date = new Date(alert.created_at);
      const key = timeGrouping === 'day' 
        ? date.toISOString().split('T')[0]
        : timeGrouping === 'week'
        ? `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[key]) {
        acc[key] = { period: key, total: 0, high: 0, medium: 0, low: 0 };
      }
      
      acc[key].total += 1;
      acc[key][alert.severity] += 1;
      
      return acc;
    }, {});

    // Calculate trend indicators
    const scanTrendData = Object.values(scanTrends).sort((a: any, b: any) => a.period.localeCompare(b.period));
    const alertTrendData = Object.values(alertTrends).sort((a: any, b: any) => a.period.localeCompare(b.period));

    // Calculate growth rates
    const calculateGrowthRate = (data: any[], field: string) => {
      if (data.length < 2) return 0;
      const latest = data[data.length - 1][field] || 0;
      const previous = data[data.length - 2][field] || 0;
      return previous === 0 ? 0 : ((latest - previous) / previous) * 100;
    };

    return {
      scan_trends: scanTrendData,
      alert_trends: alertTrendData,
      growth_indicators: {
        scan_growth: calculateGrowthRate(scanTrendData, 'scans'),
        alert_growth: calculateGrowthRate(alertTrendData, 'total'),
        risk_growth: calculateGrowthRate(alertTrendData, 'high')
      },
      summary: {
        total_scans: scanTrendData.reduce((sum: number, item: any) => sum + item.scans, 0),
        total_alerts: alertTrendData.reduce((sum: number, item: any) => sum + item.total, 0),
        avg_results_per_scan: scanTrendData.length > 0 
          ? scanTrendData.reduce((sum: number, item: any) => sum + item.total_results, 0) / scanTrendData.length 
          : 0
      }
    };
    
  } catch (error) {
    logError(error, 'getTrendAnalytics', userId);
    throw error;
  }
}

async function getPerformanceAnalytics(userId: string, timeRange: string): Promise<any> {
  const { start, end } = getDateRange(timeRange);
  
  try {
    // Get performance metrics
    const { data: metrics } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('source_component', 'trademark_monitor')
      .gte('recorded_at', start.toISOString())
      .lte('recorded_at', end.toISOString())
      .contains('additional_data', { user_id: userId });

    const { data: scans } = await supabase
      .from('trademark_monitoring_scans')
      .select('scan_duration_seconds, total_results_found, platforms_scanned')
      .eq('user_id', userId)
      .gte('started_at', start.toISOString())
      .lte('started_at', end.toISOString())
      .eq('scan_status', 'completed');

    // Calculate performance statistics
    const scanDurations = (scans || []).map(s => s.scan_duration_seconds || 0).filter(d => d > 0);
    const resultsFound = (scans || []).map(s => s.total_results_found || 0);
    
    const avgScanDuration = scanDurations.length > 0 
      ? scanDurations.reduce((a, b) => a + b, 0) / scanDurations.length 
      : 0;
    
    const avgResultsPerScan = resultsFound.length > 0 
      ? resultsFound.reduce((a, b) => a + b, 0) / resultsFound.length 
      : 0;

    // Platform performance
    const platformStats = (scans || []).reduce((acc: any, scan) => {
      (scan.platforms_scanned || []).forEach((platform: string) => {
        if (!acc[platform]) acc[platform] = { scans: 0, total_results: 0 };
        acc[platform].scans += 1;
        acc[platform].total_results += scan.total_results_found || 0;
      });
      return acc;
    }, {});

    Object.keys(platformStats).forEach(platform => {
      platformStats[platform].avg_results = platformStats[platform].total_results / platformStats[platform].scans;
    });

    return {
      scan_performance: {
        total_scans: scans?.length || 0,
        avg_duration_seconds: Math.round(avgScanDuration),
        avg_results_per_scan: Math.round(avgResultsPerScan),
        fastest_scan: Math.min(...scanDurations) || 0,
        slowest_scan: Math.max(...scanDurations) || 0
      },
      platform_performance: platformStats,
      efficiency_score: Math.min(100, Math.max(0, 100 - (avgScanDuration / 60) * 10)), // Lower duration = higher score
      reliability_score: scans && scans.length > 0 ? 95 : 0 // High reliability for completed scans
    };
    
  } catch (error) {
    logError(error, 'getPerformanceAnalytics', userId);
    throw error;
  }
}

async function getRiskAnalytics(userId: string, timeRange: string): Promise<any> {
  const { start, end } = getDateRange(timeRange);
  
  try {
    const { data: alerts } = await supabase
      .from('trademark_alerts')
      .select(`
        *,
        trademarks!inner(trademark_name, jurisdiction, trademark_class)
      `)
      .eq('user_id', userId)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    const { data: allTrademarks } = await supabase
      .from('trademarks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (!alerts || !allTrademarks) {
      return {
        overall_risk_score: 0,
        risk_distribution: { low: 0, medium: 0, high: 0 },
        high_risk_trademarks: [],
        risk_by_jurisdiction: [],
        risk_by_class: [],
        recommendations: []
      };
    }

    // Calculate risk scores by trademark
    const trademarkRisks = allTrademarks.map(trademark => {
      const trademarkAlerts = alerts.filter(a => a.trademark_id === trademark.id);
      const highRiskAlerts = trademarkAlerts.filter(a => a.severity === 'high');
      const mediumRiskAlerts = trademarkAlerts.filter(a => a.severity === 'medium');
      
      const riskScore = (highRiskAlerts.length * 10) + (mediumRiskAlerts.length * 5) + (trademarkAlerts.length * 1);
      
      return {
        trademark_id: trademark.id,
        trademark_name: trademark.trademark_name,
        jurisdiction: trademark.jurisdiction,
        risk_score: riskScore,
        alert_count: trademarkAlerts.length,
        high_risk_alerts: highRiskAlerts.length,
        risk_level: riskScore >= 30 ? 'high' : riskScore >= 15 ? 'medium' : 'low'
      };
    });

    // Overall risk score (0-100)
    const maxPossibleRisk = allTrademarks.length * 50; // Theoretical max
    const currentRisk = trademarkRisks.reduce((sum, t) => sum + t.risk_score, 0);
    const overallRiskScore = maxPossibleRisk > 0 ? Math.min(100, (currentRisk / maxPossibleRisk) * 100) : 0;

    // Risk distribution
    const riskDistribution = {
      low: trademarkRisks.filter(t => t.risk_level === 'low').length,
      medium: trademarkRisks.filter(t => t.risk_level === 'medium').length,
      high: trademarkRisks.filter(t => t.risk_level === 'high').length
    };

    // High-risk trademarks
    const highRiskTrademarks = trademarkRisks
      .filter(t => t.risk_level === 'high')
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 10);

    // Risk by jurisdiction
    const riskByJurisdiction = [...new Set(allTrademarks.map(t => t.jurisdiction))].map(jurisdiction => {
      const jurisdictionTrademarks = trademarkRisks.filter(t => t.jurisdiction === jurisdiction);
      const avgRisk = jurisdictionTrademarks.length > 0 
        ? jurisdictionTrademarks.reduce((sum, t) => sum + t.risk_score, 0) / jurisdictionTrademarks.length
        : 0;
      
      return {
        jurisdiction,
        trademark_count: jurisdictionTrademarks.length,
        avg_risk_score: Math.round(avgRisk),
        high_risk_count: jurisdictionTrademarks.filter(t => t.risk_level === 'high').length
      };
    });

    // Risk by class
    const allClasses = allTrademarks.flatMap(t => t.trademark_class || []);
    const riskByClass = [...new Set(allClasses)].map(classNum => {
      const classTrademarks = allTrademarks.filter(t => t.trademark_class?.includes(classNum));
      const classAlerts = alerts.filter(a => 
        classTrademarks.some(t => t.id === a.trademark_id)
      );
      
      return {
        class_number: classNum,
        trademark_count: classTrademarks.length,
        alert_count: classAlerts.length,
        high_risk_alerts: classAlerts.filter(a => a.severity === 'high').length,
        risk_level: classAlerts.filter(a => a.severity === 'high').length > 0 ? 'high' : 
                   classAlerts.filter(a => a.severity === 'medium').length > 0 ? 'medium' : 'low'
      };
    });

    // Generate recommendations
    const recommendations = [];
    
    if (riskDistribution.high > 0) {
      recommendations.push({
        type: 'urgent',
        priority: 'high',
        message: `You have ${riskDistribution.high} high-risk trademark(s) that require immediate attention.`,
        action: 'Review high-risk alerts and consider legal consultation'
      });
    }
    
    if (overallRiskScore > 50) {
      recommendations.push({
        type: 'monitoring',
        priority: 'medium',
        message: 'Your overall risk score is elevated. Consider increasing monitoring frequency.',
        action: 'Enable more comprehensive monitoring across additional platforms'
      });
    }
    
    const unmonitoredCount = allTrademarks.filter(t => !t.monitoring_enabled).length;
    if (unmonitoredCount > 0) {
      recommendations.push({
        type: 'coverage',
        priority: 'medium',
        message: `${unmonitoredCount} trademark(s) are not being monitored.`,
        action: 'Enable monitoring for all active trademarks'
      });
    }

    return {
      overall_risk_score: Math.round(overallRiskScore),
      risk_distribution: riskDistribution,
      high_risk_trademarks: highRiskTrademarks,
      risk_by_jurisdiction: riskByJurisdiction,
      risk_by_class: riskByClass,
      recommendations
    };
    
  } catch (error) {
    logError(error, 'getRiskAnalytics', userId);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const user = await getUserFromToken(authHeader);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const request: AnalyticsRequest = await req.json();
    const timeRange = request.time_range || 'month';
    
    let analytics: any = {};

    switch (request.type) {
      case 'portfolio':
        analytics = await getPortfolioAnalytics(user.id, timeRange);
        break;
        
      case 'trends':
        analytics = await getTrendAnalytics(user.id, timeRange);
        break;
        
      case 'performance':
        analytics = await getPerformanceAnalytics(user.id, timeRange);
        break;
        
      case 'risks':
        analytics = await getRiskAnalytics(user.id, timeRange);
        break;
        
      default:
        return new Response(JSON.stringify({ error: 'Invalid analytics type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({
      success: true,
      type: request.type,
      time_range: timeRange,
      data: analytics,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    logError(error, 'analytics_handler');
    
    return new Response(JSON.stringify({ 
      error: 'Analytics generation failed',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});