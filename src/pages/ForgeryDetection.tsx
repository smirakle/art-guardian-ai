import React, { useEffect } from 'react';
import ImageForgeryDetector from '@/components/forensics/ImageForgeryDetector';
import AIImageDetector from '@/components/forensics/AIImageDetector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BugReportButton } from '@/components/BugReportButton';

const ForgeryDetection: React.FC = () => {
  useEffect(() => {
    const title = 'Image Forgery Detection | TSMO';
    document.title = title;

    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    setMeta(
      'description',
      'Advanced image analysis with AI generation detection, forgery detection, ELA analysis, metadata verification, and tamper assessment.'
    );

    // Canonical tag
    const canonicalHref = `${window.location.origin}/forgery-detection`;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonicalHref;
  }, []);

  return (
    <main className="min-h-screen bg-background" role="main">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Advanced Image Analysis</h1>
          <p className="text-muted-foreground">
            Comprehensive image analysis including AI generation detection, forgery detection, and forensic analysis.
          </p>
        </header>
        
        <Tabs defaultValue="ai-detection" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai-detection">AI Generation Detection</TabsTrigger>
            <TabsTrigger value="forgery-detection">Forgery & Tampering</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai-detection" className="mt-6">
            <AIImageDetector />
          </TabsContent>
          
          <TabsContent value="forgery-detection" className="mt-6">
            <ImageForgeryDetector />
          </TabsContent>
        </Tabs>
      </div>
      <BugReportButton />
    </main>
  );
};

export default ForgeryDetection;
