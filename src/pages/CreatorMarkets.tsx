import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

// Helper to set basic SEO tags
const useSEO = (title: string, description: string, canonicalPath: string) => {
  useEffect(() => {
    document.title = title;

    // Meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);

    // Canonical
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', `${window.location.origin}${canonicalPath}`);
  }, [title, description, canonicalPath]);
};

interface MonitoringAlert {
  id: string;
  title: string | null;
  message: string | null;
  created_at: string;
}

interface TrademarkAlert {
  id: string;
  title: string | null;
  description: string | null;
  source_domain: string | null;
  severity: string | null;
  created_at: string;
}

type Region = 'US' | 'EU' | 'JP' | 'KR' | 'BR';

const tldToRegion = (domain?: string | null): Region | null => {
  if (!domain) return null;
  const tldMatch = domain.match(/\.([a-z]{2,})$/i);
  const tld = tldMatch?.[1]?.toLowerCase();
  if (!tld) return null;
  if (tld === 'us' || tld === 'com') return 'US';
  if (['de','fr','es','it','nl','se','pl','eu','be','at','dk','fi','pt','ie','cz','sk','hu'].includes(tld)) return 'EU';
  if (tld === 'jp') return 'JP';
  if (tld === 'kr' || tld === 'co.kr') return 'KR';
  if (tld === 'br' || tld === 'com.br') return 'BR';
  return null;
};

const severityVariant = (severity?: string | null): 'default' | 'destructive' | 'secondary' => {
  const s = (severity || '').toLowerCase();
  if (s.includes('high') || s.includes('critical') || s.includes('severe')) return 'destructive';
  if (s.includes('medium') || s.includes('moderate')) return 'default';
  return 'secondary';
};

const CreatorMarkets: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [monAlerts, setMonAlerts] = useState<MonitoringAlert[]>([]);
  const [tmAlerts, setTmAlerts] = useState<TrademarkAlert[]>([]);

  useSEO(
    `${t('markets.title', 'Creator Markets Dashboard')} – TSMO`,
    t('markets.subtitle', 'Top markets: US, EU, Japan, South Korea, Brazil'),
    '/markets'
  );

  useEffect(() => {
    const load = async () => {
      if (!user) { setLoading(false); return; }
      setLoading(true);

      const [monRes, tmRes] = await Promise.all([
        supabase
          .from('monitoring_alerts')
          .select('id,title,message,created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('trademark_alerts')
          .select('id,title,description,source_domain,severity,created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      if (!monRes.error && monRes.data) setMonAlerts(monRes.data as MonitoringAlert[]);
      if (!tmRes.error && tmRes.data) setTmAlerts(tmRes.data as TrademarkAlert[]);
      setLoading(false);
    };
    load();
  }, [user]);

  const regions: { id: Region; label: string }[] = useMemo(() => ([
    { id: 'US', label: t('markets.regions.us', 'United States') },
    { id: 'EU', label: t('markets.regions.eu', 'European Union') },
    { id: 'JP', label: t('markets.regions.jp', 'Japan') },
    { id: 'KR', label: t('markets.regions.kr', 'South Korea') },
    { id: 'BR', label: t('markets.regions.br', 'Brazil') },
  ]), [t]);

  const alertsByRegion = useMemo(() => {
    const map: Record<Region, { id: string; title: string; message: string; severity?: string; date: string; domain?: string }[]> = {
      US: [], EU: [], JP: [], KR: [], BR: []
    };
    // Assign trademark alerts by TLD
    for (const a of tmAlerts) {
      const region = tldToRegion(a.source_domain) || 'US';
      map[region].push({
        id: a.id,
        title: a.title || 'Trademark Alert',
        message: a.description || '',
        severity: a.severity || undefined,
        date: a.created_at,
        domain: a.source_domain || undefined,
      });
    }
    // Monitoring alerts have no region metadata; show under US by default
    for (const a of monAlerts) {
      map.US.push({
        id: a.id,
        title: a.title || 'Monitoring Alert',
        message: a.message || '',
        date: a.created_at,
      });
    }
    // Sort each region by date desc
    (Object.keys(map) as Region[]).forEach(r => {
      map[r].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    return map;
  }, [tmAlerts, monAlerts]);

  if (!user) {
    return (
      <main>
        <section className="container mx-auto max-w-5xl py-6">
          <h1 className="text-2xl font-bold">{t('markets.title', 'Creator Markets Dashboard')}</h1>
          <p className="text-muted-foreground mt-2">{t('markets.subtitle', 'Top markets: US, EU, Japan, South Korea, Brazil')}</p>
          <Separator className="my-6" />
          <Card>
            <CardHeader>
              <CardTitle>Sign in required</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Please sign in to view your alerts across markets.</p>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="container mx-auto max-w-6xl py-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold">{t('markets.title', 'Creator Markets Dashboard')}</h1>
          <p className="text-muted-foreground mt-2">{t('markets.subtitle', 'Top markets: US, EU, Japan, South Korea, Brazil')}</p>
        </header>
        <Separator className="my-6" />

        <Tabs defaultValue="US" className="w-full">
          <TabsList className="flex flex-wrap">
            {regions.map(r => (
              <TabsTrigger key={r.id} value={r.id} className="mr-1 mb-1">{r.label}</TabsTrigger>
            ))}
          </TabsList>
          {regions.map(r => (
            <TabsContent key={r.id} value={r.id}>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-2/3" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : alertsByRegion[r.id].length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-muted-foreground">
                    {t('markets.noAlerts', 'No alerts found')}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alertsByRegion[r.id].map(a => (
                    <Card key={a.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between gap-2">
                        <CardTitle className="text-base line-clamp-1">{a.title}</CardTitle>
                        {a.severity && (
                          <Badge variant={severityVariant(a.severity)} className="ml-2">
                            {a.severity}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">{a.message}</p>
                        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                          <span>{new Date(a.date).toLocaleString()}</span>
                          {a.domain && (
                            <>
                              <span>•</span>
                              <span>{a.domain}</span>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </main>
  );
};

export default CreatorMarkets;
