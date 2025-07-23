import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const protectedArtworks = 127;
  const totalScans = 2450;
  const detectionsThisMonth = 8;
  const protectionScore = 94;

  const recentActivity = [
    { id: 1, type: 'scan', description: 'New scan completed for "Digital Dreams"', time: '2 hours ago', status: 'success' },
    { id: 2, type: 'detection', description: 'Potential match found on Instagram', time: '5 hours ago', status: 'warning' },
    { id: 3, type: 'protection', description: 'DMCA takedown successful', time: '1 day ago', status: 'success' },
    { id: 4, type: 'upload', description: 'New artwork "Neon City" protected', time: '2 days ago', status: 'info' }
  ];

  const quickActions = [
    { 
      title: 'Upload New Artwork', 
      description: 'Protect your latest creation',
      icon: Upload,
      action: () => navigate('/upload'),
      color: 'bg-blue-500'
    },
    { 
      title: 'View All Monitoring', 
      description: 'Check all protected artworks',
      icon: Activity,
      action: () => navigate('/monitoring'),
      color: 'bg-green-500'
    },
    { 
      title: 'Legal Templates', 
      description: 'Download DMCA forms',
      icon: FileImage,
      action: () => navigate('/legal-templates'),
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Artist'}!
          </h1>
          <p className="text-muted-foreground">
            Here's your art protection overview for today.
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
              <div className="text-2xl font-bold">{protectedArtworks}</div>
              <p className="text-xs text-muted-foreground">
                +3 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalScans.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +180 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Detections</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{detectionsThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protection Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{protectionScore}%</div>
              <Progress value={protectionScore} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
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
              <CardDescription>Latest updates on your protected artworks</CardDescription>
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

        {/* Protection Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Global Protection Status</span>
            </CardTitle>
            <CardDescription>Real-time monitoring across all platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500 mb-2">Active</div>
                <p className="text-sm text-muted-foreground">Monitoring Status</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500 mb-2">15+</div>
                <p className="text-sm text-muted-foreground">Platforms Covered</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500 mb-2">24/7</div>
                <p className="text-sm text-muted-foreground">Surveillance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;