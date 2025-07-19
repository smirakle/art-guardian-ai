import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Eye, Shield, Download } from "lucide-react";
import { AnalysisResult } from "@/types/visual-recognition";
import { WatermarkProofGenerator, WatermarkProofData } from "@/lib/watermarkProof";
import { toast } from "sonner";

interface AnalysisResultsProps {
  results: AnalysisResult[];
  fileName?: string;
  artworkId?: string;
  userId?: string;
}

const AnalysisResults = ({ results, fileName, artworkId, userId }: AnalysisResultsProps) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return AlertTriangle;
      case 'medium': return Eye;
      default: return CheckCircle;
    }
  };

  const downloadWatermarkProof = (result: AnalysisResult, format: 'pdf' | 'txt' = 'pdf') => {
    if (!result.watermarkDetected) return;
    
    const proofData: WatermarkProofData = {
      fileName: fileName || 'unknown_file',
      watermarkId: result.watermarkId || 'DETECTED-PATTERN',
      detectionTimestamp: new Date(),
      confidence: result.confidence,
      userId,
      artworkId,
      scanType: result.type
    };

    const blob = format === 'pdf' 
      ? WatermarkProofGenerator.generateProofCertificate(proofData)
      : WatermarkProofGenerator.generateTextProof(proofData);
    
    WatermarkProofGenerator.downloadProof(blob, fileName || 'watermark_detection', format);
    toast.success(`Watermark proof ${format.toUpperCase()} downloaded successfully!`);
  };

  if (results.length === 0) return null;

  return (
    <Tabs defaultValue="classification" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="classification">Classification</TabsTrigger>
        <TabsTrigger value="copyright">Copyright</TabsTrigger>
        <TabsTrigger value="similarity">Similarity</TabsTrigger>
        <TabsTrigger value="reverse-search">Reverse Search</TabsTrigger>
      </TabsList>

      {results.map((result, resultIndex) => (
        <TabsContent key={resultIndex} value={result.type} className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = getRiskIcon(result.riskLevel);
                  return <Icon className="w-4 h-4" />;
                })()}
                <span className="font-medium">{result.label}</span>
                <Badge variant={getRiskColor(result.riskLevel)}>
                  {result.confidence.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {result.description}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recommendations:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {result.suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {/* Additional info for reverse search results */}
          {result.type === 'reverse-search' && result.platform && (
            <div className="space-y-2 pt-2 border-t border-border/30">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Platform:</span>
                  <span className="font-medium">{result.platform}</span>
                </div>
                {result.sourceUrl && (
                  <div className="flex justify-between">
                    <span>Source:</span>
                    <span className="font-medium text-primary truncate ml-2">{result.sourceUrl}</span>
                  </div>
                )}
                {result.dateFound && (
                  <div className="flex justify-between">
                    <span>Found:</span>
                    <span className="font-medium">{result.dateFound}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Watermark proof download buttons */}
          {result.watermarkDetected && (
            <div className="space-y-2 pt-2 border-t border-border/30">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Watermark Detected - Download Proof:
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => downloadWatermarkProof(result, 'pdf')}
                  className="flex-1"
                >
                  <Download className="w-3 h-3 mr-1" />
                  PDF Certificate
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => downloadWatermarkProof(result, 'txt')}
                  className="flex-1"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Text Proof
                </Button>
              </div>
            </div>
          )}

          {result.riskLevel === 'high' && (
            <Button size="sm" variant="destructive" className="w-full">
              <Shield className="w-3 h-3 mr-1" />
              Take Protection Action
            </Button>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default AnalysisResults;