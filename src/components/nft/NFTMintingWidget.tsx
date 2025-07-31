
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function NFTMintingWidget() {
  const { user } = useAuth();

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>NFT Minting</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Blockchain NFT minting features are currently being configured. Please check back soon.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export default NFTMintingWidget;
