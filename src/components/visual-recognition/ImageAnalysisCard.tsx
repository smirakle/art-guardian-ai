import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileImage, Scan } from "lucide-react";
import { ImageAnalysis } from "@/types/visual-recognition";
import AnalysisResults from "./AnalysisResults";

interface ImageAnalysisCardProps {
  image: ImageAnalysis;
  index: number;
}

const ImageAnalysisCard = ({ image, index }: ImageAnalysisCardProps) => {
  return (
    <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileImage className="w-4 h-4" />
          {image.file.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Preview */}
        <div className="relative">
          <img 
            src={image.preview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg"
          />
          {image.isAnalyzing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <div className="text-center text-white">
                <Scan className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Analyzing...</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress */}
        {image.isAnalyzing && (
          <div className="space-y-2">
            <Progress value={image.progress} className="w-full" />
            <p className="text-xs text-muted-foreground text-center">
              Processing: {image.progress}%
            </p>
          </div>
        )}

        {/* Results */}
        <AnalysisResults results={image.results} />
      </CardContent>
    </Card>
  );
};

export default ImageAnalysisCard;