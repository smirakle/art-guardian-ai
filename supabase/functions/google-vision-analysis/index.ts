import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleVisionRequest {
  imageUrl?: string;
  imageData?: string; // base64 encoded
  analysisTypes: string[];
}

interface VisionAnalysisResult {
  faceDetection?: any;
  textDetection?: any;
  labelDetection?: any;
  landmarkDetection?: any;
  logoDetection?: any;
  safeSearchDetection?: any;
  imageProperties?: any;
  objectLocalization?: any;
  webDetection?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, imageData, analysisTypes }: GoogleVisionRequest = await req.json();
    
    if (!imageUrl && !imageData) {
      return new Response(JSON.stringify({
        error: 'Missing required parameter: imageUrl or imageData'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const googleApiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
    
    if (!googleApiKey) {
      return new Response(JSON.stringify({
        error: 'Google Vision API key not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Starting Google Vision analysis for types: ${analysisTypes.join(', ')}`);

    // Prepare the image for Google Vision API
    let imageRequest;
    if (imageUrl) {
      imageRequest = { source: { imageUri: imageUrl } };
    } else {
      imageRequest = { content: imageData };
    }

    // Build features array based on requested analysis types
    const features = [];
    
    if (analysisTypes.includes('face_detection')) {
      features.push({ type: 'FACE_DETECTION', maxResults: 50 });
    }
    if (analysisTypes.includes('text_detection')) {
      features.push({ type: 'TEXT_DETECTION', maxResults: 50 });
    }
    if (analysisTypes.includes('label_detection')) {
      features.push({ type: 'LABEL_DETECTION', maxResults: 50 });
    }
    if (analysisTypes.includes('landmark_detection')) {
      features.push({ type: 'LANDMARK_DETECTION', maxResults: 50 });
    }
    if (analysisTypes.includes('logo_detection')) {
      features.push({ type: 'LOGO_DETECTION', maxResults: 50 });
    }
    if (analysisTypes.includes('safe_search')) {
      features.push({ type: 'SAFE_SEARCH_DETECTION' });
    }
    if (analysisTypes.includes('image_properties')) {
      features.push({ type: 'IMAGE_PROPERTIES' });
    }
    if (analysisTypes.includes('object_localization')) {
      features.push({ type: 'OBJECT_LOCALIZATION', maxResults: 50 });
    }
    if (analysisTypes.includes('web_detection')) {
      features.push({ type: 'WEB_DETECTION', maxResults: 50 });
    }

    // Make request to Google Vision API
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: imageRequest,
            features: features,
            imageContext: {
              languageHints: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh']
            }
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google Vision API error:', response.status, errorData);
      return new Response(JSON.stringify({
        error: `Google Vision API error: ${response.status}`,
        details: errorData
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const result = data.responses[0];

    if (result.error) {
      return new Response(JSON.stringify({
        error: 'Google Vision analysis failed',
        details: result.error
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process and structure the results
    const analysisResult: VisionAnalysisResult = {};

    if (result.faceAnnotations) {
      analysisResult.faceDetection = processFaceDetection(result.faceAnnotations);
    }

    if (result.textAnnotations) {
      analysisResult.textDetection = processTextDetection(result.textAnnotations);
    }

    if (result.labelAnnotations) {
      analysisResult.labelDetection = processLabelDetection(result.labelAnnotations);
    }

    if (result.landmarkAnnotations) {
      analysisResult.landmarkDetection = processLandmarkDetection(result.landmarkAnnotations);
    }

    if (result.logoAnnotations) {
      analysisResult.logoDetection = processLogoDetection(result.logoAnnotations);
    }

    if (result.safeSearchAnnotation) {
      analysisResult.safeSearchDetection = processSafeSearchDetection(result.safeSearchAnnotation);
    }

    if (result.imagePropertiesAnnotation) {
      analysisResult.imageProperties = processImageProperties(result.imagePropertiesAnnotation);
    }

    if (result.localizedObjectAnnotations) {
      analysisResult.objectLocalization = processObjectLocalization(result.localizedObjectAnnotations);
    }

    if (result.webDetection) {
      analysisResult.webDetection = processWebDetection(result.webDetection);
    }

    // Generate comprehensive summary
    const summary = generateAnalysisSummary(analysisResult);

    return new Response(JSON.stringify({
      success: true,
      analysisTypes,
      results: analysisResult,
      summary,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Google Vision analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function processFaceDetection(faceAnnotations: any[]) {
  return {
    facesDetected: faceAnnotations.length,
    faces: faceAnnotations.map((face, index) => ({
      id: index,
      confidence: face.detectionConfidence,
      boundingBox: face.boundingPoly,
      landmarks: face.landmarks,
      emotions: {
        joy: face.joyLikelihood,
        sorrow: face.sorrowLikelihood,
        anger: face.angerLikelihood,
        surprise: face.surpriseLikelihood
      },
      features: {
        headwear: face.headwearLikelihood,
        blurred: face.blurredLikelihood,
        underExposed: face.underExposedLikelihood
      },
      angles: {
        roll: face.rollAngle,
        pan: face.panAngle,
        tilt: face.tiltAngle
      }
    }))
  };
}

function processTextDetection(textAnnotations: any[]) {
  const fullText = textAnnotations[0]?.description || '';
  const textBlocks = textAnnotations.slice(1).map((text, index) => ({
    id: index,
    text: text.description,
    confidence: text.confidence || 0,
    boundingBox: text.boundingPoly,
    language: text.locale
  }));

  return {
    fullTextDetected: fullText,
    textBlocks: textBlocks,
    totalTextBlocks: textBlocks.length,
    languages: [...new Set(textBlocks.map(block => block.language).filter(Boolean))]
  };
}

function processLabelDetection(labelAnnotations: any[]) {
  return {
    labels: labelAnnotations.map((label, index) => ({
      id: index,
      description: label.description,
      confidence: label.score,
      mid: label.mid,
      topicality: label.topicality
    })).sort((a, b) => b.confidence - a.confidence),
    totalLabels: labelAnnotations.length,
    topLabels: labelAnnotations.slice(0, 5).map(label => label.description)
  };
}

function processLandmarkDetection(landmarkAnnotations: any[]) {
  return {
    landmarks: landmarkAnnotations.map((landmark, index) => ({
      id: index,
      description: landmark.description,
      confidence: landmark.score,
      boundingBox: landmark.boundingPoly,
      locations: landmark.locations?.map((loc: any) => ({
        latitude: loc.latLng.latitude,
        longitude: loc.latLng.longitude
      }))
    })),
    totalLandmarks: landmarkAnnotations.length
  };
}

function processLogoDetection(logoAnnotations: any[]) {
  return {
    logos: logoAnnotations.map((logo, index) => ({
      id: index,
      description: logo.description,
      confidence: logo.score,
      boundingBox: logo.boundingPoly,
      mid: logo.mid
    })),
    totalLogos: logoAnnotations.length
  };
}

function processSafeSearchDetection(safeSearchAnnotation: any) {
  const likelihoodToScore = (likelihood: string) => {
    const scores = { VERY_UNLIKELY: 1, UNLIKELY: 2, POSSIBLE: 3, LIKELY: 4, VERY_LIKELY: 5 };
    return scores[likelihood as keyof typeof scores] || 0;
  };

  return {
    adult: {
      likelihood: safeSearchAnnotation.adult,
      score: likelihoodToScore(safeSearchAnnotation.adult)
    },
    violence: {
      likelihood: safeSearchAnnotation.violence,
      score: likelihoodToScore(safeSearchAnnotation.violence)
    },
    racy: {
      likelihood: safeSearchAnnotation.racy,
      score: likelihoodToScore(safeSearchAnnotation.racy)
    },
    medical: {
      likelihood: safeSearchAnnotation.medical,
      score: likelihoodToScore(safeSearchAnnotation.medical)
    },
    spoof: {
      likelihood: safeSearchAnnotation.spoof,
      score: likelihoodToScore(safeSearchAnnotation.spoof)
    },
    overallSafety: Math.max(
      likelihoodToScore(safeSearchAnnotation.adult),
      likelihoodToScore(safeSearchAnnotation.violence),
      likelihoodToScore(safeSearchAnnotation.racy)
    )
  };
}

function processImageProperties(imagePropertiesAnnotation: any) {
  const dominantColors = imagePropertiesAnnotation.dominantColors?.colors || [];
  
  return {
    dominantColors: dominantColors.map((color: any, index: number) => ({
      id: index,
      color: {
        red: color.color.red || 0,
        green: color.color.green || 0,
        blue: color.color.blue || 0,
        hex: `#${((color.color.red || 0) << 16 | (color.color.green || 0) << 8 | (color.color.blue || 0)).toString(16).padStart(6, '0')}`
      },
      score: color.score,
      pixelFraction: color.pixelFraction
    })).sort((a: any, b: any) => b.score - a.score),
    colorPalette: dominantColors.slice(0, 5).map((color: any) => 
      `#${((color.color.red || 0) << 16 | (color.color.green || 0) << 8 | (color.color.blue || 0)).toString(16).padStart(6, '0')}`
    )
  };
}

function processObjectLocalization(localizedObjectAnnotations: any[]) {
  return {
    objects: localizedObjectAnnotations.map((obj, index) => ({
      id: index,
      name: obj.name,
      confidence: obj.score,
      boundingBox: obj.boundingPoly,
      mid: obj.mid
    })).sort((a, b) => b.confidence - a.confidence),
    totalObjects: localizedObjectAnnotations.length,
    uniqueObjects: [...new Set(localizedObjectAnnotations.map(obj => obj.name))]
  };
}

function processWebDetection(webDetection: any) {
  return {
    webEntities: webDetection.webEntities?.map((entity: any, index: number) => ({
      id: index,
      entityId: entity.entityId,
      description: entity.description,
      score: entity.score
    })).sort((a: any, b: any) => b.score - a.score) || [],
    fullMatchingImages: webDetection.fullMatchingImages?.map((img: any, index: number) => ({
      id: index,
      url: img.url,
      score: img.score || 1.0
    })) || [],
    partialMatchingImages: webDetection.partialMatchingImages?.map((img: any, index: number) => ({
      id: index,
      url: img.url,
      score: img.score || 0.8
    })) || [],
    pagesWithMatchingImages: webDetection.pagesWithMatchingImages?.map((page: any, index: number) => ({
      id: index,
      url: page.url,
      title: page.pageTitle,
      fullMatchingImages: page.fullMatchingImages?.length || 0,
      partialMatchingImages: page.partialMatchingImages?.length || 0
    })) || [],
    visuallySimilarImages: webDetection.visuallySimilarImages?.map((img: any, index: number) => ({
      id: index,
      url: img.url,
      score: img.score || 0.6
    })) || [],
    bestGuessLabels: webDetection.bestGuessLabels?.map((label: any) => label.label) || []
  };
}

function generateAnalysisSummary(results: VisionAnalysisResult) {
  const summary = {
    totalElements: 0,
    keyFindings: [] as string[],
    riskFactors: [] as string[],
    recommendations: [] as string[],
    confidence: 'high'
  };

  // Count total detected elements
  if (results.faceDetection) {
    summary.totalElements += results.faceDetection.facesDetected;
    if (results.faceDetection.facesDetected > 0) {
      summary.keyFindings.push(`${results.faceDetection.facesDetected} face(s) detected`);
    }
  }

  if (results.textDetection) {
    summary.totalElements += results.textDetection.totalTextBlocks;
    if (results.textDetection.totalTextBlocks > 0) {
      summary.keyFindings.push(`Text detected in ${results.textDetection.languages.length || 1} language(s)`);
    }
  }

  if (results.labelDetection) {
    summary.totalElements += results.labelDetection.totalLabels;
    if (results.labelDetection.topLabels.length > 0) {
      summary.keyFindings.push(`Main subjects: ${results.labelDetection.topLabels.slice(0, 3).join(', ')}`);
    }
  }

  if (results.logoDetection && results.logoDetection.totalLogos > 0) {
    summary.totalElements += results.logoDetection.totalLogos;
    summary.keyFindings.push(`${results.logoDetection.totalLogos} logo(s) detected`);
    summary.riskFactors.push('Commercial logos present - check licensing requirements');
  }

  if (results.safeSearchDetection) {
    if (results.safeSearchDetection.overallSafety > 3) {
      summary.riskFactors.push('Content may not be suitable for all audiences');
    }
  }

  if (results.webDetection) {
    const fullMatches = results.webDetection.fullMatchingImages.length;
    const partialMatches = results.webDetection.partialMatchingImages.length;
    
    if (fullMatches > 0) {
      summary.keyFindings.push(`${fullMatches} exact match(es) found online`);
      summary.riskFactors.push('Image appears elsewhere online - verify originality');
    }
    
    if (partialMatches > 0) {
      summary.keyFindings.push(`${partialMatches} similar image(s) found online`);
    }
  }

  // Generate recommendations
  if (summary.riskFactors.length === 0) {
    summary.recommendations.push('Image appears suitable for commercial use');
  } else {
    summary.recommendations.push('Review detected risk factors before commercial use');
  }

  if (results.imageProperties) {
    summary.recommendations.push('Professional color analysis available for design optimization');
  }

  return summary;
}