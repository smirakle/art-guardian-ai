import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Activity
} from 'lucide-react';

// Import existing components
import { PortfolioDashboard } from '@/components/portfolio/PortfolioDashboard';

const MonitoringHub = () => {
  const [activeTab, setActiveTab] = useState('portfolio');

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Monitoring & Detection Hub</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Comprehensive monitoring across portfolios, profiles, trademarks, and content forgery detection
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500">
            Real-Time Scanning
          </Badge>
          <Badge className="bg-gradient-to-r from-green-500 to-teal-500">
            Multi-Platform Detection
          </Badge>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
            Advanced Analytics
          </Badge>
        </div>
      </div>

      {/* Monitoring Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">24/7</div>
            <p className="text-sm text-muted-foreground">Active Monitoring</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Search className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">1,847</div>
            <p className="text-sm text-muted-foreground">Scans Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">23</div>
            <p className="text-sm text-muted-foreground">Violations Found</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">96.2%</div>
            <p className="text-sm text-muted-foreground">Protection Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
            <div className="text-2xl font-bold">127</div>
            <p className="text-sm text-muted-foreground">Platforms Monitored</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="trademark" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Trademark
          </TabsTrigger>
          <TabsTrigger value="deepfake" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Deepfake
          </TabsTrigger>
          <TabsTrigger value="forgery" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Forgery
          </TabsTrigger>
        </TabsList>

        {/* Portfolio Monitoring Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <PortfolioDashboard />
        </TabsContent>

        {/* Profile Monitoring Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-12 w-12" />
                Profile Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced profile monitoring dashboard with real-time threat detection and analytics coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trademark Monitoring Tab */}
        <TabsContent value="trademark" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-12 w-12" />
                Trademark Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Comprehensive trademark monitoring across global databases and marketplaces coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deepfake Detection Tab */}
        <TabsContent value="deepfake" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Real-Time Deepfake Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Detection Accuracy</span>
                    <Badge className="bg-green-500">98.7%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Processing Speed</span>
                    <Badge className="bg-blue-500">2.3s avg</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Platforms Monitored</span>
                    <Badge className="bg-purple-500">47 active</Badge>
                  </div>
                  <Button className="w-full mt-4">
                    <Search className="h-4 w-4 mr-2" />
                    Start Deepfake Scan
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Detections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm">High-quality deepfake detected</span>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <span className="text-sm">Face swap attempt identified</span>
                    <Badge className="bg-orange-500">Warning</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                    <span className="text-sm">Voice synthesis detected</span>
                    <Badge className="bg-yellow-500">Low Risk</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forgery Detection Tab */}
        <TabsContent value="forgery" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Image Forgery Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Manipulation Detection</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Metadata Analysis</span>
                    <Badge className="bg-blue-500">Enhanced</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>AI-Generated Detection</span>
                    <Badge className="bg-purple-500">AI-Powered</Badge>
                  </div>
                  <Button className="w-full mt-4">
                    <Monitor className="h-4 w-4 mr-2" />
                    Analyze Image
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detection Techniques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>• Copy-move detection algorithms</div>
                  <div>• Splice detection neural networks</div>
                  <div>• EXIF metadata forensics</div>
                  <div>• Compression artifact analysis</div>
                  <div>• AI generation fingerprinting</div>
                  <div>• Geometric transformation detection</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Panel */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Start Comprehensive Scan
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              View All Alerts
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringHub;