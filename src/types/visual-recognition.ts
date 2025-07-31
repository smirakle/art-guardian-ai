export interface AnalysisResult {
  type: 'classification' | 'similarity' | 'copyright' | 'reverse-search' | 'poison-detection' | 'object-detection' | 'product-recognition' | 'landmark-detection' | 'text-extraction';
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
  watermarkDetected?: boolean;
  watermarkId?: string;
}

export interface GoogleLensObject {
  id: string;
  type: 'product' | 'text' | 'landmark' | 'plant' | 'animal' | 'object';
  label: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  interactionData?: {
    productInfo?: {
      title: string;
      price: string;
      store: string;
      url: string;
      reviews?: number;
      rating?: number;
    };
    textInfo?: {
      content: string;
      language: string;
      translatedText?: string;
      isEditable?: boolean;
    };
    landmarkInfo?: {
      name: string;
      location: string;
      description: string;
      coordinates?: { lat: number; lng: number };
      website?: string;
    };
    plantInfo?: {
      species: string;
      commonName: string;
      description: string;
      careInstructions?: string;
    };
    animalInfo?: {
      species: string;
      description: string;
      habitat?: string;
      conservationStatus?: string;
    };
  };
}

export interface GoogleLensResult {
  objects: GoogleLensObject[];
  overallContext: string;
  suggestions: string[];
  processingTime: number;
  imageContext?: {
    scene: string;
    lighting: string;
    composition: string;
  };
}

export interface ImageAnalysis {
  file: File;
  preview: string;
  results: AnalysisResult[];
  isAnalyzing: boolean;
  progress: number;
  watermarkId?: string;
  isWatermarked?: boolean;
  artworkId?: string;
}