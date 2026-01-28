import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Sparkles, Check, ImageIcon, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface IconConfig {
  name: string;
  width: number;
  height: number;
  category: "main" | "panel";
  theme?: "dark" | "light";
}

const ICON_CONFIGS: IconConfig[] = [
  // Main plugin icons
  { name: "icon-24.png", width: 24, height: 24, category: "main" },
  { name: "icon-48.png", width: 48, height: 48, category: "main" },
  { name: "icon-96.png", width: 96, height: 96, category: "main" },
  { name: "icon-192.png", width: 192, height: 192, category: "main" },
  { name: "icon-512.png", width: 512, height: 512, category: "main" },
  // Panel toolbar icons
  { name: "panel-dark-v3.png", width: 23, height: 23, category: "panel", theme: "dark" },
  { name: "panel-dark-v3@2x.png", width: 46, height: 46, category: "panel", theme: "dark" },
  { name: "panel-light-v3.png", width: 23, height: 23, category: "panel", theme: "light" },
  { name: "panel-light-v3@2x.png", width: 46, height: 46, category: "panel", theme: "light" },
];

interface GeneratedIcon {
  config: IconConfig;
  dataUrl: string;
}

const AdobeIconGenerator = () => {
  const [generatedIcons, setGeneratedIcons] = useState<GeneratedIcon[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawShieldIcon = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    theme: "dark" | "light" = "dark"
  ) => {
    // Clear canvas with transparency
    ctx.clearRect(0, 0, width, height);

    // Calculate dimensions for the rounded rectangle
    const padding = Math.max(1, width * 0.08);
    const rectWidth = width - padding * 2;
    const rectHeight = height - padding * 2;
    const cornerRadius = Math.max(2, width * 0.15);

    // Create pink gradient (135 degrees - top-left to bottom-right)
    const gradient = ctx.createLinearGradient(
      padding,
      padding,
      padding + rectWidth,
      padding + rectHeight
    );
    gradient.addColorStop(0, "#ec4899"); // Pink-500
    gradient.addColorStop(1, "#f43f5e"); // Rose-500

    // Draw rounded rectangle with gradient
    ctx.beginPath();
    ctx.roundRect(padding, padding, rectWidth, rectHeight, cornerRadius);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Add subtle inner highlight for depth (only on larger icons)
    if (width >= 48) {
      const highlightGradient = ctx.createLinearGradient(
        padding,
        padding,
        padding,
        padding + rectHeight * 0.5
      );
      highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.15)");
      highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.beginPath();
      ctx.roundRect(padding, padding, rectWidth, rectHeight * 0.5, [cornerRadius, cornerRadius, 0, 0]);
      ctx.fillStyle = highlightGradient;
      ctx.fill();
    }

    // Add shield icon symbol in center (only for icons >= 48px)
    if (width >= 48) {
      const centerX = width / 2;
      const centerY = height / 2;
      const symbolSize = width * 0.35;

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();

      // Simple shield shape
      const shieldTop = centerY - symbolSize * 0.5;
      const shieldBottom = centerY + symbolSize * 0.5;
      const shieldLeft = centerX - symbolSize * 0.4;
      const shieldRight = centerX + symbolSize * 0.4;

      ctx.moveTo(centerX, shieldTop);
      ctx.lineTo(shieldRight, shieldTop + symbolSize * 0.15);
      ctx.lineTo(shieldRight, centerY);
      ctx.quadraticCurveTo(shieldRight, shieldBottom, centerX, shieldBottom + symbolSize * 0.1);
      ctx.quadraticCurveTo(shieldLeft, shieldBottom, shieldLeft, centerY);
      ctx.lineTo(shieldLeft, shieldTop + symbolSize * 0.15);
      ctx.closePath();
      ctx.fill();

      // Add checkmark inside shield (for icons >= 96px)
      if (width >= 96) {
        ctx.strokeStyle = "#ec4899";
        ctx.lineWidth = Math.max(2, width * 0.03);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const checkSize = symbolSize * 0.35;
        const checkX = centerX - checkSize * 0.3;
        const checkY = centerY + checkSize * 0.1;

        ctx.beginPath();
        ctx.moveTo(checkX - checkSize * 0.3, checkY);
        ctx.lineTo(checkX, checkY + checkSize * 0.3);
        ctx.lineTo(checkX + checkSize * 0.5, checkY - checkSize * 0.3);
        ctx.stroke();
      }
    }
  }, []);

  const generateIcon = useCallback((config: IconConfig): string => {
    const canvas = document.createElement("canvas");
    canvas.width = config.width;
    canvas.height = config.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    drawShieldIcon(ctx, config.width, config.height, config.theme);

    return canvas.toDataURL("image/png");
  }, [drawShieldIcon]);

  const generateAllIcons = useCallback(async () => {
    setIsGenerating(true);
    setProgress(0);
    setGeneratedIcons([]);

    const icons: GeneratedIcon[] = [];

    for (let i = 0; i < ICON_CONFIGS.length; i++) {
      const config = ICON_CONFIGS[i];
      
      // Small delay for visual feedback
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      try {
        const dataUrl = generateIcon(config);
        icons.push({ config, dataUrl });
        setProgress(((i + 1) / ICON_CONFIGS.length) * 100);
      } catch (error) {
        console.error(`Failed to generate ${config.name}:`, error);
      }
    }

    setGeneratedIcons(icons);
    setIsGenerating(false);

    toast({
      title: "Icons Generated!",
      description: `Successfully generated ${icons.length} transparent PNG icons.`,
    });
  }, [generateIcon]);

  const downloadIcon = useCallback((icon: GeneratedIcon) => {
    const link = document.createElement("a");
    link.download = icon.config.name;
    link.href = icon.dataUrl;
    link.click();

    toast({
      title: "Downloaded",
      description: `${icon.config.name} saved to downloads.`,
    });
  }, []);

  const downloadAllIcons = useCallback(async () => {
    if (generatedIcons.length === 0) {
      toast({
        title: "No icons to download",
        description: "Please generate icons first.",
        variant: "destructive",
      });
      return;
    }

    // Download each icon with a small delay
    for (const icon of generatedIcons) {
      const link = document.createElement("a");
      link.download = icon.config.name;
      link.href = icon.dataUrl;
      link.click();
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    toast({
      title: "All Icons Downloaded",
      description: `${generatedIcons.length} icons saved to your downloads folder.`,
    });
  }, [generatedIcons]);

  const mainIcons = generatedIcons.filter((i) => i.config.category === "main");
  const panelIcons = generatedIcons.filter((i) => i.config.category === "panel");

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-red-500/10 border-pink-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Adobe Plugin Icon Generator</CardTitle>
                <CardDescription className="text-base">
                  Generate transparent PNG icons for Adobe UXP plugins
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-pink-500/10 text-pink-500 border-pink-500/30">
              Transparent Background
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={generateAllIcons}
          disabled={isGenerating}
          className="gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate All Icons"}
        </Button>

        {generatedIcons.length > 0 && (
          <Button
            onClick={downloadAllIcons}
            variant="outline"
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            Download All ({generatedIcons.length})
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Generating icons... {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Generated Icons Grid */}
      {generatedIcons.length > 0 && (
        <div className="space-y-6">
          {/* Main Icons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Main Plugin Icons
              </CardTitle>
              <CardDescription>
                Icons for plugin identification (24px to 512px)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {mainIcons.map((icon) => (
                  <div
                    key={icon.config.name}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card"
                  >
                    {/* Checkerboard background to show transparency */}
                    <div
                      className="flex items-center justify-center rounded-lg"
                      style={{
                        width: Math.min(icon.config.width + 16, 128),
                        height: Math.min(icon.config.height + 16, 128),
                        backgroundImage: `
                          linear-gradient(45deg, #ccc 25%, transparent 25%),
                          linear-gradient(-45deg, #ccc 25%, transparent 25%),
                          linear-gradient(45deg, transparent 75%, #ccc 75%),
                          linear-gradient(-45deg, transparent 75%, #ccc 75%)
                        `,
                        backgroundSize: "12px 12px",
                        backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
                      }}
                    >
                      <img
                        src={icon.dataUrl}
                        alt={icon.config.name}
                        style={{
                          width: Math.min(icon.config.width, 96),
                          height: Math.min(icon.config.height, 96),
                        }}
                        className="pixelated"
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {icon.config.width}×{icon.config.height}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadIcon(icon)}
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      {icon.config.name}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Panel Icons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Panel Toolbar Icons
              </CardTitle>
              <CardDescription>
                Icons for Photoshop panel toolbar (23px and 46px @2x variants)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {panelIcons.map((icon) => (
                  <div
                    key={icon.config.name}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card"
                  >
                    {/* Checkerboard background to show transparency */}
                    <div
                      className="flex items-center justify-center rounded-lg"
                      style={{
                        width: 64,
                        height: 64,
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
                      <img
                        src={icon.dataUrl}
                        alt={icon.config.name}
                        style={{
                          width: icon.config.width,
                          height: icon.config.height,
                        }}
                      />
                    </div>
                    <Badge variant={icon.config.theme === "dark" ? "default" : "secondary"}>
                      {icon.config.theme} theme
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      {icon.config.width}×{icon.config.height}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadIcon(icon)}
                      className="gap-1 text-xs"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. Download all icons using the button above</p>
              <p>2. Copy the downloaded files to your local <code className="px-1 py-0.5 rounded bg-muted font-mono">adobe-plugin/icons/</code> folder</p>
              <p>3. Run <code className="px-1 py-0.5 rounded bg-muted font-mono">./scripts/dev-reload.sh</code></p>
              <p>4. Re-add the plugin in UXP Developer Tools</p>
              <p className="text-green-600 dark:text-green-400 font-medium mt-4">
                ✓ Icons now have transparent backgrounds - no more gray placeholders!
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {generatedIcons.length === 0 && !isGenerating && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className="w-24 h-24 rounded-lg mb-4 flex items-center justify-center"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
                  linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
                  linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
                `,
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              }}
            >
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Ready to Generate</h3>
            <p className="text-muted-foreground max-w-md">
              Click "Generate All Icons" to create all 9 required Adobe plugin icons 
              with proper transparent backgrounds. The checkerboard pattern will verify 
              transparency.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default AdobeIconGenerator;
