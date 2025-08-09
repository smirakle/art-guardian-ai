import React, { useEffect } from 'react';
import Roadmap from '@/components/investor/Roadmap';

const RoadmapPage: React.FC = () => {
  useEffect(() => {
    // Title
    document.title = 'TSMO Watch Roadmap | Investor & Product Strategy';

    // Meta description
    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    setMeta('description', 'TSMO Watch 2.0 roadmap: phases, goals, and milestones to advance global digital rights protection.');

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}/roadmap`);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-8">
        <header className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold tracking-tight">TSMO Watch 2.0 — Concept Roadmap</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore how TSMO Watch evolves from rapid protection and adoption to a global rights verification standard.
          </p>
        </header>
        <main>
          <Roadmap />
        </main>
      </div>
    </div>
  );
};

export default RoadmapPage;
