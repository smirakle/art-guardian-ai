import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Settings,
  User,
  Bot,
  Eye,
  Shield,
  Search,
  Globe
} from "lucide-react";

interface DemoScene {
  id: number;
  speaker: "artist" | "ai" | "narrator";
  text: string;
  voiceId: string;
  animation: string;
  visual: string;
}

const AnimatedDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const demoScenes: DemoScene[] = [
    {
      id: 0,
      speaker: "narrator",
      text: "Welcome to TSMO - the ultimate art protection platform. Let me show you how we protect digital artwork from theft.",
      voiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah
      animation: "wave",
      visual: "intro"
    },
    {
      id: 1,
      speaker: "artist",
      text: "Hi! I'm an artist who just created this beautiful digital painting. I'm worried about people stealing my work online.",
      voiceId: "XB0fDUnXU5powFXDhCwa", // Charlotte
      animation: "concerned",
      visual: "artwork-upload"
    },
    {
      id: 2,
      speaker: "ai",
      text: "Don't worry! I'm TSMO's AI assistant. First, I'll analyze your artwork using advanced visual recognition technology.",
      voiceId: "9BWtsMINqrJLrRacOk9x", // Aria
      animation: "analyzing",
      visual: "ai-analysis"
    },
    {
      id: 3,
      speaker: "ai",
      text: "I create a unique digital fingerprint of your artwork, mapping every color, texture, and detail.",
      voiceId: "9BWtsMINqrJLrRacOk9x", // Aria
      animation: "scanning",
      visual: "fingerprint"
    },
    {
      id: 4,
      speaker: "ai",
      text: "Now I'm monitoring over 15,000 websites, social media platforms, and marketplaces for any unauthorized use.",
      voiceId: "9BWtsMINqrJLrRacOk9x", // Aria
      animation: "monitoring",
      visual: "web-scan"
    },
    {
      id: 5,
      speaker: "ai",
      text: "I also scan the deep web and hidden networks where pirates often share stolen artwork.",
      voiceId: "9BWtsMINqrJLrRacOk9x", // Aria
      animation: "deep-scanning",
      visual: "deep-web"
    },
    {
      id: 6,
      speaker: "ai",
      text: "Finally, I create an immutable blockchain certificate proving your ownership and protecting your rights.",
      voiceId: "9BWtsMINqrJLrRacOk9x", // Aria
      animation: "blockchain",
      visual: "certificate"
    },
    {
      id: 7,
      speaker: "artist",
      text: "Wow! So if someone steals my artwork, you'll detect it automatically and help me take action?",
      voiceId: "XB0fDUnXU5powFXDhCwa", // Charlotte
      animation: "amazed",
      visual: "detection-alert"
    },
    {
      id: 8,
      speaker: "ai",
      text: "Exactly! I'll send instant alerts and provide legal tools to help you protect your intellectual property.",
      voiceId: "9BWtsMINqrJLrRacOk9x", // Aria
      animation: "confident",
      visual: "legal-tools"
    },
    {
      id: 9,
      speaker: "narrator",
      text: "Join thousands of artists who trust TSMO to protect their creative work. Start your free trial today!",
      voiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah
      animation: "celebration",
      visual: "cta"
    }
  ];

  const playTextToSpeech = async (text: string, voiceId: string) => {
    if (!apiKey || isMuted) return;

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setTimeout(() => {
            if (currentScene < demoScenes.length - 1) {
              setCurrentScene(prev => prev + 1);
            } else {
              setIsPlaying(false);
              setCurrentScene(0);
            }
          }, 500);
        };
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      // Continue without audio
      setTimeout(() => {
        if (currentScene < demoScenes.length - 1) {
          setCurrentScene(prev => prev + 1);
        } else {
          setIsPlaying(false);
          setCurrentScene(0);
        }
      }, 3000);
    }
  };

  const startDemo = () => {
    setIsPlaying(true);
    setCurrentScene(0);
  };

  const pauseDemo = () => {
    setIsPlaying(false);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentScene(0);
  };

  useEffect(() => {
    if (isPlaying && currentScene < demoScenes.length) {
      const scene = demoScenes[currentScene];
      playTextToSpeech(scene.text, scene.voiceId);
    }
  }, [isPlaying, currentScene, apiKey, isMuted]);

  const getCharacterIcon = (speaker: string) => {
    switch (speaker) {
      case "artist":
        return <User className="w-6 h-6" />;
      case "ai":
        return <Bot className="w-6 h-6" />;
      default:
        return <Volume2 className="w-6 h-6" />;
    }
  };

  const getVisualComponent = (visual: string) => {
    const baseClasses = "w-full h-64 rounded-lg flex items-center justify-center transition-all duration-1000";
    
    switch (visual) {
      case "intro":
        return (
          <div className={`${baseClasses} bg-gradient-to-r from-primary/20 to-accent/20`}>
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
              <h3 className="text-2xl font-bold">TSMO</h3>
              <p className="text-muted-foreground">Art Protection Platform</p>
            </div>
          </div>
        );
      case "artwork-upload":
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-purple-500/20 to-pink-500/20`}>
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-lg animate-pulse"></div>
              <div className="absolute -bottom-2 -right-2">
                <User className="w-8 h-8 text-primary animate-bounce" />
              </div>
            </div>
          </div>
        );
      case "ai-analysis":
        return (
          <div className={`${baseClasses} bg-gradient-to-r from-blue-500/20 to-cyan-500/20`}>
            <div className="text-center">
              <Eye className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
              <div className="space-y-2">
                <div className="h-2 bg-blue-500/30 rounded animate-pulse"></div>
                <div className="h-2 bg-blue-500/30 rounded animate-pulse delay-150"></div>
                <div className="h-2 bg-blue-500/30 rounded animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        );
      case "web-scan":
        return (
          <div className={`${baseClasses} bg-gradient-to-r from-green-500/20 to-emerald-500/20`}>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-12 h-12 bg-green-500/30 rounded animate-ping"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
              <Globe className="absolute inset-0 m-auto w-16 h-16 text-green-500 animate-pulse" />
            </div>
          </div>
        );
      case "certificate":
        return (
          <div className={`${baseClasses} bg-gradient-to-r from-yellow-500/20 to-orange-500/20`}>
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-yellow-500 animate-bounce" />
              <div className="bg-yellow-500/20 p-4 rounded border-2 border-yellow-500/30">
                <div className="text-sm font-mono">Certificate #A7B9C2F8</div>
                <div className="text-xs text-muted-foreground">Blockchain Verified</div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} bg-muted/50`}>
            <div className="text-center text-muted-foreground">
              <Play className="w-16 h-16 mx-auto mb-4" />
              <p>Demo Visual</p>
            </div>
          </div>
        );
    }
  };

  const currentSceneData = demoScenes[currentScene] || demoScenes[0];

  return (
    <div className="space-y-6">
      {/* Settings Panel */}
      {showSettings && (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4" />
              Demo Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="api-key">ElevenLabs API Key (for voice)</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your ElevenLabs API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get your API key from <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-primary">elevenlabs.io</a>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Demo Interface */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              TSMO Demo Video
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Scene {currentScene + 1} of {demoScenes.length}</span>
              <span>{Math.round(((currentScene + 1) / demoScenes.length) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentScene + 1) / demoScenes.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Visual Area */}
          <div className="relative">
            {getVisualComponent(currentSceneData.visual)}
            
            {/* Character Indicator */}
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="flex items-center gap-2">
                {getCharacterIcon(currentSceneData.speaker)}
                {currentSceneData.speaker === "artist" ? "Artist" : 
                 currentSceneData.speaker === "ai" ? "AI Assistant" : "Narrator"}
              </Badge>
            </div>
          </div>

          {/* Script/Subtitles */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getCharacterIcon(currentSceneData.speaker)}
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">
                    {currentSceneData.text}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={resetDemo}
              disabled={currentScene === 0 && !isPlaying}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            
            {!isPlaying ? (
              <Button
                onClick={startDemo}
                className="bg-gradient-to-r from-primary to-accent px-8"
              >
                <Play className="w-4 h-4 mr-2" />
                {currentScene > 0 ? "Continue" : "Start Demo"}
              </Button>
            ) : (
              <Button
                onClick={pauseDemo}
                variant="outline"
                className="px-8"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
          </div>

          {/* API Key Notice */}
          {!apiKey && (
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                💡 Add your ElevenLabs API key in settings to enable voice narration!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimatedDemo;