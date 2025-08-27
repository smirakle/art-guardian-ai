import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone,
  Upload,
  Users,
  BarChart3,
  Shield,
  Download,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { MobileUpload } from "./MobileUpload";
import { MobileCommunity } from "./MobileCommunity";
import { MobileDashboard } from "./MobileDashboard";
import { useAuth } from "@/contexts/AuthContext";

export const MobileContainer = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const features = [
    {
      icon: Upload,
      title: "Mobile Upload",
      description: "Capture and protect artwork directly from your phone camera or gallery",
      status: "available"
    },
    {
      icon: Shield,
      title: "Real-time Protection",
      description: "24/7 monitoring with instant notifications for potential infringements",
      status: "available"
    },
    {
      icon: Users,
      title: "Community Hub",
      description: "Connect with artists, share experiences, and get expert legal advice",
      status: "available"
    },
    {
      icon: BarChart3,
      title: "Mobile Dashboard",
      description: "Track protection status and view analytics on the go",
      status: "available"
    }
  ];

  const downloadLinks = {
    ios: "https://apps.apple.com/app/tsmo-art-guardian",
    android: "https://play.google.com/store/apps/details?id=com.tsmo.artguardian"
  };

  return (
    <div className="space-y-6 p-4">
      {/* Mobile App Preview Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Smartphone className="w-6 h-6" />
            TSMO Mobile Experience
          </CardTitle>
          <p className="text-muted-foreground">
            Experience the full power of TSMO copyright protection on your mobile device
          </p>
        </CardHeader>
        <CardContent>
          {/* Download Buttons */}
          <div className="flex gap-3 justify-center mb-6">
            <Button
              onClick={() => window.open(downloadLinks.ios, '_blank')}
              className="flex-1 max-w-40"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              iOS App
            </Button>
            <Button
              onClick={() => window.open(downloadLinks.android, '_blank')}
              className="flex-1 max-w-40"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Android App
            </Button>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium">{feature.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Available
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Try the mobile experience below or download the full app for the best performance
            </p>
            <Button
              onClick={() => window.location.href = "/get-app"}
              variant="default"
              className="w-full sm:w-auto"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Get Full Mobile App
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Interface Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mobile Interface Preview</CardTitle>
          <p className="text-sm text-muted-foreground">
            Experience TSMO's mobile capabilities directly in your browser
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
              <TabsTrigger value="dashboard" className="text-xs">
                <BarChart3 className="w-4 h-4 mr-1" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-xs">
                <Upload className="w-4 h-4 mr-1" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="community" className="text-xs">
                <Users className="w-4 h-4 mr-1" />
                Community
              </TabsTrigger>
            </TabsList>

            <div className="max-w-sm mx-auto bg-muted/30 rounded-t-2xl border-t border-l border-r">
              {/* Mobile Status Bar Mockup */}
              <div className="h-6 bg-background border-b flex items-center justify-center rounded-t-2xl">
                <div className="text-xs font-medium">TSMO Mobile</div>
              </div>

              {/* Mobile Content */}
              <div className="bg-background min-h-[600px] max-h-[600px] overflow-y-auto">
                <TabsContent value="dashboard" className="m-0">
                  {user ? (
                    <MobileDashboard />
                  ) : (
                    <div className="p-4 text-center">
                      <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Sign In Required</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Sign in to view your personalized protection dashboard
                      </p>
                      <Button
                        onClick={() => window.location.href = "/auth"}
                        className="w-full"
                      >
                        Sign In
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="upload" className="m-0">
                  <MobileUpload />
                </TabsContent>

                <TabsContent value="community" className="m-0">
                  <MobileCommunity />
                </TabsContent>
              </div>

              {/* Mobile Navigation Bar Mockup */}
              <div className="h-12 bg-background border-t flex items-center justify-around rounded-b-2xl">
                <Button
                  variant={activeTab === "dashboard" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("dashboard")}
                  className="h-8"
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={activeTab === "upload" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("upload")}
                  className="h-8"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <Button
                  variant={activeTab === "community" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("community")}
                  className="h-8"
                >
                  <Users className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};