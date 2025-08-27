import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  Upload, 
  AlertTriangle, 
  TrendingUp, 
  Image as ImageIcon,
  Bell,
  Search,
  Menu,
  Plus,
  Eye,
  Calendar,
  MapPin
} from 'lucide-react';

const MobileHomePage = () => {
  const recentAlerts = [
    {
      id: 1,
      type: 'violation',
      title: 'Art found on unauthorized site',
      description: 'Digital painting detected on marketplace',
      time: '2 hours ago',
      severity: 'high'
    },
    {
      id: 2,
      type: 'protection',
      title: 'New artwork protected',
      description: 'Landscape photography added to monitoring',
      time: '5 hours ago',
      severity: 'info'
    }
  ];

  const quickStats = [
    { label: 'Protected', value: '24', icon: Shield, color: 'text-green-500' },
    { label: 'Violations', value: '3', icon: AlertTriangle, color: 'text-red-500' },
    { label: 'This Month', value: '12', icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Uploaded', value: '156', icon: ImageIcon, color: 'text-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Mobile Status Bar */}
      <div className="bg-black text-white text-xs px-4 py-1 flex justify-between items-center">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
          </div>
          <span className="ml-2">100%</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Good morning, Jane</p>
              <p className="text-xs text-muted-foreground">Your art is protected</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">3</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          {quickStats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto flex-col py-4 gap-2">
                <Upload className="h-6 w-6 text-primary" />
                <span className="text-sm">Upload Art</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2">
                <Search className="h-6 w-6 text-primary" />
                <span className="text-sm">Search Web</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className={`p-2 rounded-full ${
                  alert.severity === 'high' ? 'bg-red-100 text-red-600' : 
                  alert.severity === 'info' ? 'bg-blue-100 text-blue-600' : 
                  'bg-gray-100 text-gray-600'
                }`}>
                  {alert.type === 'violation' ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Portfolio Overview */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Your Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-2 bg-white/20 backdrop-blur-sm rounded border border-white/30"></div>
                  <Badge 
                    variant={i <= 2 ? "destructive" : "secondary"} 
                    className="absolute top-1 right-1 text-[8px] px-1 py-0"
                  >
                    {i <= 2 ? "Alert" : "Safe"}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Artwork
            </Button>
          </CardContent>
        </Card>

        {/* Recent Scans */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium text-sm">Web Monitoring</p>
                  <p className="text-xs text-muted-foreground">Scanning 847 sites</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Daily Scan</p>
                  <p className="text-xs text-muted-foreground">Last run: 2 hours ago</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Complete
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="grid grid-cols-4 py-2">
          {[
            { icon: Shield, label: 'Home', active: true },
            { icon: Upload, label: 'Upload', active: false },
            { icon: Search, label: 'Monitor', active: false },
            { icon: Menu, label: 'More', active: false }
          ].map((tab, index) => (
            <button key={index} className="flex flex-col items-center py-2 px-1">
              <tab.icon className={`h-5 w-5 ${tab.active ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] mt-1 ${tab.active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom padding to account for navigation */}
      <div className="h-16"></div>
    </div>
  );
};

export default MobileHomePage;