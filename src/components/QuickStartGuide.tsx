import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Image, 
  Video, 
  Link, 
  Shield, 
  Eye,
  ArrowRight 
} from "lucide-react";

interface QuickStartGuideProps {
  onUploadClick?: () => void;
}

const QuickStartGuide = ({ onUploadClick }: QuickStartGuideProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* What you can protect */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-primary" />
            What You Can Protect
          </CardTitle>
          <CardDescription>
            Upload your creative work or add social media links for monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Image className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Images</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Video className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Videos</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Link className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Social Links</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Upload className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Artwork</span>
            </div>
          </div>
          
          <div className="pt-2">
            <Badge variant="secondary" className="text-xs">
              Supported: YouTube, TikTok, Instagram, Facebook, X
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="w-5 h-5 text-accent" />
            How Protection Works
          </CardTitle>
          <CardDescription>
            Advanced AI monitoring keeps your content safe 24/7
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                1
              </div>
              <span className="text-sm">AI analyzes and watermarks your content</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                2
              </div>
              <span className="text-sm">Continuous monitoring across 50K+ sources</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                3
              </div>
              <span className="text-sm">Instant alerts when matches are found</span>
            </div>
          </div>
          
          <Button 
            onClick={onUploadClick}
            className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            Start Protecting Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStartGuide;