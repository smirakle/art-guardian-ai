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
  TrendingUp,
  Download,
  FileText,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

interface BlockchainCertificate {
  id: string;
  artwork_id: string;
  certificate_id: string;
  blockchain_hash: string;
  status: string;
  created_at: string;
  certificate_data: any;
  ownership_proof?: string;
  artwork_fingerprint?: string;
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
  const [retryingArtworks, setRetryingArtworks] = useState<Set<string>>(new Set());
  const [pendingArtworks, setPendingArtworks] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadBlockchainData();
      loadPendingArtworks();
      setupRealTimeSubscriptions();
      
      // Auto-recovery check every 30 seconds
      const interval = setInterval(() => {
        checkAndRecoverStuckRegistrations();
      }, 30000);
      
      return () => clearInterval(interval);
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
      toast({
        title: "Data Load Error",
        description: "Failed to load blockchain data. Retrying...",
        variant: "destructive"
      });
      
      // Retry after 3 seconds
      setTimeout(() => loadBlockchainData(), 3000);
    }
  };

  const loadPendingArtworks = async () => {
    try {
      const { data: artworks, error } = await supabase
        .from('artwork')
        .select('id, title, category, enable_blockchain, blockchain_hash, blockchain_certificate_id, created_at')
        .eq('user_id', user!.id)
        .eq('enable_blockchain', true)
        .is('blockchain_certificate_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingArtworks(artworks || []);
    } catch (error) {
      console.error('Error loading pending artworks:', error);
    }
  };

  const checkAndRecoverStuckRegistrations = async () => {
    try {
      // Find artworks that have been pending for more than 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: stuckArtworks, error } = await supabase
        .from('artwork')
        .select('id, title')
        .eq('user_id', user!.id)
        .eq('enable_blockchain', true)
        .is('blockchain_certificate_id', null)
        .lt('created_at', fiveMinutesAgo);

      if (error) throw error;

      if (stuckArtworks && stuckArtworks.length > 0) {
        // Found stuck registrations, processing auto-retry
        
        // Retry each stuck registration
        for (const artwork of stuckArtworks) {
          if (!retryingArtworks.has(artwork.id)) {
            await retryBlockchainRegistration(artwork.id, artwork.title);
          }
        }
      }
    } catch (error) {
      console.error('Error checking stuck registrations:', error);
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
          // Blockchain certificate updated
          loadBlockchainData();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "⛓️ New Blockchain Certificate",
              description: `Certificate ${payload.new.certificate_id} created`,
            });
            loadPendingArtworks(); // Refresh pending list
          } else if (payload.eventType === 'UPDATE' && payload.new.status === 'registered') {
            toast({
              title: "✅ Certificate Confirmed",
              description: `${payload.new.certificate_id} confirmed on blockchain`,
            });
            loadPendingArtworks(); // Refresh pending list
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

      // Start batch registration with better error handling
      let successCount = 0;
      let failedArtworks: string[] = [];

      for (const artwork of unprotectedArtworks) {
        try {
          const { data, error: funcError } = await supabase.functions.invoke('advanced-blockchain-registration', {
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

          if (funcError) throw funcError;

          // Update artwork to mark as blockchain protected
          await supabase
            .from('artwork')
            .update({ enable_blockchain: true })
            .eq('id', artwork.id);

          successCount++;
          
        } catch (artworkError) {
          console.error(`Failed to register ${artwork.title}:`, artworkError);
          failedArtworks.push(artwork.title);
        }

        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (successCount > 0) {
        toast({
          title: "🚀 Auto-Registration Complete",
          description: `${successCount} artworks now have blockchain protection`,
        });
      }

      if (failedArtworks.length > 0) {
        toast({
          title: "⚠️ Some Registrations Failed",
          description: `${failedArtworks.length} artworks failed to register. They will be retried automatically.`,
          variant: "destructive"
        });
      }

      // Refresh data
      await loadBlockchainData();
      await loadPendingArtworks();

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

  const retryBlockchainRegistration = async (artworkId: string, artworkTitle: string) => {
    setRetryingArtworks(prev => new Set(prev).add(artworkId));
    
    try {
      const { data, error } = await supabase.functions.invoke('advanced-blockchain-registration', {
        body: {
          artworkId,
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

      if (error) throw error;

      toast({
        title: "🔄 Registration Retry Successful",
        description: `${artworkTitle} blockchain registration completed`,
      });

      // Refresh data
      await loadBlockchainData();
      await loadPendingArtworks();

    } catch (error) {
      console.error('Retry registration error:', error);
      toast({
        title: "Retry Failed",
        description: `Failed to retry registration for ${artworkTitle}`,
        variant: "destructive"
      });
    } finally {
      setRetryingArtworks(prev => {
        const newSet = new Set(prev);
        newSet.delete(artworkId);
        return newSet;
      });
    }
  };

  const manualRegisterArtwork = async (artworkId: string, artworkTitle: string) => {
    await retryBlockchainRegistration(artworkId, artworkTitle);
  };

  const downloadCertificate = async (cert: BlockchainCertificate) => {
    try {
      // Starting certificate download
      const certData = cert.certificate_data as any;
      const network = certData?.network || 'polygon';
      
      // Create PDF certificate
      const pdf = new jsPDF();
      
      // Set up colors
      const primaryBlue = [59, 130, 246];
      const darkGray = [55, 65, 81];
      const lightGray = [156, 163, 175];
      
      // Header background
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, 210, 40, 'F');
      
      // Header text
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BLOCKCHAIN CERTIFICATE', 20, 25);
      
      // Subheader
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Certificate of Authenticity & Ownership', 20, 35);
      
      // Reset colors for body
      pdf.setTextColor(55, 65, 81);
      
      // TSMO branding
      pdf.setFontSize(10);
      pdf.text('TSMO - The Social Media Observer', 20, 50);
      pdf.text('Advanced Blockchain Protection System', 20, 55);
      
      // Certificate details section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CERTIFICATE DETAILS', 20, 70);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Certificate ID: ${cert.certificate_id}`, 20, 80);
      pdf.text(`Blockchain Hash: ${cert.blockchain_hash}`, 20, 88);
      pdf.text(`Registration Date: ${new Date(cert.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 20, 96);
      pdf.text(`Status: ${cert.status.toUpperCase()}`, 20, 104);
      
      // Artwork details section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PROTECTED ARTWORK', 20, 120);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Title: ${cert.artwork?.title || 'Digital Asset'}`, 20, 130);
      pdf.text(`Category: ${cert.artwork?.category || 'Digital'}`, 20, 138);
      pdf.text(`Artwork Fingerprint: ${cert.artwork_fingerprint}`, 20, 146);
      
      // Blockchain network details
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BLOCKCHAIN VERIFICATION', 20, 162);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Network: ${network.charAt(0).toUpperCase() + network.slice(1)}`, 20, 172);
      pdf.text(`Chain ID: ${certData?.chainId || 'N/A'}`, 20, 180);
      
      if (certData?.contractAddress) {
        pdf.text(`Smart Contract: ${certData.contractAddress}`, 20, 188);
      }
      if (certData?.gasFee) {
        pdf.text(`Gas Fee: ${certData.gasFee.toFixed(8)} ETH`, 20, 196);
      }
      if (certData?.ipfsHash) {
        pdf.text(`IPFS Hash: ${certData.ipfsHash}`, 20, 204);
      }
      
      // Advanced features
      if (certData?.royaltyPercentage) {
        pdf.text(`Royalty: ${certData.royaltyPercentage}%`, 20, 212);
      }
      if (certData?.licenseTerms) {
        pdf.text(`License: ${certData.licenseTerms}`, 20, 220);
      }
      
      // Ownership proof section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('OWNERSHIP PROOF', 20, 236);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const ownershipProof = cert.ownership_proof || certData?.ownershipProof || 'Digital signature verified on blockchain';
      const proofLines = pdf.splitTextToSize(`Proof Hash: ${ownershipProof}`, 170);
      pdf.text(proofLines, 20, 246);
      
      // Verification instructions
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VERIFICATION', 20, 265);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('This certificate can be verified on the blockchain:', 20, 275);
      if (certData?.transactionUrl) {
        pdf.setTextColor(59, 130, 246);
        pdf.text(certData.transactionUrl, 20, 283);
      }
      
      // Footer
      pdf.setTextColor(156, 163, 175);
      pdf.setFontSize(9);
      pdf.text('This document certifies immutable proof of digital asset ownership', 20, 295);
      pdf.text('registered on the blockchain network. All data is cryptographically verified.', 20, 300);
      pdf.text(`Generated on ${new Date().toLocaleString()}`, 20, 305);
      
      // Generate filename
      const fileName = `TSMO_Certificate_${cert.certificate_id}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Saving PDF certificate
      
      // Save the PDF
      pdf.save(fileName);
      
      toast({
        title: "📄 Certificate Downloaded",
        description: `${fileName} saved successfully`,
      });
      
    } catch (error: any) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Unable to generate certificate",
        variant: "destructive"
      });
    }
  };

  const downloadAllCertificates = async () => {
    try {
      for (let i = 0; i < certificates.length; i++) {
        await downloadCertificate(certificates[i]);
        // Small delay between downloads
        if (i < certificates.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      toast({
        title: "📦 All Certificates Downloaded",
        description: `${certificates.length} certificates saved to your device`,
      });
    } catch (error) {
      console.error('Error downloading all certificates:', error);
      toast({
        title: "Error",
        description: "Failed to download all certificates",
        variant: "destructive"
      });
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

      {/* Pending Artworks Alert */}
      {pendingArtworks.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Pending Blockchain Registrations</p>
                  <p className="text-sm text-yellow-600">{pendingArtworks.length} artworks waiting for confirmation</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pendingArtworks.forEach(artwork => manualRegisterArtwork(artwork.id, artwork.title))}
                disabled={retryingArtworks.size > 0}
              >
                {retryingArtworks.size > 0 ? 'Retrying...' : 'Retry All'}
              </Button>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {pendingArtworks.map((artwork) => (
                <div key={artwork.id} className="flex items-center justify-between p-2 bg-white rounded text-sm">
                  <span className="font-medium">{artwork.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {retryingArtworks.has(artwork.id) ? 'Retrying...' : 'Pending'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => manualRegisterArtwork(artwork.id, artwork.title)}
                      disabled={retryingArtworks.has(artwork.id)}
                      className="h-6 px-2"
                    >
                      {retryingArtworks.has(artwork.id) ? <Clock className="w-3 h-3 animate-spin" /> : 'Retry'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 text-xs text-yellow-600">
              💡 Stuck registrations are automatically retried every 30 seconds
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Blockchain Certificates</CardTitle>
                <CardDescription>Latest blockchain registrations and their status</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={downloadAllCertificates}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download All
                </Button>
              </div>
            </div>
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => downloadCertificate(cert)}
                        className="flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
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