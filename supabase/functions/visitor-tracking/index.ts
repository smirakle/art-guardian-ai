import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...data } = await req.json();

    switch (action) {
      case 'aggregate_daily_metrics':
        return await aggregateDailyMetrics(supabase);
      case 'get_retention_stats':
        return await getRetentionStats(supabase, data);
      case 'get_top_pages':
        return await getTopPages(supabase, data);
      case 'get_traffic_sources':
        return await getTrafficSources(supabase, data);
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function aggregateDailyMetrics(supabase: any) {
  const today = new Date().toISOString().split('T')[0];
  const startOfDay = `${today}T00:00:00Z`;
  const endOfDay = `${today}T23:59:59Z`;

  // Get sessions for today
  const { data: sessions } = await supabase
    .from('visitor_sessions')
    .select('*')
    .gte('started_at', startOfDay)
    .lte('started_at', endOfDay);

  if (!sessions || sessions.length === 0) {
    return new Response(
      JSON.stringify({ message: 'No sessions to aggregate' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Calculate metrics
  const uniqueVisitors = new Set(sessions.map((s: any) => s.visitor_id)).size;
  const newVisitors = sessions.filter((s: any) => !s.is_returning_visitor).length;
  const returningVisitors = sessions.filter((s: any) => s.is_returning_visitor).length;
  const totalSessions = sessions.length;
  const totalPageViews = sessions.reduce((sum: number, s: any) => sum + (s.page_views || 0), 0);
  const avgDuration = sessions.reduce((sum: number, s: any) => sum + (s.duration_seconds || 0), 0) / totalSessions;
  const avgPagesPerSession = totalPageViews / totalSessions;
  const bounces = sessions.filter((s: any) => s.is_bounce).length;
  const bounceRate = (bounces / totalSessions) * 100;

  // Upsert daily metrics
  const { error } = await supabase
    .from('visitor_retention_metrics')
    .upsert({
      date: today,
      total_visitors: uniqueVisitors,
      new_visitors: newVisitors,
      returning_visitors: returningVisitors,
      total_sessions: totalSessions,
      total_page_views: totalPageViews,
      avg_session_duration_seconds: Math.round(avgDuration),
      avg_pages_per_session: Math.round(avgPagesPerSession * 100) / 100,
      bounce_rate: Math.round(bounceRate * 100) / 100,
    }, { onConflict: 'date' });

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, metrics: { uniqueVisitors, totalSessions, bounceRate } }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getRetentionStats(supabase: any, data: any) {
  const { days = 30 } = data;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all sessions in the period
  const { data: sessions } = await supabase
    .from('visitor_sessions')
    .select('visitor_id, started_at, is_returning_visitor')
    .gte('started_at', startDate.toISOString())
    .order('started_at', { ascending: true });

  if (!sessions) {
    return new Response(
      JSON.stringify({ retentionRate: 0, cohorts: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Calculate weekly cohorts
  const cohorts: any[] = [];
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < Math.ceil(days / 7); i++) {
    const weekStart = new Date(startDate.getTime() + i * weekMs);
    const weekEnd = new Date(weekStart.getTime() + weekMs);
    
    const weekSessions = sessions.filter((s: any) => {
      const sessionDate = new Date(s.started_at);
      return sessionDate >= weekStart && sessionDate < weekEnd;
    });

    const uniqueVisitors = new Set(weekSessions.map((s: any) => s.visitor_id)).size;
    const returningVisitors = weekSessions.filter((s: any) => s.is_returning_visitor).length;
    
    cohorts.push({
      week: i + 1,
      startDate: weekStart.toISOString().split('T')[0],
      visitors: uniqueVisitors,
      returning: returningVisitors,
      retentionRate: uniqueVisitors > 0 ? Math.round((returningVisitors / uniqueVisitors) * 100) : 0,
    });
  }

  // Calculate overall retention rate
  const totalVisitors = new Set(sessions.map((s: any) => s.visitor_id)).size;
  const totalReturning = sessions.filter((s: any) => s.is_returning_visitor).length;
  const overallRetention = totalVisitors > 0 ? Math.round((totalReturning / sessions.length) * 100) : 0;

  return new Response(
    JSON.stringify({ retentionRate: overallRetention, cohorts, totalVisitors }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getTopPages(supabase: any, data: any) {
  const { days = 30, limit = 10 } = data;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: pageViews } = await supabase
    .from('page_views')
    .select('page_path, page_title, time_on_page_seconds')
    .gte('created_at', startDate.toISOString());

  if (!pageViews || pageViews.length === 0) {
    return new Response(
      JSON.stringify({ pages: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Aggregate by page
  const pageStats: Record<string, { views: number; totalTime: number; title: string }> = {};
  
  for (const pv of pageViews) {
    if (!pageStats[pv.page_path]) {
      pageStats[pv.page_path] = { views: 0, totalTime: 0, title: pv.page_title || pv.page_path };
    }
    pageStats[pv.page_path].views++;
    pageStats[pv.page_path].totalTime += pv.time_on_page_seconds || 0;
  }

  const pages = Object.entries(pageStats)
    .map(([path, stats]) => ({
      path,
      title: stats.title,
      views: stats.views,
      avgTimeOnPage: stats.views > 0 ? Math.round(stats.totalTime / stats.views) : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);

  return new Response(
    JSON.stringify({ pages }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getTrafficSources(supabase: any, data: any) {
  const { days = 30 } = data;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: sessions } = await supabase
    .from('visitor_sessions')
    .select('referrer, utm_source, utm_medium, utm_campaign')
    .gte('started_at', startDate.toISOString());

  if (!sessions || sessions.length === 0) {
    return new Response(
      JSON.stringify({ sources: [], campaigns: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Aggregate sources
  const sourceStats: Record<string, number> = { direct: 0 };
  const campaignStats: Record<string, number> = {};

  for (const session of sessions) {
    // Traffic source
    let source = 'direct';
    if (session.utm_source) {
      source = session.utm_source;
    } else if (session.referrer) {
      try {
        const url = new URL(session.referrer);
        source = url.hostname;
      } catch {
        source = 'referral';
      }
    }
    sourceStats[source] = (sourceStats[source] || 0) + 1;

    // Campaigns
    if (session.utm_campaign) {
      campaignStats[session.utm_campaign] = (campaignStats[session.utm_campaign] || 0) + 1;
    }
  }

  const sources = Object.entries(sourceStats)
    .map(([source, count]) => ({ source, sessions: count }))
    .sort((a, b) => b.sessions - a.sessions);

  const campaigns = Object.entries(campaignStats)
    .map(([campaign, count]) => ({ campaign, sessions: count }))
    .sort((a, b) => b.sessions - a.sessions);

  return new Response(
    JSON.stringify({ sources, campaigns }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
