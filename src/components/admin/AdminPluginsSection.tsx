import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Monitor, ScrollText, ExternalLink, Plug, FileCode2, Palette, ImageIcon, FileCheck } from "lucide-react";
import AdobePluginSimulator from "./AdobePluginSimulator";
import PhotoshopPluginMockup from "./PhotoshopPluginMockup";
import AdobeIconGenerator from "./AdobeIconGenerator";
import AdobeIconValidator from "./AdobeIconValidator";

const AdminPluginsSection = () => {
  const [activeSubTab, setActiveSubTab] = useState("simulator");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                <Plug className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Plugins Development Hub</CardTitle>
                <CardDescription className="text-base">
                  Build, test, and manage creative application plugins
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                Adobe Plugin Ready
              </Badge>
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                Figma • Coming Soon
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Links */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground">Resources:</span>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => window.open("https://developer.adobe.com/photoshop/uxp/", "_blank")}
        >
          <FileCode2 className="h-4 w-4" />
          Adobe UXP Docs
          <ExternalLink className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => window.open("https://exchange.adobe.com/", "_blank")}
        >
          <Palette className="h-4 w-4" />
          Adobe Exchange
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="bg-muted/50 border border-border/50">
          <TabsTrigger value="simulator" className="gap-2 data-[state=active]:bg-purple-500/20">
            <Wrench className="h-4 w-4" />
            API Simulator
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2 data-[state=active]:bg-orange-500/20">
            <Monitor className="h-4 w-4" />
            Photoshop Preview
          </TabsTrigger>
          <TabsTrigger value="icons" className="gap-2 data-[state=active]:bg-pink-500/20">
            <ImageIcon className="h-4 w-4" />
            Icon Generator
          </TabsTrigger>
          <TabsTrigger value="validator" className="gap-2 data-[state=active]:bg-green-500/20">
            <FileCheck className="h-4 w-4" />
            Icon Validator
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2 data-[state=active]:bg-blue-500/20">
            <ScrollText className="h-4 w-4" />
            API Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="mt-6">
          <AdobePluginSimulator />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <PhotoshopPluginMockup />
        </TabsContent>

        <TabsContent value="icons" className="mt-6">
          <AdobeIconGenerator />
        </TabsContent>

        <TabsContent value="validator" className="mt-6">
          <AdobeIconValidator />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                Adobe Plugin API Logs
              </CardTitle>
              <CardDescription>
                Monitor real-time API requests from the Adobe plugin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <ScrollText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Recent Activity</p>
                <p className="text-sm">
                  API logs will appear here when the Adobe plugin makes requests.
                  <br />
                  Use the API Simulator tab to test the plugin endpoints.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPluginsSection;
