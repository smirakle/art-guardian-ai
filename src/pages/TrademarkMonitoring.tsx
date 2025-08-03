import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const TrademarkMonitoring: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleTrademarkScan = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a trademark name to search",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start a trademark scan",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    try {
      // First create a trademark record
      const { data: trademark, error: trademarkError } = await supabase
        .from('trademarks')
        .insert({
          user_id: user.id,
          trademark_name: searchQuery.trim(),
          jurisdiction: 'US',
          status: 'monitoring',
          description: `Trademark monitoring for "${searchQuery.trim()}"`
        })
        .select()
        .single();

      if (trademarkError) throw trademarkError;

      // Now start the monitoring scan
      const { data, error } = await supabase.functions.invoke('trademark-monitoring-engine', {
        body: {
          action: 'scan_trademark',
          trademark_id: trademark.id,
          scan_type: 'comprehensive',
          platforms: ['uspto', 'google', 'amazon'],
          search_terms: [searchQuery.trim()]
        }
      });

      if (error) throw error;

      toast({
        title: "Scan Started",
        description: `Trademark monitoring scan initiated for "${searchQuery}"`,
      });

      console.log('Scan results:', data);
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to start trademark monitoring scan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
              Trademark Monitoring
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Protect your brand with comprehensive trademark monitoring across multiple platforms
            </p>
          </div>

          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="search">Search & Monitor</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Trademark Search & Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="trademark-search">Trademark Name</Label>
                    <Input
                      id="trademark-search"
                      placeholder="Enter trademark name to monitor..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Our monitoring system will scan USPTO, EUIPO, Google, Amazon, and social media platforms for potential trademark conflicts.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    onClick={handleTrademarkScan}
                    disabled={isScanning}
                    className="w-full"
                  >
                    {isScanning ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Start Monitoring Scan
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Recent Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">High Risk Match Detected</p>
                          <p className="text-sm text-muted-foreground">Similar trademark found on USPTO</p>
                        </div>
                      </div>
                      <Badge variant="destructive">High Risk</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Domain Registration Alert</p>
                          <p className="text-sm text-muted-foreground">Similar domain registered recently</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Medium Risk</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Monitoring Complete</p>
                          <p className="text-sm text-muted-foreground">Weekly scan completed successfully</p>
                        </div>
                      </div>
                      <Badge variant="outline">Resolved</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Trademark Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary">0</div>
                      <div className="text-sm text-muted-foreground">Active Trademarks</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-muted-foreground">Protected Assets</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">0</div>
                      <div className="text-sm text-muted-foreground">Pending Renewals</div>
                    </div>
                  </div>
                  
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      No trademarks registered yet. Start by adding your first trademark to begin monitoring.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monitoring Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-sm text-muted-foreground">Total Scans</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-sm text-muted-foreground">Matches Found</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-sm text-muted-foreground">High Risk Alerts</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-sm text-muted-foreground">Actions Taken</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TrademarkMonitoring;