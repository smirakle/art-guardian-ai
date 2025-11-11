import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import LiveMonitoringDashboard from '@/components/realtime/LiveMonitoringDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TestRealtimeMonitoring() {
  const [artworkId, setArtworkId] = useState<string>('');
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadArtworks();
  }, []);

  const loadArtworks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('artwork')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setArtworks(data || []);
      
      // Auto-select first artwork if available
      if (data && data.length > 0) {
        setArtworkId(data[0].id);
      }
    } catch (error: any) {
      console.error('Error loading artworks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load artworks: ' + error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Monitoring Test</CardTitle>
          <CardDescription>
            Test the real-time monitoring engine with SerpAPI integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="artwork-select">Select Artwork to Monitor</Label>
            {artworks.length > 0 ? (
              <select
                id="artwork-select"
                value={artworkId}
                onChange={(e) => setArtworkId(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                {artworks.map((artwork) => (
                  <option key={artwork.id} value={artwork.id}>
                    {artwork.title || 'Untitled'} ({new Date(artwork.created_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-4 border rounded-md bg-muted">
                <p className="text-sm text-muted-foreground">
                  No artworks found. Please upload an artwork first.
                </p>
              </div>
            )}
          </div>

          {!artworkId && (
            <div className="space-y-2">
              <Label htmlFor="manual-artwork-id">Or Enter Artwork ID Manually</Label>
              <Input
                id="manual-artwork-id"
                placeholder="Enter artwork UUID"
                value={artworkId}
                onChange={(e) => setArtworkId(e.target.value)}
              />
            </div>
          )}

          <div className="p-4 bg-muted rounded-md space-y-2">
            <h4 className="font-semibold text-sm">Test Information:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• This will scan the selected artwork across Google Images, TinEye, and Pinterest</li>
              <li>• Results will appear in real-time as they're discovered</li>
              <li>• Check browser console and edge function logs for detailed information</li>
              <li>• The fix ensures artwork title is properly fetched before scanning</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {artworkId && <LiveMonitoringDashboard artworkId={artworkId} />}
    </div>
  );
}
