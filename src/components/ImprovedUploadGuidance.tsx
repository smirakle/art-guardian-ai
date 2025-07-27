import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Shield, 
  Eye, 
  CheckCircle, 
  ArrowRight,
  Info,
  Zap,
  Clock,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext';

interface GuidanceStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'active' | 'completed';
  estimatedTime: string;
}

interface ImprovedUploadGuidanceProps {
  currentStep?: 'select' | 'upload' | 'analyze' | 'monitor';
  onStepComplete?: (step: string) => void;
}

const ImprovedUploadGuidance: React.FC<ImprovedUploadGuidanceProps> = ({
  currentStep = 'select',
  onStepComplete
}) => {
  const { user } = useAuth();
  const [showDetailedGuide, setShowDetailedGuide] = useState(false);

  const steps: GuidanceStep[] = [
    {
      id: 'select',
      title: 'Select Your Artwork',
      description: 'Choose images, videos, or text content to protect',
      icon: Upload,
      status: currentStep === 'select' ? 'active' : 'pending',
      estimatedTime: '30 seconds'
    },
    {
      id: 'upload',
      title: 'Secure Upload',
      description: 'Your content is encrypted and protected during upload',
      icon: Shield,
      status: currentStep === 'upload' ? 'active' : currentStep === 'select' ? 'pending' : 'completed',
      estimatedTime: '1-2 minutes'
    },
    {
      id: 'analyze',
      title: 'AI Analysis',
      description: 'Advanced AI creates protection fingerprints',
      icon: Zap,
      status: currentStep === 'analyze' ? 'active' : 
        ['select', 'upload'].includes(currentStep) ? 'pending' : 'completed',
      estimatedTime: '2-3 minutes'
    },
    {
      id: 'monitor',
      title: 'Live Monitoring',
      description: '24/7 monitoring begins across all platforms',
      icon: Eye,
      status: currentStep === 'monitor' ? 'completed' : 'pending',
      estimatedTime: 'Continuous'
    }
  ];

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const supportedFormats = [
    { type: 'Images', formats: 'JPG, PNG, GIF, WebP, SVG', icon: '🖼️' },
    { type: 'Videos', formats: 'MP4, AVI, MOV, WebM', icon: '🎥' },
    { type: 'Text', formats: 'Articles, Scripts, Lyrics', icon: '📝' }
  ];

  const protectionFeatures = [
    { 
      name: 'Visual Recognition', 
      description: 'AI identifies your artwork across the web',
      available: true 
    },
    { 
      name: 'Invisible Watermarking', 
      description: 'Undetectable protection markers',
      available: true 
    },
    { 
      name: 'Real-time Monitoring', 
      description: '24/7 surveillance across platforms',
      available: !!user 
    },
    { 
      name: 'Legal Support', 
      description: 'Automated DMCA filing assistance',
      available: !!user 
    }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Quick Status Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Protection Setup
                {!user && (
                  <Badge variant="outline" className="text-xs">
                    Guest Mode
                  </Badge>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailedGuide(!showDetailedGuide)}
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Help
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Setup Progress</span>
                  <span>{completedSteps}/{steps.length} completed</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              {/* Current Step Highlight */}
              {currentStep && (
                <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const current = steps.find(s => s.id === currentStep);
                      if (!current) return null;
                      const Icon = current.icon;
                      return (
                        <>
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{current.title}</div>
                            <div className="text-xs text-muted-foreground">{current.description}</div>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {current.estimatedTime}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Quick Tips */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>End-to-end encryption</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>AI-powered protection</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Instant monitoring</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Guide (Collapsible) */}
        <Collapsible open={showDetailedGuide} onOpenChange={setShowDetailedGuide}>
          <CollapsibleContent className="space-y-4">
            {/* Supported Formats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Supported File Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {supportedFormats.map((format, index) => (
                    <div key={index} className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl mb-2">{format.icon}</div>
                      <div className="font-medium text-sm">{format.type}</div>
                      <div className="text-xs text-muted-foreground">{format.formats}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Protection Features */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Protection Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {protectionFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        feature.available ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{feature.name}</span>
                          {!feature.available && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="text-xs">
                                  Sign in required
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>This feature requires user authentication</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{feature.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-orange-800">Privacy & Security</div>
                    <div className="text-xs text-orange-700 mt-1">
                      Your content is encrypted during upload and storage. We never share your artwork with third parties. 
                      All processing is done securely and only for protection purposes.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </TooltipProvider>
  );
};

export default ImprovedUploadGuidance;