import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Crown,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Layers,
  Network,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BlockchainCertificate {
  id: string;
  artwork_id: string;
  certificate_id: string;
  blockchain_hash: string;
  status: string;
  created_at: string;
  certificate_data: any;
  artwork?: {
    title: string;
    category: string;
  } | null;
}

interface RealTimeBlockchainStats {
  totalCertificates: number;
  pendingRegistrations: number;
  confirmedRegistrations: number;
  totalGasSpent: number;
  networkDistribution: { [key: string]: number };
}

export const RealTimeBlockchainWidget = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<BlockchainCertificate[]>([]);
  const [stats, setStats] = useState<RealTimeBlockchainStats>({
    totalCertificates: 0,
    pendingRegistrations: 0,
    confirmedRegistrations: 0,
    totalGasSpent: 0,
    networkDistribution: {}
  });
  const [isAutoRegistering, setIsAutoRegistering] = useState(false);

  useEffect(() => {
    if (user) {
      loadBlockchainData();
      setupRealTimeSubscriptions();
    }
  }, [user]);

  const loadBlockchainData = async () => {
    try {
      const { data: certificatesData, error } = await supabase
        .from('blockchain_certificates')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get artwork titles separately
      const artworkIds = certificatesData?.map(cert => cert.artwork_id) || [];
      const { data: artworkData } = await supabase
        .from('artwork')
        .select('id, title, category')
        .in('id', artworkIds);

      const enrichedCertificates = certificatesData?.map(cert => ({
        ...cert,
        artwork: artworkData?.find(artwork => artwork.id === cert.artwork_id) || null
      })) || [];

      setCertificates(enrichedCertificates);

      // Calculate stats
      const totalCerts = certificatesData?.length || 0;
      const pending = certificatesData?.filter(cert => cert.status === 'pending').length || 0;
      const confirmed = certificatesData?.filter(cert => cert.status === 'registered').length || 0;
      
      let totalGas = 0;
      const networkDist: { [key: string]: number } = {};
      
      certificatesData?.forEach(cert => {
        const certData = cert.certificate_data as any;
        totalGas += certData?.gasFee || 0;
        const network = certData?.network || 'polygon';
        networkDist[network] = (networkDist[network] || 0) + 1;
      });

      setStats({
        totalCertificates: totalCerts,
        pendingRegistrations: pending,
        confirmedRegistrations: confirmed,
        totalGasSpent: totalGas,
        networkDistribution: networkDist
      });

    } catch (error) {
      console.error('Error loading blockchain data:', error);
    }
  };

  const setupRealTimeSubscriptions = () => {
    // Subscribe to new blockchain certificates
    const certificatesChannel = supabase
      .channel('blockchain-certificates-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'blockchain_certificates',
          filter: `user_id=eq.${user!.id}`
        },
        (payload) => {
          console.log('Blockchain certificate update:', payload);
          loadBlockchainData();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "⛓️ New Blockchain Certificate",
              description: `Certificate ${payload.new.certificate_id} created`,
            });
          } else if (payload.eventType === 'UPDATE' && payload.new.status === 'registered') {
            toast({
              title: "✅ Certificate Confirmed",
              description: `${payload.new.certificate_id} confirmed on blockchain`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(certificatesChannel);
    };
  };

  const enableAutoBlockchainRegistration = async () => {
    setIsAutoRegistering(true);
    
    try {
      // Get all unprotected artworks
      const { data: unprotectedArtworks, error } = await supabase
        .from('artwork')
        .select('id, title')
        .eq('user_id', user!.id)
        .eq('enable_blockchain', false);

      if (error) throw error;

      if (!unprotectedArtworks || unprotectedArtworks.length === 0) {
        toast({
          title: "All Artworks Protected",
          description: "All your artworks already have blockchain protection",
        });
        setIsAutoRegistering(false);
        return;
      }

      // Start batch registration
      for (const artwork of unprotectedArtworks) {
        await supabase.functions.invoke('advanced-blockchain-registration', {
          body: {
            artworkId: artwork.id,
            network: 'polygon',
            userId: user!.id,
            smartContractSettings: {
              royaltyPercentage: 10,
              licenseTerms: 'standard',
              transferable: true,
              resellable: true
            },
            advancedFeatures: true,
            realTimeProtection: true
          }
        });

        // Update artwork to mark as blockchain protected
        await supabase
          .from('artwork')
          .update({ enable_blockchain: true })
          .eq('id', artwork.id);

        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast({
        title: "🚀 Auto-Registration Complete",
        description: `${unprotectedArtworks.length} artworks now have blockchain protection`,
      });

    } catch (error) {
      console.error('Error in auto registration:', error);
      toast({
        title: "Error",
        description: "Failed to enable auto blockchain registration",
        variant: "destructive"
      });
    } finally {
      setIsAutoRegistering(false);
    }
  };

  const getNetworkIcon = (network: string) => {
    switch (network) {
      case 'ethereum':
        return '🔷';
      case 'polygon':
        return '🟣';
      case 'arbitrum':
        return '🔵';
      default:
        return '⛓️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'default';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Real-Time Blockchain Protection
          </CardTitle>
          <CardDescription>
            Advanced blockchain registration with real-time monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${certificates.some(c => c.status === 'pending') ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-sm font-medium">
                {certificates.some(c => c.status === 'pending') ? 'Processing Registrations' : 'All Registrations Complete'}
              </span>
            </div>
            <Button
              onClick={enableAutoBlockchainRegistration}
              disabled={isAutoRegistering}
              size="sm"
              className="flex items-center gap-2"
            >
              {isAutoRegistering ? (
                <>
                  <Layers className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Auto-Protect All
                </>
              )}
            </Button>
          </div>

          {isAutoRegistering && (
            <Progress value={66} className="mb-4" />
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCertificates}</p>
                <p className="text-sm text-muted-foreground">Total Certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.pendingRegistrations}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.confirmedRegistrations}</p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">${stats.totalGasSpent.toFixed(4)}</p>
                <p className="text-sm text-muted-foreground">Total Gas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Certificates */}
      {certificates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Blockchain Certificates</CardTitle>
            <CardDescription>Latest blockchain registrations and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {certificates.slice(0, 5).map((cert) => {
                const certData = cert.certificate_data as any;
                const network = certData?.network || 'polygon';
                
                return (
                  <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getNetworkIcon(network)}</div>
                      <div>
                        <p className="text-sm font-medium">
                          {cert.artwork?.title || 'Unknown Artwork'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cert.certificate_id} • {network.charAt(0).toUpperCase() + network.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(cert.status)}>
                        {cert.status}
                      </Badge>
                      {certData?.transactionUrl && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(certData.transactionUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Distribution */}
      {Object.keys(stats.networkDistribution).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Network Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.networkDistribution).map(([network, count]) => (
                <div key={network} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getNetworkIcon(network)}</span>
                    <span className="font-medium">{network.charAt(0).toUpperCase() + network.slice(1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(count / stats.totalCertificates) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};