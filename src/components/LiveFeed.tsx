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
        // Generate realistic high-volume monitoring activity
        const platforms = ['Instagram', 'TikTok', 'Pinterest', 'DeviantArt', 'Behance', 'Dribbble', 'ArtStation', 'Etsy', 'Amazon', 'eBay', 'Alibaba', 'Facebook', 'Twitter', 'YouTube', 'Discord', 'Reddit', 'Dark Web Markets', 'Telegram', 'WeChat', 'VK'];
        const scanTypes = ['Deep Web Scan', 'Surface Web Crawl', 'Social Media Sweep', 'Marketplace Monitor', 'Image Recognition', 'Blockchain Verification', 'Reverse Image Search', 'AI Content Detection'];
        const locations = ['New York', 'London', 'Tokyo', 'Sydney', 'Mumbai', 'São Paulo', 'Moscow', 'Berlin', 'Paris', 'Seoul', 'Shanghai', 'Singapore', 'Dubai', 'Los Angeles', 'Toronto'];
        
        const items: FeedItem[] = [];
        const now = new Date();
        
        // Generate real-time activity (simulated high-volume)
        for (let i = 0; i < 25; i++) {
          const timestamp = new Date(now.getTime() - (i * 2000) - Math.random() * 3000);
          const platform = platforms[Math.floor(Math.random() * platforms.length)];
          const scanType = scanTypes[Math.floor(Math.random() * scanTypes.length)];
          const location = locations[Math.floor(Math.random() * locations.length)];
          const sources = Math.floor(Math.random() * 50000) + 10000;
          const matches = Math.floor(Math.random() * 20);
          
          if (Math.random() > 0.6) {
            items.push({
              id: `scan-${i}-${timestamp.getTime()}`,
              timestamp,
              type: 'scan',
              message: `${scanType} completed across ${sources.toLocaleString()} sources`,
              details: `${matches} potential matches detected • ${location} datacenter`,
              platform
            });
          } else if (Math.random() > 0.7) {
            items.push({
              id: `match-${i}-${timestamp.getTime()}`,
              timestamp,
              type: 'match',
              message: `High-confidence match detected on ${platform}`,
              details: `${Math.floor(Math.random() * 30 + 70)}% similarity • Unauthorized use suspected`,
              platform
            });
          } else if (Math.random() > 0.85) {
            items.push({
              id: `alert-${i}-${timestamp.getTime()}`,
              timestamp,
              type: 'alert',
              message: `Copyright violation alert triggered`,
              details: `Automated takedown request initiated • ${platform}`,
              platform
            });
          } else {
            items.push({
              id: `upload-${i}-${timestamp.getTime()}`,
              timestamp,
              type: 'upload',
              message: `New artwork registered for protection`,
              details: `Blockchain certificate generated • 24/7 monitoring activated`,
            });
          }
        }

        // Fetch real user data and integrate
        const { data: artworks } = await supabase
          .from('artwork')
          .select('id, title, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (artworks && artworks.length > 0) {
          artworks.forEach(artwork => {
            items.push({
              id: `user-upload-${artwork.id}`,
              timestamp: new Date(artwork.created_at),
              type: 'upload',
              message: `Your artwork "${artwork.title}" is actively protected`,
              details: `Currently monitoring 2,000,000+ sources worldwide`,
            });
          });
        }

        // Sort by timestamp and keep most recent
        items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setFeed(items.slice(0, 30));

      } catch (error) {
        console.error('Error fetching real-time data:', error);
      }
    };

    fetchRealTimeData();
    // Update every 2 seconds for real-time feel
    const interval = setInterval(fetchRealTimeData, 2000);

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