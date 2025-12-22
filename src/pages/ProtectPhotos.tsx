import React from "react";
import { Helmet } from "react-helmet";
import { Camera, Shield, Eye, Gavel, Image, TrendingUp, AlertTriangle, Scale } from "lucide-react";
import {
  LandingPageHero,
  TrustStats,
  FeatureGrid,
  PainPointSection,
  FAQSection,
  FinalCTA,
  ProblemStats,
  generateFAQStructuredData,
} from "@/components/landing";

const ProtectPhotos = () => {
  // Note: These stats represent the problem scope, not TSMO platform metrics
  const stats = [
    { value: "2.5B", label: "Images Stolen Daily" },
    { value: "85%", label: "Used Without License" },
    { value: "23%", label: "Of All DMCA Claims" },
    { value: "48hr", label: "Avg. Takedown Time" },
  ];

  // Verified statistics from Copytrack Global Infringement Report 2019 and DMCA Authority
  const problemStats = [
    {
      icon: TrendingUp,
      value: "2.5 Billion Daily",
      description: "Images are stolen worldwide every day according to the Copytrack Global Infringement Report.",
    },
    {
      icon: Scale,
      value: "85% Unlicensed",
      description: "Of the 3 billion images shared online daily, 85% are used without a valid license.",
    },
    {
      icon: AlertTriangle,
      value: "USA Leads Theft",
      description: "The United States accounts for 23% of all global image copyright infringement cases.",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Invisible Watermarking",
      description: "Embed forensic watermarks that survive cropping, compression, and editing. Prove ownership instantly in any dispute.",
    },
    {
      icon: Eye,
      title: "Reverse Image Search Monitoring",
      description: "24/7 scanning across Google Images, TinEye, stock sites, and social media to find unauthorized uses of your photos.",
    },
    {
      icon: Image,
      title: "EXIF Metadata Protection",
      description: "Preserve and verify your original EXIF data including camera info, GPS, and timestamps for bulletproof provenance.",
    },
    {
      icon: Gavel,
      title: "One-Click DMCA Takedowns",
      description: "File professional takedown notices in seconds. Our templates are pre-approved by IP attorneys.",
    },
  ];

  const faqs = [
    {
      question: "How do I protect my photos from being stolen online?",
      answer: "TSMO provides multi-layer protection: invisible watermarking that survives edits, blockchain registration for proof of ownership, and 24/7 monitoring across 50+ platforms to detect theft early. Upload your photos and we handle the rest.",
    },
    {
      question: "What should I do if someone stole my photograph?",
      answer: "Document the theft with screenshots, then use TSMO's one-click DMCA tool to file a takedown notice. Most platforms comply within 48-72 hours. If they don't, we provide legal escalation options.",
    },
    {
      question: "Can I protect my photos from AI image generators?",
      answer: "Yes! TSMO applies AI-resistant perturbations (similar to Glaze/Nightshade) that confuse AI models while remaining invisible to human viewers. We also add machine-readable copyright assertions.",
    },
    {
      question: "Do you protect RAW files and high-resolution images?",
      answer: "Absolutely. We support all major formats including RAW, TIFF, PNG, and JPEG. Our protection works on any resolution, and we preserve your original file quality.",
    },
    {
      question: "How does TSMO find my stolen photos?",
      answer: "We use reverse image search technology across Google, Bing, TinEye, stock sites, social media, and print-on-demand platforms. Our AI also detects cropped, filtered, or heavily edited versions of your work.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "TSMO Photo Protection",
    applicationCategory: "SecurityApplication",
    description: "Protect your photography from theft with invisible watermarking, reverse image monitoring, and DMCA enforcement tools",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <Helmet>
        <title>Protect My Photos Online | Photography Copyright Protection | TSMO</title>
        <meta
          name="description"
          content="Stop photo theft with TSMO. Invisible watermarking, 24/7 reverse image monitoring, EXIF protection, and one-click DMCA takedowns for photographers."
        />
        <meta
          name="keywords"
          content="protect my photos online, photo copyright protection, stolen photography, image theft protection, photographer copyright, reverse image search monitoring"
        />
        <link rel="canonical" href="https://tsmo.lovable.app/protect-photos" />
        <meta property="og:title" content="Protect My Photos Online | TSMO" />
        <meta
          property="og:description"
          content="Stop photo theft with invisible watermarking, monitoring, and DMCA enforcement."
        />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">
          {JSON.stringify(generateFAQStructuredData(faqs))}
        </script>
      </Helmet>

      <div className="min-h-screen">
        <LandingPageHero
          badge={{ icon: Camera, text: "For Photographers" }}
          title="Protect Your Photography From Theft & AI"
          subtitle="Your photos are being stolen, resold on stock sites, and fed to AI generators. TSMO gives you military-grade protection, 24/7 monitoring, and legal tools to fight back."
          gradient="primary"
          actions={[
            { label: "Protect My Photos", href: "/upload", icon: Shield },
            { label: "View Pricing", href: "/pricing", variant: "outline" },
          ]}
        />

        <TrustStats stats={stats} />

        <ProblemStats
          title="Photography Theft Is Rampant"
          subtitle="Every day, thousands of photographers discover their work being sold without permission, used in ads, or scraped by AI models."
          stats={problemStats}
        />

        <FeatureGrid
          title="How TSMO Protects Your Photography"
          subtitle="Complete protection built specifically for photographers—from invisible watermarks to reverse image monitoring."
          features={features}
          columns={4}
        />

        <PainPointSection
          title="TSMO vs. Going Unprotected"
          withoutTitle="Without Protection"
          withoutPoints={[
            "Your photos sold on stock sites without your consent",
            "Hours wasted filing DMCA notices manually",
            "No proof of ownership in disputes",
            "AI generators trained on your work",
            "Lost licensing revenue and reputation damage",
          ]}
          withTitle="With TSMO"
          withPoints={[
            "24/7 reverse image monitoring catches theft early",
            "One-click DMCA takedowns in seconds",
            "Blockchain-verified ownership proof",
            "AI training protection built-in",
            "EXIF metadata preserved and verifiable",
          ]}
        />

        <FAQSection faqs={faqs} />

        <FinalCTA
          title="Protect Your Photography Today"
          subtitle="Don't wait until your photos are spread across the internet. Get protection now and take back control of your work."
          primaryAction={{
            label: "Start Protecting Now",
            href: "/upload",
            icon: Shield,
          }}
          secondaryAction={{
            label: "See Success Stories",
            href: "/success-stories",
          }}
        />
      </div>
    </>
  );
};

export default ProtectPhotos;
