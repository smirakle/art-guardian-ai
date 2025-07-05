import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity } from "lucide-react";

interface ChartData {
  time: string;
  scans: number;
  threats: number;
  protected: number;
}

const MonitoringChart = () => {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Initialize with some baseline data
    const initialData: ChartData[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      initialData.push({
        time: time.getHours().toString().padStart(2, '0') + ':00',
        scans: Math.floor(Math.random() * 100) + 50,
        threats: Math.floor(Math.random() * 10) + 1,
        protected: Math.floor(Math.random() * 50) + 25
      });
    }
    
    setData(initialData);

    // Update data every 10 seconds
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData];
        newData.shift(); // Remove oldest entry
        
        const now = new Date();
        newData.push({
          time: now.getHours().toString().padStart(2, '0') + ':' + 
                now.getMinutes().toString().padStart(2, '0'),
          scans: Math.floor(Math.random() * 100) + 50,
          threats: Math.floor(Math.random() * 10) + 1,
          protected: Math.floor(Math.random() * 50) + 25
        });
        
        return newData;
      });
    }, 10000);

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