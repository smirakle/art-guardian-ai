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

interface FeedItem {
  id: string;
  timestamp: Date;
  type: 'scan' | 'detection' | 'protection' | 'alert' | 'resolution';
  message: string;
  details: string;
  platform?: string;
}

interface LiveFeedProps {
  isActive: boolean;
}

const LiveFeed = ({ isActive }: LiveFeedProps) => {
  const [feed, setFeed] = useState<FeedItem[]>([]);

  const generateFeedItem = (): FeedItem => {
    const types: FeedItem['type'][] = ['scan', 'detection', 'protection', 'alert', 'resolution'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const platforms = ['Instagram', 'Pinterest', 'Etsy', 'DeviantArt', 'Behance', 'Twitter', 'Facebook'];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    
    const messages = {
      scan: [
        `Scanning ${platform} for unauthorized usage`,
        `Deep scan initiated across ${platform} marketplace`,
        `Visual recognition scan completed on ${platform}`,
        `AI-powered content analysis running on ${platform}`
      ],
      detection: [
        `Potential match found on ${platform}`,
        `Similar artwork detected on ${platform}`,
        `Possible unauthorized use identified on ${platform}`,
        `Visual similarity alert triggered for ${platform}`
      ],
      protection: [
        `Artwork successfully protected on ${platform}`,
        `Copyright claim submitted to ${platform}`,
        `DMCA takedown request sent to ${platform}`,
        `Legal protection activated for ${platform} content`
      ],
      alert: [
        `High-priority alert generated for ${platform}`,
        `Commercial usage detected on ${platform}`,
        `License violation reported on ${platform}`,
        `Watermark removal detected on ${platform}`
      ],
      resolution: [
        `Copyright issue resolved on ${platform}`,
        `Infringing content removed from ${platform}`,
        `Settlement reached with ${platform} user`,
        `Licensing agreement established for ${platform}`
      ]
    };

    const details = {
      scan: [
        'Advanced AI algorithms analyzing visual content',
        'Cross-referencing with protected artwork database',
        'Metadata comparison and hash matching in progress',
        'Reverse image search across platform database'
      ],
      detection: [
        'Confidence level: 87% - Manual review recommended',
        'Similarity score: 94% - High probability match',
        'Multiple instances found - Bulk action suggested',
        'Commercial context detected - Priority escalation'
      ],
      protection: [
        'Legal documentation automatically generated',
        'Platform notification system engaged',
        'Artist notification sent via secure channel',
        'Evidence package compiled for legal proceedings'
      ],
      alert: [
        'Immediate action required - Potential revenue loss',
        'High-value artwork compromised - Premium support activated',
        'Multiple platform violation - Cross-platform response initiated',
        'Repeat offender detected - Enhanced monitoring activated'
      ],
      resolution: [
        'Artist compensation secured - Case closed',
        'Offending party complied - Monitoring continues',
        'Platform cooperation confirmed - Future prevention measures applied',
        'Legal precedent established - Database updated'
      ]
    };

    return {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date(),
      type,
      message: messages[type][Math.floor(Math.random() * messages[type].length)],
      details: details[type][Math.floor(Math.random() * details[type].length)],
      platform
    };
  };

  useEffect(() => {
    if (!isActive) return;

    // Add initial items
    const initialItems = Array.from({ length: 5 }, generateFeedItem);
    setFeed(initialItems.reverse());

    const interval = setInterval(() => {
      const newItem = generateFeedItem();
      setFeed(prev => [newItem, ...prev.slice(0, 49)]); // Keep only 50 most recent
    }, Math.random() * 3000 + 2000); // Random interval between 2-5 seconds

    return () => clearInterval(interval);
  }, [isActive]);

  const getIcon = (type: FeedItem['type']) => {
    switch (type) {
      case 'scan':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'detection':
        return <Search className="w-4 h-4 text-yellow-500" />;
      case 'protection':
        return <Shield className="w-4 h-4 text-green-500" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'resolution':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBadgeVariant = (type: FeedItem['type']) => {
    switch (type) {
      case 'alert':
        return 'destructive' as const;
      case 'protection':
      case 'resolution':
        return 'default' as const;
      case 'detection':
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