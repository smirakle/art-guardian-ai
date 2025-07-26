import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Activity, 
  Upload, 
  FileImage, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Eye,
  Clock,
  Globe,
  Brain,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RealTimeMonitoringWidget } from '@/components/dashboard/RealTimeMonitoringWidget';
import { RecentDetectionsWidget } from '@/components/dashboard/RecentDetectionsWidget';
import { MonitoringWidget } from '@/components/dashboard/MonitoringWidget';
import { UploadWidget } from '@/components/dashboard/UploadWidget';

interface DashboardStats {
  protectedArtworks: number;
  totalScans: number;
  detectionsThisMonth: number;
  protectionScore: number;
  activeScans: number;
  recentThreatLevel: 'low' | 'medium' | 'high';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    protectedArtworks: 0,
    totalScans: 0,
    detectionsThisMonth: 0,
    protectionScore: 0,
    activeScans: 0,
    recentThreatLevel: 'low'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard useEffect - user:', user);
    if (user) {
      console.log('Loading dashboard stats for user:', user.id);
      loadDashboardStats();
    } else {
      console.log('No user found, not loading dashboard stats');
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      // Load user's artworks count
      const { data: artworkData, count: artworkCount } = await supabase
        .from('artwork')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id);

      // Load monitoring scans
      const artworkIds = artworkData?.map(a => a.id) || [];
      const { data: scanData, count: scanCount } = await supabase
        .from('monitoring_scans')
        .select('*', { count: 'exact' })
        .in('artwork_id', artworkIds);

      // Load copyright matches for threat detection
      const { data: matchData, count: matchCount } = await supabase
        .from('copyright_matches')
        .select('*', { count: 'exact' })
        .in('artwork_id', artworkIds)
        .gte('detected_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Count active scans
      const activeScans = scanData?.filter(scan => scan.status === 'running').length || 0;

      // Calculate protection score based on various factors
      const hasRecentScans = scanData?.some(scan => 
        new Date(scan.started_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      const matchRatio = matchCount && scanCount ? matchCount / scanCount : 0;
      const protectionScore = Math.max(0, Math.min(100, 
        (hasRecentScans ? 50 : 0) + 
        ((artworkCount || 0) > 0 ? 25 : 0) + 
        (matchRatio < 0.1 ? 25 : matchRatio < 0.2 ? 15 : 5)
      ));

      // Determine threat level
      const highThreatMatches = matchData?.filter(m => m.threat_level === 'high').length || 0;
      const mediumThreatMatches = matchData?.filter(m => m.threat_level === 'medium').length || 0;
      const recentThreatLevel = highThreatMatches > 0 ? 'high' : 
                               mediumThreatMatches > 0 ? 'medium' : 'low';

      setStats({
        protectedArtworks: artworkCount || 0,
        totalScans: scanCount || 0,
        detectionsThisMonth: matchCount || 0,
        protectionScore,
        activeScans,
        recentThreatLevel
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentActivity = [
    { id: 1, type: 'scan', description: 'AI monitoring scan completed', time: '2 hours ago', status: 'success' },
    { id: 2, type: 'detection', description: 'Potential match found via real-time scanning', time: '5 hours ago', status: 'warning' },
    { id: 3, type: 'protection', description: 'Copyright protection activated', time: '1 day ago', status: 'success' },
    { id: 4, type: 'upload', description: 'New artwork protected with AI monitoring', time: '2 days ago', status: 'info' }
  ];

  const quickActions = [
    { 
      title: 'Upload Monitoring', 
      description: 'Protect artwork with AI monitoring',
      icon: Brain,
      action: () => {
        // Switch to the Upload tab
        const uploadTab = document.querySelector('[value="upload"]') as HTMLElement;
        if (uploadTab) uploadTab.click();
      },
      color: 'bg-blue-500'
    },
    { 
      title: 'View Protection Status', 
      description: 'Check real-time protection status',
      icon: Activity,
      action: () => {
        // Switch to the Protection tab
        const protectionTab = document.querySelector('[value="protection"]') as HTMLElement;
        if (protectionTab) protectionTab.click();
      },
      color: 'bg-green-500'
    },
    { 
      title: 'AI Detection Reports', 
      description: 'Review AI-powered detections',
      icon: Eye,
      action: () => {
        // Switch to the Detections tab
        const detectionsTab = document.querySelector('[value="detections"]') as HTMLElement;
        if (detectionsTab) detectionsTab.click();
      },
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-muted rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Artist'}!
          </h1>
          <p className="text-muted-foreground">
            Real-time AI monitoring dashboard for your protected content.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protected Artworks</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.protectedArtworks}</div>
              <p className="text-xs text-muted-foreground">
                With AI monitoring active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Scans</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalScans.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeScans} currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Detections</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${
                stats.recentThreatLevel === 'high' ? 'text-red-500' :
                stats.recentThreatLevel === 'medium' ? 'text-yellow-500' :
                'text-green-500'
              }`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.detectionsThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                This month • {stats.recentThreatLevel} risk
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protection Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.protectionScore}%</div>
              <Progress value={stats.protectionScore} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="detections" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Detections
            </TabsTrigger>
            <TabsTrigger value="protection" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Protection
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>AI-powered protection tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start h-auto p-4"
                        onClick={action.action}
                      >
                        <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mr-3`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-sm text-muted-foreground">{action.description}</div>
                        </div>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest AI monitoring updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' :
                          activity.status === 'error' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {activity.description}
                          </p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                        <Badge variant={
                          activity.status === 'success' ? 'default' :
                          activity.status === 'warning' ? 'secondary' :
                          'outline'
                        }>
                          {activity.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Global Protection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>AI Protection Status</span>
                </CardTitle>
                <CardDescription>Real-time AI monitoring across all platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500 mb-2">Active</div>
                    <p className="text-sm text-muted-foreground">AI Monitoring</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500 mb-2">20+</div>
                    <p className="text-sm text-muted-foreground">AI Detection Models</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500 mb-2">24/7</div>
                    <p className="text-sm text-muted-foreground">Real-time Scanning</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time AI Monitoring integrated into Overview */}
            <RealTimeMonitoringWidget />
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <UploadWidget onUploadComplete={(artworkId) => {
              toast({
                title: "Upload Complete",
                description: "Your content is now protected with AI monitoring",
              });
              // Optionally refresh dashboard stats
              loadDashboardStats();
            }} />
          </TabsContent>

          {/* Detections Tab */}
          <TabsContent value="detections" className="space-y-6">
            <RecentDetectionsWidget />
          </TabsContent>

          {/* Protection Tab */}
          <TabsContent value="protection" className="space-y-6">
            <MonitoringWidget />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;