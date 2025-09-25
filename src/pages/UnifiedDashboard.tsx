import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  Users,
  Link2,
  Scale,
  Brain,
  Zap,
  Eye,
  Upload,
  Settings,
  BarChart3
} from 'lucide-react';

// Import consolidated components
import { ProductionDashboard } from '@/components/dashboard/ProductionDashboard';
import { AIDetectionDashboard } from '@/components/phase1/AIDetectionDashboard';
import { OneClickProtection } from '@/components/phase1/OneClickProtection';
import { BlockchainOwnershipRegistry } from '@/components/blockchain/BlockchainOwnershipRegistry';
import { GlobalLegalNetwork } from '@/components/legal/GlobalLegalNetwork';
import { RealTimeLegalDashboard } from '@/components/legal/RealTimeLegalDashboard';
import { CreatorEconomy } from '@/components/phase2/CreatorEconomy';
import { MultiModalAIProtection } from '@/components/multi-modal/MultiModalAIProtection';

const UnifiedDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Unified Protection Dashboard</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Complete overview of your IP protection across all phases and technologies
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500">
            Phase 1: Core Protection
          </Badge>
          <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500">
            Phase 2: Market Differentiation
          </Badge>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
            Phase 3: Technological Superiority
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-sm text-muted-foreground">Protected Assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">56</div>
            <p className="text-sm text-muted-foreground">Active Scans</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">8</div>
            <p className="text-sm text-muted-foreground">Threats</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Link2 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">342</div>
            <p className="text-sm text-muted-foreground">Blockchain Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Scale className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">Legal Actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">94.7%</div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="phase1" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Core Protection
          </TabsTrigger>
          <TabsTrigger value="phase2" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Market Edge
          </TabsTrigger>
          <TabsTrigger value="phase3" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Advanced AI
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Legal Network
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Blockchain
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Production
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Phase Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Phase Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Phase 1: Core Protection</span>
                    <Badge className="bg-green-500">Complete</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Phase 2: Market Differentiation</span>
                    <Badge className="bg-blue-500">Active</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-4/5"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Phase 3: Tech Superiority</span>
                    <Badge className="bg-purple-500">In Progress</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full w-3/5"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>3 new assets protected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span>AI training violation detected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-blue-500" />
                    <span>Blockchain record created</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-purple-500" />
                    <span>Legal action initiated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-indigo-500" />
                    <span>Portfolio scan completed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" size="sm">
                  <Upload className="h-3 w-3 mr-2" />
                  Upload & Protect
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Eye className="h-3 w-3 mr-2" />
                  Start Monitoring
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Brain className="h-3 w-3 mr-2" />
                  Configure AI Protection
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Scale className="h-3 w-3 mr-2" />
                  Legal Templates
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Phase 1: Core Protection */}
        <TabsContent value="phase1" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  One-Click Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OneClickProtection />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-3xl font-bold text-green-500">94.7%</div>
                  <p className="text-sm text-muted-foreground">Detection Accuracy</p>
                  <Button className="w-full">View Detection Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <AIDetectionDashboard />
        </TabsContent>

        {/* Phase 2: Market Differentiation */}
        <TabsContent value="phase2" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Link2 className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-xl font-semibold mb-2">Blockchain Registry</h3>
                <p className="text-sm text-muted-foreground">
                  Immutable proof of ownership with smart contracts
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <Scale className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-semibold mb-2">Legal Network</h3>
                <p className="text-sm text-muted-foreground">
                  Global network of IP attorneys and legal experts
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <h3 className="text-xl font-semibold mb-2">Creator Economy</h3>
                <p className="text-sm text-muted-foreground">
                  Monetization and licensing platform integration
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <BlockchainOwnershipRegistry />
            <CreatorEconomy />
          </div>
        </TabsContent>

        {/* Phase 3: Advanced AI */}
        <TabsContent value="phase3" className="space-y-6">
          <MultiModalAIProtection />
        </TabsContent>

        {/* Legal Network */}
        <TabsContent value="legal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlobalLegalNetwork />
            <RealTimeLegalDashboard />
          </div>
        </TabsContent>

        {/* Blockchain */}
        <TabsContent value="blockchain" className="space-y-6">
          <BlockchainOwnershipRegistry />
        </TabsContent>

        {/* Production */}
        <TabsContent value="production" className="space-y-6">
          <ProductionDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedDashboard;