import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, MousePointerClick, CreditCard, CheckCircle, ArrowRight, RefreshCw } from "lucide-react";

interface ConversionMetrics {
  upgrade_clicks: number;
  pricing_landed: number;
  checkout_started: number;
  subscription_converted: number;
  click_to_landing_rate: number;
  landing_to_checkout_rate: number;
  checkout_to_conversion_rate: number;
  overall_conversion_rate: number;
}

export const PluginConversionAnalytics = () => {
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      // Fetch conversion events from database
      const { data: events, error } = await supabase
        .from('plugin_conversion_events')
        .select('event_type, created_at')
        .eq('source', 'adobe_plugin')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString());

      if (error) {
        console.error('Error fetching conversion events:', error);
        return;
      }

      // Calculate metrics
      const counts = {
        upgrade_click: 0,
        pricing_landed: 0,
        checkout_started: 0,
        subscription_converted: 0
      };

      events?.forEach(event => {
        if (event.event_type in counts) {
          counts[event.event_type as keyof typeof counts]++;
        }
      });

      const calcRate = (num: number, denom: number) => 
        denom > 0 ? Math.round((num / denom) * 100) : 0;

      setMetrics({
        upgrade_clicks: counts.upgrade_click,
        pricing_landed: counts.pricing_landed,
        checkout_started: counts.checkout_started,
        subscription_converted: counts.subscription_converted,
        click_to_landing_rate: calcRate(counts.pricing_landed, counts.upgrade_click),
        landing_to_checkout_rate: calcRate(counts.checkout_started, counts.pricing_landed),
        checkout_to_conversion_rate: calcRate(counts.subscription_converted, counts.checkout_started),
        overall_conversion_rate: calcRate(counts.subscription_converted, counts.upgrade_click)
      });

      setLastUpdated(new Date());
    } catch (e) {
      console.error('Error calculating metrics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const funnelData = metrics ? [
    { name: 'Upgrade Clicks', value: metrics.upgrade_clicks, color: 'hsl(var(--primary))' },
    { name: 'Pricing Landed', value: metrics.pricing_landed, color: 'hsl(var(--accent))' },
    { name: 'Checkout Started', value: metrics.checkout_started, color: 'hsl(217, 91%, 60%)' },
    { name: 'Converted', value: metrics.subscription_converted, color: 'hsl(142, 71%, 45%)' },
  ] : [];

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    subValue 
  }: { 
    icon: React.ElementType; 
    label: string; 
    value: number | string; 
    subValue?: string;
  }) => (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {subValue && <p className="text-xs text-green-500">{subValue}</p>}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Adobe Plugin Conversion Funnel
            </CardTitle>
            <CardDescription>
              Track upgrade button clicks through to paid subscriptions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchMetrics} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : metrics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard 
                icon={MousePointerClick} 
                label="Upgrade Clicks" 
                value={metrics.upgrade_clicks}
              />
              <StatCard 
                icon={ArrowRight} 
                label="Pricing Views" 
                value={metrics.pricing_landed}
                subValue={`${metrics.click_to_landing_rate}% of clicks`}
              />
              <StatCard 
                icon={CreditCard} 
                label="Checkout Started" 
                value={metrics.checkout_started}
                subValue={`${metrics.landing_to_checkout_rate}% of views`}
              />
              <StatCard 
                icon={CheckCircle} 
                label="Converted" 
                value={metrics.subscription_converted}
                subValue={`${metrics.checkout_to_conversion_rate}% of checkouts`}
              />
            </div>

            {/* Conversion Rate Highlight */}
            <div className="flex items-center justify-center p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{metrics.overall_conversion_rate}%</p>
                <p className="text-sm text-muted-foreground">Overall Conversion Rate (Click → Paid)</p>
              </div>
            </div>

            {/* Funnel Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Funnel Flow Visualization */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-lg text-sm">
              <div className="flex items-center gap-1">
                <Badge variant="outline">{metrics.upgrade_clicks}</Badge>
                <span className="text-muted-foreground">clicks</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-1">
                <Badge variant="outline">{metrics.pricing_landed}</Badge>
                <span className="text-muted-foreground">landed</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-1">
                <Badge variant="outline">{metrics.checkout_started}</Badge>
                <span className="text-muted-foreground">checkout</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-1">
                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">{metrics.subscription_converted}</Badge>
                <span className="text-green-500 font-medium">converted</span>
              </div>
            </div>

            {lastUpdated && (
              <p className="text-xs text-muted-foreground text-center">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No conversion data available for this period
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PluginConversionAnalytics;
