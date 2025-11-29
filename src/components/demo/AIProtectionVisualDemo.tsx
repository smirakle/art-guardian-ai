import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, SkipForward, Maximize, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { UploadScene } from './scenes/UploadScene';
import { FingerprintingScene } from './scenes/FingerprintingScene';
import { ShieldBuildingScene } from './scenes/ShieldBuildingScene';
import { MonitoringScene } from './scenes/MonitoringScene';
import { AlertScene } from './scenes/AlertScene';

interface Scene {
  name: string;
  duration: number;
  component: React.ComponentType;
}

const scenes: Scene[] = [
  { name: 'Upload', duration: 10000, component: UploadScene },
  { name: 'Fingerprinting', duration: 8000, component: FingerprintingScene },
  { name: 'Shield Building', duration: 10000, component: ShieldBuildingScene },
  { name: 'Monitoring', duration: 12000, component: MonitoringScene },
  { name: 'Alert Detection', duration: 10000, component: AlertScene },
];

export const AIProtectionVisualDemo = () => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!isPlaying) return;

    const scene = scenes[currentSceneIndex];
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / scene.duration) * 100;

      if (newProgress >= 100) {
        if (currentSceneIndex < scenes.length - 1) {
          setCurrentSceneIndex(prev => prev + 1);
          setProgress(0);
        } else {
          setIsPlaying(false);
          setProgress(100);
        }
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, currentSceneIndex]);

  const handlePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    // Control background music
    if (audioRef.current) {
      if (newPlayingState) {
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleReset = () => {
    setCurrentSceneIndex(0);
    setProgress(0);
    setIsPlaying(false);
    
    // Reset and pause audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleSkip = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
      setProgress(0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const CurrentSceneComponent = scenes[currentSceneIndex].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Background Music */}
      <audio 
        ref={audioRef} 
        loop 
        muted={isMuted}
        src="https://cdn.pixabay.com/audio/2022/03/10/audio_4a392a76e5.mp3"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI Protection Visual Demo
          </h1>
          <p className="text-muted-foreground">
            A cinematic journey through TSMO's AI training protection system
          </p>
        </div>

        {/* Main Demo Card */}
        <Card className="p-0 overflow-hidden border-2 border-primary/20 shadow-2xl">
          {/* Scene Display */}
          <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <CurrentSceneComponent />
            
            {/* Scene Title Overlay */}
            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-primary">
                Scene {currentSceneIndex + 1} of {scenes.length}: {scenes[currentSceneIndex].name}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-muted">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="p-6 bg-card border-t border-border">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Scene Navigation */}
              <div className="flex gap-2">
                {scenes.map((scene, index) => (
                  <button
                    key={scene.name}
                    onClick={() => {
                      setCurrentSceneIndex(index);
                      setProgress(0);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSceneIndex
                        ? 'w-12 bg-primary'
                        : index < currentSceneIndex
                        ? 'w-8 bg-primary/50'
                        : 'w-8 bg-muted'
                    }`}
                    title={scene.name}
                  />
                ))}
              </div>

              {/* Center: Play Controls */}
              <div className="flex gap-2">
                <Button onClick={handleReset} variant="outline" size="icon">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button onClick={handlePlayPause} variant="default" size="icon">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button 
                  onClick={handleSkip} 
                  variant="outline" 
                  size="icon"
                  disabled={currentSceneIndex === scenes.length - 1}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Right: View Controls */}
              <div className="flex gap-2">
                <Button onClick={toggleMute} variant="outline" size="icon" title={isMuted ? "Unmute" : "Mute"}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button onClick={toggleFullscreen} variant="outline" size="icon">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scene Info */}
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Duration: {scenes[currentSceneIndex].duration / 1000}s | 
                Progress: {Math.round(progress)}%
              </p>
            </div>
          </div>
        </Card>

        {/* Scene Description */}
        <Card className="mt-6 p-6">
          <h3 className="text-lg font-semibold mb-2">About This Scene</h3>
          <p className="text-muted-foreground">
            {currentSceneIndex === 0 && "Watch as your artwork is uploaded and prepared for comprehensive AI protection."}
            {currentSceneIndex === 1 && "Advanced fingerprinting technology analyzes every detail of your work, creating a unique digital signature."}
            {currentSceneIndex === 2 && "Multiple layers of protection shields are deployed around your artwork, each defending against different AI threats."}
            {currentSceneIndex === 3 && "Real-time monitoring across 70+ platforms ensures your artwork is continuously protected from unauthorized AI training."}
            {currentSceneIndex === 4 && "When threats are detected, instant alerts trigger automated DMCA filing and legal protection workflows."}
          </p>
        </Card>
      </div>
    </div>
  );
};
