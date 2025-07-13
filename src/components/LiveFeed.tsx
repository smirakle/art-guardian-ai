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
        `Uploaded artwork being scanned on ${platform}`,
        `Deep monitoring initiated for uploaded file on ${platform}`,
        `Visual recognition analyzing uploaded artwork on ${platform}`,
        `AI-powered scan of uploaded content running on ${platform}`,
        `Protected upload being monitored across ${platform}`
      ],
      detection: [
        `Uploaded artwork match detected on ${platform}`,
        `Similar uploaded content found on ${platform}`,
        `Potential unauthorized use of uploaded file on ${platform}`,
        `Visual similarity alert for uploaded artwork on ${platform}`,
        `Copyright infringement detected for uploaded content on ${platform}`
      ],
      protection: [
        `Uploaded artwork successfully protected on ${platform}`,
        `Copyright claim filed for uploaded content on ${platform}`,
        `DMCA takedown request sent for uploaded artwork to ${platform}`,
        `Legal protection activated for uploaded file on ${platform}`,
        `Watermark verification completed for uploaded content`
      ],
      alert: [
        `High-priority alert: uploaded artwork found on ${platform}`,
        `Commercial usage of uploaded content detected on ${platform}`,
        `License violation of uploaded artwork reported on ${platform}`,
        `Watermark removal detected on uploaded file found on ${platform}`,
        `Multiple instances of uploaded artwork found on ${platform}`
      ],
      resolution: [
        `Copyright issue resolved for uploaded artwork on ${platform}`,
        `Infringing uploaded content removed from ${platform}`,
        `Settlement reached regarding uploaded artwork on ${platform}`,
        `Licensing agreement established for uploaded content on ${platform}`,
        `Uploaded artwork protection successfully enforced on ${platform}`
      ]
    };

    const details = {
      scan: [
        'Uploaded artwork being analyzed with advanced AI algorithms',
        'Cross-referencing uploaded content with protected artwork database',
        'Metadata comparison and hash matching for uploaded files in progress',
        'Reverse image search of uploaded artwork across platform database',
        'Digital fingerprinting of uploaded content completed'
      ],
      detection: [
        'Uploaded artwork similarity detected - Confidence level: 87%',
        'High probability match found for uploaded content - Score: 94%',
        'Multiple instances of uploaded artwork found - Bulk action suggested',
        'Commercial context detected for uploaded file - Priority escalation',
        'Unauthorized modification of uploaded artwork detected'
      ],
      protection: [
        'Legal documentation for uploaded artwork automatically generated',
        'Platform notification system engaged for uploaded content',
        'Artist notification sent regarding uploaded artwork protection',
        'Evidence package compiled for uploaded artwork legal proceedings',
        'Copyright registration completed for uploaded content'
      ],
      alert: [
        'Immediate action required - Uploaded artwork revenue at risk',
        'High-value uploaded artwork compromised - Premium support activated',
        'Multiple platform violation of uploaded content detected',
        'Repeat offender targeting uploaded artwork - Enhanced monitoring activated',
        'Commercial exploitation of uploaded artwork detected'
      ],
      resolution: [
        'Uploaded artwork compensation secured - Case closed',
        'Offending party complied regarding uploaded content - Monitoring continues',
        'Platform cooperation confirmed for uploaded artwork protection',
        'Legal precedent established for uploaded content - Database updated',
        'Uploaded artwork licensing agreement successfully negotiated'
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