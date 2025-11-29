import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  ShieldOff, 
  FileText, 
  Image, 
  Camera, 
  AlertTriangle, 
  Check, 
  X, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff,
  Fingerprint,
  Link2,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import exampleArtwork from "@/assets/example-artwork.gif";

const ProtectionComparisonShowcase = () => {
  const [activeTab, setActiveTab] = useState("document");
  const navigate = useNavigate();

  const contentTypes = {
    document: {
      icon: FileText,
      name: "Document",
      unprotected: {
        title: "Unprotected Document",
        risks: [
          { icon: AlertTriangle, text: "No fingerprint", color: "text-destructive" },
          { icon: Unlock, text: "No ownership proof", color: "text-destructive" },
          { icon: Eye, text: "Easy to copy", color: "text-destructive" },
          { icon: X, text: "Vulnerable to AI training", color: "text-destructive" }
        ]
      },
      protected: {
        title: "TSMO Protected Document",
        features: [
          { icon: Fingerprint, text: "AI Fingerprint Applied", color: "text-primary" },
          { icon: Shield, text: "Blockchain Verified", color: "text-primary" },
          { icon: EyeOff, text: "Tamper Detection Active", color: "text-primary" },
          { icon: Check, text: "24/7 Monitoring", color: "text-primary" }
        ]
      }
    },
    artwork: {
      icon: Image,
      name: "Artwork",
      unprotected: {
        title: "Unprotected Artwork",
        risks: [
          { icon: AlertTriangle, text: "AI Training Exposed", color: "text-destructive" },
          { icon: Eye, text: "No Watermark", color: "text-destructive" },
          { icon: Unlock, text: "Easy to Steal", color: "text-destructive" },
          { icon: X, text: "No Legal Protection", color: "text-destructive" }
        ]
      },
      protected: {
        title: "TSMO Protected Artwork",
        features: [
          { icon: Shield, text: "StyleCloak Active", color: "text-primary" },
          { icon: EyeOff, text: "Invisible Watermark", color: "text-primary" },
          { icon: Lock, text: "AI Training Blocked", color: "text-primary" },
          { icon: Check, text: "Instant Alert System", color: "text-primary" }
        ]
      }
    },
    photograph: {
      icon: Camera,
      name: "Photograph",
      unprotected: {
        title: "Unprotected Photo",
        risks: [
          { icon: Eye, text: "Metadata Visible", color: "text-destructive" },
          { icon: AlertTriangle, text: "Location Exposed", color: "text-destructive" },
          { icon: Unlock, text: "No Proof of Ownership", color: "text-destructive" },
          { icon: X, text: "Vulnerable to Theft", color: "text-destructive" }
        ]
      },
      protected: {
        title: "TSMO Protected Photo",
        features: [
          { icon: EyeOff, text: "EXIF Stripped", color: "text-primary" },
          { icon: Shield, text: "Blockchain Certificate", color: "text-primary" },
          { icon: Fingerprint, text: "Forensic Watermark", color: "text-primary" },
          { icon: Check, text: "Legal Protection", color: "text-primary" }
        ]
      }
    }
  };

  const activeContent = contentTypes[activeTab as keyof typeof contentTypes];
  const Icon = activeContent.icon;

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See the Difference Protection Makes
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your content exposed vs. protected by TSMO
          </p>
        </div>

        {/* Content Type Selector */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-auto">
            <TabsTrigger value="document" className="flex flex-col items-center gap-2 py-3">
              <FileText className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Document</span>
            </TabsTrigger>
            <TabsTrigger value="artwork" className="flex flex-col items-center gap-2 py-3">
              <Image className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Artwork</span>
            </TabsTrigger>
            <TabsTrigger value="photograph" className="flex flex-col items-center gap-2 py-3">
              <Camera className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Photo</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-8">
            {/* Comparison Cards */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Unprotected Side */}
              <Card className="border-2 border-destructive/20 bg-destructive/5 hover:border-destructive/40 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <ShieldOff className="h-8 w-8 text-destructive" />
                    <h3 className="text-xl font-bold text-destructive">
                      {activeContent.unprotected.title}
                    </h3>
                  </div>

                  {/* Visual Representation */}
                  <div className="relative bg-muted/30 rounded-lg p-4 mb-6 border-2 border-dashed border-destructive/30 min-h-[200px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent rounded-lg" />
                    {activeTab === "artwork" ? (
                      <img 
                        src={exampleArtwork} 
                        alt="Unprotected artwork example" 
                        className="max-w-full max-h-[180px] object-contain opacity-70"
                      />
                    ) : (
                      <Icon className="h-24 w-24 text-muted-foreground/40" strokeWidth={1} />
                    )}
                    <div className="absolute top-2 right-2">
                      <AlertTriangle className="h-6 w-6 text-destructive animate-pulse" />
                    </div>
                  </div>

                  {/* Risk List */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Vulnerabilities:
                    </p>
                    {activeContent.unprotected.risks.map((risk, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm">
                        <risk.icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${risk.color}`} />
                        <span className="text-foreground/80">{risk.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Protected Side */}
              <Card className="border-2 border-primary/30 bg-primary/5 hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <Shield className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-bold text-primary">
                      {activeContent.protected.title}
                    </h3>
                  </div>

                  {/* Visual Representation */}
                  <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4 mb-6 border-2 border-primary/30 min-h-[200px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-lg" />
                    {activeTab === "artwork" ? (
                      <img 
                        src={exampleArtwork} 
                        alt="TSMO protected artwork example" 
                        className="max-w-full max-h-[180px] object-contain"
                      />
                    ) : (
                      <Icon className="h-24 w-24 text-primary/60" strokeWidth={1.5} />
                    )}
                    <div className="absolute top-2 right-2">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Lock className="h-5 w-5 text-accent" />
                    </div>
                    {/* Protection Layer Effect */}
                    <div className="absolute inset-0 rounded-lg border-2 border-primary/20 animate-pulse" />
                  </div>

                  {/* Feature List */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Protection Features:
                    </p>
                    {activeContent.protected.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm">
                        <feature.icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${feature.color}`} />
                        <span className="text-foreground/80 font-medium">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl p-8 border border-primary/20">
              <h4 className="text-xl md:text-2xl font-bold mb-3">
                Ready to Protect Your {activeContent.name}?
              </h4>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join 15,000+ creators who trust TSMO to protect their intellectual property with military-grade security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => navigate("/upload")}
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Protect Your Content Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                  onClick={() => navigate("/document-protection")}
                >
                  Learn More About Protection
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ProtectionComparisonShowcase;