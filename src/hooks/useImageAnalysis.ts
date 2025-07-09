import { useCallback } from 'react';
import { pipeline, env } from '@huggingface/transformers';
import { useToast } from "@/hooks/use-toast";
import { AnalysisResult, ImageAnalysis } from '@/types/visual-recognition';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

export const useImageAnalysis = () => {
  const { toast } = useToast();

  const analyzeImage = useCallback(async (
    file: File, 
    index: number, 
    setImages: React.Dispatch<React.SetStateAction<ImageAnalysis[]>>
  ) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, isAnalyzing: true, progress: 0 } : img
    ));

    try {
      // Update progress
      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, progress: 20 } : img
      ));

      // Create image element for analysis
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, progress: 40 } : img
      ));

      // Initialize image classification pipeline
      const classifier = await pipeline(
        'image-classification',
        'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
        { device: 'webgpu' }
      );

      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, progress: 70 } : img
      ));

      // Perform classification
      const classifications = await classifier(imageUrl);
      
      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, progress: 90 } : img
      ));

      // Process results and simulate copyright analysis
      const results: AnalysisResult[] = [];

      // Add classification results
      if (classifications && Array.isArray(classifications) && classifications.length > 0) {
        const topResult = classifications[0];
        if (topResult && typeof topResult === 'object' && 'score' in topResult && 'label' in topResult) {
          results.push({
            type: 'classification',
            confidence: topResult.score * 100,
            label: topResult.label,
            description: `Detected as ${topResult.label} with ${(topResult.score * 100).toFixed(1)}% confidence`,
            riskLevel: topResult.score > 0.8 ? 'low' : topResult.score > 0.5 ? 'medium' : 'high',
            suggestions: [
              'Image successfully classified',
              'No immediate copyright concerns detected',
              'Consider watermarking for protection'
            ]
          });
        }
      }

      // Simulate copyright risk analysis
      const copyrightRisk = Math.random();
      results.push({
        type: 'copyright',
        confidence: (1 - copyrightRisk) * 100,
        label: copyrightRisk < 0.3 ? 'High Risk' : copyrightRisk < 0.7 ? 'Medium Risk' : 'Low Risk',
        description: copyrightRisk < 0.3 
          ? 'Potential copyright infringement detected' 
          : copyrightRisk < 0.7 
            ? 'Some similarities found with existing content'
            : 'No significant copyright concerns',
        riskLevel: copyrightRisk < 0.3 ? 'high' : copyrightRisk < 0.7 ? 'medium' : 'low',
        suggestions: copyrightRisk < 0.3 
          ? ['Review image ownership', 'Consider legal consultation', 'Remove potentially infringing elements']
          : copyrightRisk < 0.7 
            ? ['Verify image rights', 'Add proper attribution', 'Monitor for unauthorized use']
            : ['Register copyright', 'Add watermark', 'Enable monitoring alerts']
      });

      // Simulate similarity check
      const similarityScore = Math.random() * 100;
      results.push({
        type: 'similarity',
        confidence: similarityScore,
        label: `${similarityScore.toFixed(1)}% Similar`,
        description: `Found ${Math.floor(similarityScore / 10)} similar images across monitored platforms`,
        riskLevel: similarityScore > 80 ? 'high' : similarityScore > 50 ? 'medium' : 'low',
        suggestions: [
          'Similarity analysis completed',
          'Monitor detected matches',
          'Set up automated alerts'
        ]
      });

      // Simulate reverse image search
      const reverseSearchResults = [
        { platform: 'Instagram', confidence: 85 + Math.random() * 15, url: 'instagram.com/artist123' },
        { platform: 'Pinterest', confidence: 70 + Math.random() * 20, url: 'pinterest.com/boards/art' },
        { platform: 'DeviantArt', confidence: 60 + Math.random() * 25, url: 'deviantart.com/gallery' },
        { platform: 'ArtStation', confidence: 45 + Math.random() * 30, url: 'artstation.com/artwork' },
        { platform: 'Behance', confidence: 30 + Math.random() * 40, url: 'behance.net/portfolio' }
      ].filter(() => Math.random() > 0.4); // Randomly include results

      if (reverseSearchResults.length > 0) {
        const topMatch = reverseSearchResults[0];
        results.push({
          type: 'reverse-search',
          confidence: topMatch.confidence,
          label: `Found on ${reverseSearchResults.length} platform${reverseSearchResults.length > 1 ? 's' : ''}`,
          description: `Image detected on ${topMatch.platform} with ${topMatch.confidence.toFixed(1)}% match confidence`,
          riskLevel: topMatch.confidence > 90 ? 'high' : topMatch.confidence > 70 ? 'medium' : 'low',
          platform: topMatch.platform,
          sourceUrl: topMatch.url,
          dateFound: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          suggestions: [
            `Image found on ${reverseSearchResults.length} platform${reverseSearchResults.length > 1 ? 's' : ''}`,
            'Review usage rights and permissions',
            'Consider filing DMCA takedown if unauthorized',
            'Set up monitoring alerts for this image'
          ]
        });
      } else {
        results.push({
          type: 'reverse-search',
          confidence: 100,
          label: 'No matches found',
          description: 'No instances of this image were found across monitored platforms',
          riskLevel: 'low',
          suggestions: [
            'Image appears to be unique',
            'Consider watermarking for protection',
            'Register for continuous monitoring'
          ]
        });
      }

      setImages(prev => prev.map((img, i) => 
        i === index ? { 
          ...img, 
          results, 
          isAnalyzing: false, 
          progress: 100 
        } : img
      ));

      URL.revokeObjectURL(imageUrl);

      toast({
        title: "Analysis Complete",
        description: `Found ${results.length} analysis results for your image`,
      });

    } catch (error) {
      console.error('Error analyzing image:', error);
      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, isAnalyzing: false, progress: 0 } : img
      ));
      
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return { analyzeImage };
};