import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Shield, 
  Globe, 
  Share2, 
  Brain,
  Calendar,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  ChevronDown,
  Activity,
  Youtube,
  Facebook,
  Instagram,
  Image,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { DMCAFormDialog } from '@/components/dmca/DMCAFormDialog';

interface ScanResult {
  id: string;
  type: string;
  status: string;
  date: string;
  title: string;
  matches: number;
  confidence?: number;
  threatLevel?: string;
  source?: string;
  platform?: string;
  sourceUrl?: string;
  contentType?: string;
  artifacts?: string[];
}

interface SocialMediaResult {
  id: string;
  account_id: string;
  scan_id: string;
  content_type: string;
  content_url: string;
  content_title: string;
  content_description: string;
  thumbnail_url: string;
  detection_type: string;
  confidence_score: number;
  threat_level: string;
  artifacts_detected: string[];
  is_reviewed: boolean;
  detected_at: string;
  account: {
    platform: string;
    account_handle: string;
    account_name?: string;
  };
}

export const UnifiedScanResults = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monitoring');
  const [scanResults, setScanResults] = useState<{
    monitoring: ScanResult[];
    copyright: ScanResult[];
    webScans: ScanResult[];
    deepfake: ScanResult[];
  }>({
    monitoring: [],
    copyright: [],
    webScans: [],
    deepfake: []
  });
  const [socialMediaResults, setSocialMediaResults] = useState<SocialMediaResult[]>([]);

  useEffect(() => {
    if (user) {
      fetchAllResults();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const setupRealtimeSubscriptions = () => {
    // Monitor scan results changes
    const scanChannel = supabase
      .channel('scan-results-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'monitoring_scans' },
        () => fetchScanResults()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'copyright_matches' },
        () => fetchScanResults()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'web_scan_results' },
        () => fetchScanResults()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'deepfake_matches' },
        () => fetchScanResults()
      )
      .subscribe();

    // Monitor social media results changes
    const socialChannel = supabase
      .channel('social-media-results-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'social_media_monitoring_results' },
        () => fetchSocialMediaResults()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(scanChannel);
      supabase.removeChannel(socialChannel);
    };
  };

  const fetchAllResults = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchScanResults(),
        fetchSocialMediaResults()
      ]);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load scan results');
    } finally {
      setLoading(false);
    }
  };

  const fetchScanResults = async () => {
    try {
      // Get user's artwork IDs first
      const { data: artworkData } = await supabase
        .from('artwork')
        .select('id, title')
        .eq('user_id', user!.id);

      const artworkIds = artworkData?.map(a => a.id) || [];

      // Fetch monitoring scans - only if user has artwork
      let monitoringScans = [];
      if (artworkIds.length > 0) {
        const { data: monitoringData } = await supabase
          .from('monitoring_scans')
          .select('*')
          .in('artwork_id', artworkIds)
          .order('started_at', { ascending: false })
          .limit(20);
        monitoringScans = monitoringData || [];
      }

      // Fetch copyright matches - only if user has artwork
      let copyrightMatches = [];
      if (artworkIds.length > 0) {
        const { data: copyrightData } = await supabase
          .from('copyright_matches')
          .select('*')
          .in('artwork_id', artworkIds)
          .order('detected_at', { ascending: false })
          .limit(20);
        copyrightMatches = copyrightData || [];
      }

      // Fetch web scan results (these are user-specific via RLS)
      const { data: webScans } = await supabase
        .from('web_scan_results')
        .select(`
          *,
          scan:web_scans(id, content_type, search_terms)
        `)
        .order('detected_at', { ascending: false })
        .limit(20);

      // Fetch deepfake matches (global data, not user-specific)
      const { data: deepfakeMatches } = await supabase
        .from('deepfake_matches')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(20);

      console.log('Fetched scan data:', {
        artworkIds: artworkIds.length,
        monitoring: monitoringScans.length,
        copyright: copyrightMatches.length,
        web: webScans?.length || 0,
        deepfake: deepfakeMatches?.length || 0
      });
      // Transform data to unified format
      const monitoring: ScanResult[] = monitoringScans.map(scan => ({
        id: scan.id,
        type: 'monitoring',
        status: scan.status,
        date: scan.started_at,
        title: `Monitoring Scan`,
        matches: scan.matches_found || 0,
        source: 'AI Monitoring'
      }));

      const copyright: ScanResult[] = copyrightMatches.map(match => ({
        id: match.id,
        type: 'copyright',
        status: 'completed',
        date: match.detected_at,
        title: match.source_title || 'Copyright Match',
        matches: 1,
        confidence: match.match_confidence,
        threatLevel: match.threat_level,
        source: match.source_domain,
        sourceUrl: match.source_url
      }));

      const webResults: ScanResult[] = (webScans || []).map(result => ({
        id: result.id,
        type: 'web',
        status: 'completed',
        date: result.detected_at,
        title: result.content_title || 'Web Detection',
        matches: 1,
        confidence: parseFloat(result.confidence_score?.toString() || '0'),
        threatLevel: result.threat_level,
        source: result.source_domain,
        sourceUrl: result.source_url,
        contentType: result.content_type
      }));

      const deepfake: ScanResult[] = (deepfakeMatches || []).map(match => ({
        id: match.id,
        type: 'deepfake',
        status: 'completed',
        date: match.detected_at,
        title: match.source_title || 'Deepfake Detection',
        matches: 1,
        confidence: match.detection_confidence,
        threatLevel: match.threat_level,
        source: match.source_domain,
        sourceUrl: match.source_url,
        artifacts: match.facial_artifacts
      }));

      setScanResults({
        monitoring,
        copyright,
        webScans: webResults,
        deepfake
      });

    } catch (error) {
      console.error('Error fetching scan results:', error);
    }
  };

  const fetchSocialMediaResults = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_monitoring_results')
        .select(`
          *,
          account:social_media_accounts(platform, account_handle, account_name)
        `)
        .order('detected_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSocialMediaResults(data || []);
    } catch (error) {
      console.error('Error fetching social media results:', error);
    }
  };

  const getThreatBadgeColor = (threatLevel: string) => {
    switch (threatLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'monitoring': return <Activity className="w-4 h-4" />;
      case 'copyright': return <Shield className="w-4 h-4" />;
      case 'web': return <Globe className="w-4 h-4" />;
      case 'deepfake': return <Eye className="w-4 h-4" />;
      case 'social': return <Share2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'youtube': return <Youtube className="w-4 h-4 text-red-500" />;
      case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
      default: return <Share2 className="w-4 h-4" />;
    }
  };

  const renderScanCard = (result: ScanResult) => (
    <Card key={result.id} className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
              {getTypeIcon(result.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm mb-1 truncate">{result.title}</h4>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {result.type}
                </Badge>
                {result.threatLevel && (
                  <Badge variant={getThreatBadgeColor(result.threatLevel)} className="text-xs">
                    {result.threatLevel}
                  </Badge>
                )}
                {result.confidence && (
                  <span className="text-xs text-muted-foreground">
                    {Math.round(result.confidence * 100)}% match
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(result.date).toLocaleDateString()}
                </span>
                {result.source && (
                  <span className="truncate">{result.source}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {result.matches} {result.matches === 1 ? 'match' : 'matches'}
            </Badge>
            {result.sourceUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            )}
            {(result.type === 'copyright' || result.type === 'web') && result.sourceUrl && (
              <DMCAFormDialog 
                matchId={result.id} 
                sourceUrl={result.sourceUrl}
                sourceTitle={result.title}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSocialMediaCard = (result: SocialMediaResult) => (
    <Card key={result.id} className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
              {getPlatformIcon(result.account?.platform)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm mb-1 truncate">
                {result.content_title || 'Social Media Detection'}
              </h4>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {result.account?.platform}
                </Badge>
                <Badge variant={getThreatBadgeColor(result.threat_level)} className="text-xs">
                  {result.threat_level}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {Math.round(result.confidence_score * 100)}% match
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(result.detected_at).toLocaleDateString()}
                </span>
                <span className="truncate">@{result.account?.account_handle}</span>
              </div>
              {result.content_description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {result.content_description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {result.detection_type}
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <a href={result.content_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getTotalResults = () => {
    return scanResults.monitoring.length + 
           scanResults.copyright.length + 
           scanResults.webScans.length + 
           scanResults.deepfake.length + 
           socialMediaResults.length;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Scan Results & Detections
        </CardTitle>
        <CardDescription>
          All monitoring results and detections in one place ({getTotalResults()} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1 h-auto rounded-lg border border-border">
            <TabsTrigger 
              value="monitoring" 
              className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Activity className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Monitoring</span> ({scanResults.monitoring.length})
            </TabsTrigger>
            <TabsTrigger 
              value="copyright" 
              className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Shield className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Copyright</span> ({scanResults.copyright.length})
            </TabsTrigger>
            <TabsTrigger 
              value="social" 
              className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Share2 className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Social</span> ({socialMediaResults.length})
            </TabsTrigger>
            <TabsTrigger 
              value="web" 
              className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Globe className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Web</span> ({scanResults.webScans.length})
            </TabsTrigger>
            <TabsTrigger 
              value="deepfake" 
              className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Eye className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Deepfake</span> ({scanResults.deepfake.length})
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 min-h-[200px]">
            <TabsContent value="monitoring" className="space-y-4 mt-0">
              {scanResults.monitoring.length > 0 ? (
                <div className="space-y-3">
                  {scanResults.monitoring.map(renderScanCard)}
                </div>
              ) : (
                <Alert className="border-blue-200 bg-blue-50">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    No monitoring scans found. Start monitoring your artwork to see results here.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="copyright" className="space-y-4 mt-0">
              {scanResults.copyright.length > 0 ? (
                <div className="space-y-3">
                  {scanResults.copyright.map(renderScanCard)}
                </div>
              ) : (
                <Alert className="border-green-200 bg-green-50">
                  <Shield className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    No copyright matches detected. Your content appears to be protected.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="social" className="space-y-4 mt-0">
              {socialMediaResults.length > 0 ? (
                <div className="space-y-3">
                  {socialMediaResults.map(renderSocialMediaCard)}
                </div>
              ) : (
                <Alert className="border-purple-200 bg-purple-50">
                  <Share2 className="w-4 h-4 text-purple-600" />
                  <AlertDescription className="text-purple-800">
                    No social media violations detected yet. Connect your accounts to start monitoring.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="web" className="space-y-4 mt-0">
              {scanResults.webScans.length > 0 ? (
                <div className="space-y-3">
                  {scanResults.webScans.map(renderScanCard)}
                </div>
              ) : (
                <Alert className="border-orange-200 bg-orange-50">
                  <Globe className="w-4 h-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    No web scan results found. Run web scans to detect unauthorized usage.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="deepfake" className="space-y-4 mt-0">
              {scanResults.deepfake.length > 0 ? (
                <div className="space-y-3">
                  {scanResults.deepfake.map(renderScanCard)}
                </div>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <Eye className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    No deepfake detections found. Your identity appears secure.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};