import React, { useState, useEffect, useRef } from "react";
import { Shield, ShieldCheck, Eye, EyeOff, Fingerprint, Lock, Scan, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import exampleArt from "@/assets/example-protected-art.jpg";

const protectionLayers = [
  {
    id: "watermark",
    icon: Fingerprint,
    label: "Invisible Watermark",
    desc: "Embedded traceable fingerprint — survives cropping, resizing, and screenshots",
    color: "from-primary to-primary/60",
  },
  {
    id: "ai-cloak",
    icon: Eye,
    label: "AI Training Shield",
    desc: "Style cloaking makes your art unusable for AI model training",
    color: "from-accent to-accent/60",
  },
  {
    id: "monitoring",
    icon: Scan,
    label: "24/7 Web Monitoring",
    desc: "Continuous scanning across 50+ platforms for unauthorized copies",
    color: "from-secondary to-secondary/60",
  },
  {
    id: "enforcement",
    icon: Lock,
    label: "Auto Enforcement",
    desc: "One-click DMCA takedowns with legal-grade documentation",
    color: "from-destructive to-destructive/60",
  },
];

export const ProtectionShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState<number>(-1);
  const [isProtected, setIsProtected] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startProtection = () => {
    if (isScanning || isProtected) return;
    setIsScanning(true);
    setScanProgress(0);
    setActiveLayer(-1);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setScanProgress(progress);

      // Activate layers at thresholds
      if (progress >= 20 && progress < 22) setActiveLayer(0);
      if (progress >= 45 && progress < 47) setActiveLayer(1);
      if (progress >= 65 && progress < 67) setActiveLayer(2);
      if (progress >= 85 && progress < 87) setActiveLayer(3);

      if (progress >= 100) {
        clearInterval(interval);
        setIsProtected(true);
        setIsScanning(false);
        setActiveLayer(3);
      }
    }, 50);
  };

  const resetDemo = () => {
    setIsProtected(false);
    setIsScanning(false);
    setScanProgress(0);
    setActiveLayer(-1);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* ─── Left: Interactive artwork display ─── */}
        <div className="relative group">
          {/* Outer glow */}
          <div
            className="absolute -inset-4 rounded-[2rem] transition-all duration-1000"
            style={{
              background: isProtected
                ? "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--accent) / 0.1), hsl(var(--secondary) / 0.08))"
                : "transparent",
              filter: isProtected ? "blur(20px)" : "blur(0px)",
            }}
          />

          {/* Main image container */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-border/40 shadow-2xl transition-all duration-700"
            style={{
              borderColor: isProtected ? "hsl(var(--primary) / 0.5)" : undefined,
              boxShadow: isProtected ? "0 25px 80px -12px hsl(var(--primary) / 0.25)" : undefined,
            }}
          >
            <img
              src={exampleArt}
              alt="Example protected artwork — abstract landscape with oceanic teal and warm earth tones"
              className="w-full aspect-[4/3] object-cover transition-all duration-700"
              style={{
                filter: isScanning ? `brightness(1.05) contrast(1.05)` : "none",
              }}
            />

            {/* Scan line animation */}
            {isScanning && (
              <div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent z-20 transition-all"
                style={{
                  top: `${scanProgress}%`,
                  boxShadow: "0 0 30px 10px hsl(var(--primary) / 0.4)",
                }}
              />
            )}

            {/* Protection overlay — invisible watermark grid pattern */}
            {(isProtected || activeLayer >= 0) && (
              <div
                className="absolute inset-0 z-10 transition-opacity duration-700 pointer-events-none"
                style={{ opacity: isProtected ? 0.06 : 0.03 }}
              >
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      -45deg,
                      transparent,
                      transparent 80px,
                      hsl(var(--primary)) 80px,
                      hsl(var(--primary)) 81px
                    )`,
                  }}
                />
              </div>
            )}

            {/* Shield badge */}
            {isProtected && (
              <div className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg animate-scale-in">
                <ShieldCheck className="w-3.5 h-3.5" />
                PROTECTED
              </div>
            )}

            {/* Bottom gradient overlay with status */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent z-20 flex items-end p-5">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-white/90 text-sm font-semibold">Example Artwork</p>
                  <p className="text-white/50 text-xs">
                    {isProtected ? "4 protection layers active" : isScanning ? "Applying protection..." : "Unprotected"}
                  </p>
                </div>
                {isScanning && (
                  <div className="w-20 h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-100"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right: Protection layers + CTA ─── */}
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3">See It In Action</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-tight mb-3">
              Four layers of<br />invisible protection
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Watch how TSMO applies multi-layered defense to your artwork — all invisible to the human eye but devastating to art thieves and AI scrapers.
            </p>
          </div>

          {/* Protection layers list */}
          <div className="space-y-3">
            {protectionLayers.map((layer, i) => {
              const isActive = activeLayer >= i;
              const isCurrent = activeLayer === i && isScanning;
              return (
                <div
                  key={layer.id}
                  className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-500 ${
                    isActive
                      ? "bg-card border-primary/30 shadow-lg shadow-primary/5"
                      : "bg-card/50 border-border/30"
                  } ${isCurrent ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-background" : ""}`}
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      isActive
                        ? `bg-gradient-to-br ${layer.color} text-white shadow-lg`
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <layer.icon className="w-5 h-5" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {layer.label}
                      </h4>
                      {isActive && !isScanning && (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          ACTIVE
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-primary animate-pulse">
                          Applying...
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 transition-colors ${isActive ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                      {layer.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!isProtected && !isScanning && (
              <Button
                size="lg"
                className="h-14 px-8 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-xl shadow-primary/20 gap-2"
                onClick={startProtection}
              >
                <Shield className="w-5 h-5" />
                Apply Protection
                <Sparkles className="w-4 h-4 ml-1" />
              </Button>
            )}
            {isProtected && (
              <>
                <Button
                  size="lg"
                  className="h-14 px-8 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-xl shadow-primary/20 gap-2"
                  onClick={() => navigate("/auth?tab=signup")}
                >
                  Protect Your Art Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-6 rounded-xl"
                  onClick={resetDemo}
                >
                  Reset Demo
                </Button>
              </>
            )}
            {isScanning && (
              <Button size="lg" disabled className="h-14 px-8 rounded-xl gap-2 opacity-70">
                <Scan className="w-5 h-5 animate-pulse" />
                Protecting... {scanProgress}%
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
