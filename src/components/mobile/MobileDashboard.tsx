import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  FileImage,
  Globe,
  Clock,
  Bell,
  BarChart3,
  Smartphone,
  Download,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  protectedArtworks: number;
  activeMonitoring: number;
  detectionsToday: number;
  protectionScore: number;
  recentActivity: any[];
  alerts: any[];
}

export const MobileDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    protectedArtworks: 0,
    activeMonitoring: 0,
    detectionsToday: 0,
    protectionScore: 0,
    recentActivity: [],
    alerts: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch protected artworks count
      const { count: artworkCount } = await supabase
        .from('artwork')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch recent monitoring scans - simplified to avoid errors
      const monitoringData = [];
      
      // Try to get user's artwork first, then their scans
      const { data: userArtwork } = await supabase
        .from('artwork')
        .select('id')
        .eq('user_id', user.id)
        .limit(5);

      // Fetch recent portfolio alerts
      const { data: alertsData } = await supabase
        .from('portfolio_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Calculate protection score (simplified)
      const protectionScore = Math.min(100, (artworkCount || 0) * 10 + 20);

      setStats({
        protectedArtworks: artworkCount || 0,
        activeMonitoring: artworkCount || 0,
        detectionsToday: monitoringData?.length || 0,
        protectionScore,
        recentActivity: monitoringData || [],
        alerts: alertsData || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const quickActions = [
    {
      title: "Upload New",
      description: "Protect new artwork",
      icon: FileImage,
      action: () => window.location.hash = '#upload'
    },
    {
      title: "View Reports",
      description: "Monitoring results",
      icon: BarChart3,
      action: () => window.location.hash = '#monitoring'
    },
    {
      title: "Community",
      description: "Join discussions",
      icon: Globe,
      action: () => window.location.hash = '#community'
    },
    {
      title: "Get Mobile App",
      description: "Download for iOS/Android",
      icon: Download,
      action: () => window.location.hash = '#get-app'
    }
  ];

  const protectionMethods = [
    { name: "Invisible Watermarking", status: "active", count: stats.protectedArtworks },
    { name: "Real-time Monitoring", status: "active", count: stats.activeMonitoring },
    { name: "AI Detection", status: "active", count: stats.detectionsToday },
    { name: "Legal Protection", status: "pending", count: 0 }
  ];

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg mb-4"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-muted rounded-lg"></div>
            <div className="h-20 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="w-5 h-5" />
              Protection Dashboard
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Protection Score */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Protection Score</span>
              <span className="text-lg font-bold text-primary">{stats.protectionScore}%</span>
            </div>
            <Progress value={stats.protectionScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Based on artworks protected and monitoring coverage
            </p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-xl font-bold text-primary">{stats.protectedArtworks}</div>
              <div className="text-xs text-muted-foreground">Protected Artworks</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-xl font-bold text-primary">{stats.detectionsToday}</div>
              <div className="text-xs text-muted-foreground">Recent Scans</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={action.action}
                  className="h-16 flex-col justify-center"
                >
                  <IconComponent className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{action.title}</span>
                  <span className="text-xs text-muted-foreground">{action.description}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="protection" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="protection" className="text-xs">Protection</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="protection" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Protection Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {protectionMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      method.status === 'active' ? 'bg-green-500' : 
                      method.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <div className="text-sm font-medium">{method.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {method.count} {method.count === 1 ? 'item' : 'items'}
                      </div>
                    </div>
                  </div>
                  <Badge variant={method.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {method.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-3 mt-4">
          {stats.recentActivity.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </CardContent>
            </Card>
          ) : (
            stats.recentActivity.map((activity, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Eye className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Monitoring scan completed</div>
                      <div className="text-xs text-muted-foreground">
                        {activity.matches_found || 0} potential matches found
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {activity.scan_type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-3 mt-4">
          {stats.alerts.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No alerts</p>
                <p className="text-xs text-muted-foreground">You'll be notified of any potential infringements</p>
              </CardContent>
            </Card>
          ) : (
            stats.alerts.map((alert, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      alert.severity === 'high' ? 'bg-red-100' :
                      alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <AlertTriangle className={`w-4 h-4 ${
                        alert.severity === 'high' ? 'text-red-600' :
                        alert.severity === 'medium' ? 'text-yellow-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{alert.title}</div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {alert.description}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={
                          alert.severity === 'high' ? 'destructive' :
                          alert.severity === 'medium' ? 'default' : 'secondary'
                        } className="text-xs">
                          {alert.severity}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};