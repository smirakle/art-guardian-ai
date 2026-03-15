import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle2, Upload, Search, Mail, Clock, UserPlus, ArrowRight, Eye, Brain, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SimpleAIProtection } from '@/components/beginner/SimpleAIProtection';
import { useAIProtectionStats } from '@/hooks/useAIProtectionStats';
import { MobileCommunity } from '@/components/mobile/MobileCommunity';
import { ProtectedItemsGallery } from '@/components/dashboard/ProtectedItemsGallery';
import { cn } from '@/lib/utils';

const SimpleDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats: aiProtectionStats } = useAIProtectionStats();

  const { data: artwork } = useQuery({
    queryKey: ['user-artwork', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('artwork')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: alerts } = useQuery({
    queryKey: ['user-alerts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('copyright_matches')
        .select('*')
        .eq('artwork_id', artwork?.[0]?.id)
        .eq('is_reviewed', false)
        .order('detected_at', { ascending: false })
        .limit(3);
      return data || [];
    },
    enabled: !!user && !!artwork?.length,
  });

  const threatCount = alerts?.length || 0;
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Creator';

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 md:p-6">
      {/* Guest Banner */}
      {!user && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-secondary/5 p-5">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Guest Mode — Data expires in 7 days</p>
                <p className="text-sm text-muted-foreground">Create a free account to save permanently</p>
              </div>
            </div>
            <Button onClick={() => navigate('/auth')} className="shrink-0 gap-2">
              <UserPlus className="h-4 w-4" />
              Create Free Account
            </Button>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-secondary/10 border border-border/50 p-8 md:p-10">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-secondary/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">Protection Active</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground mt-2 text-base md:text-lg">Here's what's happening with your art</p>

          {/* Stat Pills */}
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/80 backdrop-blur border border-border/50 shadow-sm">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold text-foreground">{artwork?.length || 0}</span>
              <span className="text-sm text-muted-foreground">artworks protected</span>
            </div>
            {aiProtectionStats.totalProtected > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/80 backdrop-blur border border-border/50 shadow-sm">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{aiProtectionStats.totalProtected}</span>
                <span className="text-sm text-muted-foreground">AI training shields</span>
              </div>
            )}
            {threatCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 shadow-sm">
                <AlertTriangle className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold text-accent">{threatCount}</span>
                <span className="text-sm text-accent/80">alerts need attention</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Your Protected Art */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Your Protected Art
        </h2>
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          {!artwork || artwork.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <p className="text-xl font-semibold text-foreground mb-2">No art protected yet</p>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Upload your first artwork to start protecting it from unauthorized use and AI training</p>
              <Button size="lg" onClick={() => navigate('/upload')} className="gap-2 text-base px-8">
                <Upload className="h-5 w-5" />
                Add Your First Artwork
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {artwork.map((art) => {
                const imageUrl = art.file_paths[0]?.startsWith('http')
                  ? art.file_paths[0]
                  : supabase.storage.from('artwork').getPublicUrl(art.file_paths[0]).data.publicUrl;

                const protectionLevel = art.ai_protection_level || 'standard';
                const levelColors: Record<string, string> = {
                  maximum: 'text-purple-600 dark:text-purple-400',
                  standard: 'text-green-600 dark:text-green-400',
                  light: 'text-blue-600 dark:text-blue-400',
                };
                const levelBgColors: Record<string, string> = {
                  maximum: 'bg-purple-500/10',
                  standard: 'bg-green-500/10',
                  light: 'bg-blue-500/10',
                };
                const methods = Array.isArray(art.ai_protection_methods) ? art.ai_protection_methods : [];

                return (
                  <div key={art.id} className="group relative rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    {/* Thumbnail */}
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="hidden absolute inset-0 items-center justify-center bg-muted">
                        <div className="text-center">
                          <Shield className="h-8 w-8 text-muted-foreground/40 mx-auto mb-1" />
                          <span className="text-xs text-muted-foreground">Processing</span>
                        </div>
                      </div>
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      {/* Protection badge */}
                      <div className="absolute top-2.5 right-2.5">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-600/90 backdrop-blur-md shadow-lg">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wide">Protected</span>
                        </div>
                      </div>
                      {/* Title on image */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="font-semibold text-sm text-white truncate drop-shadow-md">{art.title}</p>
                      </div>
                    </div>
                    {/* Protection Stats */}
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Shield className={cn('h-3.5 w-3.5', levelColors[protectionLevel] || 'text-green-600')} />
                          <span className={cn('text-xs font-semibold capitalize', levelColors[protectionLevel] || 'text-green-600')}>
                            {protectionLevel} Protection
                          </span>
                        </div>
                        {art.enable_blockchain && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10">
                            <Activity className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-medium text-primary">Chain</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {art.enable_watermark && (
                          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-md', levelBgColors[protectionLevel] || 'bg-green-500/10', levelColors[protectionLevel] || 'text-green-600')}>
                            Watermark
                          </span>
                        )}
                        {art.ai_protection_enabled && (
                          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-md', levelBgColors[protectionLevel] || 'bg-green-500/10', levelColors[protectionLevel] || 'text-green-600')}>
                            AI Shield
                          </span>
                        )}
                        {methods.length > 0 && methods.slice(0, 2).map((m: any, i: number) => (
                          <span key={i} className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                            {typeof m === 'string' ? m : 'Protected'}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Protected {new Date(art.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => navigate('/upload')}
                className="aspect-square rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group"
              >
                <div className="rounded-xl bg-muted/50 p-3 group-hover:bg-primary/10 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Add More</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Plugin Protected Items */}
      <ProtectedItemsGallery />

      {/* AI Training Protection */}
      <SimpleAIProtection />

      {/* Threat Status */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          {threatCount > 0 ? (
            <AlertTriangle className="h-5 w-5 text-accent" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
          Threat Status
        </h2>
        <div className={cn(
          'rounded-2xl border-2 p-6 transition-colors',
          threatCount > 0 ? 'border-accent/30 bg-accent/5' : 'border-green-500/20 bg-green-500/5'
        )}>
          {threatCount > 0 ? (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-28 h-28 shrink-0">
                <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
                <div className="absolute inset-3 rounded-full border-2 border-accent/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/30 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-accent">{threatCount}</span>
                    <span className="text-[9px] font-semibold text-accent uppercase tracking-wider">Threats</span>
                  </div>
                </div>
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0deg, hsl(var(--accent) / 0.15) 30deg, transparent 60deg)',
                    animation: 'spin 4s linear infinite',
                  }}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-xl font-bold text-foreground mb-1">Copies of your art found online</p>
                <p className="text-muted-foreground mb-4">We detected potential unauthorized usage that needs your attention</p>
                <Button variant="destructive" size="lg" onClick={() => navigate('/monitoring-hub')} className="gap-2">
                  View Details & Take Action
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <p className="text-xl font-bold text-foreground mb-1">All Clear — No Threats Detected</p>
              <p className="text-muted-foreground">We're watching your art 24/7 across the web</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: Shield, label: 'Protect New Artwork', desc: 'Upload & secure', path: '/upload', gradient: 'from-primary/10 to-primary/5', iconColor: 'text-primary', borderHover: 'hover:border-primary/40' },
            { icon: Search, label: 'Check for Copies', desc: 'Scan the web', path: '/monitoring-hub', gradient: 'from-secondary/10 to-secondary/5', iconColor: 'text-secondary', borderHover: 'hover:border-secondary/40' },
            { icon: Mail, label: 'Get Help', desc: 'Contact support', path: '/contact', gradient: 'from-accent/10 to-accent/5', iconColor: 'text-accent', borderHover: 'hover:border-accent/40' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={cn(
                  'group relative flex flex-col items-start gap-4 rounded-2xl border border-border/50 p-6',
                  'bg-gradient-to-br transition-all duration-300',
                  'hover:shadow-lg hover:-translate-y-0.5',
                  action.gradient,
                  action.borderHover
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="rounded-xl bg-card/80 p-3">
                    <Icon className={cn('h-7 w-7', action.iconColor)} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground text-lg">{action.label}</p>
                  <p className="text-sm text-muted-foreground">{action.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Community */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Community</h2>
        <MobileCommunity />
      </div>
    </div>
  );
};

export default SimpleDashboard;
