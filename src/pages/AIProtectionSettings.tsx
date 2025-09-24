import React, { useEffect } from 'react';
import { AITrainingSettings } from '@/components/AITrainingSettings';
import StyleCloak from '@/components/ai-protection/StyleCloak';
import { ProductionMetadataSettings } from '@/components/ai-protection/ProductionMetadataSettings';
import { ProductionCrawlerBlockingSettings } from '@/components/ai-protection/ProductionCrawlerBlockingSettings';
import { ProductionLikenessSettings } from '@/components/ai-protection/ProductionLikenessSettings';
const AIProtectionSettings = () => {
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
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Training Protection Settings</h1>
          <p className="text-muted-foreground">
            Configure how your content is protected from unauthorized AI training and machine learning use.
          </p>
        </div>
        
        <AITrainingSettings />
        
        <div className="mt-8">
          <StyleCloak />
        </div>
        
        <div className="mt-8">
          <ProductionMetadataSettings />
        </div>
        
        <div className="mt-8">
          <ProductionCrawlerBlockingSettings />
        </div>
        
        <div className="mt-8">
          <ProductionLikenessSettings />
        </div>
      </div>
    </div>
  );
};

export default AIProtectionSettings;