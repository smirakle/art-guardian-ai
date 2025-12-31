import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Download, 
  Shield, 
  Zap, 
  CheckCircle2, 
  Code, 
  BookOpen,
  ExternalLink,
  Layers,
  Image,
  FileImage,
  Settings,
  Lock,
  Globe,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { CopyrightFooter } from '@/components/CopyrightFooter';
import { toast } from 'sonner';

const features = [
  {
    icon: Shield,
    title: 'One-Click Protection',
    description: 'Protect your artwork directly from Photoshop or Illustrator with a single click. No need to leave your creative workflow.'
  },
  {
    icon: Layers,
    title: 'Export Integration',
    description: 'Automatically apply AI training protection when you export or save your files. Protection is seamlessly embedded.'
  },
  {
    icon: FileImage,
    title: 'XMP Metadata',
    description: 'Industry-standard XMP metadata injection that survives file transfers and format conversions.'
  },
  {
    icon: Lock,
    title: 'C2PA Compliance',
    description: 'Full support for Content Authenticity Initiative (C2PA) standards for verifiable content provenance.'
  },
  {
    icon: Image,
    title: 'Batch Processing',
    description: 'Protect multiple artboards, layers, or files at once. Perfect for large projects and asset libraries.'
  },
  {
    icon: Globe,
    title: 'Cloud Sync',
    description: 'All protections sync to your TSMO dashboard for monitoring, verification, and enforcement.'
  }
];

const installSteps = [
  {
    step: 1,
    title: 'Download Plugin',
    description: 'Download the TSMO plugin package for your Adobe Creative Cloud version.',
    status: 'available'
  },
  {
    step: 2,
    title: 'Install via Creative Cloud',
    description: 'Open Adobe Creative Cloud desktop app, go to Plugins, and install the TSMO package.',
    status: 'available'
  },
  {
    step: 3,
    title: 'Authenticate',
    description: 'Sign in with your TSMO account credentials directly within the plugin panel.',
    status: 'available'
  },
  {
    step: 4,
    title: 'Start Protecting',
    description: 'Access the TSMO panel in any supported Adobe app and protect your work!',
    status: 'available'
  }
];

const supportedApps = [
  { name: 'Adobe Photoshop', version: '2024+', status: 'supported' },
  { name: 'Adobe Illustrator', version: '2024+', status: 'supported' },
  { name: 'Adobe InDesign', version: '2024+', status: 'coming_soon' },
  { name: 'Adobe Lightroom', version: '2024+', status: 'coming_soon' },
  { name: 'Adobe Premiere Pro', version: '2024+', status: 'planned' },
  { name: 'Adobe After Effects', version: '2024+', status: 'planned' }
];

interface VersionInfo {
  version: string;
  releaseDate: string;
  changelog: string;
  downloadUrl: string;
  updateAvailable?: boolean;
}

