import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Settings, FileImage, Video, Music, FileText, Globe, AlertTriangle, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AIProtectedFilesManager } from "@/components/ai-protection/AIProtectedFilesManager";
import { ExistingFilesProtection } from "@/components/ai-protection/ExistingFilesProtection";
import { ProtectionDemo } from "@/components/ai-protection/ProtectionDemo";

interface AIProtectionSettings {
  globalProtection: boolean;
  defaultLevel: 'basic' | 'advanced' | 'maximum';
  autoApply: boolean;
  fileTypeSettings: {
    images: boolean;
    videos: boolean;
    audio: boolean;
    documents: boolean;
  };
  methods: {
    invisibleWatermark: boolean;
    adversarialNoise: boolean;
    metadataInjection: boolean;
    blockchainRegistration: boolean;
    robotsTxtEntry: boolean;
    likenenessProtection: boolean;
  };
}

export const AITrainingSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AIProtectionSettings>({
    globalProtection: true,
    defaultLevel: 'advanced',
    autoApply: true,
    fileTypeSettings: {
      images: true,
      videos: true,
      audio: true,
      documents: true
    },
    methods: {
      invisibleWatermark: true,
      adversarialNoise: true,
      metadataInjection: true,
      blockchainRegistration: false,
      robotsTxtEntry: true,
      likenenessProtection: false
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [protectedFilesCount, setProtectedFilesCount] = useState(0);

  useEffect(() => {
    loadSettings();
    loadProtectedFilesCount();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user's AI protection settings (this would be stored in a settings table)
      // For now, using localStorage as a demo
      const savedSettings = localStorage.getItem('aiProtectionSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadProtectedFilesCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Count protected files from ai_protection_records table
      const { count } = await supabase
        .from('ai_protection_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true);

      setProtectedFilesCount(count || 0);
    } catch (error) {
      console.error('Error loading protected files count:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage for demo (in production, save to database)
      localStorage.setItem('aiProtectionSettings', JSON.stringify(settings));
      
      toast({
        title: "Settings Saved",
        description: "Your AI training protection settings have been updated.",
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof AIProtectionSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateFileTypeSetting = (fileType: keyof AIProtectionSettings['fileTypeSettings'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      fileTypeSettings: {
        ...prev.fileTypeSettings,
        [fileType]: value
      }
    }));
  };

  const updateMethodSetting = (method: keyof AIProtectionSettings['methods'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      methods: {
        ...prev.methods,
        [method]: value
      }
    }));
  };

  const getProtectionLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'maximum': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{protectedFilesCount}</p>
                <p className="text-sm text-muted-foreground">Protected Files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Settings className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <Badge className={getProtectionLevelColor(settings.defaultLevel)}>
                  {settings.defaultLevel.charAt(0).toUpperCase() + settings.defaultLevel.slice(1)}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">Default Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {settings.globalProtection ? 'ON' : 'OFF'}
                </p>
                <p className="text-sm text-muted-foreground">Global Protection</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            AI Training Protection Settings
          </CardTitle>
          <CardDescription>
            Configure how your content is protected from AI training and scraping
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="filetypes">File Types</TabsTrigger>
              <TabsTrigger value="methods">Methods</TabsTrigger>
              <TabsTrigger value="downloads">Downloads</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Global AI Protection</h4>
                    <p className="text-sm text-muted-foreground">
                      Enable protection for all uploaded content
                    </p>
                  </div>
                  <Switch
                    checked={settings.globalProtection}
                    onCheckedChange={(value) => updateSetting('globalProtection', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-Apply Protection</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically apply protection to new uploads
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoApply}
                    onCheckedChange={(value) => updateSetting('autoApply', value)}
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Default Protection Level</h4>
                  <Select 
                    value={settings.defaultLevel} 
                    onValueChange={(value) => updateSetting('defaultLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic - Essential protection</SelectItem>
                      <SelectItem value="advanced">Advanced - Comprehensive coverage</SelectItem>
                      <SelectItem value="maximum">Maximum - Enterprise-grade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="filetypes" className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: 'images', label: 'Images', icon: FileImage, description: 'JPG, PNG, GIF, WebP files' },
                  { key: 'videos', label: 'Videos', icon: Video, description: 'MP4, AVI, MOV, WebM files' },
                  { key: 'audio', label: 'Audio', icon: Music, description: 'MP3, WAV, FLAC, OGG files' },
                  { key: 'documents', label: 'Documents', icon: FileText, description: 'PDF, DOC, TXT files' }
                ].map(({ key, label, icon: Icon, description }) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{label}</h4>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.fileTypeSettings[key as keyof typeof settings.fileTypeSettings]}
                      onCheckedChange={(value) => updateFileTypeSetting(key as keyof typeof settings.fileTypeSettings, value)}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="methods" className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: 'invisibleWatermark', label: 'Invisible Watermarking', description: 'Embeds imperceptible ownership markers' },
                  { key: 'adversarialNoise', label: 'Adversarial Noise Protection', description: 'Adds subtle noise that confuses AI training' },
                  { key: 'metadataInjection', label: 'Rights Metadata Injection', description: 'Embeds copyright and usage restrictions' },
                  { key: 'blockchainRegistration', label: 'Blockchain Rights Registration', description: 'Immutable proof of ownership' },
                  { key: 'robotsTxtEntry', label: 'Web Crawler Blocking', description: 'Prevents automated crawling and scraping' },
                  { key: 'likenenessProtection', label: 'Likeness Recognition Protection', description: 'Protects against deepfake and likeness misuse' }
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{label}</h4>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <Switch
                      checked={settings.methods[key as keyof typeof settings.methods]}
                      onCheckedChange={(value) => updateMethodSetting(key as keyof typeof settings.methods, value)}
                    />
                  </div>
                ))}
              </div>
          </TabsContent>

          <TabsContent value="downloads" className="space-y-6">
            <ProtectionDemo />
            <ExistingFilesProtection />
            <AIProtectedFilesManager />
          </TabsContent>
        </Tabs>

          {/* Warning Notice */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h5 className="font-semibold text-amber-800">Important Legal Notice</h5>
                <p className="text-sm text-amber-700 mt-1">
                  While these protections significantly reduce the likelihood of unauthorized AI training, 
                  no technical solution can guarantee 100% prevention. Legal action may be necessary 
                  for complete protection of your intellectual property rights.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={saveSettings} 
            disabled={isLoading}
            className="w-full mt-6"
            size="lg"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};