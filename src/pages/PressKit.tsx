import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Image, FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Import all press images
import heroBanner from "@/assets/press/hero-banner.png";
import fourLayerDefense from "@/assets/press/four-layer-defense-infographic.png";
import statisticsInfographic from "@/assets/press/statistics-infographic.png";
import aiProtectionConcept from "@/assets/press/ai-protection-concept.png";
import beforeAfterComparison from "@/assets/press/before-after-comparison.png";
import founderQuoteCard from "@/assets/press/founder-quote-card.png";

// Import logos
import tsmoLogo from "@/assets/tsmo-logo.png";
import tsmoTransparentLogo from "@/assets/tsmo-transparent-logo.png";
import tsmoLogoFull from "@/assets/tsmo-logo-full.png";
import tsmoLogoHighres from "@/assets/press/tsmo-logo-highres.png";
import tsmoLogoTransparentHighres from "@/assets/press/tsmo-logo-transparent-highres.png";
import tsmoLogoPrintReady from "@/assets/press/tsmo-logo-print-ready-300dpi.png";
import tsmoLogoTransparentPrint from "@/assets/press/tsmo-logo-transparent-print.png";
import tsmoLogoMultilayerPrint from "@/assets/press/tsmo-logo-multilayer-print.png";

const pressImages = [
  {
    name: "Hero Banner",
    description: "Main feature article header image (1920×1080)",
    src: heroBanner,
    filename: "tsmo-hero-banner.png",
    category: "Editorial"
  },
  {
    name: "Four-Layer Defense System",
    description: "Infographic showing TSMO's protection methodology (1920×864)",
    src: fourLayerDefense,
    filename: "tsmo-four-layer-defense.png",
    category: "Infographic"
  },
  {
    name: "Key Statistics",
    description: "Visual data on IP theft and creator protection (1920×1080)",
    src: statisticsInfographic,
    filename: "tsmo-statistics.png",
    category: "Infographic"
  },
  {
    name: "AI Protection Concept",
    description: "Visual representation of AI protection technology (1920×1080)",
    src: aiProtectionConcept,
    filename: "tsmo-ai-protection-concept.png",
    category: "Concept Art"
  },
  {
    name: "Before/After Comparison",
    description: "Unprotected vs protected content visualization (1920×1080)",
    src: beforeAfterComparison,
    filename: "tsmo-before-after.png",
    category: "Editorial"
  },
  {
    name: "Founder Quote Card",
    description: "Background for founder quotes and testimonials (1080×1080)",
    src: founderQuoteCard,
    filename: "tsmo-quote-card.png",
    category: "Social Media"
  }
];

const logos = [
  {
    name: "TSMO Multi-Layer Print Logo (300 DPI)",
    description: "Premium logo with visual depth and 3D layering effects",
    src: tsmoLogoMultilayerPrint,
    filename: "tsmo-logo-multilayer-print-300dpi.png",
    featured: true
  },
  {
    name: "TSMO Transparent Print Logo (300 DPI)",
    description: "Official TSMO logo with transparent background for print",
    src: tsmoLogoTransparentPrint,
    filename: "tsmo-logo-transparent-print-300dpi.png",
    featured: false
  },
  {
    name: "TSMO Print-Ready Logo (300 DPI)",
    description: "Official TSMO logo upscaled for print at 300 DPI",
    src: tsmoLogoPrintReady,
    filename: "tsmo-logo-print-ready-300dpi.png",
    featured: false
  },
  {
    name: "TSMO Transparent High-Res (300 DPI)",
    description: "Alternative transparent logo at 1920×1920px, 300 DPI",
    src: tsmoLogoTransparentHighres,
    filename: "tsmo-logo-transparent-300dpi.png",
    featured: false
  },
  {
    name: "TSMO High-Res Logo (300 DPI)",
    description: "High-res logo at 1920×1920px, 300 DPI",
    src: tsmoLogoHighres,
    filename: "tsmo-logo-300dpi.png",
    featured: false
  },
  {
    name: "TSMO Logo",
    description: "Primary logo with background",
    src: tsmoLogo,
    filename: "tsmo-logo.png"
  },
  {
    name: "TSMO Transparent Logo",
    description: "Logo with transparent background",
    src: tsmoTransparentLogo,
    filename: "tsmo-transparent-logo.png"
  },
  {
    name: "TSMO Full Logo",
    description: "Full version with tagline",
    src: tsmoLogoFull,
    filename: "tsmo-logo-full.png"
  }
];

const downloadImage = async (src: string, filename: string) => {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
  }
};

const PressKit = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-12 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto max-w-6xl">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="secondary" className="text-sm">Press & Media</Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">TSMO Press Kit</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            High-resolution images, logos, and brand assets for journalists, media outlets, and partners.
          </p>
        </div>
      </section>

      {/* Brand Logos */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <Image className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Brand Logos</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {logos.map((logo) => (
              <Card key={logo.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted/50 flex items-center justify-center p-8">
                  <img 
                    src={logo.src} 
                    alt={logo.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{logo.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{logo.description}</p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => downloadImage(logo.src, logo.filename)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Article Images */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Feature Article Images</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pressImages.map((image) => (
              <Card key={image.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted/50 overflow-hidden">
                  <img 
                    src={image.src} 
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">{image.category}</Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{image.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{image.description}</p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => downloadImage(image.src, image.filename)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-2">About TSMO Watch</h3>
                  <p className="text-muted-foreground">
                    TSMO Watch is the first and only platform specifically designed to protect creative 
                    content from unauthorized AI training data scraping. Founded by Shirleena Cunningham 
                    after her own artwork was stolen, TSMO has grown to protect over 15,000 independent 
                    artists, designers, and creators worldwide.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Key Statistics</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>15,000+</strong> protected artists</li>
                    <li>• <strong>50,000+</strong> violations detected</li>
                    <li>• <strong>70+</strong> platforms monitored</li>
                    <li>• <strong>5+</strong> AI datasets actively scanned</li>
                    <li>• <strong>24/7</strong> automated monitoring</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-2">Media Contact</h3>
                <p className="text-muted-foreground">
                  For press inquiries, interviews, or additional materials, please contact:<br />
                  <strong>Email:</strong> press@tsmowatch.com<br />
                  <strong>Website:</strong> tsmowatch.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PressKit;
