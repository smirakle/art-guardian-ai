import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Upload, 
  Hash, 
  Link2, 
  CheckCircle, 
  Clock, 
  FileImage,
  Download,
  Copy,
  Fingerprint
} from 'lucide-react';

interface VerificationRecord {
  id: string;
  fileName: string;
  hash: string;
  blockchainId: string;
  timestamp: string;
  status: 'pending' | 'verified' | 'failed';
  transactionHash: string;
}

const BlockchainVerification = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationRecord, setVerificationRecord] = useState<VerificationRecord | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<VerificationRecord[]>([
    {
      id: '1',
      fileName: 'artwork_masterpiece.jpg',
      hash: '0xa7b3c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6',
      blockchainId: 'ETH-001234',
      timestamp: '2024-01-15 14:30:25',
      status: 'verified',
      transactionHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
    },
    {
      id: '2',
      fileName: 'digital_creation.png',
      hash: '0xf2e9c6b3a0d7e4f1a8b5c2d9e6f3a0b7c4d1e8f5a2b9c6d3e0f7a4b1c8d5e2f9',
      blockchainId: 'ETH-001235',
      timestamp: '2024-01-14 09:15:42',
      status: 'verified',
      transactionHash: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e'
    }
  ]);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setVerificationRecord(null);
    }
  };

  const generateHash = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      // Simulate hash generation
      setTimeout(() => {
        const hash = `0x${Math.random().toString(16).substr(2, 64)}`;
        resolve(hash);
      }, 1000);
    });
  };

  const verifyOnBlockchain = async () => {
    if (!selectedFile) return;

    setIsVerifying(true);
    setVerificationProgress(0);

    try {
      // Step 1: Generate hash
      setVerificationProgress(25);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const hash = await generateHash(selectedFile);

      // Step 2: Submit to blockchain
      setVerificationProgress(50);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Await confirmation
      setVerificationProgress(75);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Generate certificate
      setVerificationProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

      const newRecord: VerificationRecord = {
        id: Date.now().toString(),
        fileName: selectedFile.name,
        hash,
        blockchainId: `ETH-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
        timestamp: new Date().toLocaleString(),
        status: 'verified',
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
      };

      setVerificationRecord(newRecord);
      setVerificationHistory(prev => [newRecord, ...prev]);

      toast({
        title: "Blockchain Verification Complete",
        description: "Your artwork has been successfully registered on the blockchain.",
      });

    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "There was an error during blockchain verification.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
      setVerificationProgress(0);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Hash has been copied to your clipboard.",
    });
  };

  const downloadCertificate = (record: VerificationRecord) => {
    const certificate = {
      fileName: record.fileName,
      hash: record.hash,
      blockchainId: record.blockchainId,
      timestamp: record.timestamp,
      transactionHash: record.transactionHash,
      certificateId: `TSMO-CERT-${record.id}`,
      issuer: "TSMO Blockchain Verification System"
    };

    const blob = new Blob([JSON.stringify(certificate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TSMO_Certificate_${record.fileName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Blockchain Verification
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Create immutable proof of creation and ownership through blockchain technology. 
            Secure your intellectual property with cryptographic verification.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Upload & Verification Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Artwork for Verification
              </CardTitle>
              <CardDescription>
                Upload your digital artwork to create a blockchain-verified certificate of authenticity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="artwork-upload"
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf"
                  onChange={handleFileSelect}
                />
                <label htmlFor="artwork-upload" className="cursor-pointer">
                  <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to select your artwork file
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports images, videos, audio, and PDFs
                  </p>
                </label>
              </div>

              {selectedFile && (
                <div className="bg-secondary/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Badge variant="outline">Ready</Badge>
                  </div>
                </div>
              )}

              {isVerifying && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Verification Progress</span>
                    <span>{verificationProgress}%</span>
                  </div>
                  <Progress value={verificationProgress} className="w-full" />
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {verificationProgress < 25 && "Generating cryptographic hash..."}
                    {verificationProgress >= 25 && verificationProgress < 50 && "Submitting to blockchain..."}
                    {verificationProgress >= 50 && verificationProgress < 75 && "Awaiting blockchain confirmation..."}
                    {verificationProgress >= 75 && "Generating certificate..."}
                  </div>
                </div>
              )}

              <Button 
                onClick={verifyOnBlockchain} 
                disabled={!selectedFile || isVerifying}
                className="w-full"
                size="lg"
              >
                {isVerifying ? "Verifying..." : "Verify on Blockchain"}
              </Button>
            </CardContent>
          </Card>

          {/* Verification Result */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Verification Result
              </CardTitle>
              <CardDescription>
                Your blockchain verification certificate and proof of ownership
              </CardDescription>
            </CardHeader>
            <CardContent>
              {verificationRecord ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCertificate(verificationRecord)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">File Name</label>
                      <p className="font-mono text-sm">{verificationRecord.fileName}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Blockchain ID</label>
                      <p className="font-mono text-sm">{verificationRecord.blockchainId}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Cryptographic Hash</label>
                      <div className="flex items-center space-x-2">
                        <p className="font-mono text-xs break-all bg-secondary p-2 rounded flex-1">
                          {verificationRecord.hash}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(verificationRecord.hash)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
                      <div className="flex items-center space-x-2">
                        <p className="font-mono text-xs break-all bg-secondary p-2 rounded flex-1">
                          {verificationRecord.transactionHash}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(verificationRecord.transactionHash)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                      <p className="font-mono text-sm">{verificationRecord.timestamp}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Fingerprint className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Upload and verify your artwork to see the blockchain certificate
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Verification History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hash className="h-5 w-5 mr-2" />
              Verification History
            </CardTitle>
            <CardDescription>
              Your previous blockchain verifications and certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verificationHistory.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                      <span className="font-medium">{record.fileName}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCertificate(record)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Certificate
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Blockchain ID:</span>
                      <p className="font-mono">{record.blockchainId}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Verified:</span>
                      <p>{record.timestamp}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">Hash:</span>
                      <div className="flex items-center space-x-2">
                        <p className="font-mono text-xs break-all bg-secondary p-2 rounded flex-1">
                          {record.hash}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(record.hash)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlockchainVerification;