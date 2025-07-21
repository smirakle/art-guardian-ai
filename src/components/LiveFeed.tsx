import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  Shield, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Globe,
  Search,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FeedItem {
  id: string;
  timestamp: Date;
  type: 'scan' | 'match' | 'alert' | 'upload';
  message: string;
  details: string;
  platform?: string;
}

interface LiveFeedProps {
  isActive: boolean;
}

const LiveFeed = ({ isActive }: LiveFeedProps) => {
  const { user } = useAuth();
  const [feed, setFeed] = useState<FeedItem[]>([]);

  useEffect(() => {
    if (!isActive) return;

    const loadInitialData = async () => {
      try {
        const items: FeedItem[] = [];

        // Load recent artwork uploads
        const { data: artworks } = await supabase
          .from('artwork')
          .select('id, title, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(10);

        if (artworks) {
          artworks.forEach(artwork => {
            items.push({
              id: `artwork-${artwork.id}`,
              timestamp: new Date(artwork.created_at),
              type: 'upload',
              message: `Artwork "${artwork.title}" uploaded for protection`,
              details: 'Blockchain registration and monitoring activated',
            });
          });
        }

        // Load recent monitoring scans
        const { data: scans } = await supabase
          .from('monitoring_scans')
          .select(`
            id, 
            status, 
            scan_type, 
            created_at, 
            total_sources,
            scanned_sources,
            matches_found,
            artwork:artwork_id (title)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (scans) {
          scans.forEach(scan => {
            const progress = scan.total_sources ? Math.round((scan.scanned_sources / scan.total_sources) * 100) : 0;
            items.push({
              id: `scan-${scan.id}`,
              timestamp: new Date(scan.created_at),
              type: 'scan',
              message: `${scan.scan_type || 'Monitoring scan'} ${scan.status}`,
              details: `Artwork: "${scan.artwork?.title || 'Unknown'}" • Progress: ${progress}% • ${scan.matches_found || 0} matches found`,
            });
          });
        }

        // Load recent copyright matches
        const { data: matches } = await supabase
          .from('copyright_matches')
          .select('id, source_domain, source_title, match_confidence, threat_level, detected_at')
          .order('detected_at', { ascending: false })
          .limit(10);

        if (matches) {
          matches.forEach(match => {
            items.push({
              id: `match-${match.id}`,
              timestamp: new Date(match.detected_at),
              type: 'match',
              message: `Copyright match detected on ${match.source_domain}`,
              details: `${match.match_confidence}% confidence • ${match.threat_level} threat`,
              platform: match.source_domain,
            });
          });
        }

        // Load recent alerts
        const { data: alerts } = await supabase
          .from('monitoring_alerts')
          .select('id, alert_type, title, message, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        if (alerts) {
          alerts.forEach(alert => {
            items.push({
              id: `alert-${alert.id}`,
              timestamp: new Date(alert.created_at),
              type: 'alert',
              message: alert.title || `${alert.alert_type} alert`,
              details: alert.message || 'Copyright protection alert',
            });
          });
        }

        // Sort by timestamp and keep most recent
        items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setFeed(items.slice(0, 50));

      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();

    // Set up real-time subscriptions
    const artworkChannel = supabase
      .channel('artwork-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'artwork'
      }, (payload) => {
        const artwork = payload.new as any;
        const newItem: FeedItem = {
          id: `artwork-${artwork.id}`,
          timestamp: new Date(artwork.created_at),
          type: 'upload',
          message: `Artwork "${artwork.title}" uploaded for protection`,
          details: 'Blockchain registration and monitoring activated',
        };
        setFeed(prev => [newItem, ...prev.slice(0, 49)]);
      })
      .subscribe();

    const scanChannel = supabase
      .channel('scan-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'monitoring_scans'
      }, (payload) => {
        const scan = (payload.new || payload.old) as any;
        if (!scan) return;
        
        const progress = scan.total_sources ? Math.round((scan.scanned_sources / scan.total_sources) * 100) : 0;
        const newItem: FeedItem = {
          id: `scan-${scan.id}-${Date.now()}`,
          timestamp: new Date(),
          type: 'scan',
          message: `${scan.scan_type || 'Monitoring scan'} ${scan.status}`,
          details: `Progress: ${progress}% • ${scan.matches_found || 0} matches found`,
        };
        setFeed(prev => [newItem, ...prev.slice(0, 49)]);
      })
      .subscribe();

    const matchChannel = supabase
      .channel('match-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'copyright_matches'
      }, (payload) => {
        const match = payload.new as any;
        const newItem: FeedItem = {
          id: `match-${match.id}`,
          timestamp: new Date(match.detected_at),
          type: 'match',
          message: `Copyright match detected on ${match.source_domain}`,
          details: `${match.match_confidence}% confidence • ${match.threat_level} threat`,
          platform: match.source_domain,
        };
        setFeed(prev => [newItem, ...prev.slice(0, 49)]);
      })
      .subscribe();

    const alertChannel = supabase
      .channel('alert-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'monitoring_alerts'
      }, (payload) => {
        const alert = payload.new as any;
        const newItem: FeedItem = {
          id: `alert-${alert.id}`,
          timestamp: new Date(alert.created_at),
          type: 'alert',
          message: alert.title || `${alert.alert_type} alert`,
          details: alert.message || 'Copyright protection alert',
        };
        setFeed(prev => [newItem, ...prev.slice(0, 49)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(artworkChannel);
      supabase.removeChannel(scanChannel);
      supabase.removeChannel(matchChannel);
      supabase.removeChannel(alertChannel);
    };
  }, [isActive]);

  const getIcon = (type: FeedItem['type']) => {
    switch (type) {
      case 'scan':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'match':
        return <Search className="w-4 h-4 text-yellow-500" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'upload':
        return <FileText className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBadgeVariant = (type: FeedItem['type']) => {
    switch (type) {
      case 'alert':
        return 'destructive' as const;
      case 'upload':
        return 'default' as const;
      case 'match':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Live Activity Feed
          {isActive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
        </CardTitle>
        <CardDescription>
          Real-time monitoring events and system activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {!isActive && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Monitoring is paused</p>
                <p className="text-sm">Resume monitoring to see live activity</p>
              </div>
            )}
            
            {feed.length === 0 && isActive && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Upload artwork or start monitoring to see live events</p>
              </div>
            )}
            
            {feed.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30 animate-fade-in"
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{item.message}</p>
                    <Badge variant={getBadgeVariant(item.type)} className="text-xs">
                      {item.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.details}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{item.timestamp.toLocaleTimeString()}</span>
                    {item.platform && (
                      <>
                        <Globe className="w-3 h-3" />
                        <span>{item.platform}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveFeed;
