import { useEffect, useState } from 'react';
import { AlertTriangle, Shield, FileText, CheckCircle } from 'lucide-react';

interface AlertSceneProps {
  onNarrate?: (text: string) => void;
}

export const AlertScene = ({ onNarrate }: AlertSceneProps) => {
  const [showAlert, setShowAlert] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [dmcaStatus, setDmcaStatus] = useState<'pending' | 'filing' | 'filed'>('pending');

  useEffect(() => {
    // Start narration
    onNarrate?.(
      "Threat detected! Someone's trying to steal Sarah's style on Instagram! " +
      "But we're already on it. 92% confidence match. Evidence collected. " +
      "Legal template generated. DMCA notice filed automatically. " +
      "Total response time? Just 2.3 seconds. That's the power of TSMO!"
    );

    setTimeout(() => setShowAlert(true), 500);

    const confidenceInterval = setInterval(() => {
      setConfidence(prev => Math.min(prev + 2, 92));
    }, 50);

    setTimeout(() => setDmcaStatus('filing'), 3000);
    setTimeout(() => setDmcaStatus('filed'), 5000);

    return () => clearInterval(confidenceInterval);
  }, [onNarrate]);

  return (
    <div className="w-full h-full flex items-center justify-center p-8 relative overflow-hidden">
      {/* Alert background pulse */}
      <div className={`absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-red-500/10 transition-all duration-1000 ${
        showAlert ? 'animate-pulse' : 'opacity-0'
      }`} />

      <div className="relative z-10 w-full max-w-6xl">
        {/* Main alert banner */}
        {showAlert && (
          <div className="mb-8 bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500 rounded-2xl p-6 animate-slide-in shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse-glow">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">🚨 THREAT DETECTED</h2>
                <p className="text-red-200">Unauthorized use of protected artwork detected on external platform</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-red-200">Detection Time</p>
                <p className="text-xl font-bold text-white">00:00:03</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8">
          {/* Left: Violation details */}
          <div className="space-y-6">
            <div className="bg-slate-800/80 backdrop-blur-sm border-2 border-red-500/30 rounded-2xl p-6 animate-fade-in">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Violation Details
              </h3>

              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Platform</p>
                  <p className="text-white font-medium">Instagram</p>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Source URL</p>
                  <p className="text-primary font-mono text-sm break-all">
                    instagram.com/unauthorized_user/post/abc123
                  </p>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Detection Method</p>
                  <p className="text-white font-medium">Perceptual Hash Match</p>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-2">Confidence Score</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-2xl">{confidence}%</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        confidence > 80 ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
                      }`}>
                        {confidence > 80 ? 'High Risk' : 'Medium Risk'}
                      </span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transition-all duration-100"
                        style={{ width: `${confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence comparison */}
            <div className="bg-slate-800/80 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-6 animate-fade-in">
              <h3 className="text-white font-semibold mb-4">Evidence Comparison</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-xs mb-2">Original (Protected)</p>
                  <div className="aspect-square bg-slate-700 rounded-lg overflow-hidden border-2 border-primary">
                    <img 
                      src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5"
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-2">Found (Violation)</p>
                  <div className="aspect-square bg-slate-700 rounded-lg overflow-hidden border-2 border-red-500">
                    <img 
                      src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5"
                      alt="Violation"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Automated response */}
          <div className="space-y-6">
            <div className="bg-slate-800/80 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-6 animate-fade-in">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Automated Response Workflow
              </h3>

              <div className="space-y-4">
                {[
                  { label: 'Threat Identified', status: 'complete', delay: 0 },
                  { label: 'Evidence Collected', status: 'complete', delay: 500 },
                  { label: 'Legal Template Generated', status: dmcaStatus === 'pending' ? 'active' : 'complete', delay: 1000 },
                  { label: 'DMCA Notice Filing', status: dmcaStatus === 'filing' ? 'active' : dmcaStatus === 'filed' ? 'complete' : 'pending', delay: 1500 },
                  { label: 'Platform Notification', status: dmcaStatus === 'filed' ? 'complete' : 'pending', delay: 2000 },
                ].map((step, index) => (
                  <div 
                    key={step.label}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-500 ${
                      step.status === 'complete' 
                        ? 'bg-green-500/10 border-2 border-green-500/30' 
                        : step.status === 'active'
                        ? 'bg-primary/10 border-2 border-primary/50'
                        : 'bg-slate-900/50 border border-slate-700'
                    }`}
                    style={{ animationDelay: `${step.delay}ms` }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.status === 'complete' 
                        ? 'bg-green-500' 
                        : step.status === 'active'
                        ? 'bg-primary animate-pulse'
                        : 'bg-slate-700'
                    }`}>
                      {step.status === 'complete' ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white font-bold">{index + 1}</span>
                      )}
                    </div>
                    <span className={`font-medium ${
                      step.status === 'complete' ? 'text-green-400' : 
                      step.status === 'active' ? 'text-primary' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Success notification */}
            {dmcaStatus === 'filed' && (
              <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border-2 border-green-500 rounded-2xl p-6 animate-scale-in">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">DMCA Filed Successfully</h3>
                    <p className="text-green-200 text-sm">Platform notified. Takedown in progress.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/80 backdrop-blur-sm border-2 border-primary/30 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">Response Time</p>
                <p className="text-2xl font-bold text-primary">2.3s</p>
              </div>
              <div className="bg-slate-800/80 backdrop-blur-sm border-2 border-secondary/30 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">Protection Level</p>
                <p className="text-2xl font-bold text-secondary">Max</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
