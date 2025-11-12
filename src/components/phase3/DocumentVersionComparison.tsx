import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDocumentComparison } from "@/hooks/useDocumentComparison";
import { 
  FileText, 
  Link as LinkIcon, 
  GitCompare, 
  TrendingUp, 
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
  Download,
  Shield,
  Clock,
  FileSearch
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
  const [urlError, setUrlError] = useState("");
  const [textError, setTextError] = useState("");

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

  const validateUrl = (url: string): boolean => {
    setUrlError("");
    if (!url.trim()) {
      setUrlError("URL is required");
      return false;
    }
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setUrlError("URL must use HTTP or HTTPS protocol");
        return false;
      }
      return true;
    } catch {
      setUrlError("Please enter a valid URL");
      return false;
    }
  };

  const validateText = (text: string): boolean => {
    setTextError("");
    if (!text.trim()) {
      setTextError("Text content is required");
      return false;
    }
    if (text.trim().length < 50) {
      setTextError("Text must be at least 50 characters for meaningful comparison");
      return false;
    }
    if (text.length > 1000000) {
      setTextError("Text is too long (max 1MB)");
      return false;
    }
    return true;
  };

  const handleCompare = async () => {
    if (!selectedDocId) return;

    const isUrlMode = comparisonUrl.trim().length > 0;
    const isValid = isUrlMode 
      ? validateUrl(comparisonUrl) 
      : validateText(comparisonText);

    if (!isValid) return;

    await compareDocuments(selectedDocId, {
      url: comparisonUrl || undefined,
      text: comparisonText || undefined
    });
  };

  const exportComparison = () => {
    if (!latestResult) return;

    const exportData = {
      original_document_id: latestResult.original_document_id,
      comparison_url: latestResult.comparison_url,
      similarity_score: latestResult.similarity_score,
      statistics: {
        total_chars: latestResult.total_chars,
        matched_chars: latestResult.matched_chars,
        added_chars: latestResult.added_chars,
        removed_chars: latestResult.removed_chars,
      },
      differences: latestResult.differences,
      metadata: latestResult.metadata
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
    <TooltipProvider>
      <div className="space-y-6">
        {/* Help Banner */}
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong>Version Comparison:</strong> Detect plagiarism by comparing your protected document 
            with potential copies found online. Our AI-powered analysis highlights exact matches, 
            modifications, and provides a detailed similarity score.
          </AlertDescription>
        </Alert>

        {!plagiarismMatchId && (
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <GitCompare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Compare Document Versions</CardTitle>
                    <CardDescription className="mt-1">
                      Upload or paste a suspected plagiarized version to analyze
                    </CardDescription>
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      Paste a URL to fetch content automatically, or paste text directly. 
                      We'll analyze character-by-character differences and provide detailed statistics.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
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
                  <Label htmlFor="comparison-url" className="flex items-center gap-2">
                    Comparison Document URL
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Supported: PDF, DOCX, TXT, HTML, and text-based documents</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="relative">
                    <Input
                      id="comparison-url"
                      placeholder="https://example.com/document.pdf"
                      value={comparisonUrl}
                      onChange={(e) => {
                        setComparisonUrl(e.target.value);
                        setUrlError("");
                      }}
                      className={urlError ? "border-destructive" : ""}
                      disabled={comparing}
                    />
                    <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {urlError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {urlError}
                    </p>
                  )}
                  {!urlError && (
                    <p className="text-xs text-muted-foreground">
                      We'll automatically fetch and analyze the document content
                    </p>
                  )}
                </div>

                <Button 
                  onClick={handleCompare} 
                  disabled={comparing || !comparisonUrl.trim() || !selectedDocId}
                  className="w-full"
                >
                  {comparing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      <FileSearch className="w-4 h-4 mr-2" />
                      Compare Documents
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comparison-text" className="flex items-center gap-2">
                    Comparison Document Text
                    <Badge variant="outline" className="text-xs">
                      {comparisonText.length.toLocaleString()} / 1,000,000 chars
                    </Badge>
                  </Label>
                  <Textarea
                    id="comparison-text"
                    placeholder="Paste the text content you want to compare... (minimum 50 characters)"
                    value={comparisonText}
                    onChange={(e) => {
                      setComparisonText(e.target.value);
                      setTextError("");
                    }}
                    rows={12}
                    className={`font-mono text-sm resize-none ${textError ? "border-destructive" : ""}`}
                    disabled={comparing}
                  />
                  {textError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {textError}
                    </p>
                  )}
                  {!textError && comparisonText.length > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      {comparisonText.length >= 50 
                        ? `Ready to compare (${comparisonText.split(/\s+/).length} words)`
                        : `${50 - comparisonText.length} more characters needed`
                      }
                    </p>
                  )}
                </div>

                <Button 
                  onClick={handleCompare} 
                  disabled={comparing || !comparisonText.trim() || !selectedDocId}
                  className="w-full"
                >
                  {comparing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      <FileSearch className="w-4 h-4 mr-2" />
                      Compare Documents
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {comparing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary animate-spin" />
                <div>
                  <p className="font-medium">Analyzing Documents...</p>
                  <p className="text-sm text-muted-foreground">
                    Running character-by-character comparison using advanced diff algorithms
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!comparing && !latestResult && comparisonResults.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                <FileSearch className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Comparisons Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Start by entering a URL or pasting text content above to compare with your protected document. 
                We'll highlight all differences and provide detailed plagiarism statistics.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {latestResult && (
        <>
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Comparison Results
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Analyzed on {new Date(latestResult.metadata.compared_at).toLocaleString()}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={exportComparison}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </Button>
              </div>
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

              {latestResult.similarity_score >= 0.9 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="w-5 h-5" />
                  <AlertDescription>
                    <strong className="block mb-1">Critical: Potential Plagiarism Detected</strong>
                    This document shows {(latestResult.similarity_score * 100).toFixed(1)}% similarity - 
                    this is extremely high and likely indicates direct copying. We recommend taking immediate 
                    legal action and filing a DMCA takedown notice.
                  </AlertDescription>
                </Alert>
              )}

              {latestResult.similarity_score >= 0.7 && latestResult.similarity_score < 0.9 && (
                <Alert className="mt-4 border-amber-500/50 bg-amber-500/10">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <AlertDescription>
                    <strong className="block mb-1 text-amber-700 dark:text-amber-400">Warning: High Similarity Detected</strong>
                    This document shows {(latestResult.similarity_score * 100).toFixed(1)}% similarity to your original. 
                    Consider reaching out to the publisher or filing a copyright claim.
                  </AlertDescription>
                </Alert>
              )}

              {latestResult.similarity_score >= 0.5 && latestResult.similarity_score < 0.7 && (
                <Alert className="mt-4 border-blue-500/50 bg-blue-500/10">
                  <Info className="w-5 h-5 text-blue-500" />
                  <AlertDescription className="text-sm">
                    <strong className="block mb-1 text-blue-700 dark:text-blue-400">Moderate Similarity</strong>
                    {(latestResult.similarity_score * 100).toFixed(1)}% similarity detected. 
                    This may indicate inspiration or partial copying. Review the highlighted differences carefully.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GitCompare className="w-5 h-5" />
                    Side-by-Side Comparison
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {latestResult.differences.length.toLocaleString()} differences detected
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "unified" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("unified")}
                      >
                        Unified View
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Show all changes in a single column</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "side-by-side" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("side-by-side")}
                      >
                        Split View
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Compare documents side by side</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "unified" ? (
                <ScrollArea className="h-[600px] rounded-lg border bg-muted/30">
                  <div className="space-y-0.5 font-mono text-sm p-4">
                    {latestResult.differences.map((diff, idx) => (
                      <div
                        key={idx}
                        className={`whitespace-pre-wrap leading-relaxed px-2 py-0.5 rounded ${
                          diff.type === "insert"
                            ? "bg-green-500/20 border-l-2 border-green-600"
                            : diff.type === "delete"
                            ? "bg-destructive/20 border-l-2 border-destructive line-through"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {diff.type === "insert" && (
                            <TrendingUp className="w-3 h-3 text-green-600 flex-shrink-0" />
                          )}
                          {diff.type === "delete" && (
                            <TrendingDown className="w-3 h-3 text-destructive flex-shrink-0" />
                          )}
                          {diff.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="bg-muted/80 px-4 py-2.5 rounded-t-lg border-b flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Original Document</p>
                    </div>
                    <ScrollArea className="h-[600px] border border-t-0 rounded-b-lg bg-muted/30">
                      <div className="p-4 font-mono text-sm space-y-0.5">
                        {latestResult.differences.map((diff, idx) => (
                          diff.type !== "insert" && (
                            <span
                              key={idx}
                              className={`whitespace-pre-wrap leading-relaxed ${
                                diff.type === "delete"
                                  ? "bg-destructive/20 px-1 rounded border-l-2 border-destructive"
                                  : ""
                              }`}
                            >
                              {diff.text}
                            </span>
                          )
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div>
                    <div className="bg-muted/80 px-4 py-2.5 rounded-t-lg border-b flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Comparison Version</p>
                    </div>
                    <ScrollArea className="h-[600px] border border-t-0 rounded-b-lg bg-muted/30">
                      <div className="p-4 font-mono text-sm space-y-0.5">
                        {latestResult.differences.map((diff, idx) => (
                          diff.type !== "delete" && (
                            <span
                              key={idx}
                              className={`whitespace-pre-wrap leading-relaxed ${
                                diff.type === "insert"
                                  ? "bg-green-500/20 px-1 rounded border-l-2 border-green-600"
                                  : ""
                              }`}
                            >
                              {diff.text}
                            </span>
                          )
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-green-500/20 border border-green-600 rounded"></div>
                    <span className="text-muted-foreground">Added Content</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-destructive/20 border border-destructive rounded"></div>
                    <span className="text-muted-foreground">Removed Content</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-muted border rounded"></div>
                    <span className="text-muted-foreground">Unchanged</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Powered by advanced diff-match-patch algorithm
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {comparisonResults.length > 1 && (
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <CardTitle>Comparison History</CardTitle>
                <CardDescription className="mt-1">
                  {comparisonResults.length} previous comparisons
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3 pr-4">
                {comparisonResults.map((result) => (
                  <div 
                    key={result.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getSimilarityBadge(result.similarity_score)} className="flex-shrink-0">
                          {(result.similarity_score * 100).toFixed(1)}% Similarity
                        </Badge>
                        {result.similarity_score >= 0.9 && (
                          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                        )}
                      </div>
                      {result.comparison_url && (
                        <p className="text-xs text-muted-foreground truncate mb-1 group-hover:text-foreground transition-colors">
                          <LinkIcon className="w-3 h-3 inline mr-1" />
                          {result.comparison_url}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(result.metadata.compared_at).toLocaleDateString()} at{' '}
                        {new Date(result.metadata.compared_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right text-xs ml-4 flex-shrink-0">
                      <p className="font-medium mb-1">{result.matched_chars.toLocaleString()} matched</p>
                      <p className="text-green-600">+{result.added_chars.toLocaleString()} added</p>
                      <p className="text-destructive">-{result.removed_chars.toLocaleString()} removed</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      </div>
    </TooltipProvider>
  );
};
