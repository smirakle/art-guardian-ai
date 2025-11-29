import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UserGuide } from '@/components/UserGuide';
import { monitoringHubGuide } from '@/data/userGuides';
import { 
  Monitor, 
  Search, 
  Eye, 
  User,
  Briefcase,
  Award,
  Image,
  AlertTriangle,
  TrendingUp,
  Shield,
  Activity,
  CheckCircle,
  Clock,
  Zap,
  Info,
  ChevronDown,
  PlayCircle,
  PauseCircle,
  Settings
} from 'lucide-react';
import { BugReportButton } from '@/components/BugReportButton';

// Import existing components
import { PortfolioDashboard } from '@/components/portfolio/PortfolioDashboard';
import { OpenAIDiagnostics } from '@/components/admin/OpenAIDiagnostics';
import AdminOnly from '@/components/AdminOnly';

const MonitoringHub = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [monitoringActive, setMonitoringActive] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Shield className="w-10 h-10 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Monitoring & Detection Hub
          </h1>
          <UserGuide 
            title={monitoringHubGuide.title}
            description={monitoringHubGuide.description}
            sections={monitoringHubGuide.sections}
          />
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
          Comprehensive monitoring across portfolios, profiles, trademarks, and content forgery detection
        </p>
        
        {/* System Status Alert */}
        <Alert className="max-w-3xl mx-auto mb-4 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {monitoringActive ? (
                <>
                  <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                  <AlertDescription className="flex items-center gap-2">
                    <span className="font-medium">Status: Active</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      All Systems Operational
                    </Badge>
                  </AlertDescription>
                </>
              ) : (
                <>
                  <PauseCircle className="h-4 w-4 text-orange-500" />
                  <AlertDescription>
                    <span className="font-medium">Monitoring Paused</span>
                  </AlertDescription>
                </>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setMonitoringActive(!monitoringActive)}
            >
              {monitoringActive ? (
                <>
                  <PauseCircle className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
          </div>
        </Alert>
        
        <div className="flex justify-center gap-2 mt-4">
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500">
            <Zap className="h-3 w-3 mr-1" />
            Real-Time Scanning
          </Badge>
          <Badge className="bg-gradient-to-r from-green-500 to-teal-500">
            <Eye className="h-3 w-3 mr-1" />
            Multi-Platform Detection
          </Badge>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
            <TrendingUp className="h-3 w-3 mr-1" />
            Advanced Analytics
          </Badge>
        </div>
      </div>

      {/* Monitoring Stats - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <CardContent className="pt-6 text-center">
            <div className="relative">
              <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
            </div>
            <div className="text-2xl font-bold">24/7</div>
            <p className="text-sm text-muted-foreground">Active Monitoring</p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
                Live
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <CardContent className="pt-6 text-center">
            <Search className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">1,847</div>
            <p className="text-sm text-muted-foreground">Scans Completed</p>
            <Progress value={85} className="h-1 mt-2" />
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">23</div>
            <p className="text-sm text-muted-foreground">Violations Found</p>
            <Badge variant="destructive" className="text-xs mt-2">
              Requires Review
            </Badge>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">96.2%</div>
            <p className="text-sm text-muted-foreground">Protection Rate</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">+2.4%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-indigo-500">
          <CardContent className="pt-6 text-center">
            <Eye className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
            <div className="text-2xl font-bold">127</div>
            <p className="text-sm text-muted-foreground">Platforms Monitored</p>
            <Badge variant="outline" className="text-xs mt-2 text-indigo-600 border-indigo-600">
              Expanding
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs - Enhanced */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto gap-2">
          <TabsTrigger value="portfolio" className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary/10">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Portfolio</span>
              <CheckCircle className="h-3 w-3 text-green-500" />
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">Content tracking</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary/10">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
              <Badge variant="outline" className="text-xs ml-1">Soon</Badge>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">Identity monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="trademark" className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary/10">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Trademark</span>
              <Badge variant="outline" className="text-xs ml-1">Soon</Badge>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">Brand protection</span>
          </TabsTrigger>
          <TabsTrigger value="deepfake" className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary/10">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Deepfake</span>
              <CheckCircle className="h-3 w-3 text-green-500" />
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">AI detection</span>
          </TabsTrigger>
          <TabsTrigger value="forgery" className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary/10">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span>Forgery</span>
              <CheckCircle className="h-3 w-3 text-green-500" />
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">Image forensics</span>
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary/10">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Diagnostics</span>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">System health</span>
          </TabsTrigger>
        </TabsList>

        {/* Portfolio Monitoring Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <PortfolioDashboard />
        </TabsContent>

        {/* Profile Monitoring Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-2 border-dashed border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-8 w-8 text-primary" />
                Profile Monitoring
                <Badge variant="secondary">Coming Soon</Badge>
              </CardTitle>
              <CardDescription>
                Monitor your digital identity across platforms and detect impersonation attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="bg-muted/50">
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Advanced profile monitoring dashboard with real-time threat detection and analytics is currently under development.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Planned Features
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Cross-platform identity monitoring</li>
                      <li>• Impersonation detection</li>
                      <li>• Social media account tracking</li>
                      <li>• Reputation management tools</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-accent" />
                      Get Notified
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Want early access when this feature launches?
                    </p>
                    <Button size="sm" variant="outline">
                      Join Waitlist
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trademark Monitoring Tab */}
        <TabsContent value="trademark" className="space-y-6">
          <Card className="border-2 border-dashed border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-8 w-8 text-primary" />
                Trademark Monitoring
                <Badge variant="secondary">Coming Soon</Badge>
              </CardTitle>
              <CardDescription>
                Protect your brand across global databases, marketplaces, and domain registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="bg-muted/50">
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Comprehensive trademark monitoring across global databases and marketplaces is currently under development.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Planned Features
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• USPTO & international trademark monitoring</li>
                      <li>• Domain name infringement detection</li>
                      <li>• Marketplace brand violation tracking</li>
                      <li>• Automated cease & desist generation</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-accent" />
                      Get Notified
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Want early access when this feature launches?
                    </p>
                    <Button size="sm" variant="outline">
                      Join Waitlist
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deepfake Detection Tab */}
        <TabsContent value="deepfake" className="space-y-6">
          {/* Quick Overview Card */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Deepfake Detection Overview
                <Badge variant="outline" className="ml-auto">Active</Badge>
              </CardTitle>
              <CardDescription>
                AI-powered detection of synthetic media, face swaps, and voice synthesis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                    <div className="font-semibold text-lg">98.7%</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Avg Speed</div>
                    <div className="font-semibold text-lg">2.3s</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Platforms</div>
                    <div className="font-semibold text-lg">47 Active</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Real-Time Detection
                </CardTitle>
                <CardDescription>
                  Start a scan to detect deepfakes in images and videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Detection Accuracy</span>
                      <Badge className="bg-green-500">98.7%</Badge>
                    </div>
                    <Progress value={98.7} className="h-2" />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Processing Speed</span>
                      <Badge className="bg-blue-500">2.3s avg</Badge>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Platforms Monitored</span>
                      <Badge className="bg-purple-500">47 active</Badge>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="lg" onClick={() => navigate('/forgery-detection?tab=ai-detection')}>
                    <Search className="h-4 w-4 mr-2" />
                    Start Deepfake Scan
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Recent Detections
                </CardTitle>
                <CardDescription>
                  Latest deepfake threats detected across monitored platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">High-quality deepfake detected</span>
                    </div>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span className="text-sm">Face swap attempt identified</span>
                    </div>
                    <Badge className="bg-orange-500">Warning</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span className="text-sm">Voice synthesis detected</span>
                    </div>
                    <Badge className="bg-yellow-500">Low Risk</Badge>
                  </div>
                  <Button variant="outline" className="w-full mt-2" onClick={() => navigate('/forgery-detection')}>
                    View All Detections
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forgery Detection Tab */}
        <TabsContent value="forgery" className="space-y-6">
          {/* Quick Overview Card */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                Image Forgery Analysis Overview
                <Badge variant="outline" className="ml-auto">Active</Badge>
              </CardTitle>
              <CardDescription>
                Advanced forensics to detect manipulation, splicing, and AI-generated content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="font-semibold">Active</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Analysis</div>
                    <div className="font-semibold">Enhanced</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">AI Detection</div>
                    <div className="font-semibold">Enabled</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-primary" />
                  Forensic Analysis
                </CardTitle>
                <CardDescription>
                  Upload images for comprehensive forgery detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Manipulation Detection</span>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Metadata Analysis</span>
                      <Badge className="bg-blue-500">Enhanced</Badge>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">AI-Generated Detection</span>
                      <Badge className="bg-purple-500">AI-Powered</Badge>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <Button className="w-full mt-4" size="lg" onClick={() => navigate('/forgery-detection?tab=forgery-detection')}>
                    <Monitor className="h-4 w-4 mr-2" />
                    Analyze Image
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  Detection Techniques
                </CardTitle>
                <CardDescription>
                  Advanced forensic methods used for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Copy-move detection algorithms', icon: CheckCircle },
                    { name: 'Splice detection neural networks', icon: CheckCircle },
                    { name: 'EXIF metadata forensics', icon: CheckCircle },
                    { name: 'Compression artifact analysis', icon: CheckCircle },
                    { name: 'AI generation fingerprinting', icon: CheckCircle },
                    { name: 'Geometric transformation detection', icon: CheckCircle }
                  ].map((technique, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <technique.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{technique.name}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/forgery-detection')}>
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics" className="space-y-6">
          <AdminOnly>
            <OpenAIDiagnostics />
          </AdminOnly>
        </TabsContent>
      </Tabs>

      {/* Action Panel - Enhanced */}
      <Card className="mt-8 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Fast access to key monitoring and detection tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="flex items-center gap-2 h-auto py-4 flex-col" 
              onClick={() => navigate('/portfolio-monitoring')}
            >
              <Search className="h-5 w-5" />
              <div className="text-center">
                <div className="font-semibold">Comprehensive Scan</div>
                <div className="text-xs opacity-90">Full portfolio analysis</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-auto py-4 flex-col hover:bg-orange-500/10 hover:border-orange-500" 
              onClick={() => navigate('/ai-protection')}
            >
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div className="text-center">
                <div className="font-semibold">View All Alerts</div>
                <div className="text-xs opacity-70">23 violations found</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-auto py-4 flex-col hover:bg-primary/10 hover:border-primary" 
              onClick={() => navigate('/analytics')}
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Analytics Dashboard</div>
                <div className="text-xs opacity-70">View detailed reports</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
      <BugReportButton />
    </div>
  );
};

export default MonitoringHub;