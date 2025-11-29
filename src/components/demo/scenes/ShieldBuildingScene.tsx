import { useEffect, useState, useRef } from 'react';
import { Shield, Lock, Zap, Database } from 'lucide-react';
import { ShieldEffect } from '../effects/ShieldEffect';

const protectionLayers = [
  { 
    icon: Shield, 
    name: 'Invisible Watermark', 
    color: 'from-blue-500 to-blue-600',
    delay: 0 
  },
  { 
    icon: Zap, 
    name: 'Adversarial Noise', 
    color: 'from-green-500 to-green-600',
    delay: 1000 
  },
  { 
    icon: Database, 
    name: 'Metadata Injection', 
    color: 'from-purple-500 to-purple-600',
    delay: 2000 
  },
  { 
    icon: Lock, 
    name: 'Blockchain Registry', 
    color: 'from-yellow-500 to-yellow-600',
    delay: 3000 
  },
];

interface ShieldBuildingSceneProps {
  onNarrate?: (text: string) => void;
}

export const ShieldBuildingScene = ({ onNarrate }: ShieldBuildingSceneProps) => {
  const [activeLayers, setActiveLayers] = useState<number[]>([]);
  const [shieldComplete, setShieldComplete] = useState(false);
  const hasNarrated = useRef(false);

  useEffect(() => {
    // Start narration only once
    if (!hasNarrated.current && onNarrate) {
      hasNarrated.current = true;
      onNarrate(
        "Watch as we deploy multiple layers of protection around Sarah's artwork. " +
        "Invisible watermarks, adversarial noise, metadata injection, and blockchain registration. " +
        "Four impenetrable shields that work together to defend against AI training theft."
      );
    }

    protectionLayers.forEach((layer, index) => {
      setTimeout(() => {
        setActiveLayers(prev => [...prev, index]);
        if (index === protectionLayers.length - 1) {
          setTimeout(() => setShieldComplete(true), 500);
        }
      }, layer.delay);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center p-12 relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-2 gap-12 items-center">
        {/* Left: Artwork with shields */}
        <div className="relative">
          <div className="relative aspect-square max-w-md mx-auto">
            {/* Central artwork */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-48 h-48 rounded-lg overflow-hidden border-2 border-primary shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5"
                  alt="Protected artwork"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Shield layers */}
            {activeLayers.map((layerIndex) => (
              <ShieldEffect 
                key={layerIndex}
                size={220 + layerIndex * 60}
                color={protectionLayers[layerIndex].color}
                delay={layerIndex * 200}
              />
            ))}

            {/* Completion glow */}
            {shieldComplete && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 animate-pulse-glow blur-3xl" />
              </div>
            )}
          </div>
        </div>

        {/* Right: Protection methods list */}
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Building Protection Layers</h2>
            <p className="text-slate-400">Multi-layered defense against AI training</p>
          </div>

          {protectionLayers.map((layer, index) => {
            const isActive = activeLayers.includes(index);
            const Icon = layer.icon;
            
            return (
              <div 
                key={layer.name}
                className={`bg-slate-800/50 backdrop-blur-sm border-2 rounded-xl p-4 transition-all duration-500 ${
                  isActive 
                    ? 'border-primary/50 scale-100 opacity-100' 
                    : 'border-slate-700/30 scale-95 opacity-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${layer.color} flex items-center justify-center ${
                    isActive ? 'animate-pulse-shield' : ''
                  }`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{layer.name}</h3>
                    <p className="text-sm text-slate-400">
                      {isActive ? '✓ Active' : 'Deploying...'}
                    </p>
                  </div>

                  {isActive && (
                    <div className="flex items-center gap-2 text-primary animate-scale-in">
                      <Lock className="w-5 h-5" />
                      <span className="text-sm font-medium">Locked</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Protection status */}
          {shieldComplete && (
            <div className="mt-6 bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary/50 rounded-xl p-6 animate-scale-in">
              <div className="flex items-center justify-center gap-3 text-primary">
                <Shield className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold text-white">Protection Active</p>
                  <p className="text-sm text-slate-300">All defense layers operational</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
