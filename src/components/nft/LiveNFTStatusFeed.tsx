import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  Zap,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface LiveNFTActivity {
  id: string;
  type: 'minting' | 'confirmed' | 'failed';
  timestamp: string;
  network: string;
  tokenId?: string;
  transactionHash?: string;
  contractAddress?: string;
  gasUsed?: number;
  gasPriceGwei?: number;
  artworkTitle?: string;
  status: 'pending' | 'confirmed' | 'failed';
  openseaUrl?: string;
  explorerUrl?: string;
}

export const LiveNFTStatusFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<LiveNFTActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecentActivity();
      
      // Set up real-time updates
      const channel = supabase
        .channel('nft-live-feed')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'blockchain_certificates'
          },
          (payload) => {
            handleRealTimeUpdate(payload);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadRecentActivity = async () => {
    try {
      const { data: certificates, error } = await supabase
        .from('blockchain_certificates')
        .select(`
          *,
          artwork:artwork_id (title, category)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const processedActivities = certificates
        ?.filter(cert => {
          const certData = cert.certificate_data as any;
          return certData && typeof certData === 'object' && certData.nft_data;
        })
        .map(cert => convertToActivity(cert)) || [];

      setActivities(processedActivities);
    } catch (error) {
      console.error('Error loading NFT activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRealTimeUpdate = (payload: any) => {
    const certData = payload.new?.certificate_data as any;
    if (certData && typeof certData === 'object' && certData.nft_data) {
      const newActivity = convertToActivity(payload.new);
      setActivities(prev => [newActivity, ...prev].slice(0, 10));
    }
  };

  const convertToActivity = (cert: any): LiveNFTActivity => {
    const certData = cert.certificate_data as any;
    const nftData = certData.nft_data;
    const network = nftData.network || 'unknown';
    
    return {
      id: cert.id,
      type: nftData.transactionHash ? 'confirmed' : 'minting',
      timestamp: cert.created_at,
      network,
      tokenId: nftData.tokenId,
      transactionHash: nftData.transactionHash,
      contractAddress: nftData.contractAddress,
      gasUsed: nftData.gasUsed,
      gasPriceGwei: nftData.gasPriceGwei,
      artworkTitle: cert.artwork?.title || 'Unknown Artwork',
      status: nftData.transactionHash ? 'confirmed' : 'pending',
      openseaUrl: nftData.opensea_url,
      explorerUrl: nftData.explorer_url
    };
  };

  const getStatusIcon = (activity: LiveNFTActivity) => {
    switch (activity.status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Zap className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      confirmed: 'default',
      pending: 'secondary',
      failed: 'destructive'
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatGasCost = (gasUsed?: number, gasPriceGwei?: number) => {
    if (!gasUsed || !gasPriceGwei) return 'N/A';
    const costEth = (gasUsed * gasPriceGwei) / 1e9;
    return `${costEth.toFixed(6)} ETH`;
  };

  const getNetworkColor = (network: string) => {
    const colors = {
      ethereum: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      polygon: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      sepolia: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[network as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live NFT Activity</CardTitle>
          <CardDescription>Real-time minting and transaction updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-48 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Live NFT Activity
        </CardTitle>
        <CardDescription>Real-time minting and transaction updates</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No NFT activity yet</p>
            <p className="text-sm">Mint your first NFT to see live updates here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-card/50">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(activity)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium truncate">
                        {activity.artworkTitle}
                      </h4>
                      {getStatusBadge(activity.status)}
                    </div>
                    <Badge className={getNetworkColor(activity.network)}>
                      {activity.network.charAt(0).toUpperCase() + activity.network.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="mt-1 text-xs text-muted-foreground space-y-1">
                    <div>
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                    
                    {activity.tokenId && (
                      <div>Token ID: #{activity.tokenId}</div>
                    )}
                    
                    {activity.gasUsed && activity.gasPriceGwei && (
                      <div>Gas Cost: {formatGasCost(activity.gasUsed, activity.gasPriceGwei)}</div>
                    )}
                    
                    {activity.transactionHash && (
                      <div className="font-mono">
                        TX: {activity.transactionHash.slice(0, 10)}...{activity.transactionHash.slice(-8)}
                      </div>
                    )}
                  </div>
                  
                  {activity.status === 'confirmed' && (
                    <div className="flex gap-2 mt-2">
                      {activity.openseaUrl && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => window.open(activity.openseaUrl, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          OpenSea
                        </Button>
                      )}
                      
                      {activity.explorerUrl && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => window.open(activity.explorerUrl, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Explorer
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

