import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  BarChart3, 
  Users, 
  Eye, 
  Clock, 
  Globe, 
  Settings,
  Activity,
  TrendingUp,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    gtag: any;
    dataLayer: any;
  }
}

interface AnalyticsConfig {
  tracking_id: string;
  enabled: boolean;
  enhanced_measurement: boolean;
  custom_events: boolean;
  ecommerce_tracking: boolean;
  demographics: boolean;
}

interface AnalyticsMetrics {
  page_views: number;
  unique_visitors: number;
  session_duration: string;
  bounce_rate: number;
  top_pages: Array<{ page: string; views: number }>;
  traffic_sources: Array<{ source: string; percentage: number }>;
  user_demographics: {
    countries: Array<{ country: string; users: number }>;
    devices: Array<{ device: string; users: number }>;
  };
}

export const GoogleAnalytics = () => {
  const [config, setConfig] = useState<AnalyticsConfig>({
    tracking_id: '',
    enabled: false,
    enhanced_measurement: true,
    custom_events: true,
    ecommerce_tracking: false,
    demographics: true
  });
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    page_views: 0,
    unique_visitors: 0,
    session_duration: '0m 0s',
    bounce_rate: 0,
    top_pages: [],
    traffic_sources: [],
    user_demographics: { countries: [], devices: [] }
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfiguration();
    loadMetrics();
  }, []);

  const loadConfiguration = () => {
    const savedConfig = localStorage.getItem('ga4_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  };

  const loadMetrics = async () => {
    // Simulate loading metrics - in production, this would fetch from GA4 API
    setMetrics({
      page_views: 12543,
      unique_visitors: 8921,
      session_duration: '3m 42s',
      bounce_rate: 34.2,
      top_pages: [
        { page: '/', views: 3421 },
        { page: '/dashboard', views: 2876 },
        { page: '/upload', views: 1987 },
        { page: '/pricing', views: 1654 },
        { page: '/about-tsmo', views: 1205 }
      ],
      traffic_sources: [
        { source: 'Direct', percentage: 45.2 },
        { source: 'Organic Search', percentage: 32.1 },
        { source: 'Social Media', percentage: 12.7 },
        { source: 'Referral', percentage: 6.8 },
        { source: 'Paid Search', percentage: 3.2 }
      ],
      user_demographics: {
        countries: [
          { country: 'United States', users: 3456 },
          { country: 'United Kingdom', users: 1234 },
          { country: 'Canada', users: 987 },
          { country: 'Germany', users: 765 },
          { country: 'Australia', users: 543 }
        ],
        devices: [
          { device: 'Desktop', users: 4321 },
          { device: 'Mobile', users: 3210 },
          { device: 'Tablet', users: 876 }
        ]
      }
    });
  };

  const initializeGA4 = (trackingId: string) => {
    if (!trackingId) return;

    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', trackingId, {
      enhanced_measurement: config.enhanced_measurement,
      demographics_and_interests: config.demographics,
      send_page_view: true
    });

    // Set up custom events if enabled
    if (config.custom_events) {
      setupCustomEvents();
    }
  };

  const setupCustomEvents = () => {
    // Track button clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' && window.gtag) {
        window.gtag('event', 'button_click', {
          event_category: 'engagement',
          event_label: target.textContent || 'button',
          value: 1
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const target = event.target as HTMLFormElement;
      if (window.gtag) {
        window.gtag('event', 'form_submit', {
          event_category: 'engagement',
          event_label: target.id || 'form',
          value: 1
        });
      }
    });

    // Track file uploads
    window.addEventListener('upload_complete', ((event: CustomEvent) => {
      if (window.gtag) {
        window.gtag('event', 'file_upload', {
          event_category: 'content',
          event_label: event.detail.fileType || 'file',
          value: 1
        });
      }
    }) as EventListener);
  };

  const saveConfiguration = () => {
    setIsLoading(true);
    
    try {
      localStorage.setItem('ga4_config', JSON.stringify(config));
      
      if (config.enabled && config.tracking_id) {
        initializeGA4(config.tracking_id);
      }

      toast({
        title: "Configuration Saved",
        description: "Google Analytics 4 has been configured successfully.",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save Google Analytics configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const trackCustomEvent = (eventName: string, parameters: any = {}) => {
    if (window.gtag && config.enabled) {
      window.gtag('event', eventName, parameters);
      toast({
        title: "Event Tracked",
        description: `Custom event "${eventName}" has been sent to Google Analytics.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Google Analytics 4</h2>
          <p className="text-muted-foreground">
            Track user behavior and website performance
          </p>
        </div>
        <Badge variant={config.enabled ? "default" : "secondary"}>
          {config.enabled ? "Active" : "Inactive"}
        </Badge>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="events">Custom Events</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {!config.enabled ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Not Configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Set up Google Analytics 4 to start tracking your website performance
                  </p>
                  <Button onClick={() => setConfig({ ...config, enabled: true })}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                        <p className="text-2xl font-bold">{metrics.page_views.toLocaleString()}</p>
                      </div>
                      <Eye className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Unique Visitors</p>
                        <p className="text-2xl font-bold">{metrics.unique_visitors.toLocaleString()}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Session</p>
                        <p className="text-2xl font-bold">{metrics.session_duration}</p>
                      </div>
                      <Clock className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                        <p className="text-2xl font-bold">{metrics.bounce_rate}%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Pages & Traffic Sources */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Pages</CardTitle>
                    <CardDescription>Most visited pages on your website</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {metrics.top_pages.map((page, index) => (
                        <div key={page.page} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{page.page}</span>
                          <span className="text-sm text-muted-foreground">
                            {page.views.toLocaleString()} views
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                    <CardDescription>Where your visitors are coming from</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {metrics.traffic_sources.map((source) => (
                        <div key={source.source} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{source.source}</span>
                          <span className="text-sm text-muted-foreground">
                            {source.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="configuration">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Configuration</CardTitle>
              <CardDescription>
                Configure Google Analytics 4 tracking for your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enabled">Enable Google Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn on Google Analytics 4 tracking
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
                />
              </div>

              <div>
                <Label htmlFor="tracking-id">Tracking ID (GA4 Measurement ID)</Label>
                <Input
                  id="tracking-id"
                  value={config.tracking_id}
                  onChange={(e) => setConfig({ ...config, tracking_id: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  disabled={!config.enabled}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Find this in your Google Analytics 4 property settings
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tracking Features</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enhanced-measurement">Enhanced Measurement</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically track scrolls, outbound clicks, site search, video engagement
                    </p>
                  </div>
                  <Switch
                    id="enhanced-measurement"
                    checked={config.enhanced_measurement}
                    onCheckedChange={(checked) => setConfig({ ...config, enhanced_measurement: checked })}
                    disabled={!config.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="custom-events">Custom Events</Label>
                    <p className="text-sm text-muted-foreground">
                      Track button clicks, form submissions, and custom interactions
                    </p>
                  </div>
                  <Switch
                    id="custom-events"
                    checked={config.custom_events}
                    onCheckedChange={(checked) => setConfig({ ...config, custom_events: checked })}
                    disabled={!config.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="demographics">Demographics & Interests</Label>
                    <p className="text-sm text-muted-foreground">
                      Collect demographic information about your users
                    </p>
                  </div>
                  <Switch
                    id="demographics"
                    checked={config.demographics}
                    onCheckedChange={(checked) => setConfig({ ...config, demographics: checked })}
                    disabled={!config.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ecommerce">E-commerce Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Track purchases and subscription events
                    </p>
                  </div>
                  <Switch
                    id="ecommerce"
                    checked={config.ecommerce_tracking}
                    onCheckedChange={(checked) => setConfig({ ...config, ecommerce_tracking: checked })}
                    disabled={!config.enabled}
                  />
                </div>
              </div>

              <Button onClick={saveConfiguration} disabled={isLoading}>
                <Settings className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Custom Events</CardTitle>
              <CardDescription>
                Track custom events and user interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => trackCustomEvent('test_event', { 
                      event_category: 'testing',
                      event_label: 'manual_test',
                      value: 1
                    })}
                    disabled={!config.enabled}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Test Event
                  </Button>
                  
                  <Button
                    onClick={() => trackCustomEvent('feature_used', { 
                      event_category: 'engagement',
                      event_label: 'analytics_panel',
                      value: 1
                    })}
                    disabled={!config.enabled}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Feature Used
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Custom events being tracked automatically:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Button clicks</li>
                    <li>Form submissions</li>
                    <li>File uploads</li>
                    <li>Page navigation</li>
                    <li>Feature usage</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Reports</CardTitle>
              <CardDescription>
                Detailed analytics reports and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Reporting</h3>
                <p className="text-muted-foreground">
                  Detailed analytics reports coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};