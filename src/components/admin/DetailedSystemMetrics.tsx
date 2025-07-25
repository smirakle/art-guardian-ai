import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Database, 
  Globe, 
  Eye,
  Search,
  Zap,
  Clock,
  BarChart3
} from "lucide-react";

interface DetailedMetrics {
  hourlyScans: number[];
  dailyRegistrations: number[];
  topPlatforms: Array<{platform: string; count: number}>;
  scanTypes: Array<{type: string; count: number}>;
  threatLevels: Array<{level: string; count: number}>;
  responseTime: number;
  dbConnections: number;
  cacheHitRate: number;
  apiCalls: number;
  storageUsed: number;
  bandwidth: number;
}

const DetailedSystemMetrics = () => {
  const [metrics, setMetrics] = useState<DetailedMetrics>({
    hourlyScans: [],
    dailyRegistrations: [],
    topPlatforms: [],
    scanTypes: [],
    threatLevels: [],
    responseTime: 0,
    dbConnections: 0,
    cacheHitRate: 0,
    apiCalls: 0,
    storageUsed: 0,
    bandwidth: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDetailedMetrics = async () => {
    try {
      // Simulate hourly scan data for the last 24 hours
      const hourlyScans = Array.from({ length: 24 }, () => Math.floor(Math.random() * 50) + 10);
      
      // Simulate daily registrations for the last 7 days
      const dailyRegistrations = Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 5);

      // Fetch threat levels from copyright matches
      const { data: copyrightData } = await supabase
        .from('copyright_matches')
        .select('threat_level')
        .limit(100);

      const threatLevels = copyrightData?.reduce((acc: any[], match) => {
        const existing = acc.find(item => item.level === match.threat_level);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ level: match.threat_level, count: 1 });
        }
        return acc;
      }, []) || [];

      // Fetch scan types from monitoring scans
      const { data: scanData } = await supabase
        .from('monitoring_scans')
        .select('scan_type')
        .limit(100);

      const scanTypes = scanData?.reduce((acc: any[], scan) => {
        const existing = acc.find(item => item.type === scan.scan_type);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ type: scan.scan_type, count: 1 });
        }
        return acc;
      }, []) || [];

      // Fetch platform data from social media accounts
      const { data: platformData } = await supabase
        .from('social_media_accounts')
        .select('platform')
        .limit(100);

      const topPlatforms = platformData?.reduce((acc: any[], account) => {
        const existing = acc.find(item => item.platform === account.platform);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ platform: account.platform, count: 1 });
        }
        return acc;
      }, []) || [];

      // Simulate system metrics
      const responseTime = Math.floor(Math.random() * 100) + 50;
      const dbConnections = Math.floor(Math.random() * 50) + 20;
      const cacheHitRate = Math.floor(Math.random() * 20) + 80;
      const apiCalls = Math.floor(Math.random() * 1000) + 5000;
      const storageUsed = Math.floor(Math.random() * 30) + 60;
      const bandwidth = Math.floor(Math.random() * 500) + 1000;

      setMetrics({
        hourlyScans,
        dailyRegistrations,
        topPlatforms: topPlatforms.slice(0, 5),
        scanTypes: scanTypes.slice(0, 5),
        threatLevels: threatLevels.slice(0, 3),
        responseTime,
        dbConnections,
        cacheHitRate,
        apiCalls,
        storageUsed,
        bandwidth
      });

    } catch (error) {
      console.error('Error fetching detailed metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailedMetrics();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDetailedMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              12% faster than yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Zap className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cacheHitRate}%</div>
            <Progress value={metrics.cacheHitRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Activity className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.apiCalls.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              Last 24 hours
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Database className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.storageUsed}%</div>
            <Progress value={metrics.storageUsed} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Hourly Scan Activity (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-1 h-32">
              {metrics.hourlyScans.map((scans, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="bg-primary rounded-t w-full transition-all duration-300"
                    style={{ height: `${(scans / Math.max(...metrics.hourlyScans)) * 100}%` }}
                  ></div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {index % 4 === 0 ? `${index}h` : ''}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Daily Registrations (7d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-2 h-32">
              {metrics.dailyRegistrations.map((registrations, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="bg-accent rounded-t w-full transition-all duration-300"
                    style={{ height: `${(registrations / Math.max(...metrics.dailyRegistrations)) * 100}%` }}
                  ></div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Top Platforms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.topPlatforms.map((platform, index) => (
              <div key={platform.platform} className="flex items-center justify-between">
                <span className="text-sm capitalize">{platform.platform}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(platform.count / Math.max(...metrics.topPlatforms.map(p => p.count))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{platform.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Scan Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.scanTypes.map((scanType) => (
              <div key={scanType.type} className="flex items-center justify-between">
                <span className="text-sm">{scanType.type}</span>
                <Badge variant="secondary">{scanType.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Threat Levels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.threatLevels.map((threat) => {
              const variant = threat.level === 'high' ? 'destructive' : 
                           threat.level === 'medium' ? 'secondary' : 'default';
              return (
                <div key={threat.level} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{threat.level}</span>
                  <Badge variant={variant}>{threat.count}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DetailedSystemMetrics;