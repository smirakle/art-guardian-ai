import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Portfolio {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface PortfolioItem {
  id: string;
  portfolio_id: string;
  artwork_id: string;
  added_at: string;
  is_active: boolean;
}

interface MonitoringResult {
  id: string;
  portfolio_id: string;
  total_matches: number;
  high_risk_matches: number;
  medium_risk_matches: number;
  low_risk_matches: number;
  platforms_scanned: string[];
  scan_date: string;
  artworks_scanned: number;
}

export const usePortfolioMonitoring = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error: any) {
      console.error("Error loading portfolios:", error);
      toast({
        title: "Load Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPortfolio = async (name: string, description: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("portfolios")
        .insert({
          user_id: user.id,
          name,
          description,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Portfolio Created",
        description: `${name} has been created successfully.`,
      });

      await loadPortfolios();
      return data;
    } catch (error: any) {
      console.error("Error creating portfolio:", error);
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const addItemToPortfolio = async (
    portfolioId: string,
    artworkId: string
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("portfolio_items")
        .insert({
          portfolio_id: portfolioId,
          artwork_id: artworkId,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Item Added",
        description: `Artwork added to portfolio.`,
      });

      return data;
    } catch (error: any) {
      console.error("Error adding item:", error);
      toast({
        title: "Add Failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const startPortfolioScan = async (
    portfolioId: string,
    platforms: string[]
  ) => {
    setScanning(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Call edge function to start scan
      const { data, error } = await supabase.functions.invoke(
        "portfolio-scan",
        {
          body: {
            portfolio_id: portfolioId,
            platforms,
          },
        }
      );

      if (error) throw error;

      toast({
        title: "Scan Started",
        description: `Monitoring ${platforms.length} platforms for portfolio content.`,
      });

      return data;
    } catch (error: any) {
      console.error("Error starting scan:", error);
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setScanning(false);
    }
  };

  const getPortfolioResults = async (portfolioId: string) => {
    try {
      const { data, error } = await supabase
        .from("portfolio_monitoring_results")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .order("scan_date", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as MonitoringResult[];
    } catch (error: any) {
      console.error("Error getting results:", error);
      return [];
    }
  };

  const getPortfolioAlerts = async (portfolioId: string) => {
    try {
      const { data, error } = await supabase
        .from("portfolio_alerts")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error getting alerts:", error);
      return [];
    }
  };

  return {
    portfolios,
    loading,
    scanning,
    loadPortfolios,
    createPortfolio,
    addItemToPortfolio,
    startPortfolioScan,
    getPortfolioResults,
    getPortfolioAlerts,
  };
};
