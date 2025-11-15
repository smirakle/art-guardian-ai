import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PromoVideoScriptDownload from "@/components/PromoVideoScriptDownload";
import { Video, FileText, Download } from "lucide-react";

const PromoMaterials = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Promotional Materials</h1>
            <p className="text-lg text-muted-foreground">
              Download scripts, guides, and materials to help promote TSMO
            </p>
          </div>

          {/* Promotional Video Script Section */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Video className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Promotional Video Script</CardTitle>
                  <CardDescription>
                    A complete script for creating promotional videos about TSMO
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PromoVideoScriptDownload />
            </CardContent>
          </Card>

          {/* Future materials placeholder */}
          <Card className="opacity-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <CardTitle>Additional Materials</CardTitle>
                  <CardDescription>
                    More promotional materials coming soon
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PromoMaterials;
