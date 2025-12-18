import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Upload, CheckCircle2, Sparkles, Lock, Fingerprint, ArrowRight, X, Download, FileText, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { realWorldProtection } from "@/lib/realWorldProtection";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InstantProtectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "upload" | "processing" | "complete";

const GUEST_PROTECTION_KEY = "tsmo_guest_protection_count";
const MAX_GUEST_PROTECTIONS = 3;

const getGuestProtectionCount = (): number => {
  const stored = localStorage.getItem(GUEST_PROTECTION_KEY);
  return stored ? parseInt(stored, 10) : 0;
};

const incrementGuestProtection = (): void => {
  const current = getGuestProtectionCount();
  localStorage.setItem(GUEST_PROTECTION_KEY, String(current + 1));
};

export const InstantProtectModal = ({ open, onOpenChange }: InstantProtectModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [protectionResult, setProtectionResult] = useState<{
    protectionId: string;
    methodsApplied: string[];
    protectedBlob?: Blob;
    metadata?: Record<string, any>;
    originalSize?: number;
    protectedSize?: number;
  } | null>(null);
  
  const protectionCount = getGuestProtectionCount();
  const canProtect = protectionCount < MAX_GUEST_PROTECTIONS;
  const remainingProtections = MAX_GUEST_PROTECTIONS - protectionCount;

  const resetState = () => {
    setStep("upload");
    setSelectedFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setProtectionResult(null);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, WEBP)",
        variant: "destructive"
      });
    }
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleProtect = async () => {
    if (!selectedFile) return;

    // Check if can still protect
    if (!canProtect) {
      toast({
        title: "Limit Reached",
        description: "Create a free account to protect more images.",
        variant: "destructive"
      });
      return;
    }

    try {
      setStep("processing");
      setProgress(10);

      // Simulate progress while protection runs
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 85));
      }, 300);

      // Apply real protection
      const result = await realWorldProtection.protectFile(selectedFile, {
        adversarialNoise: true,
        rightsMetadata: true,
        webCrawlerBlocking: true,
        copyrightInfo: {
          owner: "Guest User",
          year: new Date().getFullYear(),
          rights: "All Rights Reserved"
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      // Record the protection locally
      incrementGuestProtection();

      setProtectionResult({
        protectionId: result.protectionId,
        methodsApplied: result.methods,
        protectedBlob: result.protectedBlob,
        metadata: result.metadata,
        originalSize: selectedFile.size,
        protectedSize: result.protectedBlob?.size
      });

      // Short delay to show 100% before completing
      setTimeout(() => {
        setStep("complete");
      }, 500);

    } catch (error) {
      console.error("Protection error:", error);
      toast({
        title: "Protection Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      setStep("upload");
    }
  };

  const handleCreateAccount = () => {
    handleClose();
    navigate("/auth");
  };

  const handleProtectMore = () => {
    resetState();
  };

  const handleDownloadProtected = () => {
    if (!protectionResult?.protectedBlob || !selectedFile) return;
    const url = URL.createObjectURL(protectionResult.protectedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `protected_${selectedFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Your protected image has been saved."
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {step === "upload" && "Instant AI Protection"}
            {step === "processing" && "Protecting Your Image"}
            {step === "complete" && "Protection Complete!"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" && "Drop an image to see AI protection in action — no signup required"}
            {step === "processing" && "Applying multiple layers of protection..."}
            {step === "complete" && "Your image is now protected from AI training"}
          </DialogDescription>
        </DialogHeader>

        {/* Upload Step */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${isDragging 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                }
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("instant-file-input")?.click()}
            >
              <input
                id="instant-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
              
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-48 rounded-lg mx-auto shadow-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Drop your image here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supports JPG, PNG, WEBP • Max 20MB
                  </p>
                </div>
              )}
            </div>

            {selectedFile && (
              <Button 
                onClick={handleProtect} 
                className="w-full"
                size="lg"
              >
                <Shield className="mr-2 h-4 w-4" />
                Protect This Image
              </Button>
            )}

            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Secure & Private
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Instant Results
              </span>
            </div>

            {remainingProtections > 0 && (
              <p className="text-xs text-center text-muted-foreground">
                {remainingProtections} free protection{remainingProtections !== 1 ? "s" : ""} remaining
              </p>
            )}
          </div>
        )}

        {/* Processing Step */}
        {step === "processing" && (
          <div className="space-y-6 py-4">
            <div className="relative">
              {previewUrl && (
                <img 
                  src={previewUrl} 
                  alt="Processing" 
                  className="max-h-40 rounded-lg mx-auto opacity-50"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background/80 backdrop-blur rounded-lg px-4 py-2">
                  <Shield className="h-8 w-8 text-primary animate-pulse mx-auto" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Applying protection...</span>
                <span>{progress}%</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className={`flex items-center gap-2 ${progress > 20 ? "text-foreground" : "text-muted-foreground"}`}>
                <CheckCircle2 className={`h-4 w-4 ${progress > 20 ? "text-green-500" : ""}`} />
                Analyzing image structure
              </div>
              <div className={`flex items-center gap-2 ${progress > 40 ? "text-foreground" : "text-muted-foreground"}`}>
                <CheckCircle2 className={`h-4 w-4 ${progress > 40 ? "text-green-500" : ""}`} />
                Injecting adversarial noise
              </div>
              <div className={`flex items-center gap-2 ${progress > 60 ? "text-foreground" : "text-muted-foreground"}`}>
                <CheckCircle2 className={`h-4 w-4 ${progress > 60 ? "text-green-500" : ""}`} />
                Embedding rights metadata
              </div>
              <div className={`flex items-center gap-2 ${progress > 80 ? "text-foreground" : "text-muted-foreground"}`}>
                <CheckCircle2 className={`h-4 w-4 ${progress > 80 ? "text-green-500" : ""}`} />
                Adding crawler blocking
              </div>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <div className="space-y-4 py-2">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              
              {previewUrl && (
                <div className="relative inline-block mb-3">
                  <img 
                    src={previewUrl} 
                    alt="Protected" 
                    className="max-h-24 rounded-lg shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1">
                    <Shield className="h-3 w-3" />
                  </div>
                </div>
              )}
            </div>

            {/* Verification Tabs */}
            <Tabs defaultValue="proof" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="proof" className="text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  Proof
                </TabsTrigger>
                <TabsTrigger value="technical" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Technical
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="proof" className="space-y-3 mt-3">
                {/* File Size Change - proves modification */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">File Modified</h5>
                  <div className="flex justify-between items-center text-sm">
                    <span>Original Size:</span>
                    <span className="font-mono">{formatBytes(protectionResult?.originalSize || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Protected Size:</span>
                    <span className="font-mono text-green-600">{formatBytes(protectionResult?.protectedSize || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                    <span>Data Added:</span>
                    <span className="font-mono text-primary">
                      +{formatBytes((protectionResult?.protectedSize || 0) - (protectionResult?.originalSize || 0))}
                    </span>
                  </div>
                </div>

                {/* Download Protected File */}
                <Button 
                  onClick={handleDownloadProtected} 
                  variant="outline" 
                  className="w-full"
                  disabled={!protectionResult?.protectedBlob}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Protected Image
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Download and verify the embedded metadata yourself
                </p>
              </TabsContent>

              <TabsContent value="technical" className="space-y-3 mt-3">
                {/* Adversarial Noise Details */}
                {protectionResult?.metadata?.protection?.adversarialNoise && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <h5 className="text-xs font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Adversarial Noise
                    </h5>
                    <div className="text-xs text-muted-foreground font-mono space-y-0.5">
                      <p>Algorithm: {protectionResult.metadata.protection.adversarialNoise.algorithm}</p>
                      <p>Epsilon: {protectionResult.metadata.protection.adversarialNoise.epsilon}</p>
                      <p>Iterations: {protectionResult.metadata.protection.adversarialNoise.iterations}</p>
                    </div>
                  </div>
                )}

                {/* Rights Metadata Details */}
                {protectionResult?.metadata?.protection?.rightsMetadata && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <h5 className="text-xs font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Rights Metadata
                    </h5>
                    <div className="text-xs text-muted-foreground font-mono space-y-0.5">
                      <p>Standard: {protectionResult.metadata.protection.rightsMetadata.standard}</p>
                      <p>Copyright Notice: Embedded</p>
                      <p>AI Training: PROHIBITED</p>
                    </div>
                  </div>
                )}

                {/* Crawler Blocking Details */}
                {protectionResult?.metadata?.protection?.crawlerBlocking && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <h5 className="text-xs font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Crawler Blocking
                    </h5>
                    <div className="text-xs text-muted-foreground font-mono space-y-0.5">
                      <p>Methods: {protectionResult.metadata.protection.crawlerBlocking.methods?.join(", ")}</p>
                      <p>Robots: noindex, nofollow, noarchive</p>
                    </div>
                  </div>
                )}

                <div className="border-t pt-2">
                  <p className="text-xs text-muted-foreground">
                    ID: <span className="font-mono">{protectionResult?.protectionId}</span>
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* CTA */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
              <h4 className="text-sm font-medium">Save & Monitor This Image</h4>
              <Button onClick={handleCreateAccount} className="w-full" size="sm">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              {remainingProtections > 0 && (
                <Button variant="outline" onClick={handleProtectMore} className="flex-1" size="sm">
                  Protect Another
                </Button>
              )}
              <Button variant="ghost" onClick={handleClose} className="flex-1" size="sm">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
