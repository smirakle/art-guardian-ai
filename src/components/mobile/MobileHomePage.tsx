import React, { useState } from 'react';
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
  MapPin,
  ArrowRight,
  Zap,
  Globe,
  Lock,
  Users,
  Play,
  ChevronRight,
  FileText,
  Scale,
  Building,
  Heart,
  ExternalLink,
  Bot,
  FileImage,
  EyeOff,
  Fingerprint,
  BadgeCheck,
  CheckCircle,
  Star
} from 'lucide-react';

const MobileHomePage = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const heroStats = [
    { label: 'Creators Protected', value: '15K+', icon: Users, color: 'text-blue-500' },
    { label: 'Revenue Recovered', value: '$2.4M', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Violations Detected', value: '50K+', icon: AlertTriangle, color: 'text-red-500' },
    { label: 'Monitoring', value: '24/7', icon: Shield, color: 'text-purple-500' }
  ];

  const protectionFeatures = [
    {
      icon: EyeOff,
      title: 'Invisible Art Shield',
      description: 'Prevents AI from learning your style while keeping artwork unchanged',
      badge: 'StyleCloak Tech',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Fingerprint,
      title: 'Smart Detection',
      description: 'Finds copies anywhere online, even when modified or filtered',
      badge: 'Multi-Modal AI',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: BadgeCheck,
      title: 'Blockchain Proof',
      description: 'Immutable certificates proving ownership and creation date',
      badge: 'Permanent Record',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Upload & Protect',
      description: 'Upload artwork and apply invisible protection layers'
    },
    {
      step: '2', 
      title: '24/7 AI Monitoring',
      description: 'AI scans internet, social media, and marketplaces'
    },
    {
      step: '3',
      title: 'Instant Detection',
      description: 'Get notified immediately with detailed evidence'
    },
    {
      step: '4',
      title: 'Automated Response',
      description: 'Automatic takedown notices and legal documentation'
    }
  ];

  const recentAlerts = [
    {
      id: 1,
      type: 'violation',
      title: 'Art found on marketplace',
      description: 'Digital painting detected on unauthorized site',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
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
        {/* Hero Section - Mobile Version */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-6 text-center">
            <Badge variant="secondary" className="mb-4 px-3 py-1 animate-pulse">
              💰 Stop Losing Money to Content Thieves
            </Badge>
            <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Protect Your Art.
            </h1>
            <h2 className="text-xl font-bold mb-4 text-foreground">
              Keep What's Yours.
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Advanced AI-powered protection for digital artists. Monitor, verify, and secure your creative work with blockchain technology.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                Start Free Protection
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm">
                <Play className="mr-1 h-3 w-3" />
                See Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hero Stats - Mobile Grid */}
        <div className="grid grid-cols-2 gap-3">
          {heroStats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Problem Showcase - Mobile */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Art Theft Problems
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Bot className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-700 text-sm">AI Art Theft</span>
              </div>
              <p className="text-xs text-red-600">AI models stealing your style without permission</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FileImage className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-700 text-sm">Fake Products</span>
              </div>
              <p className="text-xs text-red-600">Unauthorized merchandise using your artwork</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Search className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-700 text-sm">Art Copying</span>
              </div>
              <p className="text-xs text-red-600">Direct copying and unauthorized distribution</p>
            </div>
          </CardContent>
        </Card>

        {/* How It Works - Mobile */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              How We Protect You
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {howItWorks.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">{step.step}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Protection Features - Mobile Carousel */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Protection Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {protectionFeatures.map((feature, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-muted/30 to-background">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center shrink-0`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-sm">{feature.title}</h3>
                        <Badge variant="secondary" className="text-xs px-2 py-0">
                          {feature.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
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
            <Button className="w-full" variant="default">
              <ExternalLink className="h-4 w-4 mr-2" />
              Get Full Protection
            </Button>
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