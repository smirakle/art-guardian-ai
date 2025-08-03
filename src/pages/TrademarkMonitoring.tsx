import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Globe, Shield, Zap, AlertTriangle, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AdvancedTrademarkSearch from "@/components/trademark/AdvancedTrademarkSearch";
import TrademarkAnalytics from "@/components/trademark/TrademarkAnalytics";
import TrademarkPortfolio from "@/components/trademark/TrademarkPortfolio";
import RealTimeTrademarkAlerts from "@/components/trademark/RealTimeTrademarkAlerts";

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
      // Create trademark record
      const { data: trademark, error: trademarkError } = await supabase
        .from('trademarks')
        .insert({
          user_id: user.id,
          trademark_name: searchParams.query.trim(),
          jurisdiction: searchParams.jurisdictions[0] || 'US',
          status: 'monitoring',
          description: `Advanced trademark monitoring for "${searchParams.query.trim()}"`,
          trademark_class: searchParams.classifications
        })
        .select()
        .single();

      if (trademarkError) throw trademarkError;

      // Start advanced monitoring scan
      const { data, error } = await supabase.functions.invoke('trademark-monitoring-engine', {
        body: {
          action: 'scan_trademark',
          trademark_id: trademark.id,
          scan_type: searchParams.searchDepth,
          platforms: searchParams.platforms,
          search_terms: [searchParams.query.trim()],
          jurisdictions: searchParams.jurisdictions,
          similarity_threshold: searchParams.similarityThreshold,
          fuzzy_matching: searchParams.fuzzyMatching,
          include_expired: searchParams.includeExpired,
          search_type: searchParams.searchType
        }
      });

      if (error) throw error;

      toast({
        title: "Advanced Search Started",
        description: `AI-powered trademark analysis initiated for "${searchParams.query}"`,
      });

      console.log('Advanced search results:', data);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Failed to start advanced trademark search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Advanced Trademark Intelligence
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              AI-powered trademark monitoring, analysis, and protection across 200+ platforms and 50+ jurisdictions worldwide
            </p>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-primary" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-primary" />
                <span>Global Coverage</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-primary" />
                <span>Real-Time Monitoring</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>Legal Automation</span>
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