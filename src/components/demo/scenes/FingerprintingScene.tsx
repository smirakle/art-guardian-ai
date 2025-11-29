import { useEffect, useState } from 'react';
import { Fingerprint, Activity } from 'lucide-react';
import { ScanLineEffect } from '../effects/ScanLineEffect';

interface FingerprintingSceneProps {
  onNarrate?: (text: string) => void;
}

export const FingerprintingScene = ({ onNarrate }: FingerprintingSceneProps) => {
  const [dataPoints, setDataPoints] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  useEffect(() => {
    // Start narration
    onNarrate?.(
      "Our AI is now analyzing every pixel, every detail of this artwork. " +
      "We're creating a unique digital fingerprint that's impossible to replicate. " +
      "Over 12,000 data points extracted and secured."
    );

    const interval = setInterval(() => {
      setDataPoints(prev => {
        if (prev >= 100) {
          setAnalysisComplete(true);
          return 100;
        }
        return prev + 1;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onNarrate]);

  return (
    <div className="w-full h-full flex items-center justify-center p-12 relative overflow-hidden">
      {/* Matrix-style background */}
      <div className="absolute inset-0 opacity-10">
        <div className="text-primary text-xs font-mono leading-tight animate-matrix-scroll">
          {Array(100).fill('01011010 ').join('')}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-2 gap-8">
        {/* Left: Artwork being analyzed */}
        <div className="relative">
          <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-6">
            <div className="relative aspect-video bg-slate-700 rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5"
                alt="Artwork analysis"
                className="w-full h-full object-cover"
              />
              <ScanLineEffect active={!analysisComplete} />
              
              {/* Analysis grid overlay */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-1 p-4 pointer-events-none">
                {Array(48).fill(0).map((_, i) => (
                  <div 
                    key={i}
                    className={`border border-primary/30 rounded-sm transition-all duration-300 ${
                      i < (dataPoints / 100) * 48 ? 'bg-primary/20 border-primary' : ''
                    }`}
                    style={{ 
                      transitionDelay: `${i * 20}ms`,
                      animation: i < (dataPoints / 100) * 48 ? 'pulse 2s infinite' : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-4 flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-primary animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-white">Fingerprinting Progress</span>
                  <span className="text-primary font-bold">{dataPoints}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-100"
                    style={{ width: `${dataPoints}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Data extraction visualization */}
        <div className="space-y-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-secondary" />
              <h3 className="text-white font-semibold">Extracting Features</h3>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Color Histogram', value: Math.min(dataPoints * 1.2, 100) },
                { label: 'Edge Detection', value: Math.min(dataPoints * 0.9, 100) },
                { label: 'Texture Analysis', value: Math.min(dataPoints * 1.1, 100) },
                { label: 'Neural Hash', value: Math.min(dataPoints * 0.8, 100) },
                { label: 'Metadata Extract', value: Math.min(dataPoints * 1.0, 100) },
              ].map((feature) => (
                <div key={feature.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{feature.label}</span>
                    <span className="text-primary font-mono">{Math.round(feature.value)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary/50 to-primary transition-all duration-300"
                      style={{ width: `${feature.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data points counter */}
          <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-secondary/30 rounded-2xl p-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Unique Data Points Extracted</p>
              <p className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {(dataPoints * 127).toLocaleString()}
              </p>
              <p className="text-slate-400 text-xs mt-2">Creating unique digital fingerprint</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
