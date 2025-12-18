import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Eye, 
  Image,
  AlertTriangle,
  Shield,
  Activity,
  CheckCircle,
  Zap,
  Briefcase
} from 'lucide-react';
import { BugReportButton } from '@/components/BugReportButton';
import { PortfolioDashboard } from '@/components/portfolio/PortfolioDashboard';

const MonitoringHub = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Simplified Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Search className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Find Copies</h1>
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Scan the web to find unauthorized copies of your content
        </p>
      </div>

      {/* Simplified Stats - 3 cards only */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">23</div>
            <p className="text-sm text-muted-foreground">Threats Found</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6 text-center">
            <Shield className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">847</div>
            <p className="text-sm text-muted-foreground">Items Protected</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6 text-center">
            <Activity className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">96%</div>
            <p className="text-sm text-muted-foreground">Protection Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Simplified Tabs - 3 working features only */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="portfolio" className="flex items-center gap-2 py-3">
            <Briefcase className="h-4 w-4" />
            <span>Portfolio</span>
          </TabsTrigger>
          <TabsTrigger value="deepfake" className="flex items-center gap-2 py-3">
            <Eye className="h-4 w-4" />
            <span>Deepfake</span>
          </TabsTrigger>
          <TabsTrigger value="forgery" className="flex items-center gap-2 py-3">
            <Image className="h-4 w-4" />
            <span>Forgery</span>
          </TabsTrigger>
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <PortfolioDashboard />
        </TabsContent>

        {/* Deepfake Tab - Simplified */}
        <TabsContent value="deepfake" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Deepfake Detection
              </CardTitle>
              <CardDescription>
                Detect AI-generated faces, voice clones, and synthetic media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">98.7%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">2.3s</div>
                  <div className="text-xs text-muted-foreground">Avg Speed</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">47</div>
                  <div className="text-xs text-muted-foreground">Platforms</div>
                </div>
              </div>
              
              <Button className="w-full" size="lg" onClick={() => navigate('/forgery-detection?tab=ai-detection')}>
                <Search className="h-4 w-4 mr-2" />
                Start Deepfake Scan
              </Button>

              {/* Recent detections */}
              <div className="space-y-2 pt-4 border-t">
                <h4 className="text-sm font-medium text-muted-foreground">Recent Detections</h4>
                <div className="flex justify-between items-center p-2 bg-destructive/10 rounded-lg">
                  <span className="text-sm">High-quality deepfake detected</span>
                  <Badge variant="destructive">Critical</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-500/10 rounded-lg">
                  <span className="text-sm">Face swap attempt identified</span>
                  <Badge className="bg-orange-500">Warning</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forgery Tab - Simplified */}
        <TabsContent value="forgery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                Image Forgery Analysis
              </CardTitle>
              <CardDescription>
                Detect manipulation, splicing, and AI-generated content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {['Manipulation Detection', 'Metadata Analysis', 'AI-Generated Detection'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{item}</span>
                    <Badge variant="outline" className="ml-auto text-xs">Active</Badge>
                  </div>
                ))}
              </div>
              
              <Button className="w-full" size="lg" onClick={() => navigate('/forgery-detection?tab=forgery-detection')}>
                <Image className="h-4 w-4 mr-2" />
                Analyze Image
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Simplified Quick Actions - 2 buttons only */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <Button 
          size="lg"
          className="h-auto py-4"
          onClick={() => navigate('/portfolio-monitoring')}
        >
          <Search className="h-5 w-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">Scan for Copies</div>
            <div className="text-xs opacity-90">Full portfolio analysis</div>
          </div>
        </Button>
        <Button 
          variant="outline"
          size="lg"
          className="h-auto py-4"
          onClick={() => navigate('/ai-protection')}
        >
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
          <div className="text-left">
            <div className="font-semibold">View Alerts</div>
            <div className="text-xs text-muted-foreground">23 violations found</div>
          </div>
        </Button>
      </div>

      <BugReportButton />
    </div>
  );
};

export default MonitoringHub;
