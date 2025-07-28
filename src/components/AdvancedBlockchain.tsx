import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Copy, 
  Search,
  FileText,
  Key,
  Zap,
  Download,
  Lock,
  Eye,
  TrendingUp,
  Network,
  Globe,
  Layers,
  ArrowUpRight,
  Settings,
  Calendar,
  BarChart3,
  Wallet,
  RefreshCw,
  Crown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import FeatureGuard from "@/components/FeatureGuard";
import { supabase } from "@/integrations/supabase/client";
import tsmoLogo from "@/assets/tsmo-transparent-logo.png";

interface AdvancedBlockchainCertificate {
  id: string;
  artwork_id: string;
  certificate_id: string;
  blockchain_hash: string;
  artwork_fingerprint: string;
  ownership_proof: string;
  registration_timestamp: string;
  status: string;
  certificate_data: any;
  created_at: string;
  blockchain_network: string;
  smart_contract_address?: string;
  nft_token_id?: string;
  gas_fee?: number;
  confirmation_blocks: number;
  transaction_url?: string;
  metadata_ipfs_hash?: string;
  royalty_percentage?: number;
  license_terms?: string;
  artwork?: {
    title: string;
    description: string;
    category: string;
  };
}

interface BlockchainNetwork {
  id: string;
  name: string;
  symbol: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  gasPrice: number;
  confirmationTime: string;
  securityLevel: 'High' | 'Medium' | 'Low';
  supported: boolean;
}

const supportedNetworks: BlockchainNetwork[] = [
  {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    symbol: 'ETH',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/',
    explorerUrl: 'https://etherscan.io',
    gasPrice: 30,
    confirmationTime: '~15 seconds',
    securityLevel: 'High',
    supported: true
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    gasPrice: 0.001,
    confirmationTime: '~2 seconds',
    securityLevel: 'High',
    supported: true
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    symbol: 'ARB',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    gasPrice: 0.1,
    confirmationTime: '~1 second',
    securityLevel: 'High',
    supported: true
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'OP',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    gasPrice: 0.05,
    confirmationTime: '~2 seconds',
    securityLevel: 'High',
    supported: false
  }
];

