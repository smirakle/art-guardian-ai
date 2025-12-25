import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Upload, 
  Search, 
  Eye, 
  Brain, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { MonitoringWrapper } from '@/components/MonitoringWrapper';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Import existing components
import { AIDetectionDashboard } from '@/components/phase1/AIDetectionDashboard';
import VisualRecognition from '@/components/VisualRecognition';
import StyleCloak from '@/components/ai-protection/StyleCloak';
import { ProductionMetadataSettings } from '@/components/ai-protection/ProductionMetadataSettings';
import { ProductionCrawlerBlockingSettings } from '@/components/ai-protection/ProductionCrawlerBlockingSettings';
import { ProductionLikenessSettings } from '@/components/ai-protection/ProductionLikenessSettings';
import { AITrainingSettings } from '@/components/AITrainingSettings';
import { BugReportButton } from '@/components/BugReportButton';
import { UserGuide } from '@/components/UserGuide';
import { protectionHubGuide } from '@/data/userGuides';
import { ProtectionDisclaimer } from '@/components/protection/ProtectionDisclaimer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ProtectionHub = () => {
  const [activeTab, setActiveTab] = useState('protect');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Real stats from database
  const [stats, setStats] = useState({
    protectedFiles: 0,
    threatsDetected: 0,
    isProtectionActive: false,
    isLoading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setStats(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Fetch protected files count
        const { count: artworkCount } = await supabase
          .from('artwork')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: protectionCount } = await supabase
          .from('ai_protection_records')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch threats detected
        const { count: threatsCount } = await supabase
          .from('ai_training_violations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const totalProtected = (artworkCount || 0) + (protectionCount || 0);

        setStats({
          protectedFiles: totalProtected,
          threatsDetected: threatsCount || 0,
          isProtectionActive: totalProtected > 0,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();
  }, [user]);

  const isNewUser = stats.protectedFiles === 0 && !stats.isLoading;

  return (
    <MonitoringWrapper componentName="ProtectionHub" budgets={{ pageLoad: 2000, apiCall: 1000 }}>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Simplified Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Protect Your Content</h1>
            <UserGuide 
              title={protectionHubGuide.title}
              description={protectionHubGuide.description}
              sections={protectionHubGuide.sections}
            />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop AI from copying your art. Upload, protect, and monitor your creative work.
          </p>
        </div>

        {/* Protection Disclaimer */}
        <ProtectionDisclaimer />

        {/* Quick Stats - Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">
                {stats.isLoading ? '...' : stats.protectedFiles}
              </div>
              <p className="text-sm text-muted-foreground">Files Protected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">
                {stats.isLoading ? '...' : stats.threatsDetected}
              </div>
              <p className="text-sm text-muted-foreground">Threats Found</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              {stats.isProtectionActive ? (
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              ) : (
                <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              )}
              <div className="text-2xl font-bold">
                {stats.isLoading ? '...' : (stats.isProtectionActive ? 'Active' : 'Inactive')}
              </div>
              <p className="text-sm text-muted-foreground">Protection Status</p>
            </CardContent>
          </Card>
        </div>

        {/* New User CTA */}
        {isNewUser && (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="py-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome! Let's protect your first file</h2>
              <p className="text-muted-foreground mb-4">
                Upload your artwork and we'll add invisible protection to stop AI from copying it.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/upload')}
                className="bg-primary hover:bg-primary/90"
              >
                <Upload className="h-5 w-5 mr-2" />
                Protect Your First File
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Simplified 3-Tab Layout */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="protect" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Protect
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Protect Tab - Combined Upload & AI Protection */}
          <TabsContent value="protect" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload & Protect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload your images, videos, or documents. We'll automatically add protection.
                  </p>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Images (JPG, PNG, GIF)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Videos (MP4, AVI, MOV)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Documents (PDF, DOC)</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/upload')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </CardContent>
              </Card>

              {/* Style Cloaking with Tooltip */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Style Protection
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Adds invisible changes to your images that confuse AI models, preventing them from learning your unique art style.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StyleCloak />
                </CardContent>
              </Card>
            </div>

            {/* AI Training Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  AI Scraping Resistance
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Tells AI companies not to use your work for training their models. Embeds "Do Not Train" signals in your files.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AITrainingSettings />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitor Tab - Combined Detection & Visual Recognition */}
          <TabsContent value="monitor" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Find Copies of Your Work
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Scans the internet to find unauthorized copies of your artwork being used without permission.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AIDetectionDashboard />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Visual Recognition
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Uses AI to recognize your artwork even if it's been modified, cropped, or edited.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VisualRecognition />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab - Combined Advanced Settings */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Metadata Protection
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Embeds your copyright information into your files so your ownership can be proven.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductionMetadataSettings />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Crawler Blocking
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Blocks AI bots and web scrapers from automatically downloading your content.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductionCrawlerBlockingSettings />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Likeness Protection
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Protects photos of yourself from being used to create AI-generated deepfakes.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductionLikenessSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <BugReportButton />
      </div>
    </MonitoringWrapper>
  );
};

export default ProtectionHub;
