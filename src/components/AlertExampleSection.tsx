import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, Calendar, Download, ChevronRight } from "lucide-react";

const AlertExampleSection = () => {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4 bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
            Proof of Product
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">What an Alert Looks Like</h2>
          <p className="text-lg text-muted-foreground">When we find a copy of your art, you'll get a detailed alert like this</p>
        </div>

        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 max-w-2xl mx-auto">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg">Match Found</CardTitle>
              </div>
              <Badge variant="destructive" className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40">
                High Confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Match Preview */}
            <div className="flex gap-4 p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-muted-foreground text-center">Your Art<br/>Thumbnail</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">pinterest.com/pins/123456</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Detected: Dec 23, 2025 at 2:34 PM</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Confidence: </span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">94%</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button size="sm" variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Save Evidence
              </Button>
              <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                Take Action
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-2">
              This is a sample alert. Real alerts include direct links to the source.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AlertExampleSection;
