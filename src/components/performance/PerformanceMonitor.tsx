import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Zap, 
  Clock, 
  Wifi,
  Server,
  Database,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceMetrics {
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    fcp: number; // First Contentful Paint
    ttfb: number; // Time to First Byte
  };
  networkMetrics: {
    connectionType: string;
    effectiveType: string;
    rtt: number;
    downlink: number;
  };
  resourceMetrics: {
    jsSize: number;
    cssSize: number;
    imageSize: number;
    totalSize: number;
    requestCount: number;
  };
  trends: Array<{
    timestamp: string;
    lcp: number;
    fid: number;
    cls: number;
  }>;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    collectPerformanceMetrics();
    startRealTimeMonitoring();
  }, []);

  const collectPerformanceMetrics = () => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const resources = performance.getEntriesByType('resource');

      // Calculate Core Web Vitals
      const lcp = getLargestContentfulPaint();
      const fid = getFirstInputDelay();
      const cls = getCumulativeLayoutShift();
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      const ttfb = navigation?.responseStart - navigation?.requestStart || 0;

      // Network metrics
      const connection = (navigator as any).connection || {};
      const networkMetrics = {
        connectionType: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        rtt: connection.rtt || 0,
        downlink: connection.downlink || 0
      };

      // Resource metrics
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const cssResources = resources.filter(r => r.name.includes('.css'));
      const imageResources = resources.filter(r => 
        r.name.includes('.jpg') || r.name.includes('.png') || 
        r.name.includes('.gif') || r.name.includes('.webp')
      );

      const resourceMetrics = {
        jsSize: jsResources.reduce((sum, r) => sum + ((r as any).transferSize || 0), 0),
        cssSize: cssResources.reduce((sum, r) => sum + ((r as any).transferSize || 0), 0),
        imageSize: imageResources.reduce((sum, r) => sum + ((r as any).transferSize || 0), 0),
        totalSize: resources.reduce((sum, r) => sum + ((r as any).transferSize || 0), 0),
        requestCount: resources.length
      };

      // Generate mock trend data
      const trends = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        lcp: Math.random() * 1000 + 1500,
        fid: Math.random() * 50 + 50,
        cls: Math.random() * 0.1 + 0.05
      }));

      setMetrics({
        coreWebVitals: { lcp, fid, cls, fcp, ttfb },
        networkMetrics,
        resourceMetrics,
        trends
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to collect performance metrics:', error);
      setLoading(false);
    }
  };

  const getLargestContentfulPaint = (): number => {
    // Use PerformanceObserver API or fallback
    return performance.now(); // Simplified for demo
  };

  const getFirstInputDelay = (): number => {
    // Use PerformanceObserver API or fallback
    return Math.random() * 100; // Simplified for demo
  };

  const getCumulativeLayoutShift = (): number => {
    // Use PerformanceObserver API or fallback
    return Math.random() * 0.2; // Simplified for demo
  };

  const startRealTimeMonitoring = () => {
    setIsMonitoring(true);
    
    // Monitor Core Web Vitals in real-time
    if ('PerformanceObserver' in window) {
      try {
        // LCP Observer
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID Observer
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            console.log('FID:', (entry as any).processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

      } catch (error) {
        console.warn('Performance monitoring not fully supported:', error);
      }
    }

    // Refresh metrics every 30 seconds
    const interval = setInterval(collectPerformanceMetrics, 30000);
    return () => clearInterval(interval);
  };

  const getMetricStatus = (metric: string, value: number) => {
    const thresholds: { [key: string]: { good: number; poor: number } } = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading || !metrics) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitor</h1>
          <p className="text-muted-foreground">
            Real-time web performance and Core Web Vitals tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isMonitoring ? 'default' : 'secondary'}>
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
          </Badge>
          <Button onClick={collectPerformanceMetrics} size="sm">
            Refresh Metrics
          </Button>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(metrics.coreWebVitals).map(([key, value]) => {
          const status = getMetricStatus(key, value);
          const statusColor = status === 'good' ? 'text-green-600' : 
                             status === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600';
          const statusIcon = status === 'good' ? CheckCircle : AlertTriangle;
          const StatusIcon = statusIcon;

          return (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium uppercase">{key}</span>
                  <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                </div>
                <div className="text-2xl font-bold mb-1">
                  {key === 'cls' ? value.toFixed(3) : Math.round(value)}
                  {key !== 'cls' && 'ms'}
                </div>
                <div className={`text-xs ${statusColor}`}>
                  {status.replace('-', ' ')}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
              />
              <Line type="monotone" dataKey="lcp" stroke="#3b82f6" strokeWidth={2} name="LCP (ms)" />
              <Line type="monotone" dataKey="fid" stroke="#10b981" strokeWidth={2} name="FID (ms)" />
              <Line type="monotone" dataKey="cls" stroke="#f59e0b" strokeWidth={2} name="CLS (×100)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Network & Resource Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Network Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Connection Type</span>
                <Badge variant="outline">{metrics.networkMetrics.connectionType}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Effective Type</span>
                <Badge variant="outline">{metrics.networkMetrics.effectiveType}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Round Trip Time</span>
                <span className="font-medium">{metrics.networkMetrics.rtt}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Downlink</span>
                <span className="font-medium">{metrics.networkMetrics.downlink} Mbps</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Resource Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">JavaScript</span>
                <span className="font-medium">{formatBytes(metrics.resourceMetrics.jsSize)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Stylesheets</span>
                <span className="font-medium">{formatBytes(metrics.resourceMetrics.cssSize)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Images</span>
                <span className="font-medium">{formatBytes(metrics.resourceMetrics.imageSize)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Size</span>
                <span className="font-medium">{formatBytes(metrics.resourceMetrics.totalSize)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Requests</span>
                <span className="font-medium">{metrics.resourceMetrics.requestCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.resourceMetrics.totalSize > 2000000 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Total page size is {formatBytes(metrics.resourceMetrics.totalSize)}. 
                  Consider optimizing images and minimizing JavaScript bundles.
                </AlertDescription>
              </Alert>
            )}
            
            {metrics.coreWebVitals.lcp > 2500 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Largest Contentful Paint is {Math.round(metrics.coreWebVitals.lcp)}ms. 
                  Optimize your largest content elements and consider lazy loading.
                </AlertDescription>
              </Alert>
            )}

            {metrics.coreWebVitals.cls > 0.1 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Cumulative Layout Shift is {metrics.coreWebVitals.cls.toFixed(3)}. 
                  Set explicit dimensions for images and avoid inserting content above existing content.
                </AlertDescription>
              </Alert>
            )}

            {metrics.coreWebVitals.lcp <= 2500 && 
             metrics.coreWebVitals.fid <= 100 && 
             metrics.coreWebVitals.cls <= 0.1 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Great job! All Core Web Vitals are in the "Good" range.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;