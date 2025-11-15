import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw } from "lucide-react";
import problemScene from "@/assets/promo-problem-scene.png";
import solutionScene from "@/assets/promo-solution-scene.png";
import logoScene from "@/assets/promo-logo-scene.png";

const PromoVideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 10; // 10 seconds

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return prev + 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (currentTime >= duration) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Determine current scene and text
  const getSceneContent = () => {
    if (currentTime < 3) {
      return {
        image: problemScene,
        title: "AI Companies Are Stealing Your Work",
        subtitle: "Without permission. Without payment. Without you knowing.",
        opacity: Math.min(currentTime / 0.5, 1),
      };
    } else if (currentTime < 7) {
      const sceneTime = currentTime - 3;
      return {
        image: solutionScene,
        title: "TSMO Fights Back",
        subtitle: "AI-powered protection. Real-time monitoring. Automated enforcement.",
        opacity: Math.min(sceneTime / 0.5, 1),
      };
    } else {
      const sceneTime = currentTime - 7;
      return {
        image: logoScene,
        title: "Join TSMO Beta Today",
        subtitle: "Your Work. Your Rights. Your Protection.",
        opacity: Math.min(sceneTime / 0.5, 1),
        showBeta: true,
      };
    }
  };

  const scene = getSceneContent();
  const progress = (currentTime / duration) * 100;

  return (
    <Card className="w-full overflow-hidden">
      {/* Video Container */}
      <div className="relative aspect-video bg-background overflow-hidden">
        {/* Background Image with Fade */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundImage: `url(${scene.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: scene.opacity,
          }}
        />
        
        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          <h2
            className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in"
            style={{
              opacity: scene.opacity,
              transform: `translateY(${(1 - scene.opacity) * 20}px)`,
              transition: "all 0.5s ease-out",
            }}
          >
            {scene.title}
          </h2>
          <p
            className="text-xl md:text-2xl text-white/90 max-w-3xl animate-fade-in"
            style={{
              opacity: scene.opacity * 0.9,
              transform: `translateY(${(1 - scene.opacity) * 20}px)`,
              transition: "all 0.5s ease-out 0.2s",
            }}
          >
            {scene.subtitle}
          </p>
          {scene.showBeta && (
            <div
              className="mt-6 px-6 py-2 bg-primary/20 border-2 border-primary rounded-full animate-fade-in"
              style={{
                opacity: scene.opacity,
                transform: `scale(${0.8 + scene.opacity * 0.2})`,
                transition: "all 0.5s ease-out 0.4s",
              }}
            >
              <span className="text-primary font-bold text-lg">BETA ACCESS</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-primary transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleRestart}
          disabled={currentTime === 0}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          size="lg"
          onClick={handlePlayPause}
          className="min-w-32"
        >
          {isPlaying ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              {currentTime >= duration ? "Replay" : "Play"}
            </>
          )}
        </Button>
        <div className="text-sm text-muted-foreground min-w-20 text-center">
          {currentTime.toFixed(1)}s / {duration}s
        </div>
      </div>
    </Card>
  );
};

export default PromoVideoPlayer;
