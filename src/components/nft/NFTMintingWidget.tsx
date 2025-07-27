import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Coins, Zap, ExternalLink, Clock, TrendingUp } from 'lucide-react';

interface Certificate {
  id: string;
  certificate_id: string;
  artwork_id: string;
  certificate_data: any;
  created_at: string;
}

interface NFTData {
  tokenId?: number;
  contractAddress?: string;
  mintingHash?: string;
  opensea_url?: string;
  mintedAt?: string;
  royaltyPercentage?: number;
  transferable?: boolean;
  resellable?: boolean;
  network?: string;
}

const networks = [
  { 
    id: 'ethereum', 
    name: 'Ethereum', 
    symbol: 'ETH', 
    color: 'bg-blue-500',
    explorerUrl: 'https://etherscan.io',
    openseaBase: 'https://opensea.io/assets/ethereum'
  },
  { 
    id: 'polygon', 
    name: 'Polygon', 
    symbol: 'MATIC', 
    color: 'bg-purple-500',
    explorerUrl: 'https://polygonscan.com',
    openseaBase: 'https://opensea.io/assets/matic'
  },
  { 
    id: 'arbitrum', 
    name: 'Arbitrum', 
    symbol: 'ARB', 
    color: 'bg-blue-400',
    explorerUrl: 'https://arbiscan.io',
    openseaBase: 'https://opensea.io/assets/arbitrum'
  }
];

export default function NFTMintingWidget() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState('polygon');
  const [mintingStatus, setMintingStatus] = useState<Record<string, boolean>>({});
  const [nftData, setNftData] = useState<Record<string, NFTData>>({});
  const [royaltyPercentage, setRoyaltyPercentage] = useState(10);
  const [transferable, setTransferable] = useState(true);
  const [resellable, setResellable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('blockchain_certificates')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCertificates(data || []);
      
      // Extract NFT data from certificates
      const nftDataMap: Record<string, NFTData> = {};
      data?.forEach(cert => {
        const certData = cert.certificate_data as any;
        console.log('Certificate data:', cert.id, certData); // Debug log
        
        if (certData?.tokenId) {
          nftDataMap[cert.id] = {
            tokenId: certData.tokenId,
            contractAddress: certData.contractAddress || certData.nftContractAddress, // Fix mapping
            mintingHash: certData.mintingHash,
            opensea_url: certData.opensea_url,
            mintedAt: certData.mintedAt,
            royaltyPercentage: certData.royaltyPercentage,
            transferable: certData.transferable,
            resellable: certData.resellable,
            network: certData.network || 'polygon' // Extract network from certificate
          };
          console.log('NFT data extracted:', nftDataMap[cert.id]); // Debug log
        }
      });
      setNftData(nftDataMap);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const mintNFT = async (certificateId: string) => {
    setMintingStatus(prev => ({ ...prev, [certificateId]: true }));

    try {
      const { data, error } = await supabase.functions.invoke('nft-minting', {
        body: {
          certificateId,
          network: selectedNetwork,
          userId: user?.id,
          royaltyPercentage,
          metadata: {
            transferable,
            resellable
          }
        }
      });

      if (error) throw error;

      toast.success('NFT minted successfully!');
      
      // Update local state with new NFT data
      setNftData(prev => ({
        ...prev,
        [certificateId]: {
          tokenId: data.tokenId,
          contractAddress: data.contractAddress,
          mintingHash: data.mintingHash,
          opensea_url: data.opensea_url,
          mintedAt: new Date().toISOString(),
          royaltyPercentage,
          transferable,
          resellable,
          network: selectedNetwork
        }
      }));

      // Refresh certificates to get updated data
      await fetchCertificates();
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT');
    } finally {
      setMintingStatus(prev => ({ ...prev, [certificateId]: false }));
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            NFT Minting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-lg"></div>
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
          <Coins className="w-5 h-5" />
          NFT Minting
        </CardTitle>
        <div className="flex gap-4 mt-4">
          <div>
            <label className="text-sm font-medium">Network</label>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {networks.map(network => (
                  <SelectItem key={network.id} value={network.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${network.color}`} />
                      {network.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Royalty %</label>
            <Select value={royaltyPercentage.toString()} onValueChange={(value) => setRoyaltyPercentage(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 2.5, 5, 7.5, 10, 15, 20].map(percent => (
                  <SelectItem key={percent} value={percent.toString()}>
                    {percent}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {certificates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Coins className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No blockchain certificates available for minting</p>
            <p className="text-sm">Upload and register artwork to create NFTs</p>
          </div>
        ) : (
          certificates.map(certificate => {
            const isNFT = nftData[certificate.id];
            const isMinting = mintingStatus[certificate.id];

            return (
              <div key={certificate.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{certificate.certificate_id}</h4>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(certificate.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {isNFT ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Zap className="w-3 h-3 mr-1" />
                      NFT Minted
                    </Badge>
                  ) : (
                    <Button 
                      onClick={() => mintNFT(certificate.id)}
                      disabled={isMinting}
                      size="sm"
                    >
                      {isMinting ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Minting...
                        </>
                      ) : (
                        <>
                          <Coins className="w-4 h-4 mr-2" />
                          Mint NFT
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {isNFT && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Token ID:</span>
                        <p className="font-mono">#{isNFT.tokenId}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contract:</span>
                        <p className="font-mono">{formatAddress(isNFT.contractAddress || '')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Royalty:</span>
                        <p>{isNFT.royaltyPercentage}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Network:</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${networks.find(n => n.id === (isNFT.network || selectedNetwork))?.color}`} />
                          {networks.find(n => n.id === (isNFT.network || selectedNetwork))?.name}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {isNFT.opensea_url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(isNFT.opensea_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on OpenSea
                        </Button>
                      )}
                      
                      {isNFT.mintingHash && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const nftNetwork = isNFT.network || selectedNetwork;
                            const network = networks.find(n => n.id === nftNetwork);
                            const explorerUrl = network?.explorerUrl || 'https://polygonscan.com';
                            console.log('Opening transaction:', `${explorerUrl}/tx/${isNFT.mintingHash}`);
                            window.open(`${explorerUrl}/tx/${isNFT.mintingHash}`, '_blank');
                          }}
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          View Transaction
                        </Button>
                      )}
                      
                      {isNFT.contractAddress && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const nftNetwork = isNFT.network || selectedNetwork;
                            const network = networks.find(n => n.id === nftNetwork);
                            const explorerUrl = network?.explorerUrl || 'https://polygonscan.com';
                            console.log('Opening contract:', `${explorerUrl}/address/${isNFT.contractAddress}`);
                            window.open(`${explorerUrl}/address/${isNFT.contractAddress}`, '_blank');
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Contract
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}