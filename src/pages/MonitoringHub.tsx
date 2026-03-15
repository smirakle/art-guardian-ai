import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  Eye,
  Image,
  AlertTriangle,
  Shield,
  Activity,
  CheckCircle,
  Zap,
  Briefcase,
  Loader2,
  Users,
  Brain,
  FileText,
  ExternalLink,
  TrendingUp,
  Radio,
  ArrowRight,
  Scan,
  Globe,
  Lock,
  Radar,
} from 'lucide-react';
import { PortfolioDashboard } from '@/components/portfolio/PortfolioDashboard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { buildMatchUrl } from '@/utils/buildMatchUrl';
import CopyrightMatches from '@/components/monitoring/CopyrightMatches';
import AlertsPanel from '@/components/AlertsPanel';
import SocialMediaMonitoringResults from '@/components/monitoring/SocialMediaMonitoringResults';
import SocialMediaAccountManager from '@/components/SocialMediaAccountManager';
import FakeAccountDetector from '@/components/FakeAccountDetector';
import FeatureGuard from '@/components/FeatureGuard';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const MonitoringHub = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [stats, setStats] = useState({ matches: 0, protected: 0, resolutionRate: null as number | null });
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const [matchesRes, threatsRes, artworkRes, protectionRes, resolvedMatchesRes, resolvedThreatsRes, recentMatchesRes] = await Promise.all([
          supabase.from('copyright_matches').select('id', { count: 'exact', head: true }),
          supabase.from('ai_threat_detections').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('artwork').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('ai_protection_records').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('copyright_matches').select('id', { count: 'exact', head: true }).eq('is_reviewed', true),
          supabase.from('ai_threat_detections').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'resolved'),
          supabase.from('copyright_matches').select('id, source_url, source_domain, source_title, thumbnail_url, image_url, match_confidence, detected_at, threat_level').order('detected_at', { ascending: false }).limit(5),
        ]);
        const totalMatches = (matchesRes.count || 0) + (threatsRes.count || 0);
        const resolvedMatches = (resolvedMatchesRes.count || 0) + (resolvedThreatsRes.count || 0);
        const protectedCount = (artworkRes.count || 0) + (protectionRes.count || 0);
        const resolutionRate = totalMatches > 0 ? Math.round((resolvedMatches / totalMatches) * 100) : null;
        setStats({ matches: totalMatches, protected: protectedCount, resolutionRate });
        setRecentMatches(recentMatchesRes.data || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const tabs = [
    { value: 'portfolio', label: 'Portfolio', shortLabel: 'Scan', icon: Briefcase, description: 'Asset overview' },
    { value: 'matches', label: 'Copyright', shortLabel: 'Copyright', icon: Shield, description: 'Web matches' },
    { value: 'social', label: 'Social Media', shortLabel: 'Social', icon: Users, description: 'Platform tracking' },
    { value: 'deepfakes', label: 'Deepfakes', shortLabel: 'AI', icon: Brain, description: 'Synthetic detection' },
    { value: 'forgery', label: 'Forgery', shortLabel: 'Forgery', icon: Image, description: 'Altered content' },
    { value: 'alerts', label: 'Alerts', shortLabel: 'Alerts', icon: AlertTriangle, description: 'Notifications' },
  ];

  const resolutionRate = stats.resolutionRate ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Cinematic Hero Header ── */}
      <div className="relative overflow-hidden">
        {/* Layered gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/6" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_30%_20%,hsl(var(--primary)/0.12),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_70%_at_80%_80%,hsl(var(--accent)/0.08),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--secondary)/0.04),transparent_50%)]" />
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="container mx-auto px-4 pt-10 pb-8 md:pt-16 md:pb-12 relative z-10">
          {/* Live badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-card/60 backdrop-blur-md border border-border/50 shadow-lg shadow-primary/5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              <span className="text-sm font-medium text-foreground">Monitoring Active</span>
              <span className="text-xs text-muted-foreground">• 24/7</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 animate-fade-up">
              <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                Command
              </span>{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Center
              </span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto animate-fade-up stagger-1">
              Real-time intelligence across every surface where your content lives.
            </p>
          </div>

          {/* ── Premium Stats Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto animate-fade-up stagger-2">
            {/* Matches Found */}
            <div className="group relative rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md p-6 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent opacity-60" />
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center ring-1 ring-secondary/20 group-hover:ring-secondary/40 transition-all">
                  <AlertTriangle className="w-5 h-5 text-secondary" />
                </div>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold border-secondary/30 text-secondary">
                  Detections
                </Badge>
              </div>
              {loading ? (
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-4xl font-bold tracking-tight tabular-nums text-foreground">{stats.matches}</div>
              )}
              <p className="text-sm text-muted-foreground mt-1">Matches found</p>
            </div>

            {/* Items Protected */}
            <div className="group relative rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md p-6 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold border-primary/30 text-primary">
                  Protected
                </Badge>
              </div>
              {loading ? (
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-4xl font-bold tracking-tight tabular-nums text-foreground">{stats.protected}</div>
              )}
              <p className="text-sm text-muted-foreground mt-1">Items secured</p>
            </div>

            {/* Resolution Rate */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="group relative rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md p-6 hover:shadow-xl hover:shadow-green-500/5 hover:-translate-y-1 transition-all duration-500 overflow-hidden cursor-default">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-60" />
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center ring-1 ring-green-500/20 group-hover:ring-green-500/40 transition-all">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold border-green-500/30 text-green-600 dark:text-green-400">
                        Resolution
                      </Badge>
                    </div>
                    {loading ? (
                      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <div className="text-4xl font-bold tracking-tight tabular-nums text-foreground">
                          {stats.resolutionRate !== null ? `${stats.resolutionRate}%` : '—'}
                        </div>
                        <div className="mt-3">
                          <Progress value={resolutionRate} className="h-1.5 bg-muted/50" />
                        </div>
                      </>
                    )}
                    <p className="text-sm text-muted-foreground mt-1.5">Cases resolved</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Percentage of flagged matches marked as resolved</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10 space-y-8">
        {/* ── Recent Detections — Immersive Feed ── */}
        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center ring-1 ring-accent/20">
                <Radar className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Latest Detections</h2>
                <p className="text-xs text-muted-foreground">Most recent content matches</p>
              </div>
            </div>
            {recentMatches.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => setActiveTab('matches')}>
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {recentMatches.map((match, i) => (
                <div
                  key={match.id}
                  className="group relative rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => {
                    const url = buildMatchUrl(match.source_url, match.source_domain, match.source_title);
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Thumbnail */}
                  <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden">
                    {match.thumbnail_url || match.image_url ? (
                      <img
                        src={match.thumbnail_url || match.image_url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Globe className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                    {/* Confidence overlay */}
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={match.match_confidence >= 80 ? "destructive" : "secondary"}
                        className="text-[10px] font-mono shadow-sm"
                      >
                        {Math.round(match.match_confidence)}%
                      </Badge>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                      <span className="text-[11px] font-medium text-primary-foreground flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> View Source
                      </span>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium truncate text-foreground">
                      {match.source_domain || (() => { try { return new URL(match.source_url).hostname; } catch { return 'Unknown'; } })()}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(match.detected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative rounded-2xl border border-dashed border-border/60 bg-card/30 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,hsl(var(--primary)/0.03),transparent)]" />
              <div className="text-center py-20 px-6 relative z-10">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5 ring-1 ring-primary/10">
                  <Scan className="h-9 w-9 text-primary/60" />
                </div>
                <p className="font-semibold text-lg mb-2">No detections yet</p>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Upload your content and run a scan to start detecting unauthorized usage across the web.
                </p>
                <Button onClick={() => setActiveTab('portfolio')} size="lg" className="gap-2 shadow-lg shadow-primary/20 glow-pulse">
                  <Zap className="h-4 w-4" />
                  Start Quick Scan
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation Tabs ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="sticky top-0 z-20 -mx-4 px-4 py-3">
            <div className="bg-card/70 backdrop-blur-xl rounded-2xl border border-border/40 shadow-sm p-1.5">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto bg-transparent p-0 gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-3 md:py-2.5 px-2 rounded-xl bg-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-200"
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="hidden sm:inline font-medium">{tab.label}</span>
                      <span className="sm:hidden text-[10px] font-medium">{tab.shortLabel}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </div>

          {/* ── Tab Contents ── */}
          <TabsContent value="portfolio" className="space-y-6 animate-fade-in">
            <PortfolioDashboard />
          </TabsContent>

          <TabsContent value="matches" className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">Copyright Matches</h3>
                    <p className="text-xs text-muted-foreground">Content found across the web matching your protected works</p>
                  </div>
                </div>
              </div>
              <div className="p-0">
                <CopyrightMatches />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">Social Media Monitoring</h3>
                    <p className="text-xs text-muted-foreground">Track and protect your content across social platforms</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <SocialMediaAccountManager />
              </div>
            </div>
            <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border/30">
                <h3 className="font-semibold text-base">Recent Social Detections</h3>
              </div>
              <div className="p-6">
                <SocialMediaMonitoringResults />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deepfakes" className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border/30 bg-gradient-to-r from-accent/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center ring-1 ring-accent/20">
                    <Brain className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">Deepfake Detection</h3>
                    <p className="text-xs text-muted-foreground">AI-powered detection of synthetic and manipulated media</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <FakeAccountDetector />
                <Button className="w-full gap-2 shadow-lg shadow-primary/10" size="lg" onClick={() => navigate('/forgery-detection?tab=ai-detection')}>
                  <Search className="h-4 w-4" />
                  Start Deepfake Scan
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="forgery" className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border/30 bg-gradient-to-r from-secondary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center ring-1 ring-secondary/20">
                    <Image className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">Image Forgery Analysis</h3>
                    <p className="text-xs text-muted-foreground">Detect manipulation, splicing, and AI-generated content</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid gap-2">
                  {[
                    { label: 'Manipulation Detection', icon: Eye },
                    { label: 'Metadata Analysis', icon: FileText },
                    { label: 'AI-Generated Detection', icon: Brain },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-3.5 rounded-xl border border-border/30 bg-card/30 hover:bg-card/60 transition-all duration-200 group">
                      <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 ring-1 ring-green-500/20 group-hover:ring-green-500/40 transition-all">
                        <item.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[11px] text-green-600 dark:text-green-400 font-medium">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full gap-2 shadow-lg shadow-secondary/10" size="lg" onClick={() => navigate('/forgery-detection?tab=forgery-detection')}>
                  <Image className="h-4 w-4" />
                  Analyze Image
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border/30 bg-gradient-to-r from-secondary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center ring-1 ring-secondary/20">
                    <AlertTriangle className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">Monitoring Alerts</h3>
                    <p className="text-xs text-muted-foreground">Priority alerts requiring your attention</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <AlertsPanel />
              </div>
            </div>

            <FeatureGuard
              feature="automated_dmca"
              fallbackTitle="Automated DMCA"
              fallbackDescription="Automatically file DMCA takedown notices for copyright infringement"
            >
              <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">DMCA Takedown History</h3>
                      <p className="text-xs text-muted-foreground">Track your takedown notices and their status</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-muted-foreground text-sm">Your DMCA takedown notices and their status will appear here.</p>
                </div>
              </div>
            </FeatureGuard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MonitoringHub;
