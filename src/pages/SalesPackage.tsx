import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import B2BSalesPackageDownload from "@/components/B2BSalesPackageDownload";

const SalesPackage: React.FC = () => {
  useEffect(() => {
    const title = "TSMO B2B Sales Package | Enterprise PDF";
    document.title = title;

    const ensureMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    ensureMeta("description", "Download the TSMO B2B Sales Package PDF: features, security, SLAs, pricing, ROI, and next steps.");

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}/sales-package`;
  }, []);

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold">B2B Sales Package</h1>
        <p className="text-muted-foreground mt-2">
          Download our enterprise-ready sales package PDF with product overview, security, SLAs, pricing, and ROI.
        </p>
      </header>
      <section aria-labelledby="download">
        <Card>
          <CardContent className="pt-6">
            <B2BSalesPackageDownload />
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default SalesPackage;
