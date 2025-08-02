import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AITPAAnalysis {
  confidence: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  fingerprint: {
    perceptualHash: string;
    structuralFeatures: number[];
    semanticEmbedding: number[];
    visualSignature: string;
    metadataHash: string;
  };
  similarityScore: number;
  riskFactors: {
    datasetPresence: number;
    accessPatterns: number;
    technicalIndicators: number;
    behavioralAnomalies: number;
  };
}

interface AITPAEngineResult {
  success: boolean;
  result?: AITPAAnalysis;
  error?: string;
}

export const useAITPAEngine = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const analyzeWithAITPA = useCallback(async (imageUrl: string): Promise<AITPAEngineResult> => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('aitpa-core-engine', {
        body: {
          action: 'analyze',
          imageUrl,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) {
        console.error('AITPA analysis error:', error);
        toast({
          title: "Analysis Failed",
          description: "Failed to perform AITPA analysis. Please try again.",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      return { success: true, result: data.result };
    } catch (error: any) {
      console.error('AITPA engine error:', error);
      toast({
        title: "Engine Error",
        description: "AITPA engine encountered an error. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const generateFingerprint = useCallback(async (imageUrl: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('aitpa-core-engine', {
        body: {
          action: 'fingerprint',
          imageUrl
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.result;
    } catch (error: any) {
      console.error('Fingerprint generation error:', error);
      toast({
        title: "Fingerprint Error",
        description: "Failed to generate AITPA fingerprint.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const compareFingerprints = useCallback(async (
    fingerprint: string, 
    comparisonUrls: string[]
  ) => {
    setIsComparing(true);
    try {
      const { data, error } = await supabase.functions.invoke('aitpa-core-engine', {
        body: {
          action: 'compare',
          fingerprint,
          comparisonUrls
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.result;
    } catch (error: any) {
      console.error('Fingerprint comparison error:', error);
      toast({
        title: "Comparison Failed",
        description: "Failed to compare fingerprints using AITPA.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsComparing(false);
    }
  }, [toast]);

  const scanDatasets = useCallback(async (fingerprint: string) => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('aitpa-core-engine', {
        body: {
          action: 'scan_datasets',
          fingerprint
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Dataset Scan Complete",
        description: `Found ${data.result.matches?.length || 0} potential matches across ${data.result.totalDatasets} datasets.`,
        variant: data.result.matches?.length > 0 ? "destructive" : "default",
      });

      return data.result;
    } catch (error: any) {
      console.error('Dataset scan error:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to scan AI training datasets.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsScanning(false);
    }
  }, [toast]);

  const getThreatLevelColor = useCallback((threatLevel: string) => {
    switch (threatLevel) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }, []);

  const getThreatLevelIcon = useCallback((threatLevel: string) => {
    switch (threatLevel) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '🔶';
      case 'low': return '✅';
      default: return '❓';
    }
  }, []);

  return {
    isAnalyzing,
    isComparing,
    isScanning,
    analyzeWithAITPA,
    generateFingerprint,
    compareFingerprints,
    scanDatasets,
    getThreatLevelColor,
    getThreatLevelIcon
  };
};