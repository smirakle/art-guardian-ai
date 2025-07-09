export interface AnalysisResult {
  type: 'classification' | 'similarity' | 'copyright' | 'reverse-search';
  confidence: number;
  label: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
  sourceUrl?: string;
  platform?: string;
  dateFound?: string;
}

export interface ImageAnalysis {
  file: File;
  preview: string;
  results: AnalysisResult[];
  isAnalyzing: boolean;
  progress: number;
}