import { useEffect, useState } from 'react';
import { Activity, Globe, Search } from 'lucide-react';
import { MatrixRain } from '../effects/MatrixRain';

const platforms = [
  'Instagram', 'Pinterest', 'TikTok', 'DeviantArt', 'ArtStation',
  'Behance', 'Dribbble', 'Twitter', 'Facebook', 'Reddit'
];

interface MonitoringSceneProps {
  onNarrate?: (text: string) => void;
}

export const MonitoringScene = ({ onNarrate }: MonitoringSceneProps) => {
  const [scannedPlatforms, setScannedPlatforms] = useState(0);
  const [currentScan, setCurrentScan] = useState('');
  const [totalScans, setTotalScans] = useState(0);

  useEffect(() => {
    // Start narration
    onNarrate?.(
      "Now our AI monitoring system springs into action! " +
      "We're scanning over 70 platforms simultaneously - Instagram, Pinterest, TikTok, and more. " +
      "Like having a private detective watching every corner of the internet, 24/7. " +
      "Any unauthorized use? We'll catch it instantly!"
    );

    const interval = setInterval(() => {
      setScannedPlatforms(prev => {
        const next = prev + 1;
        if (next <= platforms.length) {
          setCurrentScan(platforms[next - 1]);
        }
        return Math.min(next, platforms.length);
      });
      setTotalScans(prev => prev + Math.floor(Math.random() * 5) + 1);
    }, 800);

    return () => clearInterval(interval);
  }, [onNarrate]);

  return (
    <div className="w-full h-full flex items-center justify-center p-8 relative overflow-hidden">
      {/* Matrix rain background */}
      <MatrixRain />

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-2 gap-8">
        {/* Left: Protected artwork */}
        <div className="space-y-6">
          <div className="bg-slate-800/80 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <h3 className="text-white font-semibold">Protected Asset</h3>
            </div>

            <div className="aspect-video bg-slate-700 rounded-lg overflow-hidden border-2 border-primary/50 relative">
              <img 
                src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5"
                alt="Monitored artwork"
                className="w-full h-full object-cover"
              />
              {/* Shield overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-24 h-24 border-4 border-primary rounded-full animate-ping opacity-20" />
                <div className="absolute w-16 h-16 border-4 border-primary rounded-full" />
              </div>
            </div>

            {/* Real-time stats */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-400 mb-1">Protection Status</p>
                <p className="text-primary font-bold">Active</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-400 mb-1">Monitoring Since</p>
                <p className="text-white font-medium">00:00:12</p>
              </div>
            </div>
          </div>

          {/* Global map */}
          <div className="bg-slate-800/80 backdrop-blur-sm border-2 border-secondary/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-secondary" />
              <h3 className="text-white font-semibold">Global Coverage</h3>
            </div>
            <div className="aspect-video bg-slate-900 rounded-lg relative overflow-hidden">
              {/* Animated scanning pulses */}
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + Math.sin(i) * 20}%`,
                    animationDelay: `${i * 300}ms`
                  }}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-6xl opacity-20">
                🌍
              </div>
            </div>
          </div>
        </div>

        {/* Right: Monitoring dashboard */}
        <div className="space-y-6">
          {/* Scan counter */}
          <div className="bg-slate-800/80 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-6">
            <div className="text-center">
              <Activity className="w-12 h-12 text-primary mx-auto mb-3 animate-pulse" />
              <p className="text-slate-400 text-sm mb-2">Total Scans Performed</p>
              <p className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {totalScans.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Platform scanning list */}
          <div className="bg-slate-800/80 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-primary animate-pulse" />
              <h3 className="text-white font-semibold">Platform Monitoring</h3>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {platforms.map((platform, index) => {
                const isScanned = index < scannedPlatforms;
                const isCurrent = index === scannedPlatforms - 1;

                return (
                  <div
                    key={platform}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                      isScanned 
                        ? 'bg-slate-900/50 border border-primary/20' 
                        : 'bg-slate-900/20 border border-slate-700/20'
                    } ${isCurrent ? 'ring-2 ring-primary/50' : ''}`}
                  >
                    <span className={`font-medium ${isScanned ? 'text-white' : 'text-slate-500'}`}>
                      {platform}
                    </span>
                    
                    {isScanned && (
                      <div className="flex items-center gap-2">
                        {isCurrent ? (
                          <div className="flex items-center gap-2 text-primary">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-sm">Scanning...</span>
                          </div>
                        ) : (
                          <span className="text-sm text-green-500">✓ Clear</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Progress</span>
                <span className="text-primary font-bold">
                  {scannedPlatforms} / {platforms.length} platforms
                </span>
              </div>
              <div className="mt-2 h-2 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${(scannedPlatforms / platforms.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
