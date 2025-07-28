import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Fuel, 
  TrendingUp, 
  TrendingDown, 
  Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GasPrice {
  network: string;
  currentGwei: number;
  trend: 'up' | 'down' | 'stable';
  costUsd: number;
  recommendation: 'low' | 'medium' | 'high';
}

interface GasHistory {
  timestamp: string;
  ethereum: number;
  polygon: number;
  sepolia: number;
}

export const NFTGasPriceTracker = () => {
  const [gasPrices, setGasPrices] = useState<GasPrice[]>([
    {
      network: 'Ethereum',
      currentGwei: 25.5,
      trend: 'down',
      costUsd: 12.30,
      recommendation: 'medium'
    },
    {
      network: 'Polygon',
      currentGwei: 0.8,
      trend: 'stable',
      costUsd: 0.05,
      recommendation: 'low'
    },
    {
      network: 'Sepolia',
      currentGwei: 2.1,
      trend: 'up',
      costUsd: 0.00,
      recommendation: 'low'
    }
  ]);

  const [gasHistory, setGasHistory] = useState<GasHistory[]>([
    { timestamp: '12:00', ethereum: 28.2, polygon: 0.9, sepolia: 1.8 },
    { timestamp: '12:15', ethereum: 26.8, polygon: 0.7, sepolia: 2.0 },
    { timestamp: '12:30', ethereum: 25.1, polygon: 0.8, sepolia: 2.2 },
    { timestamp: '12:45', ethereum: 25.5, polygon: 0.8, sepolia: 2.1 },
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate real-time gas price updates
    const interval = setInterval(() => {
      updateGasPrices();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const updateGasPrices = () => {
    setGasPrices(prev => prev.map(gas => ({
      ...gas,
      currentGwei: gas.currentGwei + (Math.random() - 0.5) * 2,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      costUsd: gas.network === 'Ethereum' ? gas.currentGwei * 0.48 : gas.costUsd
    })));

    // Add new data point to history
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    setGasHistory(prev => {
      const newPoint = {
        timestamp: timeStr,
        ethereum: gasPrices[0]?.currentGwei || 25,
        polygon: gasPrices[1]?.currentGwei || 0.8,
        sepolia: gasPrices[2]?.currentGwei || 2.1
      };
      return [...prev.slice(-9), newPoint]; // Keep last 10 points
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    const variants = {
      low: { variant: 'default' as const, label: 'Good Time to Mint' },
      medium: { variant: 'secondary' as const, label: 'Moderate Cost' },
      high: { variant: 'destructive' as const, label: 'High Cost' }
    };
    const config = variants[recommendation as keyof typeof variants];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getNetworkColor = (network: string) => {
    const colors = {
      ethereum: '#627EEA',
      polygon: '#8247E5',
      sepolia: '#F7931A'
    };
    return colors[network.toLowerCase() as keyof typeof colors] || '#94A3B8';
  };

  return (
    <div className="space-y-6">
      {/* Current Gas Prices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gasPrices.map((gas) => (
          <Card key={gas.network}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{gas.network}</CardTitle>
              <div className="flex items-center gap-1">
                {getTrendIcon(gas.trend)}
                <Fuel className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {gas.currentGwei.toFixed(1)} Gwei
              </div>
              <div className="space-y-2 mt-2">
                <p className="text-xs text-muted-foreground">
                  ~${gas.costUsd.toFixed(2)} per NFT mint
                </p>
                {getRecommendationBadge(gas.recommendation)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gas Price History Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Gas Price Trends
          </CardTitle>
          <CardDescription>Real-time gas price monitoring across networks</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={gasHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)} Gwei`, 
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="ethereum" 
                stroke={getNetworkColor('ethereum')} 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="polygon" 
                stroke={getNetworkColor('polygon')} 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="sepolia" 
                stroke={getNetworkColor('sepolia')} 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-4">
            {['ethereum', 'polygon', 'sepolia'].map((network) => (
              <div key={network} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getNetworkColor(network) }}
                />
                <span className="text-sm capitalize">{network}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Gas Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Best Times to Mint:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Weekends typically have lower gas</li>
                <li>• Early morning (UTC) often cheapest</li>
                <li>• Avoid major market events</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Network Recommendations:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Polygon: Lowest fees, fast confirmation</li>
                <li>• Sepolia: Free testnet for testing</li>
                <li>• Ethereum: Highest liquidity, premium pricing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

