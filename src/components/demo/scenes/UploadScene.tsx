import { useEffect, useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import { ParticleEffect } from '../effects/ParticleEffect';

export const UploadScene = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          setShowParticles(true);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center p-12 relative overflow-hidden">
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse" />
      
      {/* Main upload card */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-8 shadow-2xl">
          {/* Artwork preview with pulsing border */}
          <div className="relative mb-6">
            <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-secondary blur-xl opacity-50 ${uploadProgress === 100 ? 'animate-pulse-glow' : ''}`} />
            <div className="relative aspect-video bg-slate-700 rounded-lg overflow-hidden border-2 border-primary/50">
              <img 
                src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5"
                alt="Sample artwork"
                className="w-full h-full object-cover"
              />
              {/* Scanning line effect */}
              {uploadProgress < 100 && (
                <div 
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/30 to-transparent h-8 animate-scan-down"
                  style={{ top: `${uploadProgress}%` }}
                />
              )}
              {/* Success checkmark */}
              {uploadProgress === 100 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <CheckCircle className="w-24 h-24 text-primary animate-scale-in" />
                </div>
              )}
            </div>
          </div>

          {/* Upload info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-primary" />
                <span className="text-white font-medium">Uploading Artwork...</span>
              </div>
              <span className="text-primary font-bold">{uploadProgress}%</span>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 relative"
                style={{ width: `${uploadProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer" />
              </div>
            </div>

            {/* Upload details */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400">File Size</p>
                <p className="text-white font-medium">2.4 MB</p>
              </div>
              <div>
                <p className="text-slate-400">Format</p>
                <p className="text-white font-medium">PNG</p>
              </div>
              <div>
                <p className="text-slate-400">Resolution</p>
                <p className="text-white font-medium">4K</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles after upload */}
      {showParticles && <ParticleEffect />}
    </div>
  );
};
