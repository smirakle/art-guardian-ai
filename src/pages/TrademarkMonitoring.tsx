import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Globe, Shield, Zap, AlertTriangle, BarChart3, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AdvancedTrademarkSearch from "@/components/trademark/AdvancedTrademarkSearch";
import TrademarkAnalytics from "@/components/trademark/TrademarkAnalytics";
import TrademarkPortfolio from "@/components/trademark/TrademarkPortfolio";
import RealTimeTrademarkAlerts from "@/components/trademark/RealTimeTrademarkAlerts";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface SearchParameters {
  query: string;
  searchType: 'text' | 'image' | 'phonetic' | 'semantic';
  jurisdictions: string[];
  classifications: string[];
  similarityThreshold: number;
  platforms: string[];
  includeExpired: boolean;
  fuzzyMatching: boolean;
  searchDepth: 'surface' | 'deep' | 'comprehensive';
}

const TrademarkMonitoring: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAdvancedSearch = async (searchParams: SearchParameters) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start a trademark search",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    try {
      console.log('Starting real trademark search with params:', searchParams);
      
      // Perform real trademark search using USPTO API
      const { data: searchData, error: searchError } = await supabase.functions
        .invoke('real-trademark-search', {
          body: {
            action: 'search',
            query: searchParams.query.trim(),
            jurisdictions: searchParams.jurisdictions || ['US'],
            classifications: searchParams.classifications || [],
            similarity_threshold: searchParams.similarityThreshold || 0.8,
            platforms: searchParams.platforms || ['USPTO'],
            user_id: user.id
          }
        });

      if (searchError) {
        console.error('Real search error:', searchError);
        throw new Error(`Search failed: ${searchError.message}`);
      }

      console.log('Real search completed:', searchData);

      const totalMatches = searchData?.data?.total_matches || 0;
      const highRiskMatches = searchData?.data?.high_risk_matches || 0;
      const searchDuration = searchData?.data?.search_duration_ms || 0;

      toast({
        title: "Real Trademark Search Completed",
        description: `Found ${totalMatches} matches (${highRiskMatches} high-risk) in ${Math.round(searchDuration)}ms`,
      });

      // Create trademark record if high-risk matches found
      if (highRiskMatches > 0) {
        const { data: trademark, error: trademarkError } = await supabase
          .from('trademarks')
          .insert({
            user_id: user.id,
            trademark_name: searchParams.query.trim(),
            jurisdiction: searchParams.jurisdictions[0] || 'US',
            status: 'monitoring',
            description: `Real search found ${highRiskMatches} high-risk conflicts`,
            trademark_class: searchParams.classifications || []
          })
          .select()
          .single();

        if (!trademarkError && highRiskMatches >= 3) {
          // Create high-priority alert for significant conflicts
          await supabase.from('trademark_alerts').insert({
            user_id: user.id,
            trademark_id: trademark.id,
            alert_type: 'high_risk_conflicts',
            severity: 'critical',
            title: 'Critical Trademark Conflicts Detected',
            description: `Found ${highRiskMatches} high-risk conflicts for "${searchParams.query.trim()}". Immediate legal review recommended.`,
            status: 'pending',
            evidence_data: {
              search_results: searchData?.data,
              search_params: JSON.parse(JSON.stringify(searchParams))
            }
          });
        }
      }
    } catch (error) {
      console.error('Real trademark search failed:', error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center py-20">
            <Shield className="h-20 w-20 mx-auto text-primary mb-6" />
            <h1 className="text-4xl font-bold mb-4">Trademark Monitoring</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Sign in to access advanced trademark monitoring and protection
            </p>
            <Button asChild size="lg">
              <Link to="/login">Sign In to Continue</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Trademark Intelligence Platform
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Monitor, analyze, and protect your trademarks with AI-powered real-time intelligence
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm bg-primary/10 px-4 py-2 rounded-full">
                <Brain className="h-4 w-4 text-primary" />
                <span className="font-medium">AI Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-blue-500/10 px-4 py-2 rounded-full">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="font-medium">200+ Platforms</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-green-500/10 px-4 py-2 rounded-full">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="font-medium">Real-Time Alerts</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-purple-500/10 px-4 py-2 rounded-full">
                <Shield className="h-4 w-4 text-purple-500" />
                <span className="font-medium">50+ Jurisdictions</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-14">
              <TabsTrigger value="search" className="flex items-center gap-2 text-base">
                <Brain className="h-4 w-4" />
                AI Search
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4" />
                Live Alerts
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="mt-6">
              <AdvancedTrademarkSearch 
                onSearch={handleAdvancedSearch}
                isSearching={isScanning}
              />
            </TabsContent>

            <TabsContent value="alerts" className="mt-6">
              <RealTimeTrademarkAlerts />
            </TabsContent>

            <TabsContent value="portfolio" className="mt-6">
              <TrademarkPortfolio />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <TrademarkAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TrademarkMonitoring;