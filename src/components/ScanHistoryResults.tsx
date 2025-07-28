import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
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
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

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
}

export const ScanHistoryResults = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scanResults, setScanResults] = useState<{
    monitoring: ScanResult[];
    copyright: ScanResult[];
    socialMedia: ScanResult[];
    webScans: ScanResult[];
    deepfake: ScanResult[];
  }>({
    monitoring: [],
    copyright: [],
    socialMedia: [],
    webScans: [],
    deepfake: []
  });

  useEffect(() => {
    if (user) {
      fetchScanHistory();
    }
  }, [user]);

  const fetchScanHistory = async () => {
    try {
      setLoading(true);

      // Fetch monitoring scans
      const { data: monitoringScans } = await supabase
        .from('monitoring_scans')
        .select(`
          id,
          scan_type,
          status,
          started_at,
          matches_found,
          artwork:artwork(title)
        `)
        .order('started_at', { ascending: false })
        .limit(20);

      // Fetch copyright matches
      const { data: copyrightMatches } = await supabase
        .from('copyright_matches')
        .select(`
          id,
          match_type,
          detected_at,
          match_confidence,
          threat_level,
          source_domain,
          artwork:artwork(title)
        `)
        .order('detected_at', { ascending: false })
        .limit(20);

      // Fetch social media scans
      const { data: socialScans } = await supabase
        .from('social_media_scans')
        .select(`
          id,
          scan_type,
          status,
          started_at,
          detections_found,
          account:social_media_accounts(account_handle, platform)
        `)
        .order('started_at', { ascending: false })
        .limit(20);

      // Fetch web scans
      const { data: webScans } = await supabase
        .from('web_scans')
        .select(`
          id,
          content_type,
          status,
          started_at,
          matches_found,
          content_url
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(20);

      // Fetch deepfake matches
      const { data: deepfakeMatches } = await supabase
        .from('deepfake_matches')
        .select(`
          id,
          manipulation_type,
          detected_at,
          detection_confidence,
          threat_level,
          source_domain
        `)
        .order('detected_at', { ascending: false })
        .limit(20);

      // Transform data
      setScanResults({
        monitoring: monitoringScans?.map(scan => ({
          id: scan.id,
          type: scan.scan_type,
          status: scan.status,
          date: scan.started_at,
          title: scan.artwork?.title || 'Unknown Artwork',
          matches: scan.matches_found || 0
        })) || [],
        
        copyright: copyrightMatches?.map(match => ({
          id: match.id,
          type: match.match_type,
          status: 'detected',
          date: match.detected_at,
          title: match.artwork?.title || 'Unknown Artwork',
          matches: 1,
          confidence: match.match_confidence,
          threatLevel: match.threat_level,
          source: match.source_domain
        })) || [],
        
        socialMedia: socialScans?.map(scan => ({
          id: scan.id,
          type: scan.scan_type,
          status: scan.status,
          date: scan.started_at,
          title: `${scan.account?.platform} - ${scan.account?.account_handle}`,
          matches: scan.detections_found || 0
        })) || [],
        
        webScans: webScans?.map(scan => ({
          id: scan.id,
          type: scan.content_type,
          status: scan.status,
          date: scan.started_at,
          title: scan.content_url || 'Web Scan',
          matches: scan.matches_found || 0
        })) || [],
        
        deepfake: deepfakeMatches?.map(match => ({
          id: match.id,
          type: match.manipulation_type,
          status: 'detected',
          date: match.detected_at,
          title: 'Deepfake Detection',
          matches: 1,
          confidence: match.detection_confidence,
          threatLevel: match.threat_level,
          source: match.source_domain
        })) || []
      });

    } catch (error) {
      console.error('Error fetching scan history:', error);
      toast.error('Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'running': case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'detected': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getThreatLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getScanIcon = (type: string) => {
    switch (type) {
      case 'monitoring': return <Search className="w-4 h-4" />;
      case 'copyright': return <Shield className="w-4 h-4" />;
      case 'social': return <Share2 className="w-4 h-4" />;
      case 'web': return <Globe className="w-4 h-4" />;
      case 'deepfake': return <Brain className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const renderScanCard = (scan: ScanResult) => (
    <Card key={scan.id} className="border border-border/50 hover:border-border transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getScanIcon(scan.type)}
            <span className="font-medium text-sm">{scan.title}</span>
          </div>
          <Badge className={getStatusColor(scan.status)}>
            {scan.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(scan.date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {scan.matches} matches
          </div>
          
          {scan.confidence && (
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {Math.round(scan.confidence * 100)}% confidence
            </div>
          )}
          
          {scan.threatLevel && (
            <div className="flex items-center gap-1">
              <Badge variant={getThreatLevelColor(scan.threatLevel)} className="text-xs">
                {scan.threatLevel} threat
              </Badge>
            </div>
          )}
        </div>
        
        {scan.source && (
          <div className="mt-2 text-xs text-muted-foreground">
            Source: {scan.source}
          </div>
        )}
        
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" className="text-xs">
            <Eye className="w-3 h-3 mr-1" />
            View Details
          </Button>
          {scan.source && (
            <Button size="sm" variant="ghost" className="text-xs">
              <ExternalLink className="w-3 h-3 mr-1" />
              Source
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Scan History Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monitoring" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="monitoring" className="flex items-center gap-1">
              <Search className="w-3 h-3" />
              Monitoring ({scanResults.monitoring.length})
            </TabsTrigger>
            <TabsTrigger value="copyright" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Copyright ({scanResults.copyright.length})
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-1">
              <Share2 className="w-3 h-3" />
              Social ({scanResults.socialMedia.length})
            </TabsTrigger>
            <TabsTrigger value="web" className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Web ({scanResults.webScans.length})
            </TabsTrigger>
            <TabsTrigger value="deepfake" className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              Deepfake ({scanResults.deepfake.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="mt-4">
            <div className="grid gap-4">
              {scanResults.monitoring.length > 0 ? (
                scanResults.monitoring.map(renderScanCard)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No monitoring scans found
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="copyright" className="mt-4">
            <div className="grid gap-4">
              {scanResults.copyright.length > 0 ? (
                scanResults.copyright.map(renderScanCard)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No copyright matches found
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="social" className="mt-4">
            <div className="grid gap-4">
              {scanResults.socialMedia.length > 0 ? (
                scanResults.socialMedia.map(renderScanCard)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No social media scans found
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="web" className="mt-4">
            <div className="grid gap-4">
              {scanResults.webScans.length > 0 ? (
                scanResults.webScans.map(renderScanCard)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No web scans found
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="deepfake" className="mt-4">
            <div className="grid gap-4">
              {scanResults.deepfake.length > 0 ? (
                scanResults.deepfake.map(renderScanCard)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No deepfake detections found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};