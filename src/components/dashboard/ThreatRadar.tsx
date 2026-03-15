import { Shield, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreatRadarProps {
  threatCount: number;
  successRate: number;
}

export const ThreatRadar = ({ threatCount, successRate }: ThreatRadarProps) => {
  const isClean = threatCount === 0;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 flex flex-col items-center">
      <h2 className="text-lg font-semibold text-foreground self-start mb-6">Threat Status</h2>
      
      {/* Radar visual */}
      <div className="relative w-48 h-48 mb-6">
        {/* Outer ring */}
        <div className={cn(
          'absolute inset-0 rounded-full border-2',
          isClean ? 'border-green-500/20' : 'border-accent/20'
        )} />
        {/* Middle ring */}
        <div className={cn(
          'absolute inset-4 rounded-full border-2',
          isClean ? 'border-green-500/30' : 'border-accent/30'
        )} />
        {/* Inner ring */}
        <div className={cn(
          'absolute inset-8 rounded-full border-2',
          isClean ? 'border-green-500/40' : 'border-accent/40'
        )} />
        
        {/* Sweep animation */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div 
            className={cn(
              'absolute inset-0 origin-center',
              isClean ? 'bg-gradient-conic-green' : 'bg-gradient-conic-red'
            )}
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, ${isClean ? 'hsl(142 76% 36% / 0.15)' : 'hsl(var(--accent) / 0.15)'} 30deg, transparent 60deg)`,
              animation: 'spin 4s linear infinite',
            }}
          />
        </div>

        {/* Center badge */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'w-20 h-20 rounded-full flex flex-col items-center justify-center',
            isClean
              ? 'bg-green-500/10 border-2 border-green-500/30'
              : 'bg-accent/10 border-2 border-accent/30'
          )}>
            {isClean ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <>
                <span className="text-2xl font-bold text-accent">{threatCount}</span>
                <span className="text-[10px] font-medium text-accent uppercase tracking-wider">Threats</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className={cn(
          'text-lg font-bold',
          isClean ? 'text-green-500' : 'text-accent'
        )}>
          {isClean ? 'All Clear' : `${threatCount} Active Threats`}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {successRate}% resolution rate
        </p>
      </div>
    </div>
  );
};
