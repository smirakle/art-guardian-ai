import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCacheManager } from '@/hooks/useCacheManager';
import { RefreshCw, Trash2, Zap, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CacheManagementPanel = () => {
  const { toast } = useToast();
  const { getCacheStats, invalidateCache, warmCache, cleanupExpired } = useCacheManager();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [invalidateKey, setInvalidateKey] = useState('');

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getCacheStats();
      setStats(data);
    } catch (error) {
      toast({
        title: 'Error loading cache stats',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleInvalidate = async (key: string, isPattern: boolean = false) => {
    try {
      await invalidateCache(key, isPattern);
      toast({
        title: 'Cache invalidated',
        description: `Successfully invalidated ${isPattern ? 'pattern' : 'key'}: ${key}`
      });
      loadStats();
    } catch (error) {
      toast({
        title: 'Error invalidating cache',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleCleanup = async () => {
    try {
      const result = await cleanupExpired();
      toast({
        title: 'Cache cleaned',
        description: `Removed ${result.cleaned} expired entries`
      });
      loadStats();
    } catch (error) {
      toast({
        title: 'Error cleaning cache',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Cache Management</h2>
          <Button onClick={loadStats} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Hit Rate</span>
              </div>
              <p className="text-2xl font-bold">{stats.hit_rate}%</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Entries</span>
              </div>
              <p className="text-2xl font-bold">{stats.total_entries}</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Cache Size</span>
              </div>
              <p className="text-2xl font-bold">{formatBytes(stats.total_size_bytes)}</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Hits</span>
              </div>
              <p className="text-2xl font-bold">{stats.total_hits.toLocaleString()}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Cache key or pattern (e.g., user:* for pattern)"
              value={invalidateKey}
              onChange={(e) => setInvalidateKey(e.target.value)}
            />
            <Button
              onClick={() => handleInvalidate(invalidateKey, invalidateKey.includes('*'))}
              disabled={!invalidateKey}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Invalidate
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCleanup} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Clean Expired
            </Button>
          </div>
        </div>

        {stats?.entries && stats.entries.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Recent Cache Entries</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {stats.entries.slice(0, 20).map((entry: any) => (
                <div key={entry.cache_key} className="flex items-center justify-between p-3 bg-muted rounded">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm truncate">{entry.cache_key}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Hits: {entry.hit_count}</span>
                      <span>Misses: {entry.miss_count}</span>
                      <span>Size: {formatBytes(entry.size_bytes)}</span>
                      <span>TTL: {entry.ttl_seconds}s</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleInvalidate(entry.cache_key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
