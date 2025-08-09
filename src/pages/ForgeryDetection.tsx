import React, { useEffect } from 'react';
import ImageForgeryDetector from '@/components/forensics/ImageForgeryDetector';

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
      'Image forgery detection with ELA, metadata verification, invisible watermark checks, and AI tamper assessment.'
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
          <h1 className="text-3xl font-bold mb-2">Image Forgery Detection</h1>
          <p className="text-muted-foreground">
            Detect manipulations with Error Level Analysis, metadata verification, invisible watermark checks,
            and AI-based tamper assessment.
          </p>
        </header>
        <ImageForgeryDetector />
      </div>
    </main>
  );
};

export default ForgeryDetection;
