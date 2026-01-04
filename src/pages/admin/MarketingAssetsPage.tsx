import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Image, Video, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import pluginIcon from "@/assets/adobe-plugin-icon-512.png";
import screenshot1 from "@/assets/adobe-screenshot-1.png";
import screenshot2 from "@/assets/adobe-screenshot-2.png";
import screenshot3 from "@/assets/adobe-screenshot-3.png";
import demoVideo from "@/assets/adobe-plugin-demo.mp4";

const MarketingAssetsPage: React.FC = () => {
  const [copiedUrl, setCopiedUrl] = React.useState<string | null>(null);

  const assets = [
    { name: "Plugin Icon (512x512)", file: pluginIcon, filename: "adobe-plugin-icon-512.png", type: "image" },
    { name: "Screenshot 1 - Protection Panel", file: screenshot1, filename: "adobe-screenshot-1.png", type: "image" },
    { name: "Screenshot 2 - Protection Progress", file: screenshot2, filename: "adobe-screenshot-2.png", type: "image" },
    { name: "Screenshot 3 - Protection Complete", file: screenshot3, filename: "adobe-screenshot-3.png", type: "image" },
    { name: "Demo Video (5s)", file: demoVideo, filename: "adobe-plugin-demo.mp4", type: "video" },
  ];

  const handleDownload = (file: string, filename: string) => {
    const link = document.createElement('a');
    link.href = file;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Download started", description: filename });
  };

  const handleCopyUrl = (file: string, name: string) => {
    const fullUrl = window.location.origin + file;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(name);
    setTimeout(() => setCopiedUrl(null), 2000);
    toast({ title: "URL copied", description: "Link copied to clipboard" });
  };

  const handleDownloadAll = () => {
    assets.forEach((asset, index) => {
      setTimeout(() => handleDownload(asset.file, asset.filename), index * 500);
    });
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Marketing Assets</h1>
            <p className="text-muted-foreground">Adobe Exchange submission assets</p>
          </div>
          <Button onClick={handleDownloadAll} className="gap-2">
            <Download className="h-4 w-4" />
            Download All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <Card key={asset.name} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {asset.type === 'video' ? <Video className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                  {asset.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  {asset.type === 'video' ? (
                    <video src={asset.file} controls className="w-full h-full object-contain" />
                  ) : (
                    <img src={asset.file} alt={asset.name} className="w-full h-full object-contain" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => handleDownload(asset.file, asset.filename)}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCopyUrl(asset.file, asset.name)}
                  >
                    {copiedUrl === asset.name ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{asset.filename}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketingAssetsPage;
