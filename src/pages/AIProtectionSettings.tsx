import React, { useEffect, useState } from 'react';
import { AITrainingSettings } from '@/components/AITrainingSettings';
import StyleCloak from '@/components/ai-protection/StyleCloak';
import { ProductionMetadataSettings } from '@/components/ai-protection/ProductionMetadataSettings';
import { ProductionCrawlerBlockingSettings } from '@/components/ai-protection/ProductionCrawlerBlockingSettings';
import { ProductionLikenessSettings } from '@/components/ai-protection/ProductionLikenessSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
const AIProtectionSettings = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'basic-settings': true,
    'style-cloak': false,
    'metadata-protection': false,
    'crawler-blocking': false,
    'likeness-protection': false
  });

  useEffect(() => {
    document.title = 'AI Training Protection Settings | Style Cloaking';
    const desc = 'Configure AI training protection and apply style cloaking to safeguard artwork.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
    meta.setAttribute('content', desc);
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link); }
    link.setAttribute('href', window.location.origin + '/ai-protection-settings');
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Training Protection Settings</h1>
          <p className="text-muted-foreground">
            Configure how your content is protected from unauthorized AI training and machine learning use.
          </p>
        </div>
        
        {/* Basic Settings - Always Expanded */}
        <Card className="mb-6">
          <CardHeader 
            className="cursor-pointer"
            onClick={() => toggleSection('basic-settings')}
          >
            <CardTitle className="flex items-center justify-between">
              <span>Basic AI Protection Settings</span>
              {expandedSections['basic-settings'] ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </CardTitle>
          </CardHeader>
          {expandedSections['basic-settings'] && (
            <CardContent>
              <AITrainingSettings />
            </CardContent>
          )}
        </Card>
        
        {/* Style Cloak */}
        <Card className="mb-6">
          <CardHeader 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleSection('style-cloak')}
          >
            <CardTitle className="flex items-center justify-between">
              <span>Enhanced Style Cloaking</span>
              {expandedSections['style-cloak'] ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </CardTitle>
          </CardHeader>
          {expandedSections['style-cloak'] && (
            <CardContent className="pt-0">
              <StyleCloak />
            </CardContent>
          )}
        </Card>
        
        {/* Metadata Protection */}
        <Card className="mb-6">
          <CardHeader 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleSection('metadata-protection')}
          >
            <CardTitle className="flex items-center justify-between">
              <span>Production Metadata Protection</span>
              {expandedSections['metadata-protection'] ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </CardTitle>
          </CardHeader>
          {expandedSections['metadata-protection'] && (
            <CardContent className="pt-0">
              <ProductionMetadataSettings />
            </CardContent>
          )}
        </Card>
        
        {/* Crawler Blocking */}
        <Card className="mb-6">
          <CardHeader 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleSection('crawler-blocking')}
          >
            <CardTitle className="flex items-center justify-between">
              <span>Web Crawler Blocking</span>
              {expandedSections['crawler-blocking'] ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </CardTitle>
          </CardHeader>
          {expandedSections['crawler-blocking'] && (
            <CardContent className="pt-0">
              <ProductionCrawlerBlockingSettings />
            </CardContent>
          )}
        </Card>
        
        {/* Likeness Protection */}
        <Card className="mb-6">
          <CardHeader 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleSection('likeness-protection')}
          >
            <CardTitle className="flex items-center justify-between">
              <span>Likeness Recognition Protection</span>
              {expandedSections['likeness-protection'] ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </CardTitle>
          </CardHeader>
          {expandedSections['likeness-protection'] && (
            <CardContent className="pt-0">
              <ProductionLikenessSettings />
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AIProtectionSettings;