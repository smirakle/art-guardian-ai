import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";

export const ProductionDisclaimer = () => {
  return (
    <div className="space-y-4 mb-6">
      <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-sm">
          <strong>Important Disclaimer:</strong> AI deepfake detection is not 100% accurate. 
          Results should be verified by human experts for critical decisions. This tool is 
          designed to assist, not replace, professional verification.
        </AlertDescription>
      </Alert>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm space-y-2">
          <p><strong>Usage Limits:</strong></p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Single Image Analysis: 50 scans per day</li>
            <li>Multi-modal Protection: 30 scans per day</li>
            <li>Real-time Monitoring: Coming soon (requires enterprise plan)</li>
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            All scans are logged for quality assurance and cost management.
          </p>
        </AlertDescription>
      </Alert>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>What We Analyze:</strong> Our AI examines facial artifacts, lighting inconsistencies, 
          temporal anomalies, metadata forensics, and cross-platform verification to detect potential 
          deepfakes and AI-generated content.
        </AlertDescription>
      </Alert>
    </div>
  );
};