const AdvancedBlockchain = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<AdvancedBlockchainCertificate[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState('polygon');
  const [batchRegistering, setBatchRegistering] = useState(false);
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);
  const [nftMinting, setNftMinting] = useState<string | null>(null);
  const [smartContractSettings, setSmartContractSettings] = useState({
    royaltyPercentage: 10,
    licenseTerms: 'standard',
    transferable: true,
    resellable: true
  });
  const [registrationProgress, setRegistrationProgress] = useState(0);
  const [analytics, setAnalytics] = useState({
    totalRegistrations: 0,
    totalValue: 0,
    networkDistribution: {},
    recentActivity: []
  });

  useEffect(() => {
    if (user) {
      fetchAdvancedCertificates();
      fetchAnalytics();
    }
  }, [user]);

  const fetchAdvancedCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('blockchain_certificates')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enhance certificates with advanced metadata
      const enhancedCertificates = data?.map(cert => {
        const certData = cert.certificate_data as any;
        return {
          ...cert,
          blockchain_network: certData?.network || 'polygon',
          smart_contract_address: certData?.contractAddress,
          nft_token_id: certData?.tokenId,
          gas_fee: certData?.gasFee || 0,
          confirmation_blocks: certData?.confirmationBlocks || 12,
          transaction_url: certData?.transactionUrl,
          metadata_ipfs_hash: certData?.ipfsHash,
          royalty_percentage: certData?.royaltyPercentage || 0,
          license_terms: certData?.licenseTerms || 'standard'
        };
      }) || [];

      setCertificates(enhancedCertificates);
    } catch (error) {
      console.error('Error fetching advanced certificates:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('blockchain_certificates')
        .select('certificate_data, created_at')
        .eq('user_id', user!.id);

      if (error) throw error;

      const networkDist: { [key: string]: number } = {};
      let totalValue = 0;
      
      data?.forEach(cert => {
        const certData = cert.certificate_data as any;
        const network = certData?.network || 'polygon';
        networkDist[network] = (networkDist[network] || 0) + 1;
        totalValue += certData?.gasFee || 0;
      });

      setAnalytics({
        totalRegistrations: data?.length || 0,
        totalValue,
        networkDistribution: networkDist,
        recentActivity: data?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const batchRegisterArtwork = async () => {
    if (selectedArtworks.length === 0) {
      toast({
        title: "No Artworks Selected",
        description: "Please select artworks to register",
        variant: "destructive",
      });
      return;
    }

    setBatchRegistering(true);
    setRegistrationProgress(0);

    try {
      const network = supportedNetworks.find(n => n.id === selectedNetwork);
      if (!network) throw new Error('Network not supported');

      for (let i = 0; i < selectedArtworks.length; i++) {
        const artworkId = selectedArtworks[i];
        setRegistrationProgress(((i + 1) / selectedArtworks.length) * 100);

        const { data, error } = await supabase.functions.invoke('advanced-blockchain-registration', {
          body: {
            artworkId,
            network: selectedNetwork,
            userId: user!.id,
            smartContractSettings,
            advancedFeatures: true
          }
        });

        if (error) throw error;

        // Simulate network confirmation delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      toast({
        title: "Batch Registration Complete!",
        description: `${selectedArtworks.length} artworks registered on ${network.name}`,
      });

      await fetchAdvancedCertificates();
      await fetchAnalytics();
      setSelectedArtworks([]);
    } catch (error: any) {
      console.error('Batch registration error:', error);
      toast({
        title: "Batch Registration Failed",
        description: error.message || "Failed to register artworks",
        variant: "destructive",
      });
    } finally {
      setBatchRegistering(false);
      setRegistrationProgress(0);
    }
  };

  const mintAsNFT = async (certificateId: string) => {
    setNftMinting(certificateId);
    
    try {
      const { data, error } = await supabase.functions.invoke('nft-minting', {
        body: {
          certificateId,
          network: selectedNetwork,
          userId: user!.id,
          royaltyPercentage: smartContractSettings.royaltyPercentage,
          metadata: {
            transferable: smartContractSettings.transferable,
            resellable: smartContractSettings.resellable
          }
        }
      });

      if (error) throw error;

      toast({
        title: "NFT Minted Successfully!",
        description: `Token ID: ${data.tokenId}`,
      });

      await fetchAdvancedCertificates();
    } catch (error: any) {
      console.error('NFT minting error:', error);
      toast({
        title: "NFT Minting Failed",
        description: error.message || "Failed to mint NFT",
        variant: "destructive",
      });
    } finally {
      setNftMinting(null);
    }
  };

  const generateAdvancedReport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('blockchain-analytics-report', {
        body: {
          userId: user!.id,
          includeGasAnalysis: true,
          includeNetworkComparison: true,
          includeROI: true
        }
      });

      if (error) throw error;

      // Download report
      const blob = new Blob([data.report], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TSMO_Blockchain_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Advanced blockchain analytics report downloaded",
      });
    } catch (error: any) {
      console.error('Report generation error:', error);
      toast({
        title: "Report Generation Failed",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          Please sign in to access advanced blockchain features.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <FeatureGuard feature="blockchain_verification">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Crown className="w-8 h-8 text-primary" />
            Advanced Blockchain Protection
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade blockchain registration with multi-network support, NFT minting, and advanced analytics
          </p>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{analytics.totalRegistrations}</p>
                  <p className="text-sm text-muted-foreground">Total Registrations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">${analytics.totalValue.toFixed(4)}</p>
                  <p className="text-sm text-muted-foreground">Total Gas Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Network className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{Object.keys(analytics.networkDistribution).length}</p>
                  <p className="text-sm text-muted-foreground">Networks Used</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">99.9%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="register" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="register">Batch Register</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="nft">NFT Minting</TabsTrigger>
            <TabsTrigger value="networks">Networks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Batch Blockchain Registration
                </CardTitle>
                <CardDescription>
                  Register multiple artworks simultaneously across different blockchain networks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="network">Select Blockchain Network</Label>
                      <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose network" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportedNetworks.filter(n => n.supported).map((network) => (
                            <SelectItem key={network.id} value={network.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{network.name}</span>
                                <Badge variant="outline">{network.securityLevel}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="royalty">Royalty Percentage (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={smartContractSettings.royaltyPercentage}
                        onChange={(e) => setSmartContractSettings(prev => ({
                          ...prev,
                          royaltyPercentage: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="license">License Terms</Label>
                      <Select
                        value={smartContractSettings.licenseTerms}
                        onValueChange={(value) => setSmartContractSettings(prev => ({
                          ...prev,
                          licenseTerms: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard License</SelectItem>
                          <SelectItem value="commercial">Commercial License</SelectItem>
                          <SelectItem value="exclusive">Exclusive License</SelectItem>
                          <SelectItem value="custom">Custom Terms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedNetwork && (
                      <Card className="p-4">
                        <h4 className="font-semibold mb-2">Network Details</h4>
                        {(() => {
                          const network = supportedNetworks.find(n => n.id === selectedNetwork);
                          return network ? (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Gas Price:</span>
                                <span>{network.gasPrice} {network.symbol}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Confirmation Time:</span>
                                <span>{network.confirmationTime}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Security Level:</span>
                                <Badge variant="outline">{network.securityLevel}</Badge>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </Card>
                    )}
                  </div>
                </div>

                {batchRegistering && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Registration Progress</span>
                      <span>{Math.round(registrationProgress)}%</span>
                    </div>
                    <Progress value={registrationProgress} />
                  </div>
                )}

                <Button
                  onClick={batchRegisterArtwork}
                  disabled={batchRegistering || selectedArtworks.length === 0}
                  className="w-full"
                >
                  {batchRegistering ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Registering on Blockchain...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Register Selected Artworks ({selectedArtworks.length})
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-6">
            <div className="grid gap-6">
              {certificates.map((cert) => (
                <div key={cert.id} className="relative">
                  {/* Certificate Design */}
                  <div className="bg-white border-4 border-gray-900 rounded-lg p-12 max-w-2xl mx-auto relative">
                    {/* TSMO Logo and Header */}
                    <div className="text-center mb-8">
                      <img 
                        src={tsmoLogo} 
                        alt="TSMO Logo" 
                        className="w-32 h-32 mx-auto mb-4"
                      />
                      <h1 className="text-3xl font-bold text-gray-900 tracking-wide">
                        BLOCKCHAIN CERTIFICATE
                      </h1>
                    </div>

                    {/* Certificate Details */}
                    <div className="space-y-4 text-gray-900">
                      <div>
                        <span className="font-bold">Certificate ID: </span>
                        <span>{cert.certificate_id}</span>
                      </div>
                      <div>
                        <span className="font-bold">Artwork Title: </span>
                        <span>{cert.artwork?.title || 'Untitled'}</span>
                      </div>
                      <div>
                        <span className="font-bold">Category: </span>
                        <span>{cert.artwork?.category || 'digital-art'}</span>
                      </div>
                      <div>
                        <span className="font-bold">Blockchain Hash:</span>
                        <div className="font-mono text-sm break-all mt-1">
                          {cert.blockchain_hash}
                        </div>
                      </div>
                      <div>
                        <span className="font-bold">Registration Date: </span>
                        <span>{new Date(cert.registration_timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Verification Text */}
                    <div className="text-center mt-12 mb-8">
                      <p className="text-gray-900 leading-relaxed">
                        This certificate verifies the ownership and authenticity<br />
                        of the above artwork on the blockchain.
                      </p>
                    </div>

                    {/* Generated Date */}
                    <div className="text-center">
                      <p className="text-gray-900">
                        Generated on: {new Date(cert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-4 mt-6">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Certificate
                    </Button>
                    
                    {cert.transaction_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(cert.transaction_url, '_blank')}
                      >
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        View on Explorer
                      </Button>
                    )}
                    
                    {!cert.nft_token_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => mintAsNFT(cert.certificate_id)}
                        disabled={nftMinting === cert.certificate_id}
                      >
                        {nftMinting === cert.certificate_id ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Minting...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Mint as NFT
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Additional Info Card */}
                  <Card className="mt-6 max-w-2xl mx-auto">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Network</p>
                          <p className="text-muted-foreground">{cert.blockchain_network}</p>
                        </div>
                        <div>
                          <p className="font-medium">Gas Fee</p>
                          <p className="text-muted-foreground">${cert.gas_fee?.toFixed(4) || '0'}</p>
                        </div>
                        <div>
                          <p className="font-medium">Confirmations</p>
                          <p className="text-muted-foreground">{cert.confirmation_blocks}</p>
                        </div>
                        <div>
                          <p className="font-medium">Status</p>
                          <Badge variant="outline">{cert.status}</Badge>
                        </div>
                      </div>

                      {cert.smart_contract_address && (
                        <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                          <p className="text-sm font-medium mb-1">Smart Contract</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-background px-2 py-1 rounded flex-1 break-all">
                              {cert.smart_contract_address}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigator.clipboard.writeText(cert.smart_contract_address!)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Advanced Analytics
                </CardTitle>
                <CardDescription>
                  Comprehensive insights into your blockchain activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <Button onClick={generateAdvancedReport} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Full Report
                  </Button>
                </div>
                
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                  <p>Advanced analytics dashboard coming soon</p>
                  <p className="text-sm">Track gas optimization, network performance, and ROI</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FeatureGuard>
  );
};

export default AdvancedBlockchain;