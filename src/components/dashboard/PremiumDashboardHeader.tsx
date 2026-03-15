import { useAuth } from '@/contexts/AuthContext';
import { Shield, Activity } from 'lucide-react';

export const PremiumDashboardHeader = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Creator';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-secondary/10 border border-border/50 p-8 md:p-10">
      {/* Animated background orbs */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-secondary/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">All Systems Active</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground mt-2 text-base md:text-lg">
            Your creative assets are being monitored 24/7
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/80 backdrop-blur border border-border/50 shadow-sm">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">Protection On</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/80 backdrop-blur border border-border/50 shadow-sm">
            <Activity className="h-5 w-5 text-secondary" />
            <span className="text-sm font-semibold text-foreground">Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
};
