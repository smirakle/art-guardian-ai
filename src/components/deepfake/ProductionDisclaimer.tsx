import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info, Zap, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ProductionDisclaimer = () => {
  return (
    <div className="space-y-4 mb-6">
      {/* Production Status */}
      <Alert variant="default" className="border-green-500/50 bg-green-500/10">
        <Shield className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-sm">
          <div className="flex items-center gap-2 mb-2">
            <strong>Production Status:</strong>
            <Badge variant="default" className="bg-green-600 text-xs">LIVE</Badge>
            <Badge variant="outline" className="text-xs">Real APIs Active</Badge>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">SerpAPI Reverse Image</Badge>
            <Badge variant="secondary" className="text-xs">OpenAI GPT-4 Vision</Badge>
            <Badge variant="secondary" className="text-xs">TinEye API</Badge>
          </div>
        </AlertDescription>
      </Alert>

      <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-sm">
          <strong>Important Disclaimer:</strong> AI deepfake detection is not 100% accurate. 
          Results should be verified by human experts for critical decisions. This tool is 
          designed to assist, not replace, professional verification.
        </AlertDescription>
      </Alert>

      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription className="text-sm space-y-2">
          <p><strong>Daily API Limits (Production):</strong></p>
          <ul className="list-disc ml-4 space-y-1">
            <li><strong>Full Scans:</strong> 50 per day (SerpAPI + OpenAI analysis)</li>
            <li><strong>AI Training Protection:</strong> 50 files per day</li>
            <li><strong>Real-time Monitoring:</strong> 10 sessions per day</li>
            <li><strong>Individual API calls:</strong> ~100 SerpAPI, ~200 OpenAI daily</li>
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Limits reset at midnight UTC. All API usage is tracked and logged.
          </p>
        </AlertDescription>
      </Alert>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Real Detection Methods:</strong>
          <ul className="list-disc ml-4 mt-2 space-y-1">
            <li><strong>Reverse Image Search:</strong> SerpAPI scans Google, social platforms for your images</li>
            <li><strong>AI Vision Analysis:</strong> GPT-4 Vision examines facial artifacts, lighting, boundaries</li>
            <li><strong>Dataset Scanning:</strong> Checks LAION, Common Crawl, HuggingFace for unauthorized use</li>
            <li><strong>Metadata Forensics:</strong> Analyzes EXIF data and compression artifacts</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};
