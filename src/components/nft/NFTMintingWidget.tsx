
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAccount, useChainId } from 'wagmi';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import WalletConnection from '@/components/blockchain/WalletConnection';
import RealNFTMinting from '@/components/blockchain/RealNFTMinting';
import { useAuth } from '@/contexts/AuthContext';

function NFTMintingWidget() {
  const { user } = useAuth();
  const { isConnected } = useAccount();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NFT Minting</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Please sign in to access NFT minting features.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NFT Minting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Connect your wallet to start minting NFTs on the blockchain.
            </AlertDescription>
          </Alert>
          <WalletConnection />
        </CardContent>
      </Card>
    );
  }

  return <RealNFTMinting onMintSuccess={(result) => {
    toast.success(`NFT #${result.tokenId} minted successfully!`);
  }} />;
}

export default NFTMintingWidget;
