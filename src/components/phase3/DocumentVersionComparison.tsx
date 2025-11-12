import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDocumentComparison } from "@/hooks/useDocumentComparison";
import { 
  FileText, 
  Link as LinkIcon, 
  GitCompare, 
  TrendingUp, 
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface DocumentVersionComparisonProps {
  originalDocumentId?: string;
  plagiarismMatchId?: string;
}

export const DocumentVersionComparison = ({
  originalDocumentId,
  plagiarismMatchId
}: DocumentVersionComparisonProps) => {
  const {
    comparing,
    comparisonResults,
    compareDocuments,
    compareWithPlagiarismMatch,
    loadComparisonHistory
  } = useDocumentComparison();

  const [comparisonUrl, setComparisonUrl] = useState("");
  const [comparisonText, setComparisonText] = useState("");
  const [selectedDocId, setSelectedDocId] = useState(originalDocumentId || "");
  const [viewMode, setViewMode] = useState<"side-by-side" | "unified">("unified");

  useEffect(() => {
    if (plagiarismMatchId) {
      compareWithPlagiarismMatch(plagiarismMatchId);
    }
  }, [plagiarismMatchId, compareWithPlagiarismMatch]);

  useEffect(() => {
    if (originalDocumentId) {
      loadComparisonHistory(originalDocumentId);
    }
  }, [originalDocumentId, loadComparisonHistory]);

  const handleCompare = async () => {
    if (!selectedDocId) return;

    await compareDocuments(selectedDocId, {
      url: comparisonUrl || undefined,
      text: comparisonText || undefined
    });
  };

  const latestResult = comparisonResults[0];

  const getSimilarityColor = (score: number) => {
    if (score >= 0.9) return "text-red-600";
    if (score >= 0.7) return "text-orange-600";
    if (score >= 0.5) return "text-yellow-600";
    return "text-green-600";
  };

  const getSimilarityBadge = (score: number) => {
    if (score >= 0.9) return "destructive";
    if (score >= 0.7) return "destructive";
    if (score >= 0.5) return "outline";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      {!plagiarismMatchId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="w-5 h-5" />
              Compare Document Versions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="url" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Compare by URL
                </TabsTrigger>
                <TabsTrigger value="text">
                  <FileText className="w-4 h-4 mr-2" />
                  Compare by Text
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-4">
                <div className="space-y-2">
                  <Label>Comparison Document URL</Label>
                  <Input
                    placeholder="https://example.com/document.pdf"
                    value={comparisonUrl}
                    onChange={(e) => setComparisonUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the URL of the suspected plagiarized version
                  </p>
                </div>

                <Button 
                  onClick={handleCompare} 
                  disabled={comparing || !comparisonUrl || !selectedDocId}
                  className="w-full"
                >
                  {comparing ? "Comparing..." : "Compare Documents"}
                </Button>
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label>Comparison Document Text</Label>
                  <Textarea
                    placeholder="Paste the text content you want to compare..."
                    value={comparisonText}
                    onChange={(e) => setComparisonText(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste the full text of the suspected plagiarized version
                  </p>
                </div>

                <Button 
                  onClick={handleCompare} 
                  disabled={comparing || !comparisonText || !selectedDocId}
                  className="w-full"
                >
                  {comparing ? "Comparing..." : "Compare Documents"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {latestResult && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Comparison Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Similarity Score</p>
                  </div>
                  <p className={`text-2xl font-bold ${getSimilarityColor(latestResult.similarity_score)}`}>
                    {(latestResult.similarity_score * 100).toFixed(1)}%
                  </p>
                  <Progress 
                    value={latestResult.similarity_score * 100} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium">Matched Content</p>
                  </div>
                  <p className="text-2xl font-bold">{latestResult.matched_chars.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {((latestResult.matched_chars / latestResult.total_chars) * 100).toFixed(1)}% of total
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Added Content</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{latestResult.added_chars.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    New characters added
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-medium">Removed Content</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{latestResult.removed_chars.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    Characters removed
                  </p>
                </div>
              </div>

              {latestResult.similarity_score >= 0.7 && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">High Similarity Detected</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This document shows {(latestResult.similarity_score * 100).toFixed(1)}% similarity to your original. 
                        Consider taking legal action.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Document Comparison</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "unified" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("unified")}
                  >
                    Unified
                  </Button>
                  <Button
                    variant={viewMode === "side-by-side" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("side-by-side")}
                  >
                    Side by Side
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "unified" ? (
                <div className="space-y-1 font-mono text-sm border rounded-lg p-4 max-h-[600px] overflow-y-auto bg-muted/30">
                  {latestResult.differences.map((diff, idx) => (
                    <div
                      key={idx}
                      className={`whitespace-pre-wrap ${
                        diff.type === "insert"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100"
                          : diff.type === "delete"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100 line-through"
                          : ""
                      }`}
                    >
                      {diff.type === "insert" && <TrendingUp className="w-3 h-3 inline mr-1" />}
                      {diff.type === "delete" && <TrendingDown className="w-3 h-3 inline mr-1" />}
                      {diff.type === "equal" && <Minus className="w-3 h-3 inline mr-1 opacity-0" />}
                      {diff.text}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="bg-muted px-3 py-2 rounded-t-lg border-b">
                      <p className="text-sm font-medium">Original Document</p>
                    </div>
                    <div className="border rounded-b-lg p-4 max-h-[600px] overflow-y-auto bg-muted/30 font-mono text-sm">
                      {latestResult.differences.map((diff, idx) => (
                        diff.type !== "insert" && (
                          <span
                            key={idx}
                            className={`whitespace-pre-wrap ${
                              diff.type === "delete"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100"
                                : ""
                            }`}
                          >
                            {diff.text}
                          </span>
                        )
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="bg-muted px-3 py-2 rounded-t-lg border-b">
                      <p className="text-sm font-medium">Comparison Version</p>
                    </div>
                    <div className="border rounded-b-lg p-4 max-h-[600px] overflow-y-auto bg-muted/30 font-mono text-sm">
                      {latestResult.differences.map((diff, idx) => (
                        diff.type !== "delete" && (
                          <span
                            key={idx}
                            className={`whitespace-pre-wrap ${
                              diff.type === "insert"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100"
                                : ""
                            }`}
                          >
                            {diff.text}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 border"></div>
                  <span>Added</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 border"></div>
                  <span>Removed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-muted border"></div>
                  <span>Unchanged</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {comparisonResults.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comparisonResults.map((result, idx) => (
                <div 
                  key={result.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSimilarityBadge(result.similarity_score)}>
                        {(result.similarity_score * 100).toFixed(1)}% Match
                      </Badge>
                      {result.comparison_url && (
                        <span className="text-xs text-muted-foreground truncate max-w-xs">
                          {result.comparison_url}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Compared {new Date(result.metadata.compared_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{result.matched_chars.toLocaleString()} matched</p>
                    <p className="text-green-600">+{result.added_chars.toLocaleString()}</p>
                    <p className="text-red-600">-{result.removed_chars.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
