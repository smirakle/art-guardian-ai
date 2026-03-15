import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  HelpCircle,
  Users,
  Brain,
  FileText,
  ChevronDown,
  BarChart3,
} from 'lucide-react';
import { BugReportButton } from '@/components/BugReportButton';
import { PortfolioDashboard } from '@/components/portfolio/PortfolioDashboard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
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
  const { isAdmin } = useUserPreferences();
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

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

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Search className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Monitoring Hub</h1>
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Monitor your content across the web — copyright, social media, deepfakes, and alerts in one place
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            {loading ? <Loader2 className="h-6 w-6 mx-auto animate-spin" /> : <div className="text-2xl font-bold">{stats.matches}</div>}
            <p className="text-sm text-muted-foreground">Matches Found</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6 text-center">
            <Shield className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            {loading ? <Loader2 className="h-6 w-6 mx-auto animate-spin" /> : <div className="text-2xl font-bold">{stats.protected}</div>}
            <p className="text-sm text-muted-foreground">Items Protected</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6 text-center">
            <Activity className="h-6 w-6 mx-auto mb-2 text-green-500" />
            {loading ? <Loader2 className="h-6 w-6 mx-auto animate-spin" /> : (
              <div className="text-2xl font-bold">
                {stats.resolutionRate !== null ? `${stats.resolutionRate}%` : '—'}
              </div>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 cursor-help">
                    Resolution Rate
                    <HelpCircle className="h-3 w-3" />
                  </p>
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px]">
                  <p className="text-xs">Resolution Rate = % of flagged matches marked resolved.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>

      {/* Recent Matches */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Recent Matches
          </CardTitle>
          <CardDescription>Latest detected copies of your content</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentMatches.length > 0 ? (
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <div key={match.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {match.thumbnail_url || match.image_url ? (
                      <img src={match.thumbnail_url || match.image_url} alt="Match thumbnail" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{match.source_domain || new URL(match.source_url).hostname}</p>
                    <p className="text-xs text-muted-foreground">{new Date(match.detected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <Badge variant={match.match_confidence >= 80 ? "destructive" : match.match_confidence >= 50 ? "default" : "secondary"} className="flex-shrink-0">
                    {Math.round(match.match_confidence)}%
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => { const url = buildMatchUrl(match.source_url, match.source_domain, match.source_title); window.open(url, '_blank', 'noopener,noreferrer'); }}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No matches yet</p>
                <p className="text-sm text-muted-foreground">Run a Quick Scan to start monitoring your content.</p>
              </div>
              <Button onClick={() => setActiveTab('portfolio')}>
                <Zap className="h-4 w-4 mr-2" />
                Start Quick Scan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
          <TabsTrigger value="portfolio" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2">
            <Briefcase className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Portfolio</span>
            <span className="sm:hidden">Scan</span>
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2">
            <Shield className="w-3 h-3 md:w-4 md:h-4" />
            <span>Copyright</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2">
            <Users className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Social Media</span>
            <span className="sm:hidden">Social</span>
          </TabsTrigger>
          <TabsTrigger value="deepfakes" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2">
            <Brain className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Deepfakes</span>
            <span className="sm:hidden">AI</span>
          </TabsTrigger>
          <TabsTrigger value="forgery" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2">
            <Image className="w-3 h-3 md:w-4 md:h-4" />
            <span>Forgery</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2">
            <AlertTriangle className="w-3 h-3 md:w-4 md:h-4" />
            <span>Alerts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          <PortfolioDashboard />
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Copyright Matches Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CopyrightMatches />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Social Media Monitoring
              </CardTitle>
              <CardDescription>Monitor and protect your content across social media platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <SocialMediaAccountManager />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Social Media Detections</CardTitle>
            </CardHeader>
            <CardContent>
              <SocialMediaMonitoringResults />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deepfakes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Deepfake Detection
              </CardTitle>
              <CardDescription>AI-powered deepfake detection and monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FakeAccountDetector />
              <Button className="w-full" size="lg" onClick={() => navigate('/forgery-detection?tab=ai-detection')}>
                <Search className="h-4 w-4 mr-2" />
                Start Deepfake Scan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forgery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                Image Forgery Analysis
              </CardTitle>
              <CardDescription>Detect manipulation, splicing, and AI-generated content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {['Manipulation Detection', 'Metadata Analysis', 'AI-Generated Detection'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{item}</span>
                    <Badge variant="outline" className="ml-auto text-xs">Active</Badge>
                  </div>
                ))}
              </div>
              <Button className="w-full" size="lg" onClick={() => navigate('/forgery-detection?tab=forgery-detection')}>
                <Image className="h-4 w-4 mr-2" />
                Analyze Image
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Monitoring Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AlertsPanel />
            </CardContent>
          </Card>

          <FeatureGuard
            feature="automated_dmca"
            fallbackTitle="Automated DMCA"
            fallbackDescription="Automatically file DMCA takedown notices for copyright infringement"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  DMCA Takedown History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Your DMCA takedown notices and their status will appear here.</p>
              </CardContent>
            </Card>
          </FeatureGuard>
        </TabsContent>
      </Tabs>

      <BugReportButton />
    </div>
  );
};

export default MonitoringHub;
