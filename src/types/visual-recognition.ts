export interface AnalysisResult {
  type: 'classification' | 'similarity' | 'copyright' | 'reverse-search' | 'poison-detection';
  confidence: number;
  label: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
  sourceUrl?: string;
  platform?: string;
  dateFound?: string;
  poisonType?: 'adversarial' | 'backdoor' | 'data-poisoning' | 'trigger-based';
  detectionMethod?: string;
}

export interface ImageAnalysis {
  file: File;
  preview: string;
  results: AnalysisResult[];
  isAnalyzing: boolean;
  progress: number;
}