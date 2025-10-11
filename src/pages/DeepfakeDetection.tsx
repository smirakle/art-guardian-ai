import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Shield, 
  AlertTriangle, 
  Eye, 
  TrendingUp, 
  Users, 
  Search,
  FileImage
} from "lucide-react";
import DeepfakeReporter from "@/components/DeepfakeReporter";
import LiveDeepfakeMonitor from "@/components/deepfake/LiveDeepfakeMonitor";
import RecentDeepfakeDetections from "@/components/RecentDeepfakeDetections";

const DeepfakeDetection = () => {
  const [activeTab, setActiveTab] = useState("detector");

  const stats = [
    {
      title: "Deepfakes Detected",
      value: "1,247",
      change: "+23%",
      icon: AlertTriangle,
      color: "text-red-500"
    },
    {
      title: "Sources Monitored",
      value: "2.5M+",
      change: "+15%",
      icon: Eye,
      color: "text-blue-500"
    },
    {
      title: "Accuracy Rate",
      value: "94.7%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-green-500"
    },
    {
      title: "Protected Users",
      value: "12.3K",
      change: "+8%",
      icon: Users,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Advanced Deepfake Detection
                </h1>
                <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                AI-powered detection of deepfakes, face swaps, and media manipulation across surface and dark web
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.change} this month</p>
                  </div>
                  <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color}`} />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
            <TabsTrigger value="detector" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Single Analysis</span>
              <span className="sm:hidden">Analyze</span>
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Real-Time Monitor</span>
              <span className="sm:hidden">Live</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Detected Content</span>
              <span className="sm:hidden">Results</span>
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <Search className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Threat Intel</span>
              <span className="sm:hidden">Intel</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Protection</span>
              <span className="sm:hidden">Guide</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detector" className="space-y-6">
            <DeepfakeReporter />
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <LiveDeepfakeMonitor />
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Detected Deepfakes & Manipulations
                </CardTitle>
                <CardDescription>
                  View all detected deepfakes, face swaps, and manipulated content found across monitored sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentDeepfakeDetections />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Threat Landscape</CardTitle>
                  <CardDescription>Latest deepfake trends and threats detected</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Celebrity Face Swaps</p>
                        <p className="text-xs text-muted-foreground">Increased 34% this month</p>
                      </div>
                      <Badge variant="destructive">High Risk</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Political Deepfakes</p>
                        <p className="text-xs text-muted-foreground">Election-related manipulation</p>
                      </div>
                      <Badge variant="secondary">Medium Risk</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Financial Fraud Videos</p>
                        <p className="text-xs text-muted-foreground">Fake CEO announcements</p>
                      </div>
                      <Badge variant="destructive">High Risk</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Revenge Deepfakes</p>
                        <p className="text-xs text-muted-foreground">Non-consensual content</p>
                      </div>
                      <Badge variant="destructive">Critical Risk</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detection Capabilities</CardTitle>
                  <CardDescription>Our AI detection methods and accuracy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Face Swap Detection</span>
                        <span className="font-medium">97.2%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '97.2%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Voice Synthesis</span>
                        <span className="font-medium">92.8%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '92.8%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Temporal Manipulation</span>
                        <span className="font-medium">89.4%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '89.4%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Metadata Forensics</span>
                        <span className="font-medium">95.6%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '95.6%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Dark Web Intelligence</CardTitle>
                <CardDescription>Suspicious activity detected on dark web platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">New Deepfake Service Marketplace</p>
                      <p className="text-xs text-muted-foreground">Custom face swap services advertising on Tor networks</p>
                      <Badge variant="outline" className="mt-1 text-xs">2 hours ago</Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <FileImage className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Celebrity Content Distribution</p>
                      <p className="text-xs text-muted-foreground">Coordinated distribution of manipulated celebrity images</p>
                      <Badge variant="outline" className="mt-1 text-xs">5 hours ago</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    How to Spot Deepfakes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium">Facial Inconsistencies</h4>
                      <p className="text-sm text-muted-foreground">Look for unnatural facial movements, blinking patterns, or asymmetrical features</p>
                    </div>
                    
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium">Temporal Artifacts</h4>
                      <p className="text-sm text-muted-foreground">Watch for flickering, inconsistent lighting, or sudden quality changes</p>
                    </div>
                    
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium">Audio-Visual Sync</h4>
                      <p className="text-sm text-muted-foreground">Check if lip movements match speech patterns and timing</p>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium">Context Verification</h4>
                      <p className="text-sm text-muted-foreground">Verify claimed location, time, and circumstances with known facts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Protection Strategies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-medium">Verify Sources</h4>
                      <p className="text-sm text-muted-foreground">Always check multiple reputable sources before sharing content</p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-medium">Use Detection Tools</h4>
                      <p className="text-sm text-muted-foreground">Regularly scan suspicious content with AI detection tools</p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-medium">Report Suspicious Content</h4>
                      <p className="text-sm text-muted-foreground">Report deepfakes to platform moderators and authorities</p>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-medium">Educate Others</h4>
                      <p className="text-sm text-muted-foreground">Share knowledge about deepfakes and detection methods</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeepfakeDetection;