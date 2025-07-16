import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Download
} from "lucide-react";
import tsmoLogo from "@/assets/tsmo-logo.png";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface BlockchainCertificate {
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
  artwork?: {
    title: string;
    description: string;
    category: string;
  };
}

interface ArtworkItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  blockchain_hash: string | null;
  blockchain_certificate_id: string | null;
  blockchain_registered_at: string | null;
  created_at: string;
}

const BlockchainVerification = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<BlockchainCertificate[]>([]);
  const [unregisteredArtwork, setUnregisteredArtwork] = useState<ArtworkItem[]>([]);
  const [registering, setRegistering] = useState<string | null>(null);
  const [verificationQuery, setVerificationQuery] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCertificates();
      fetchUnregisteredArtwork();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('blockchain_certificates')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch artwork details separately to avoid join issues
      const certificatesWithArtwork = await Promise.all(
        (data || []).map(async (cert) => {
          const { data: artwork } = await supabase
            .from('artwork')
            .select('title, description, category')
            .eq('id', cert.artwork_id)
            .single();
          
          return {
            ...cert,
            artwork: artwork || undefined
          };
        })
      );

      setCertificates(certificatesWithArtwork);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const fetchUnregisteredArtwork = async () => {
    try {
      const { data, error } = await supabase
        .from('artwork')
        .select('*')
        .eq('user_id', user!.id)
        .is('blockchain_certificate_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUnregisteredArtwork(data || []);
    } catch (error) {
      console.error('Error fetching unregistered artwork:', error);
    }
  };

  const registerArtwork = async (artworkId: string) => {
    if (!user) return;

    setRegistering(artworkId);
    try {
      const artwork = unregisteredArtwork.find(a => a.id === artworkId);
      if (!artwork) return;

      const { data, error } = await supabase.functions.invoke('blockchain-registration', {
        body: {
          artworkId: artwork.id,
          title: artwork.title,
          description: artwork.description,
          category: artwork.category,
          filePaths: [],
          userEmail: user.email || 'unknown@example.com',
          userId: user.id
        }
      });

      if (error) throw error;

      if (data?.certificate) {
        toast({
          title: "Blockchain Registration Successful!",
          description: `Certificate ID: ${data.certificate.certificateId}`,
        });
        
        await fetchCertificates();
        await fetchUnregisteredArtwork();
      }
    } catch (error: any) {
      console.error('Blockchain registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register artwork on blockchain",
        variant: "destructive",
      });
    } finally {
      setRegistering(null);
    }
  };

  const verifyArtwork = async () => {
    if (!verificationQuery.trim()) {
      toast({
        title: "Invalid Query",
        description: "Please enter a certificate ID or blockchain hash to verify",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    setVerificationResult(null);

    try {
      // First try to find by certificate ID
      let { data, error } = await supabase
        .from('blockchain_certificates')
        .select('*')
        .eq('certificate_id', verificationQuery)
        .single();

      // If not found by certificate ID, try by blockchain hash
      if (error && error.code === 'PGRST116') {
        const { data: hashData, error: hashError } = await supabase
          .from('blockchain_certificates')
          .select('*')
          .eq('blockchain_hash', verificationQuery)
          .single();

        data = hashData;
        error = hashError;
      }

      if (error) {
        if (error.code === 'PGRST116') {
          setVerificationResult({
            found: false,
            message: "No blockchain certificate found for this query"
          });
        } else {
          throw error;
        }
      } else {
        // Fetch artwork details separately
        const { data: artwork } = await supabase
          .from('artwork')
          .select('title, description, category')
          .eq('id', data.artwork_id)
          .single();

        setVerificationResult({
          found: true,
          certificate: {
            ...data,
            artwork: artwork || undefined
          },
          message: "Artwork verified on blockchain"
        });
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify artwork",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const downloadCertificate = async (cert: BlockchainCertificate) => {
    try {
      // Fetch artwork details with file paths
      const { data: artwork } = await supabase
        .from('artwork')
        .select('title, description, category, file_paths')
        .eq('id', cert.artwork_id)
        .single();

      if (!artwork) {
        toast({
          title: "Error",
          description: "Artwork not found",
          variant: "destructive",
        });
        return;
      }

      // Create a canvas for the certificate
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size (A4 proportions)
      canvas.width = 800;
      canvas.height = 1130;

      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Load and draw TSMO logo
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      logoImg.onload = async () => {
        // Draw TSMO logo
        ctx.drawImage(logoImg, 50, 50, 200, 100);

        // Add title
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BLOCKCHAIN CERTIFICATE', canvas.width / 2, 200);

        // Add certificate details
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Certificate ID: ${cert.certificate_id}`, 80, 280);
        ctx.fillText(`Artwork Title: ${artwork.title}`, 80, 320);
        ctx.fillText(`Category: ${artwork.category}`, 80, 360);
        if (artwork.description) {
          ctx.fillText(`Description: ${artwork.description.substring(0, 60)}...`, 80, 400);
        }
        ctx.fillText(`Blockchain Hash: ${cert.blockchain_hash}`, 80, 440);
        ctx.fillText(`Registration Date: ${new Date(cert.registration_timestamp).toLocaleDateString()}`, 80, 480);

        // Try to load artwork thumbnail
        if (artwork.file_paths && artwork.file_paths.length > 0) {
          const firstFilePath = artwork.file_paths[0];
          const { data: fileData } = await supabase.storage
            .from('artwork')
            .download(firstFilePath);

          if (fileData) {
            const thumbnailImg = new Image();
            thumbnailImg.crossOrigin = 'anonymous';
            thumbnailImg.onload = () => {
              // Draw thumbnail
              ctx.drawImage(thumbnailImg, 80, 520, 200, 200);
              
              // Add verification text
              ctx.font = '16px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('This certificate verifies the ownership and authenticity', canvas.width / 2, 800);
              ctx.fillText('of the above artwork on the blockchain.', canvas.width / 2, 830);
              
              // Add timestamp
              ctx.fillText(`Generated on: ${new Date().toLocaleDateString()}`, canvas.width / 2, 900);
              
              // Convert canvas to blob and download
              canvas.toBlob((blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `TSMO_Certificate_${cert.certificate_id}.png`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  
                  toast({
                    title: "Certificate Downloaded",
                    description: "Your blockchain certificate has been downloaded successfully",
                  });
                }
              }, 'image/png');
            };
            
            thumbnailImg.src = URL.createObjectURL(fileData);
          } else {
            // Generate certificate without thumbnail
            generateCertificateWithoutThumbnail();
          }
        } else {
          // Generate certificate without thumbnail
          generateCertificateWithoutThumbnail();
        }

        function generateCertificateWithoutThumbnail() {
          // Add verification text
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('This certificate verifies the ownership and authenticity', canvas.width / 2, 600);
          ctx.fillText('of the above artwork on the blockchain.', canvas.width / 2, 630);
          
          // Add timestamp
          ctx.fillText(`Generated on: ${new Date().toLocaleDateString()}`, canvas.width / 2, 700);
          
          // Convert canvas to blob and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `TSMO_Certificate_${cert.certificate_id}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              
              toast({
                title: "Certificate Downloaded",
                description: "Your blockchain certificate has been downloaded successfully",
              });
            }
          }, 'image/png');
        }
      };

      logoImg.src = tsmoLogo;
      
    } catch (error: any) {
      console.error('Certificate download error:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download certificate",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          Please sign in to access blockchain verification features.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Blockchain Verification
        </h2>
        <p className="text-muted-foreground">
          Create immutable proof of ownership and verify artwork authenticity
        </p>
      </div>

      <Tabs defaultValue="certificates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="certificates">
            <FileText className="w-4 h-4 mr-2" />
            My Certificates
          </TabsTrigger>
          <TabsTrigger value="register">
            <Key className="w-4 h-4 mr-2" />
            Register Artwork
          </TabsTrigger>
          <TabsTrigger value="verify">
            <Search className="w-4 h-4 mr-2" />
            Verify Artwork
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                My Blockchain Certificates
              </CardTitle>
              <CardDescription>
                View all your blockchain-verified artwork certificates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No blockchain certificates yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Register your artwork to create blockchain certificates
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <Card key={cert.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">
                                {cert.artwork?.title || 'Untitled Artwork'}
                              </h3>
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="w-4 h-4" />
                                {cert.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {cert.artwork?.description || 'No description'}
                            </p>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Certificate ID:</span>
                                <code className="bg-muted px-2 py-1 rounded">{cert.certificate_id}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(cert.certificate_id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-right text-xs text-muted-foreground">
                              <p>Registered</p>
                              <p>{new Date(cert.registration_timestamp).toLocaleDateString()}</p>
                            </div>
                            <Button
                              onClick={() => downloadCertificate(cert)}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Register Artwork on Blockchain
              </CardTitle>
              <CardDescription>
                Create immutable proof of ownership for your artwork
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unregisteredArtwork.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">All your artwork is already registered!</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload new artwork to register it on the blockchain
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unregisteredArtwork.map((artwork) => (
                    <Card key={artwork.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{artwork.title}</h3>
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                <Clock className="w-3 h-3 mr-1" />
                                Not Registered
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {artwork.description || 'No description'}
                            </p>
                          </div>
                          <Button
                            onClick={() => registerArtwork(artwork.id)}
                            disabled={registering === artwork.id}
                            className="flex items-center gap-2"
                          >
                            {registering === artwork.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Registering...
                              </>
                            ) : (
                              <>
                                <Shield className="w-4 h-4" />
                                Register
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Verify Artwork Authenticity
              </CardTitle>
              <CardDescription>
                Verify any artwork using its certificate ID or blockchain hash
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-query">Certificate ID or Blockchain Hash</Label>
                <div className="flex gap-2">
                  <Input
                    id="verification-query"
                    placeholder="Enter certificate ID or blockchain hash..."
                    value={verificationQuery}
                    onChange={(e) => setVerificationQuery(e.target.value)}
                  />
                  <Button 
                    onClick={verifyArtwork}
                    disabled={verifying}
                    className="flex items-center gap-2"
                  >
                    {verifying ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    Verify
                  </Button>
                </div>
              </div>

              {verificationResult && (
                <Alert className={verificationResult.found ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <div className="flex items-center gap-2">
                    {verificationResult.found ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <AlertDescription className={verificationResult.found ? 'text-green-800' : 'text-red-800'}>
                      {verificationResult.message}
                    </AlertDescription>
                  </div>

                  {verificationResult.found && verificationResult.certificate && (
                    <div className="mt-4 p-4 bg-white rounded-lg border space-y-2">
                      <h4 className="font-medium">{verificationResult.certificate.artwork?.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {verificationResult.certificate.artwork?.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-medium">Certificate ID:</span>
                          <br />
                          <code className="bg-muted px-2 py-1 rounded">
                            {verificationResult.certificate.certificate_id}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Registration Date:</span>
                          <br />
                          <span>{new Date(verificationResult.certificate.registration_timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlockchainVerification;