import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChartData {
  time: string;
  scans: number;
  threats: number;
  protected: number;
}

const MonitoringChart = () => {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    const loadRealData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [scansRes, matchesRes, artworkRes] = await Promise.all([
        supabase.from('monitoring_scans')
          .select('created_at, status')
          .gte('created_at', dayAgo.toISOString()),
        supabase.from('copyright_matches')
          .select('created_at, threat_level')
          .gte('created_at', dayAgo.toISOString()),
        supabase.from('artwork')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', dayAgo.toISOString()),
      ]);

      const scans = scansRes.data || [];
      const matches = matchesRes.data || [];
      const artworks = artworkRes.data || [];

      // Bucket by hour
      const chartData: ChartData[] = [];
      for (let i = 23; i >= 0; i--) {
        const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
        const hStart = hourStart.toISOString();
        const hEnd = hourEnd.toISOString();

        chartData.push({
          time: hourStart.getHours().toString().padStart(2, '0') + ':00',
          scans: scans.filter(s => s.created_at >= hStart && s.created_at < hEnd).length,
          threats: matches.filter(m => m.created_at >= hStart && m.created_at < hEnd).length,
          protected: artworks.filter(a => a.created_at >= hStart && a.created_at < hEnd).length,
        });
      }
      setData(chartData);
    };

    loadRealData();
    const interval = setInterval(loadRealData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Real-time Activity
        </CardTitle>
        <CardDescription>
          Live monitoring data from the last 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="threatsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="protectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="scans"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#scansGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="protected"
                stroke="hsl(var(--accent))"
                fillOpacity={1}
                fill="url(#protectedGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="threats"
                stroke="hsl(var(--destructive))"
                fillOpacity={1}
                fill="url(#threatsGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary"></div>
            <span>Scans</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-accent"></div>
            <span>Protected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-destructive"></div>
            <span>Threats</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonitoringChart;