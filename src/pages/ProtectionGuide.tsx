import { Shield, Lock, Eye, FileCheck, AlertTriangle, Fingerprint, Globe, Scale } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const ProtectionGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Protection Guide</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Protect Your Creative Work
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive guide for independent artists, designers, musicians, and creative brands
            to safeguard their digital creations from theft and unauthorized use
          </p>
        </div>

        {/* Understanding Digital Theft */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <CardTitle>Understanding Digital Theft</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Digital content theft occurs when your creative work is used, reproduced, or distributed
              without your permission. This includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Direct copying:</strong> Exact reproduction of your images, music, or designs</li>
              <li><strong>AI training misuse:</strong> Your work used to train AI models without consent</li>
              <li><strong>Unauthorized derivatives:</strong> Modified versions that retain your original elements</li>
              <li><strong>Commercial exploitation:</strong> Your work sold or monetized by others</li>
              <li><strong>Attribution removal:</strong> Your name or watermark removed from your work</li>
            </ul>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium">
                <strong>Impact on Creators:</strong> Digital theft costs independent creators billions in lost revenue
                annually, damages brand reputation, and undermines the value of original creative work.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Types of Protection */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Fingerprint className="h-6 w-6 text-primary" />
                <CardTitle>Watermarking & AI Protection</CardTitle>
              </div>
              <CardDescription>Invisible markers that identify your work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Modern watermarking embeds imperceptible signatures into your digital files:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
                <li>Survives compression, cropping, and format conversion</li>
                <li>Proves ownership even if visual watermark removed</li>
                <li>AI-resistant fingerprinting deters unauthorized training</li>
                <li>Works with images, audio, video, and documents</li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate("/protection-hub")}
              >
                Enable AI Protection
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-primary" />
                <CardTitle>Blockchain Verification</CardTitle>
              </div>
              <CardDescription>Immutable proof of ownership</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Blockchain creates tamper-proof certificates of authenticity:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
                <li>Timestamped proof you created the work first</li>
                <li>Cannot be altered or disputed once recorded</li>
                <li>Globally recognized and legally admissible</li>
                <li>Transferred with licensing agreements</li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate("/blockchain")}
              >
                Get Certificate
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6 text-primary" />
                <CardTitle>Monitoring & Detection</CardTitle>
              </div>
              <CardDescription>24/7 surveillance of your work online</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Automated systems scan the internet for unauthorized use:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
                <li>Reverse image/audio search across billions of pages</li>
                <li>Deep web and dark web scanning capabilities</li>
                <li>AI-powered similarity detection finds derivatives</li>
                <li>Real-time alerts when matches are found</li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate("/monitoring-hub")}
              >
                Start Monitoring
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Scale className="h-6 w-6 text-primary" />
                <CardTitle>Legal Protection (DMCA)</CardTitle>
              </div>
              <CardDescription>Automated takedown enforcement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Legal tools to remove infringing content quickly:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
                <li>DMCA takedown notices filed on your behalf</li>
                <li>Templates and guidance for cease & desist letters</li>
                <li>Track notice status and platform responses</li>
                <li>Connect with IP attorneys when needed</li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate("/dmca-automation")}
              >
                File DMCA Notice
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-12" />

        {/* Document Protection */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileCheck className="h-6 w-6 text-primary" />
              <CardTitle>Document & Text Protection</CardTitle>
            </div>
            <CardDescription>Special protection for written content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Written content requires unique protection strategies:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">AI Fingerprinting</h4>
                <p className="text-sm text-muted-foreground">
                  Embed invisible tracers in your text that can be detected even after paraphrasing
                  or translation, helping identify when your content is used to train AI models.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Plagiarism Monitoring</h4>
                <p className="text-sm text-muted-foreground">
                  Continuous scanning of academic databases, content mills, and publishing platforms
                  to detect unauthorized use of your articles, books, or manuscripts.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Copyright Metadata</h4>
                <p className="text-sm text-muted-foreground">
                  Embed copyright information directly into document files, including author details,
                  creation date, and usage rights.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Version Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Compare different versions of your work online to identify unauthorized edits or
                  derivative works based on your original content.
                </p>
              </div>
            </div>
            <Button 
              className="w-full mt-4"
              onClick={() => navigate("/document-protection")}
            >
              Protect Your Documents
            </Button>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Best Practices for Creators</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Before Publishing:</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
                  <li>Register your work with blockchain verification</li>
                  <li>Apply watermarking and AI protection</li>
                  <li>Save original high-resolution files securely</li>
                  <li>Document your creative process (sketches, drafts)</li>
                  <li>Add copyright notices to all public-facing work</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold">After Publishing:</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
                  <li>Enable 24/7 monitoring on all platforms</li>
                  <li>Set up instant theft alerts</li>
                  <li>Regularly review monitoring reports</li>
                  <li>Act quickly on detected infringements</li>
                  <li>Keep records of all takedown notices</li>
                </ul>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-6">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Multi-Platform Strategy
              </h4>
              <p className="text-sm text-muted-foreground">
                Protect your work across all platforms where you publish: social media, portfolio sites,
                stock image libraries, music streaming services, and creative marketplaces. Each platform
                has unique risks and requires tailored protection strategies.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* TSMO Solutions */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">How TSMO Protects Your Work</CardTitle>
            <CardDescription>
              Comprehensive protection designed for independent creators and small creative brands
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-background rounded-lg p-4">
                <h4 className="font-semibold mb-2">🔒 Upload & Protect</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically apply multi-layer protection when you upload images, audio, video, or documents
                </p>
              </div>
              <div className="bg-background rounded-lg p-4">
                <h4 className="font-semibold mb-2">👁️ Monitor 24/7</h4>
                <p className="text-sm text-muted-foreground">
                  AI agents scan billions of web pages daily to detect unauthorized use of your work
                </p>
              </div>
              <div className="bg-background rounded-lg p-4">
                <h4 className="font-semibold mb-2">⚖️ Take Action</h4>
                <p className="text-sm text-muted-foreground">
                  Automated DMCA filing, attorney connections, and enforcement tools to stop theft fast
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="text-center space-y-4">
              <h4 className="text-xl font-semibold">Ready to Protect Your Creative Work?</h4>
              <p className="text-muted-foreground">
                Join thousands of independent creators who trust TSMO to safeguard their digital assets
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg"
                  onClick={() => navigate("/upload")}
                >
                  Start Protecting Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate("/pricing")}
                >
                  View Pricing Plans
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-12 grid md:grid-cols-4 gap-4">
          <Button variant="ghost" className="h-auto flex-col items-start p-4" onClick={() => navigate("/faq")}>
            <span className="font-semibold">FAQ</span>
            <span className="text-xs text-muted-foreground">Common questions</span>
          </Button>
          <Button variant="ghost" className="h-auto flex-col items-start p-4" onClick={() => navigate("/contact")}>
            <span className="font-semibold">Contact Support</span>
            <span className="text-xs text-muted-foreground">Get help</span>
          </Button>
          <Button variant="ghost" className="h-auto flex-col items-start p-4" onClick={() => navigate("/lawyers")}>
            <span className="font-semibold">Find an Attorney</span>
            <span className="text-xs text-muted-foreground">Legal assistance</span>
          </Button>
          <Button variant="ghost" className="h-auto flex-col items-start p-4" onClick={() => navigate("/terms-and-privacy")}>
            <span className="font-semibold">Terms & Privacy</span>
            <span className="text-xs text-muted-foreground">Legal information</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProtectionGuide;
