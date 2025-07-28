import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Zap, 
  Network, 
  DollarSign,
  Activity,
  Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface NFTAnalytics {
  totalMinted: number;
  totalValue: number;
  avgGasCost: number;
  networkDistribution: { network: string; count: number; color: string }[];
  mintingTrends: { date: string; count: number }[];
  gasSpendingTrends: { date: string; gas: number }[];
  successRate: number;
}

export const NFTMintingAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<NFTAnalytics>({
    totalMinted: 0,
    totalValue: 0,
    avgGasCost: 0,
    networkDistribution: [],
    mintingTrends: [],
    gasSpendingTrends: [],
    successRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
      
      // Set up real-time updates
      const channel = supabase
        .channel('nft-analytics')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'blockchain_certificates'
          },
          () => loadAnalytics()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      // Fetch NFT minting data
      const { data: certificates, error } = await supabase
        .from('blockchain_certificates')
        .select(`
          *,
          artwork:artwork_id (title, category)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const processedAnalytics = processAnalyticsData(certificates || []);
      setAnalytics(processedAnalytics);
    } catch (error) {
      console.error('Error loading NFT analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (certificates: any[]): NFTAnalytics => {
    const nftCertificates = certificates.filter(cert => 
      cert.certificate_data?.nft_data
    );

    const networkCounts: { [key: string]: number } = {};
    let totalGas = 0;
    let totalValue = 0;
    const dailyCounts: { [key: string]: number } = {};
    const dailyGas: { [key: string]: number } = {};

    nftCertificates.forEach(cert => {
      const nftData = cert.certificate_data.nft_data;
      const network = nftData.network || 'unknown';
      const date = new Date(cert.created_at).toISOString().split('T')[0];
      
      networkCounts[network] = (networkCounts[network] || 0) + 1;
      
      if (nftData.gasUsed && nftData.gasPriceGwei) {
        const gasSpent = (nftData.gasUsed * nftData.gasPriceGwei) / 1e9;
        totalGas += gasSpent;
        dailyGas[date] = (dailyGas[date] || 0) + gasSpent;
      }

      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const networkColors = {
      'ethereum': '#627EEA',
      'polygon': '#8247E5',
      'sepolia': '#F7931A'
    };

    const networkDistribution = Object.entries(networkCounts).map(([network, count]) => ({
      network: network.charAt(0).toUpperCase() + network.slice(1),
      count,
      color: networkColors[network as keyof typeof networkColors] || '#94A3B8'
    }));

    const mintingTrends = Object.entries(dailyCounts)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-7)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      }));

    const gasSpendingTrends = Object.entries(dailyGas)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-7)
      .map(([date, gas]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        gas: parseFloat(gas.toFixed(4))
      }));

    return {
      totalMinted: nftCertificates.length,
      totalValue,
      avgGasCost: nftCertificates.length > 0 ? totalGas / nftCertificates.length : 0,
      networkDistribution,
      mintingTrends,
      gasSpendingTrends,
      successRate: certificates.length > 0 ? (nftCertificates.length / certificates.length) * 100 : 0
    };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-8 bg-muted rounded w-16 mt-2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total NFTs Minted</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMinted}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {analytics.successRate.toFixed(1)}% success rate
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Gas Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.avgGasCost.toFixed(4)} ETH
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Networks Used</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.networkDistribution.length}</div>
            <p className="text-xs text-muted-foreground">
              Active blockchain networks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minting Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.mintingTrends.reduce((sum, day) => sum + day.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Network Distribution</CardTitle>
            <CardDescription>NFTs minted by blockchain network</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.networkDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analytics.networkDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {analytics.networkDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, 'NFTs']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No NFT data available
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {analytics.networkDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.network}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Minting Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Minting Trends</CardTitle>
            <CardDescription>Daily NFT minting activity</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.mintingTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.mintingTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No minting activity data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};