import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Search, 
  Eye, 
  Globe, 
  Play, 
  Upload, 
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Users,
  Lock,
  Zap
} from "lucide-react";
import VisualRecognition from "@/components/VisualRecognition";
import AnimatedDemo from "@/components/AnimatedDemo";
import MonitoringFlow from "@/components/MonitoringFlow";

const Demo = () => {
  const [activeDemo, setActiveDemo] = useState("video");

  const demoFeatures = [
    {
      id: "video",
      title: "Video Demo",
      icon: Play,
      description: "Watch our animated characters explain how TSMO protects your artwork",
      component: <AnimatedDemo />
    },
    {
      id: "visual",
      title: "Visual Recognition",
      icon: Eye,
      description: "Upload an image and see our AI analyze it for copyright similarities",
      component: <VisualRecognition />
    },
    {
      id: "monitoring",
      title: "How TSMO Works",
      icon: Search,
      description: "See the 6 automated steps of TSMO's monitoring system",
      component: <MonitoringFlow />
    },
    {
      id: "blockchain",
      title: "Blockchain Verification",
      icon: Shield,
      description: "Experience immutable proof of ownership",
      component: <BlockchainDemo />
    }
  ];

  const educationalContent = [
    {
      title: "Understanding Art Theft in the Digital Age",
      content: "Art theft has evolved from physical heists to digital piracy. Learn how to protect your creative works.",
      stats: "85% of art theft now happens online"
    },
    {
      title: "How AI Detection Works",
      content: "Our advanced algorithms can identify visual similarities even when images are cropped or modified.",
      stats: "99.2% accuracy rate"
    },
    {
      title: "Legal Protections & DMCA",
      content: "Understanding your rights and how to enforce them when your work is stolen.",
      stats: "24-48 hour response time"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">
            <Zap className="w-3 h-3 mr-1" />
            Free Demo Available
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
            Experience Art Protection
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Try our AI-powered protection tools for free. Upload your artwork and see how we detect theft, 
            monitor usage, and protect your intellectual property.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent">
              <Play className="w-5 h-5 mr-2" />
              Start Free Demo
            </Button>
            <Button size="lg" variant="outline">
              <BookOpen className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Demos */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Interactive Feature Demos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience our protection features firsthand. No registration required.
            </p>
          </div>

          <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              {demoFeatures.map((feature) => (
                <TabsTrigger key={feature.id} value={feature.id} className="flex items-center gap-2">
                  <feature.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{feature.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {demoFeatures.map((feature) => (
              <TabsContent key={feature.id} value={feature.id}>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <feature.icon className="w-5 h-5 text-primary" />
                      {feature.title}
                    </CardTitle>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardHeader>
                  <CardContent>
                    {feature.component}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Educational Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Art Protection Education
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn about digital art theft and how to protect your creative works
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {educationalContent.map((content, index) => (
              <Card key={index} className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{content.content}</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">{content.stats}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Read More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Free Tools Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Free Protection Tools
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started with basic protection for your artwork at no cost
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 text-center p-6">
              <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Basic Image Scan</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload up to 3 images per day for basic similarity checking
              </p>
              <Button variant="outline" className="w-full">
                Start Scanning
              </Button>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 text-center p-6">
              <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Website Monitor</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Monitor one website for unauthorized use of your artwork
              </p>
              <Button variant="outline" className="w-full">
                Setup Monitor
              </Button>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 text-center p-6">
              <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Copyright Guide</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Free downloadable guide on protecting your digital artwork
              </p>
              <Button variant="outline" className="w-full">
                Download Guide
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for Complete Protection?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Upgrade to our full platform for unlimited monitoring, advanced AI detection, 
            and comprehensive legal support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent">
              View Pricing Plans
            </Button>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Demo Components

const BlockchainDemo = () => (
  <div className="space-y-6">
    <div className="bg-muted/50 rounded-lg p-6">
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        Blockchain Certificate Preview
      </h4>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Hash:</span>
          <span className="font-mono">0x4a7b...9c2f</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Block:</span>
          <span className="font-mono">18,934,521</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Timestamp:</span>
          <span>2024-01-15 14:23:17 UTC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status:</span>
          <Badge variant="default">Verified</Badge>
        </div>
      </div>
    </div>
    <div className="text-center">
      <Button className="bg-gradient-to-r from-primary to-accent">
        Create Your Certificate
      </Button>
    </div>
  </div>
);

export default Demo;