import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Upload, 
  Search, 
  Eye, 
  Brain, 
  Zap, 
  Image,
  Video,
  FileText,
  AlertTriangle,
  TrendingUp,
  Settings
} from 'lucide-react';
import { MonitoringWrapper } from '@/components/MonitoringWrapper';

// Import existing components
import { AIDetectionDashboard } from '@/components/phase1/AIDetectionDashboard';
import { OneClickProtection } from '@/components/phase1/OneClickProtection';
import VisualRecognition from '@/components/VisualRecognition';
import StyleCloak from '@/components/ai-protection/StyleCloak';
import { ProductionMetadataSettings } from '@/components/ai-protection/ProductionMetadataSettings';
import { ProductionCrawlerBlockingSettings } from '@/components/ai-protection/ProductionCrawlerBlockingSettings';
import { ProductionLikenessSettings } from '@/components/ai-protection/ProductionLikenessSettings';
import { AITrainingSettings } from '@/components/AITrainingSettings';
import { BugReportButton } from '@/components/BugReportButton';
import { UserGuide } from '@/components/UserGuide';
import { protectionHubGuide } from '@/data/userGuides';

const ProtectionHub = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const navigate = useNavigate();

  return (
    <MonitoringWrapper componentName="ProtectionHub" budgets={{ pageLoad: 2000, apiCall: 1000 }}>
      <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-4xl font-bold">Content Protection Hub</h1>
          <UserGuide 
            title={protectionHubGuide.title}
            description={protectionHubGuide.description}
            sections={protectionHubGuide.sections}
          />
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Comprehensive AI training protection, content upload, and monitoring all in one place
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500">
            Multi-Modal Protection
          </Badge>
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
            Real-Time Monitoring
          </Badge>
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500">
            Advanced AI Defense
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-sm text-muted-foreground">Protected Files</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">56</div>
            <p className="text-sm text-muted-foreground">Active Scans</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">8</div>
            <p className="text-sm text-muted-foreground">Threats Detected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">94.7%</div>
            <p className="text-sm text-muted-foreground">Detection Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload & Protect
          </TabsTrigger>
          <TabsTrigger value="ai-protection" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Protection
          </TabsTrigger>
          <TabsTrigger value="detection" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Detection
          </TabsTrigger>
          <TabsTrigger value="multi-modal" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Multi-Modal
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        {/* Upload & Protect Tab */}
        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Quick Upload & Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OneClickProtection />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Supported File Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Images (JPG, PNG, GIF)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Videos (MP4, AVI, MOV)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Documents (PDF, DOC)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">3D Models (OBJ, FBX)</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4"
                  onClick={() => navigate('/upload')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Start Upload
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Protection Tab */}
        <TabsContent value="ai-protection" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic AI Training Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <AITrainingSettings />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Style Cloaking</CardTitle>
              </CardHeader>
              <CardContent>
                <StyleCloak />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Detection Tab */}
        <TabsContent value="detection" className="space-y-6">
          <AIDetectionDashboard />
        </TabsContent>

        {/* Multi-Modal Tab */}
        <TabsContent value="multi-modal" className="space-y-6">
          <VisualRecognition />
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Metadata Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductionMetadataSettings />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Crawler Blocking</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductionCrawlerBlockingSettings />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Likeness Recognition Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductionLikenessSettings />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Protection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>AI Training Protection</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Style Cloaking</span>
                    <Badge className="bg-blue-500">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Metadata Protection</span>
                    <Badge className="bg-orange-500">Configured</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>• 3 new files protected</div>
                  <div>• AI training violation detected</div>
                  <div>• Metadata stripped from 12 files</div>
                  <div>• Style cloak applied to portfolio</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button size="sm" className="w-full">
                  <Upload className="h-3 w-3 mr-2" />
                  Upload New Content
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  <Search className="h-3 w-3 mr-2" />
                  Start New Scan
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  <Settings className="h-3 w-3 mr-2" />
                  Configure Protection
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      <BugReportButton />
      </div>
    </MonitoringWrapper>
  );
};

export default ProtectionHub;