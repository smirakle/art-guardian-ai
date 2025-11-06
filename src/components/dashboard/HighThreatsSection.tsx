import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, ExternalLink, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface HighThreatMatch {
  id: string;
  platform: string;
  threat_level: string;
  confidence_score: number;
  source_url: string;
  source_domain: string | null;
  detected_at: string;
}

export const HighThreatsSection = () => {
  const [highThreats, setHighThreats] = useState<HighThreatMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHighThreats();

    // Set up realtime subscription for new high threats
    const channel = supabase
      .channel('high-threats-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_matches',
          filter: 'threat_level=in.(high,critical)'
        },
        (payload) => {
          console.log('New high threat detected:', payload);
          const newThreat = payload.new as HighThreatMatch;
          
          setHighThreats(prev => [newThreat, ...prev].slice(0, 5));
          
          toast({
            title: '🚨 New High Threat Detected',
            description: `${newThreat.threat_level.toUpperCase()} threat found on ${newThreat.platform}`,
            variant: 'destructive'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const loadHighThreats = async () => {
    try {
      const { data, error } = await supabase
        .from('realtime_matches')
        .select('id, platform, threat_level, confidence_score, source_url, source_domain, detected_at')
        .in('threat_level', ['high', 'critical'])
        .order('detected_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setHighThreats(data || []);
    } catch (error) {
      console.error('Error loading high threats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThreatColor = (level: string): "default" | "destructive" | "outline" | "secondary" => {
    if (level === 'critical') return 'destructive';
    if (level === 'high') return 'destructive';
    return 'secondary';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            High Threat Detections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (highThreats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            High Threat Detections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No High-Risk Threats Detected</p>
            <p className="text-sm">
              Start a real-time monitoring session to scan for potential copyright infringements.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          High Threat Detections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {highThreats.map((threat) => (
            <div
              key={threat.id}
              className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={getThreatColor(threat.threat_level)}>
                      {threat.threat_level.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{threat.platform}</span>
                    <span className="text-sm text-muted-foreground">
                      {threat.confidence_score}% match
                    </span>
                  </div>
                  {threat.source_domain && (
                    <p className="text-sm font-medium">{threat.source_domain}</p>
                  )}
                  <a
                    href={threat.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1 break-all"
                  >
                    {threat.source_url}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(threat.detected_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
