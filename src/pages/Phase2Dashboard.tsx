import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BlockchainOwnershipRegistry } from '@/components/blockchain/BlockchainOwnershipRegistry';
import { GlobalLegalNetwork } from '@/components/legal/GlobalLegalNetwork';
import { RealTimeLegalDashboard } from '@/components/legal/RealTimeLegalDashboard';
import { CreatorEconomy } from '@/components/phase2/CreatorEconomy';
import { Link2, Scale, Users, TrendingUp, MessageCircle } from 'lucide-react';

export default function Phase2Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Phase 2: Market Differentiation</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Blockchain ownership registry, global legal network, and creator economy integration
        </p>
        <Badge className="mt-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-background">
          Active & Operational
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Link2 className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-semibold mb-2">Blockchain Registry</h3>
            <p className="text-sm text-muted-foreground">
              Immutable proof of ownership with smart contracts and decentralized verification
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <Scale className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold mb-2">Global Legal Network</h3>
            <p className="text-sm text-muted-foreground">
              Real-time case management with 25+ country legal action capability
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-purple-500" />
            <h3 className="text-xl font-semibold mb-2">Creator Economy</h3>
            <p className="text-sm text-muted-foreground">
              Integration with OnlyFans, Patreon, Instagram and other creator platforms
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="blockchain" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="blockchain" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Blockchain Registry
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Legal Network
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Real-Time Legal
          </TabsTrigger>
          <TabsTrigger value="creator" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Creator Economy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blockchain">
          <BlockchainOwnershipRegistry />
        </TabsContent>

        <TabsContent value="legal">
          <GlobalLegalNetwork />
        </TabsContent>

        <TabsContent value="realtime">
          <RealTimeLegalDashboard />
        </TabsContent>

        <TabsContent value="creator">
          <CreatorEconomy />
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Phase 2 Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">✓</p>
              <p className="text-sm text-muted-foreground">Blockchain Registry</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">✓</p>
              <p className="text-sm text-muted-foreground">Global Legal Network</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">✓</p>
              <p className="text-sm text-muted-foreground">Creator Economy</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-500">100%</p>
              <p className="text-sm text-muted-foreground">Phase 2 Complete</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}