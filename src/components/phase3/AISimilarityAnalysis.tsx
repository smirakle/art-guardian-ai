import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle2, AlertTriangle } from "lucide-react";

interface AISimilarityAnalysisProps {
  analysis: {
    similarity_score: number;
    is_paraphrased: boolean;
    semantic_similarity: number;
    structural_similarity: number;
    key_concepts_matched: string[];
    analysis_details: string;
    confidence: number;
  };
  sourceUrl?: string;
}

export const AISimilarityAnalysis = ({ analysis, sourceUrl }: AISimilarityAnalysisProps) => {
  const getSeverityColor = (score: number) => {
    if (score >= 0.8) return "destructive";
    if (score >= 0.6) return "default";
    return "secondary";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Similarity Analysis</CardTitle>
          </div>
          {analysis.is_paraphrased ? (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Paraphrased Content Detected
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              No Paraphrasing Detected
            </Badge>
          )}
        </div>
        <CardDescription>
          Advanced AI analysis for semantic similarity and paraphrasing detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Similarity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Similarity</span>
            <Badge variant={getSeverityColor(analysis.similarity_score)}>
              {(analysis.similarity_score * 100).toFixed(1)}%
            </Badge>
          </div>
          <Progress value={analysis.similarity_score * 100} className="h-2" />
        </div>

        {/* Semantic Similarity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Semantic Similarity</span>
            <span className="text-muted-foreground">
              {(analysis.semantic_similarity * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={analysis.semantic_similarity * 100} className="h-2" />
        </div>

        {/* Structural Similarity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Structural Similarity</span>
            <span className="text-muted-foreground">
              {(analysis.structural_similarity * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={analysis.structural_similarity * 100} className="h-2" />
        </div>

        {/* Confidence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Analysis Confidence</span>
            <span className={getConfidenceColor(analysis.confidence)}>
              {(analysis.confidence * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={analysis.confidence * 100} className="h-2" />
        </div>

        {/* Key Concepts Matched */}
        {analysis.key_concepts_matched.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Matched Key Concepts</div>
            <div className="flex flex-wrap gap-2">
              {analysis.key_concepts_matched.map((concept, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {concept}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Details */}
        <div className="space-y-2">
          <div className="text-sm font-medium">AI Analysis</div>
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            {analysis.analysis_details}
          </p>
        </div>

        {/* Source URL */}
        {sourceUrl && (
          <div className="pt-4 border-t">
            <div className="text-xs text-muted-foreground">Source</div>
            <a 
              href={sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline break-all"
            >
              {sourceUrl}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
