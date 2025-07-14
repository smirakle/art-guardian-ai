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
    if (!isActive || !user) return;

    const fetchRealTimeData = async () => {
      try {
        const { data: artworks } = await supabase
          .from('artwork')
          .select('id, title, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        const items: FeedItem[] = [];

        if (artworks && artworks.length > 0) {
          const artworkIds = artworks.map(a => a.id);

          // Recent uploads
          artworks.forEach(artwork => {
            items.push({
              id: `upload-${artwork.id}`,
              timestamp: new Date(artwork.created_at),
              type: 'upload',
              message: `Artwork "${artwork.title}" uploaded and protected`,
              details: '24/7 monitoring activated across all platforms',
            });
          });

          // Recent scans
          const { data: scans } = await supabase
            .from('monitoring_scans')
            .select(`*, artwork:artwork_id(title)`)
            .in('artwork_id', artworkIds)
            .order('created_at', { ascending: false })
            .limit(5);

          scans?.forEach(scan => {
            items.push({
              id: `scan-${scan.id}`,
              timestamp: new Date(scan.created_at),
              type: 'scan',
              message: `Scanning "${(scan.artwork as any)?.title}" across ${scan.total_sources?.toLocaleString()} sources`,
              details: `${scan.scanned_sources?.toLocaleString() || 0} sources scanned, ${scan.matches_found || 0} matches found`,
            });
          });

          // Recent matches
          const { data: matches } = await supabase
            .from('copyright_matches')
            .select(`*, artwork:artwork_id(title)`)
            .in('artwork_id', artworkIds)
            .order('detected_at', { ascending: false })
            .limit(5);

          matches?.forEach(match => {
            items.push({
              id: `match-${match.id}`,
              timestamp: new Date(match.detected_at),
              type: 'match',
              message: `${match.match_type} match detected for "${(match.artwork as any)?.title}"`,
              details: `${Math.round(match.match_confidence)}% confidence on ${match.source_domain}`,
              platform: match.source_domain || undefined
            });
          });

          // Recent alerts
          const { data: alerts } = await supabase
            .from('monitoring_alerts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

          alerts?.forEach(alert => {
            items.push({
              id: `alert-${alert.id}`,
              timestamp: new Date(alert.created_at),
              type: 'alert',
              message: alert.title,
              details: alert.message,
            });
          });
        }

        // Sort by timestamp and keep most recent
        items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setFeed(items.slice(0, 20));

      } catch (error) {
        console.error('Error fetching real-time data:', error);
      }
    };

    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 5000);

    return () => clearInterval(interval);
  }, [isActive, user]);

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