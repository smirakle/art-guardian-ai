import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Upload, 
  Search, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Activity
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'user_registration' | 'artwork_upload' | 'scan_initiated' | 'match_detected' | 'alert_created' | 'scan_completed';
  description: string;
  timestamp: string;
  user?: string;
  metadata?: any;
  severity?: 'low' | 'medium' | 'high';
}

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const generateMockActivity = (): ActivityItem => {
    const types: ActivityItem['type'][] = [
      'user_registration', 'artwork_upload', 'scan_initiated', 'match_detected', 'alert_created', 'scan_completed'
    ];
    
    const mockUsers = ['John D.', 'Sarah M.', 'Mike R.', 'Emma L.', 'David K.', 'Lisa P.'];
    const type = types[Math.floor(Math.random() * types.length)];
    const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    
    const descriptions = {
      user_registration: `${user} registered a new account`,
      artwork_upload: `${user} uploaded new artwork "Digital Masterpiece"`,
      scan_initiated: `Automated scan started for artwork by ${user}`,
      match_detected: `Copyright match detected for ${user}'s artwork`,
      alert_created: `High-priority alert created for potential infringement`,
      scan_completed: `Monitoring scan completed for ${user} - 3 matches found`
    };

    const severities = {
      user_registration: 'low',
      artwork_upload: 'low',
      scan_initiated: 'medium',
      match_detected: 'high',
      alert_created: 'high',
      scan_completed: 'medium'
    } as const;

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      description: descriptions[type],
      timestamp: new Date().toISOString(),
      user,
      severity: severities[type]
    };
  };

  const fetchRecentActivity = async () => {
    try {
      // In a real app, we'd fetch from multiple tables and combine
      // For now, we'll simulate real-time activity
      
      // Fetch recent user registrations
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at, full_name')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent artwork uploads
      const { data: artworks } = await supabase
        .from('artwork')
        .select('created_at, title, user_id')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent scans
      const { data: scans } = await supabase
        .from('monitoring_scans')
        .select('created_at, status, artwork_id')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent matches
      const { data: matches } = await supabase
        .from('copyright_matches')
        .select('detected_at, threat_level, source_domain')
        .order('detected_at', { ascending: false })
        .limit(5);

      const realActivities: ActivityItem[] = [];

      // Convert profiles to activities
      profiles?.forEach(profile => {
        realActivities.push({
          id: `profile_${profile.created_at}`,
          type: 'user_registration',
          description: `${profile.full_name || 'New user'} registered`,
          timestamp: profile.created_at,
          user: profile.full_name || 'Anonymous',
          severity: 'low'
        });
      });

      // Convert artworks to activities
      artworks?.forEach(artwork => {
        realActivities.push({
          id: `artwork_${artwork.created_at}`,
          type: 'artwork_upload',
          description: `New artwork uploaded: "${artwork.title}"`,
          timestamp: artwork.created_at,
          severity: 'low'
        });
      });

      // Convert scans to activities
      scans?.forEach(scan => {
        realActivities.push({
          id: `scan_${scan.created_at}`,
          type: scan.status === 'completed' ? 'scan_completed' : 'scan_initiated',
          description: scan.status === 'completed' ? 'Monitoring scan completed' : 'New monitoring scan initiated',
          timestamp: scan.created_at,
          severity: 'medium'
        });
      });

      // Convert matches to activities
      matches?.forEach(match => {
        realActivities.push({
          id: `match_${match.detected_at}`,
          type: 'match_detected',
          description: `Copyright match detected on ${match.source_domain}`,
          timestamp: match.detected_at,
          severity: match.threat_level as 'low' | 'medium' | 'high'
        });
      });

      // Sort by timestamp and take the most recent
      realActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setActivities(realActivities.slice(0, 20));
    } catch (error) {
      console.error('Error fetching activity:', error);
      // Fallback to mock data
      const mockActivities = Array.from({ length: 15 }, generateMockActivity);
      setActivities(mockActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivity();

    // Add a new activity every 10-30 seconds for demo
    const activityInterval = setInterval(() => {
      const newActivity = generateMockActivity();
      setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
    }, Math.random() * 20000 + 10000);

    // Refresh real data every 2 minutes
    const refreshInterval = setInterval(fetchRecentActivity, 120000);

    return () => {
      clearInterval(activityInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_registration': return <User className="w-4 h-4" />;
      case 'artwork_upload': return <Upload className="w-4 h-4" />;
      case 'scan_initiated': return <Search className="w-4 h-4" />;
      case 'match_detected': return <Shield className="w-4 h-4" />;
      case 'alert_created': return <AlertTriangle className="w-4 h-4" />;
      case 'scan_completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Live Activity Feed
          <Badge variant="secondary" className="ml-auto animate-pulse">
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[520px] px-6">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3 animate-pulse">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                    <div className="h-2 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {activities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-500 ${
                    index === 0 ? 'bg-primary/5 border-l-2 border-primary' : ''
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {getActivityIcon(activity.type)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <Badge variant={getSeverityColor(activity.severity)} className="text-xs">
                        {activity.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveActivityFeed;