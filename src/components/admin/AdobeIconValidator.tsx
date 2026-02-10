import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, FileCheck, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface IconValidationResult {
  name: string;
  expectedWidth: number;
  expectedHeight: number;
  actualWidth: number | null;
  actualHeight: number | null;
  loaded: boolean;
  hasTransparency: boolean | null;
  error?: string;
  dataUrl?: string;
}

const EXPECTED_ICONS = [
  // Main plugin icons (files in adobe-plugin/ root)
  { name: "icon-24.png", width: 24, height: 24, category: "main" },
  { name: "icon-48.png", width: 48, height: 48, category: "main" },
  { name: "icon-96.png", width: 96, height: 96, category: "main" },
  { name: "icon-192.png", width: 192, height: 192, category: "main" },
  { name: "icon-512.png", width: 512, height: 512, category: "main" },
  // Panel toolbar icons (files in adobe-plugin/ root)
  { name: "panel-dark.png", width: 23, height: 23, category: "panel" },
  { name: "panel-dark@2x.png", width: 46, height: 46, category: "panel" },
  { name: "panel-light.png", width: 23, height: 23, category: "panel" },
  { name: "panel-light@2x.png", width: 46, height: 46, category: "panel" },
];

const AdobeIconValidator = () => {
  const [results, setResults] = useState<IconValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validated, setValidated] = useState(false);

  const checkTransparency = useCallback((img: HTMLImageElement): boolean => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return false;
    
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Sample every 8th pixel for performance on larger images
    const step = Math.max(1, Math.floor(data.length / 4 / 1000));
    
    for (let i = 3; i < data.length; i += 4 * step) {
      // Check alpha channel - if any pixel has alpha < 255, it has transparency
      if (data[i] < 255) {
        return true;
      }
    }
    
    return false;
  }, []);

  const validateIcon = useCallback(async (icon: typeof EXPECTED_ICONS[0]): Promise<IconValidationResult> => {
    return new Promise((resolve) => {
      const img = new Image();
      const basePath = "/adobe-plugin/";
      const cacheBuster = `?t=${Date.now()}`;
      
      img.onload = () => {
        const hasTransparency = checkTransparency(img);
        
        // Create a small preview
        const canvas = document.createElement("canvas");
        const size = Math.min(64, icon.width);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, size, size);
        }
        
        resolve({
          name: icon.name,
          expectedWidth: icon.width,
          expectedHeight: icon.height,
          actualWidth: img.naturalWidth,
          actualHeight: img.naturalHeight,
          loaded: true,
          hasTransparency,
          dataUrl: canvas.toDataURL("image/png"),
        });
      };
      
      img.onerror = () => {
        resolve({
          name: icon.name,
          expectedWidth: icon.width,
          expectedHeight: icon.height,
          actualWidth: null,
          actualHeight: null,
          loaded: false,
          hasTransparency: null,
          error: "Failed to load image - file may not exist or is corrupted",
        });
      };
      
      img.src = basePath + icon.name + cacheBuster;
    });
  }, [checkTransparency]);

  const runValidation = useCallback(async () => {
    setIsValidating(true);
    setResults([]);
    setValidated(false);
    
    const validationResults: IconValidationResult[] = [];
    
    for (const icon of EXPECTED_ICONS) {
      const result = await validateIcon(icon);
      validationResults.push(result);
      setResults([...validationResults]);
    }
    
    setIsValidating(false);
    setValidated(true);
    
    const allPassed = validationResults.every(
      r => r.loaded && 
      r.actualWidth === r.expectedWidth && 
      r.actualHeight === r.expectedHeight && 
      r.hasTransparency
    );
    
    if (allPassed) {
      toast({
        title: "All Icons Valid ✓",
        description: "All 9 icons have correct dimensions and transparency.",
      });
    } else {
      const failed = validationResults.filter(
        r => !r.loaded || 
        r.actualWidth !== r.expectedWidth || 
        r.actualHeight !== r.expectedHeight || 
        !r.hasTransparency
      );
      toast({
        title: "Validation Issues Found",
        description: `${failed.length} icon(s) have issues. Check the details below.`,
        variant: "destructive",
      });
    }
  }, [validateIcon]);

  const getStatusBadge = (result: IconValidationResult) => {
    if (!result.loaded) {
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Not Found</Badge>;
    }
    
    const sizeMatch = result.actualWidth === result.expectedWidth && 
                      result.actualHeight === result.expectedHeight;
    
    if (!sizeMatch) {
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Wrong Size</Badge>;
    }
    
    if (!result.hasTransparency) {
      return <Badge className="gap-1 bg-yellow-500"><AlertTriangle className="h-3 w-3" /> No Transparency</Badge>;
    }
    
    return <Badge className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" /> Valid</Badge>;
  };

  const mainIcons = results.filter(r => 
    EXPECTED_ICONS.find(e => e.name === r.name)?.category === "main"
  );
  const panelIcons = results.filter(r => 
    EXPECTED_ICONS.find(e => e.name === r.name)?.category === "panel"
  );

  const allValid = validated && results.every(
    r => r.loaded && 
    r.actualWidth === r.expectedWidth && 
    r.actualHeight === r.expectedHeight && 
    r.hasTransparency
  );

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                <FileCheck className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Icon Validator</CardTitle>
                <CardDescription className="text-base">
                  Verify repo icon files meet Adobe UXP requirements
                </CardDescription>
              </div>
            </div>
            {validated && (
              allValid ? (
                <Badge className="gap-1 bg-green-500 text-white">
                  <CheckCircle className="h-4 w-4" /> All Pass
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-4 w-4" /> Issues Found
                </Badge>
              )
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Validate Button */}
      <Button
        onClick={runValidation}
        disabled={isValidating}
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isValidating ? "animate-spin" : ""}`} />
        {isValidating ? "Validating..." : "Validate Repo Icons"}
      </Button>

      {/* Info Box */}
      <Card className="bg-muted/50 border-muted">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p>This validator checks the actual icon files in <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">/adobe-plugin/</code></p>
              <p>It verifies: ✓ File exists ✓ Correct dimensions ✓ Has alpha transparency</p>
              <p className="text-yellow-600 dark:text-yellow-400">
                Note: Files must be accessible at the web path. After generating icons locally, 
                ensure they're committed and deployed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          {/* Main Icons */}
          {mainIcons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Main Plugin Icons</CardTitle>
                <CardDescription>Plugin identification icons (24px to 512px)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {mainIcons.map((result) => (
                    <div
                      key={result.name}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                    >
                      {/* Preview */}
                      <div
                        className="w-12 h-12 rounded shrink-0 flex items-center justify-center"
                        style={{
                          backgroundImage: `
                            linear-gradient(45deg, #ccc 25%, transparent 25%),
                            linear-gradient(-45deg, #ccc 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #ccc 75%),
                            linear-gradient(-45deg, transparent 75%, #ccc 75%)
                          `,
                          backgroundSize: "8px 8px",
                          backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                        }}
                      >
                        {result.dataUrl ? (
                          <img src={result.dataUrl} alt={result.name} className="w-10 h-10" />
                        ) : (
                          <XCircle className="h-6 w-6 text-destructive" />
                        )}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs truncate">{result.name}</span>
                        </div>
                        {getStatusBadge(result)}
                        <div className="text-xs text-muted-foreground mt-1">
                          {result.loaded ? (
                            <>
                              <span className={result.actualWidth === result.expectedWidth && result.actualHeight === result.expectedHeight ? "text-green-600" : "text-red-500"}>
                                {result.actualWidth}×{result.actualHeight}
                              </span>
                              <span className="mx-1">•</span>
                              <span>Expected: {result.expectedWidth}×{result.expectedHeight}</span>
                            </>
                          ) : (
                            <span className="text-red-500">{result.error}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Panel Icons */}
          {panelIcons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Panel Toolbar Icons</CardTitle>
                <CardDescription>Photoshop panel icons (23px and 46px @2x)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {panelIcons.map((result) => (
                    <div
                      key={result.name}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                    >
                      {/* Preview */}
                      <div
                        className="w-12 h-12 rounded shrink-0 flex items-center justify-center"
                        style={{
                          backgroundImage: `
                            linear-gradient(45deg, #ccc 25%, transparent 25%),
                            linear-gradient(-45deg, #ccc 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #ccc 75%),
                            linear-gradient(-45deg, transparent 75%, #ccc 75%)
                          `,
                          backgroundSize: "6px 6px",
                          backgroundPosition: "0 0, 0 3px, 3px -3px, -3px 0px",
                        }}
                      >
                        {result.dataUrl ? (
                          <img src={result.dataUrl} alt={result.name} className="w-8 h-8" />
                        ) : (
                          <XCircle className="h-6 w-6 text-destructive" />
                        )}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs truncate">{result.name}</span>
                        </div>
                        {getStatusBadge(result)}
                        <div className="text-xs text-muted-foreground mt-1">
                          {result.loaded ? (
                            <>
                              <span className={result.actualWidth === result.expectedWidth && result.actualHeight === result.expectedHeight ? "text-green-600" : "text-red-500"}>
                                {result.actualWidth}×{result.actualHeight}
                              </span>
                              <span className="mx-1">•</span>
                              <span>Expected: {result.expectedWidth}×{result.expectedHeight}</span>
                            </>
                          ) : (
                            <span className="text-red-500">{result.error}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Troubleshooting Tips */}
          {validated && !allValid && (
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Troubleshooting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                  <p className="font-medium text-destructive">⚠️ Critical Path Requirement</p>
                  <p className="text-muted-foreground mt-1">
                    Icons must be placed in <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">adobe-plugin/</code> (root folder, next to <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">manifest.json</code>).
                    <br />
                    <strong>Do NOT use</strong> <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">adobe-plugin/icons/</code> — UXP will show gray placeholders.
                  </p>
                </div>

                <p><strong>If icons show "Not Found":</strong></p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Go to Icon Generator tab and generate new icons</li>
                  <li>Download and place them in <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">adobe-plugin/</code> (same folder as manifest.json)</li>
                  <li>Commit and push to GitHub, then pull locally</li>
                </ul>
                
                <p><strong>If icons show "Wrong Size":</strong></p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Panel icons must be <strong>exactly</strong> 23×23 (1x) and 46×46 (2x)</li>
                  <li>Use Finder → Get Info to verify pixel dimensions</li>
                  <li>Regenerate with the Icon Generator if sizes don't match</li>
                </ul>
                
                <p><strong>If icons show "No Transparency":</strong></p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>The PNG may have been saved with a solid background</li>
                  <li>Regenerate using the Icon Generator (uses true alpha)</li>
                </ul>

                <p><strong>Still seeing gray icons after copying?</strong></p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Manifest must declare panel icons at <strong>23×23</strong> with <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">scale: [1, 2]</code> — UXP auto-resolves the @2x file</li>
                  <li>Do <strong>NOT</strong> declare separate 46×46 entries with <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">scale: [2]</code> — this confuses UXP</li>
                  <li>In UXP Developer Tools: <strong>Remove</strong> the plugin, <strong>Add</strong> it again, then <strong>Load</strong></li>
                  <li>Make sure you select the <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">adobe-plugin/</code> folder (not the repository root)</li>
                  <li>Clear UXP cache: <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">~/Library/Caches/Adobe/UXP</code></li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && !isValidating && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Ready to Validate</h3>
            <p className="text-muted-foreground max-w-md">
              Click "Validate Repo Icons" to check all 9 icon files in the repository.
              This will verify dimensions and transparency for Adobe UXP compatibility.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdobeIconValidator;
