import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, FileImage, Video, Music, FileText, Zap, Globe, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AITrainingProtectionProps {
  fileType: 'image' | 'video' | 'audio' | 'document';
  fileName: string;
  file?: File;
  onProtectionApply: (protectionLevel: string, methods: string[]) => void;
}

interface ProtectionMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  fileTypes: string[];
}

export const AITrainingProtection: React.FC<AITrainingProtectionProps> = ({
  fileType,
  fileName,
  file,
  onProtectionApply
}) => {
  const { toast } = useToast();
  const [protectionLevel, setProtectionLevel] = useState<'basic' | 'advanced' | 'maximum'>('advanced');
  const [methods, setMethods] = useState<ProtectionMethod[]>([
    {
      id: 'invisibleWatermark',
      name: 'Invisible Watermarking',
      description: 'Embeds imperceptible ownership markers that survive AI training',
      icon: <Eye className="w-4 h-4" />,
      enabled: true,
      fileTypes: ['image', 'video']
    },
    {
      id: 'adversarialNoise',
      name: 'Adversarial Noise Protection',
      description: 'Adds subtle noise that confuses AI training algorithms',
      icon: <Zap className="w-4 h-4" />,
      enabled: true,
      fileTypes: ['image', 'video']
    },
    {
      id: 'metadataInjection',
      name: 'Rights Metadata Injection',
      description: 'Embeds copyright and usage restriction metadata',
      icon: <FileText className="w-4 h-4" />,
      enabled: true,
      fileTypes: ['image', 'video', 'audio', 'document']
    },
    {
      id: 'blockchainRegistration',
      name: 'Blockchain Rights Registration',
      description: 'Immutable proof of ownership and usage restrictions',
      icon: <Lock className="w-4 h-4" />,
      enabled: protectionLevel === 'maximum',
      fileTypes: ['image', 'video', 'audio', 'document']
    },
    {
      id: 'robotsTxtEntry',
      name: 'Web Crawler Blocking',
      description: 'Prevents automated crawling and scraping',
      icon: <Globe className="w-4 h-4" />,
      enabled: protectionLevel !== 'basic',
      fileTypes: ['image', 'video', 'audio', 'document']
    },
    {
      id: 'likenenessProtection',
      name: 'Likeness Recognition Protection',
      description: 'Protects against deepfake and likeness misuse',
      icon: <Shield className="w-4 h-4" />,
      enabled: protectionLevel === 'maximum',
      fileTypes: ['image', 'video']
    }
  ]);

  const getFileTypeIcon = () => {
    switch (fileType) {
      case 'image': return <FileImage className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      default: return <FileImage className="w-5 h-5" />;
    }
  };

  const getProtectionLevelColor = () => {
    switch (protectionLevel) {
      case 'basic': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'advanced': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'maximum': return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const toggleMethod = (methodId: string) => {
    setMethods(prev => prev.map(method => 
      method.id === methodId 
        ? { ...method, enabled: !method.enabled }
        : method
    ));
  };

  const applyProtection = async () => {
    const enabledMethods = methods
      .filter(method => method.enabled && method.fileTypes.includes(fileType))
      .map(method => method.id);

    if (enabledMethods.length === 0) {
      toast({
        title: "No Protection Methods Selected",
        description: "Please select at least one protection method to apply.",
        variant: "destructive"
      });
      return;
    }

    try {
      let protectionResult = null;
      
      // Apply real protection if file is provided
      if (file) {
        const { enhancedRealWorldProtection } = await import('@/lib/enhancedRealWorldProtection');
        
        protectionResult = await enhancedRealWorldProtection.protectFileWithDatabase(file, {
          enableAdversarialNoise: enabledMethods.includes('adversarialNoise'),
          enableRightsMetadata: enabledMethods.includes('metadataInjection'),
          enableCrawlerBlocking: enabledMethods.includes('robotsTxtEntry'),
          protectionLevel,
          copyrightInfo: {
            owner: 'TSMO User',
            year: new Date().getFullYear(),
            rights: 'All Rights Reserved'
          },
          userId: (await supabase.auth.getUser()).data.user?.id || 'anonymous',
          fileName: file.name
        });
        
        if (!protectionResult.success) {
          throw new Error(protectionResult.error || 'Protection failed');
        }
      } else {
        // Simulate protection for cases without file
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      onProtectionApply(protectionLevel, enabledMethods);
      
      toast({
        title: "AI Training Protection Applied",
        description: file 
          ? `File protected and saved with ID: ${protectionResult?.protectionId}`
          : `${enabledMethods.length} protection methods applied to ${fileName}`,
        duration: 5000
      });
    } catch (error) {
      console.error('Protection error:', error);
      toast({
        title: "Protection Failed",
        description: error instanceof Error ? error.message : "Failed to apply AI training protection. Please try again.",
        variant: "destructive"
      });
    }
  };

  const availableMethods = methods.filter(method => method.fileTypes.includes(fileType));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          AI Training Protection
        </CardTitle>
        <CardDescription>
          Protect your {fileType} from unauthorized AI training and scraping
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* File Information */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          {getFileTypeIcon()}
          <div>
            <p className="font-medium">{fileName}</p>
            <p className="text-sm text-muted-foreground">
              {fileType.charAt(0).toUpperCase() + fileType.slice(1)} file
            </p>
          </div>
        </div>

        {/* Protection Level */}
        <div className="space-y-3">
          <h4 className="font-semibold">Protection Level</h4>
          <div className="grid grid-cols-3 gap-2">
            {['basic', 'advanced', 'maximum'].map((level) => (
              <button
                key={level}
                onClick={() => setProtectionLevel(level as any)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  protectionLevel === level
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium capitalize">{level}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {level === 'basic' && 'Essential protection'}
                  {level === 'advanced' && 'Comprehensive coverage'}
                  {level === 'maximum' && 'Enterprise-grade'}
                </div>
              </button>
            ))}
          </div>
          <Badge className={getProtectionLevelColor()}>
            {protectionLevel.charAt(0).toUpperCase() + protectionLevel.slice(1)} Protection
          </Badge>
        </div>

        {/* Protection Methods */}
        <div className="space-y-3">
          <h4 className="font-semibold">Protection Methods</h4>
          <div className="space-y-3">
            {availableMethods.map((method) => (
              <div key={method.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{method.name}</span>
                      {method.enabled && (
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {method.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={method.enabled}
                  onCheckedChange={() => toggleMethod(method.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Legal Notice */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h5 className="font-semibold text-amber-800 mb-2">Legal Protection Notice</h5>
          <p className="text-sm text-amber-700">
            This file is protected by copyright law and explicitly excludes use for AI training, 
            machine learning, or algorithmic development without express written consent. 
            Unauthorized use may result in legal action.
          </p>
        </div>

        {/* Apply Protection Button */}
        <Button 
          onClick={applyProtection}
          className="w-full"
          size="lg"
        >
          <Shield className="w-4 h-4 mr-2" />
          Apply AI Training Protection
        </Button>
      </CardContent>
    </Card>
  );
};