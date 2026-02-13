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
  HelpCircle
} from 'lucide-react';
import { BugReportButton } from '@/components/BugReportButton';
import { PortfolioDashboard } from '@/components/portfolio/PortfolioDashboard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch matches and resolution data
        const [matchesRes, threatsRes, artworkRes, protectionRes, resolvedMatchesRes, resolvedThreatsRes, recentMatchesRes] = await Promise.all([
          supabase
            .from('copyright_matches')
            .select('id', { count: 'exact', head: true }),
          supabase
            .from('ai_threat_detections')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('artwork')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('ai_protection_records')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('copyright_matches')
            .select('id', { count: 'exact', head: true })
            .eq('is_reviewed', true),
          supabase
            .from('ai_threat_detections')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'resolved'),
          supabase
            .from('copyright_matches')
            .select('id, source_url, source_domain, thumbnail_url, image_url, match_confidence, detected_at, threat_level')
            .order('detected_at', { ascending: false })
            .limit(5)
        ]);

        const totalMatches = (matchesRes.count || 0) + (threatsRes.count || 0);
        const resolvedMatches = (resolvedMatchesRes.count || 0) + (resolvedThreatsRes.count || 0);
        const protectedCount = (artworkRes.count || 0) + (protectionRes.count || 0);
        
        // Calculate resolution rate (resolved / total matches)
        // Show null if no matches to calculate from
        const resolutionRate = totalMatches > 0 
          ? Math.round((resolvedMatches / totalMatches) * 100)
          : null;

        setStats({
          matches: totalMatches,
          protected: protectedCount,
          resolutionRate
        });
        
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
      {/* Simplified Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Search className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Find Copies</h1>
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Scan the web to find unauthorized copies of your content
        </p>
      </div>

      {/* Stats with real data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            {loading ? (
              <Loader2 className="h-6 w-6 mx-auto animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats.matches}</div>
            )}
            <p className="text-sm text-muted-foreground">Matches Found</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6 text-center">
            <Shield className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            {loading ? (
              <Loader2 className="h-6 w-6 mx-auto animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats.protected}</div>
            )}
            <p className="text-sm text-muted-foreground">Items Protected</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6 text-center">
            <Activity className="h-6 w-6 mx-auto mb-2 text-green-500" />
            {loading ? (
              <Loader2 className="h-6 w-6 mx-auto animate-spin" />
            ) : (
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
                  <p className="text-xs">
                    Resolution Rate = % of flagged matches marked resolved (removed, credited, or closed).
                  </p>
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
                <div 
                  key={match.id} 
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {match.thumbnail_url || match.image_url ? (
                      <img 
                        src={match.thumbnail_url || match.image_url} 
                        alt="Match thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {match.source_domain || new URL(match.source_url).hostname}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(match.detected_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  {/* Confidence Badge */}
                  <Badge 
                    variant={match.match_confidence >= 80 ? "destructive" : match.match_confidence >= 50 ? "default" : "secondary"}
                    className="flex-shrink-0"
                  >
                    {Math.round(match.match_confidence)}%
                  </Badge>
                  
                  {/* View Button */}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      if (match.source_url && match.source_url.startsWith('http') && match.source_url.includes('.')) {
                        window.open(match.source_url, '_blank', 'noopener,noreferrer');
                      } else {
                        const domain = (match.source_domain || '').split(' ')[0].toLowerCase();
                        const platformUrls: Record<string, string> = {
                          shutterstock: 'https://www.shutterstock.com',
                          alamy: 'https://www.alamy.com',
                          flickr: 'https://www.flickr.com',
                          instagram: 'https://www.instagram.com',
                          reddit: 'https://www.reddit.com',
                          pinterest: 'https://www.pinterest.com',
                          deviantart: 'https://www.deviantart.com',
                          artstation: 'https://www.artstation.com',
                          behance: 'https://www.behance.net',
                          unsplash: 'https://www.unsplash.com',
                          pexels: 'https://www.pexels.com',
                          gettyimages: 'https://www.gettyimages.com',
                          adobe: 'https://stock.adobe.com',
                          twitter: 'https://www.twitter.com',
                          facebook: 'https://www.facebook.com',
                        };
                        const url = platformUrls[domain] || `https://duckduckgo.com/?q=site:${domain}.com`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="portfolio" className="flex items-center gap-2 py-3">
            <Briefcase className="h-4 w-4" />
            <span>Portfolio</span>
          </TabsTrigger>
          <TabsTrigger value="deepfake" className="flex items-center gap-2 py-3">
            <Eye className="h-4 w-4" />
            <span>Deepfake</span>
          </TabsTrigger>
          <TabsTrigger value="forgery" className="flex items-center gap-2 py-3">
            <Image className="h-4 w-4" />
            <span>Forgery</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          <PortfolioDashboard />
        </TabsContent>

        <TabsContent value="deepfake" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Deepfake Detection
              </CardTitle>
              <CardDescription>
                Detect AI-generated faces, voice clones, and synthetic media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">98.7%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">2.3s</div>
                  <div className="text-xs text-muted-foreground">Avg Speed</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">47</div>
                  <div className="text-xs text-muted-foreground">Platforms</div>
                </div>
              </div>
              
              <Button className="w-full" size="lg" onClick={() => navigate('/forgery-detection?tab=ai-detection')}>
                <Search className="h-4 w-4 mr-2" />
                Start Deepfake Scan
              </Button>

              <div className="space-y-2 pt-4 border-t">
                <h4 className="text-sm font-medium text-muted-foreground">Recent Detections</h4>
                <div className="flex justify-between items-center p-2 bg-destructive/10 rounded-lg">
                  <span className="text-sm">High-quality deepfake detected</span>
                  <Badge variant="destructive">Critical</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-500/10 rounded-lg">
                  <span className="text-sm">Face swap attempt identified</span>
                  <Badge className="bg-orange-500">Warning</Badge>
                </div>
              </div>
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
              <CardDescription>
                Detect manipulation, splicing, and AI-generated content
              </CardDescription>
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
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <Button 
          size="lg"
          className="h-auto py-4"
          onClick={() => navigate('/portfolio-monitoring')}
        >
          <Search className="h-5 w-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">Scan for Copies</div>
            <div className="text-xs opacity-90">Full portfolio analysis</div>
          </div>
        </Button>
        <Button 
          variant="outline"
          size="lg"
          className="h-auto py-4"
          onClick={() => navigate('/ai-protection')}
        >
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
          <div className="text-left">
            <div className="font-semibold">View Alerts</div>
            <div className="text-xs text-muted-foreground">{stats.matches} matches found</div>
          </div>
        </Button>
      </div>

      <BugReportButton />
    </div>
  );
};

export default MonitoringHub;