const AdobeIntegration: React.FC = () => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    fetchVersionInfo();
  }, []);

  const fetchVersionInfo = async () => {
    try {
      const response = await fetch(
        'https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/plugin-version?platform=web'
      );
      const data = await response.json();
      setVersionInfo(data);
    } catch (error) {
      console.error('Failed to fetch version info:', error);
      setVersionInfo({
        version: '1.0.0',
        releaseDate: '2025-01-01',
        changelog: 'Initial release',
        downloadUrl: '#'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!versionInfo?.downloadUrl || versionInfo.downloadUrl === '#') {
      toast.info('Plugin package coming soon', {
        description: 'The plugin is being prepared for distribution. Check back soon!'
      });
      return;
    }
    
    // Open download URL
    window.open(versionInfo.downloadUrl, '_blank');
    toast.success('Download started', {
      description: `TSMO Plugin v${versionInfo.version}`
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-destructive/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                  Adobe Creative Cloud Integration
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Protect Your Art<br />
                  <span className="text-primary">Without Leaving Adobe</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                  The TSMO plugin brings AI training protection directly into Photoshop, 
                  Illustrator, and more. One click to protect your creative work from 
                  unauthorized AI training.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="gap-2" onClick={handleDownload} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    {isLoading ? 'Loading...' : `Download Plugin${versionInfo ? ` v${versionInfo.version}` : ''}`}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open('https://docs.tsmo.io/adobe-plugin', '_blank')}
                  >
                    <BookOpen className="w-5 h-5" />
                    View Documentation
                  </Button>
                </div>
                {versionInfo && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Released: {new Date(versionInfo.releaseDate).toLocaleDateString()} • 
                    Requires Adobe CC 2024+
                  </p>
                )}
              </div>
              <div className="flex-1 relative">
                <div className="bg-gradient-to-br from-primary/20 to-destructive/20 rounded-2xl p-8 backdrop-blur-sm border border-border/50">
                  <div className="flex items-center gap-3 mb-6">
                    <Palette className="w-10 h-10 text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">TSMO Panel</h3>
                      <p className="text-sm text-muted-foreground">Adobe Photoshop</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-background/80 rounded-lg p-4 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Protection Level</span>
                        <Badge variant="secondary">Professional</Badge>
                      </div>
                      <Progress value={66} className="h-2" />
                    </div>
                    <Button className="w-full gap-2">
                      <Shield className="w-4 h-4" />
                      Protect Current Document
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Layers className="w-3 h-3" />
                        Batch
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Settings className="w-3 h-3" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Seamless Creative Workflow
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Protection that works the way you work. No exports, no uploads, 
                no context switching.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* C2PA Signing Status */}
        <section className="py-12 px-4 bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">C2PA Cryptographic Signing</h3>
                    <p className="text-muted-foreground mb-4">
                      Enterprise-level protection includes real ES256 cryptographic signatures 
                      following the Content Authenticity Initiative (C2PA) specification. 
                      This provides verifiable proof of content origin and ownership.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">ES256 Algorithm</Badge>
                      <Badge variant="secondary">X.509 Certificates</Badge>
                      <Badge variant="secondary">CAI Compliant</Badge>
                      <Badge variant="secondary">Adobe Verified</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Installation & Supported Apps */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="installation" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="installation">Installation</TabsTrigger>
                <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
              </TabsList>
              
              <TabsContent value="installation">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {installSteps.map((step) => (
                    <Card key={step.step} className="relative">
                      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {step.step}
                      </div>
                      <CardHeader className="pt-6">
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{step.description}</CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="compatibility">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {supportedApps.map((app, index) => (
                    <Card key={index} className={`${
                      app.status === 'supported' 
                        ? 'border-emerald-500/30 bg-emerald-500/5' 
                        : app.status === 'coming_soon'
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-border/50 bg-muted/30'
                    }`}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{app.name}</h3>
                            <p className="text-sm text-muted-foreground">{app.version}</p>
                          </div>
                          {app.status === 'supported' && (
                            <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Supported
                            </Badge>
                          )}
                          {app.status === 'coming_soon' && (
                            <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                              Coming Soon
                            </Badge>
                          )}
                          {app.status === 'planned' && (
                            <Badge variant="secondary">Planned</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* API Documentation */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Developer Resources
              </h2>
              <p className="text-muted-foreground">
                Building a custom integration? Our API makes it easy.
              </p>
            </div>
            
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  <CardTitle>Adobe Plugin API Endpoint</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <pre className="bg-slate-950 text-slate-50 p-6 overflow-x-auto text-sm">
                  <code>{`// Protect artwork from Adobe plugin
POST https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/adobe-plugin-api

{
  "action": "protect",
  "protectionLevel": "enterprise",
  "fileName": "artwork.psd",
  "fileHash": "sha256:abc123...",
  "metadata": {
    "copyrightOwner": "Artist Name",
    "copyrightYear": 2025,
    "rights": "All Rights Reserved",
    "prohibitAiTraining": true
  }
}

// Response (with C2PA signing)
{
  "success": true,
  "protectionId": "TSMO-ADOBE-...",
  "protectionCertificate": {
    "id": "TSMO-ADOBE-...",
    "timestamp": "2025-01-01T00:00:00Z",
    "methods": ["XMP Standard", "C2PA Manifest"],
    "level": "enterprise",
    "signatureValid": true,
    "c2paManifest": {
      "claim_signature": {
        "alg": "ES256",
        "sig": "MEUCIQDj...",
        "certificate_thumbprint": "a1b2c3..."
      }
    }
  }
}`}</code>
                </pre>
              </CardContent>
            </Card>
            
            <div className="flex justify-center mt-8 gap-4">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => window.open('https://docs.tsmo.io/api', '_blank')}
              >
                <BookOpen className="w-4 h-4" />
                Full API Documentation
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => window.open('https://github.com/tsmo/adobe-plugin', '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                GitHub Repository
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-destructive/10">
          <div className="max-w-3xl mx-auto text-center">
            <Zap className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Protect Your Creative Work?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of artists who trust TSMO to protect their work from 
              unauthorized AI training. Get started in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" onClick={handleDownload}>
                <Download className="w-5 h-5" />
                Download for Adobe CC
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2"
                onClick={() => window.location.href = '/auth'}
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </section>
      </main>

      <CopyrightFooter />
    </div>
  );
};

export default AdobeIntegration;
