import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  const statCards = [
    {
      label: 'Matches Found',
      value: stats.matches,
      icon: AlertTriangle,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      ringColor: 'ring-secondary/20',
    },
    {
      label: 'Items Protected',
      value: stats.protected,
      icon: Shield,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      ringColor: 'ring-primary/20',
    },
    {
      label: 'Resolution Rate',
      value: stats.resolutionRate !== null ? `${stats.resolutionRate}%` : '—',
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10',
      ringColor: 'ring-green-500/20',
      tooltip: 'Percentage of flagged matches marked as resolved',
    },
  ];

  const tabs = [
    { value: 'portfolio', label: 'Portfolio', shortLabel: 'Scan', icon: Briefcase },
    { value: 'matches', label: 'Copyright', shortLabel: 'Copyright', icon: Shield },
    { value: 'social', label: 'Social Media', shortLabel: 'Social', icon: Users },
    { value: 'deepfakes', label: 'Deepfakes', shortLabel: 'AI', icon: Brain },
    { value: 'forgery', label: 'Forgery', shortLabel: 'Forgery', icon: Image },
    { value: 'alerts', label: 'Alerts', shortLabel: 'Alerts', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Cinematic Header */}
      <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.06),transparent_60%)]" />
        <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-5 animate-fade-in">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Live monitoring active
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Monitoring Hub
              </span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
              Real-time protection intelligence across copyright, social media, deepfakes, and more.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Row */}
        <TooltipProvider>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              const card = (
                <Card key={stat.label} className="group hover:shadow-lg transition-all duration-300 border bg-card/50 backdrop-blur-sm overflow-hidden relative">
                  <div className={`absolute top-0 left-0 w-1 h-full ${stat.bgColor}`} />
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center shrink-0 ring-1 ${stat.ringColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      {loading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : (
                        <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                      )}
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );

              return stat.tooltip ? (
                <Tooltip key={stat.label}>
                  <TooltipTrigger asChild>{card}</TooltipTrigger>
                  <TooltipContent><p className="text-xs">{stat.tooltip}</p></TooltipContent>
                </Tooltip>
              ) : card;
            })}
          </div>
        </TooltipProvider>

        {/* Recent Matches */}
        <Card className="border bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                Recent Detections
              </CardTitle>
              {recentMatches.length > 0 && (
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setActiveTab('matches')}>
                  View all <ExternalLink className="w-3 h-3" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentMatches.length > 0 ? (
              <div className="divide-y">
                {recentMatches.map((match) => (
                  <div key={match.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors group">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0 ring-1 ring-border">
                      {match.thumbnail_url || match.image_url ? (
                        <img src={match.thumbnail_url || match.image_url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {match.source_domain || (() => { try { return new URL(match.source_url).hostname; } catch { return 'Unknown'; } })()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(match.detected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <Badge
                      variant={match.match_confidence >= 80 ? "destructive" : "secondary"}
                      className="shrink-0 text-xs font-mono"
                    >
                      {Math.round(match.match_confidence)}%
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => {
                        const url = buildMatchUrl(match.source_url, match.source_domain, match.source_title);
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-14 px-6">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Search className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="font-semibold mb-1">No detections yet</p>
                <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
                  Upload content and run a scan to start detecting unauthorized usage.
                </p>
                <Button onClick={() => setActiveTab('portfolio')} className="gap-2 shadow-lg shadow-primary/20">
                  <Zap className="h-4 w-4" />
                  Start Quick Scan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl py-2 -mx-4 px-4 border-b border-transparent">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto bg-muted/50 p-1 rounded-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-1.5 text-xs md:text-sm py-2.5 rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-background transition-all"
                  >
                    <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent value="portfolio" className="space-y-6 animate-fade-in">
            <PortfolioDashboard />
          </TabsContent>

          <TabsContent value="matches" className="space-y-6 animate-fade-in">
            <Card className="border bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="w-4 h-4 text-primary" />
                  Copyright Matches
                </CardTitle>
                <CardDescription>Content found across the web matching your protected works</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <CopyrightMatches />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6 animate-fade-in">
            <Card className="border bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="w-4 h-4 text-primary" />
                  Social Media Monitoring
                </CardTitle>
                <CardDescription>Track and protect your content across social platforms</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <SocialMediaAccountManager />
              </CardContent>
            </Card>
            <Card className="border bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-base">Recent Social Detections</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <SocialMediaMonitoringResults />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deepfakes" className="space-y-6 animate-fade-in">
            <Card className="border bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="w-4 h-4 text-primary" />
                  Deepfake Detection
                </CardTitle>
                <CardDescription>AI-powered detection of synthetic and manipulated media</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <FakeAccountDetector />
                <Button className="w-full gap-2" size="lg" onClick={() => navigate('/forgery-detection?tab=ai-detection')}>
                  <Search className="h-4 w-4" />
                  Start Deepfake Scan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forgery" className="space-y-6 animate-fade-in">
            <Card className="border bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Image className="w-4 h-4 text-primary" />
                  Image Forgery Analysis
                </CardTitle>
                <CardDescription>Detect manipulation, splicing, and AI-generated content</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-2">
                  {['Manipulation Detection', 'Metadata Analysis', 'AI-Generated Detection'].map((item) => (
                    <div key={item} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm font-medium flex-1">{item}</span>
                      <Badge variant="outline" className="text-xs">Active</Badge>
                    </div>
                  ))}
                </div>
                <Button className="w-full gap-2" size="lg" onClick={() => navigate('/forgery-detection?tab=forgery-detection')}>
                  <Image className="h-4 w-4" />
                  Analyze Image
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6 animate-fade-in">
            <Card className="border bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="w-4 h-4 text-secondary" />
                  Monitoring Alerts
                </CardTitle>
                <CardDescription>Priority alerts requiring your attention</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <AlertsPanel />
              </CardContent>
            </Card>

            <FeatureGuard
              feature="automated_dmca"
              fallbackTitle="Automated DMCA"
              fallbackDescription="Automatically file DMCA takedown notices for copyright infringement"
            >
              <Card className="border bg-card/50 backdrop-blur-sm">
                <CardHeader className="border-b bg-muted/20">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-4 h-4 text-primary" />
                    DMCA Takedown History
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-sm">Your DMCA takedown notices and their status will appear here.</p>
                </CardContent>
              </Card>
            </FeatureGuard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MonitoringHub;
