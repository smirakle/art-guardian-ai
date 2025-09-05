import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBlockchain } from '@/contexts/BlockchainContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Hash, Clock, FileText, ExternalLink, Verified } from 'lucide-react';

interface OwnershipRecord {
  id: string;
  transaction_hash: string;
  blockchain: string;
  contract_address: string | null;
  token_id: number | null;
  owner_address: string | null;
  metadata_uri: string | null;
  created_at: string;
  is_valid: boolean;
  block_number: number | null;
  block_timestamp: string | null;
  gas_used: number | null;
  gas_price: number | null;
  verification_timestamp: string;
  verification_metadata: any;
}

export function BlockchainOwnershipRegistry() {
  const { isConnected, address, connectWallet } = useBlockchain();
  const [ownershipRecords, setOwnershipRecords] = useState<OwnershipRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      fetchOwnershipRecords();
    }
  }, [isConnected, address]);

  const fetchOwnershipRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blockchain_verifications')
        .select(`
          *,
          artwork:artwork_id (
            id,
            title,
            image_url
          )
        `)
        .eq('owner_address', address?.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOwnershipRecords(data || []);
    } catch (error) {
      console.error('Failed to fetch ownership records:', error);
      toast.error('Failed to fetch ownership records');
    } finally {
      setLoading(false);
    }
  };

  const verifyOwnership = async (recordId: string) => {
    try {
      setVerifying(recordId);
      
      const { data, error } = await supabase.functions.invoke('blockchain-ownership-registry', {
        body: {
          action: 'verify_ownership',
          record_id: recordId
        }
      });

      if (error) throw error;

      toast.success('Ownership verification completed');
      fetchOwnershipRecords();
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error('Ownership verification failed');
    } finally {
      setVerifying(null);
    }
  };

  const createImmutableProof = async (artworkId: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('blockchain-ownership-registry', {
        body: {
          action: 'create_immutable_proof',
          artwork_id: artworkId,
          owner_address: address
        }
      });

      if (error) throw error;

      toast.success('Immutable proof created on blockchain');
      fetchOwnershipRecords();
    } catch (error) {
      console.error('Failed to create immutable proof:', error);
      toast.error('Failed to create immutable proof');
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatusBadge = (isValid: boolean) => {
    if (isValid) {
      return <Badge variant="default" className="bg-emerald-500"><Verified className="w-3 h-3 mr-1" />Verified</Badge>;
    } else {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Blockchain Ownership Registry
          </CardTitle>
          <CardDescription>
            Connect your wallet to access immutable ownership proofs and smart contract protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connectWallet} className="w-full">
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Blockchain Ownership Registry
          </CardTitle>
          <CardDescription>
            Immutable proof of ownership secured by blockchain technology
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{ownershipRecords.length}</div>
              <div className="text-sm text-muted-foreground">Registered Assets</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-emerald-500">
                {ownershipRecords.filter(r => r.is_valid).length}
              </div>
              <div className="text-sm text-muted-foreground">Verified Proofs</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500">
                {ownershipRecords.filter(r => r.contract_address).length}
              </div>
              <div className="text-sm text-muted-foreground">Smart Contracts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Loading ownership records...</div>
            </CardContent>
          </Card>
        ) : ownershipRecords.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                No ownership records found. Register your first artwork to get started.
              </div>
            </CardContent>
          </Card>
        ) : (
          ownershipRecords.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Ownership Record</h3>
                      <p className="text-sm text-muted-foreground">#{record.token_id}</p>
                    </div>
                  </div>
                  {getVerificationStatusBadge(record.is_valid)}
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Hash className="w-4 h-4" />
                        <span className="font-mono text-sm">{record.transaction_hash.substring(0, 20)}...</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://etherscan.io/tx/${record.transaction_hash}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Blockchain</label>
                      <p className="text-sm font-mono mt-1">{record.blockchain}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Contract Address</label>
                      <p className="text-sm font-mono mt-1">{record.contract_address}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Owner Address</label>
                      <p className="text-sm font-mono mt-1">{record.owner_address}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="text-sm mt-1">{new Date(record.created_at).toLocaleDateString()}</p>
                    </div>

                    {record.verification_metadata && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Verification Data</label>
                        <p className="text-sm font-mono mt-1">
                          Block #{record.block_number}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex gap-2">
                  {!record.is_valid && (
                    <Button
                      onClick={() => verifyOwnership(record.id)}
                      disabled={verifying === record.id}
                      size="sm"
                    >
                      {verifying === record.id ? 'Verifying...' : 'Verify Ownership'}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(record.metadata_uri, '_blank')}
                  >
                    View Metadata
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}