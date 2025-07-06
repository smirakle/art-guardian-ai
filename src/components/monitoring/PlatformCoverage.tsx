import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Globe } from "lucide-react";

const PlatformCoverage = () => {
  const platforms = [
    { name: "Instagram", coverage: 98, scans: 1247 },
    { name: "Pinterest", coverage: 95, scans: 892 },
    { name: "Etsy", coverage: 91, scans: 654 },
    { name: "DeviantArt", coverage: 88, scans: 423 },
    { name: "Behance", coverage: 85, scans: 321 }
  ];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Platform Coverage
        </CardTitle>
        <CardDescription>
          Monitoring across major platforms and marketplaces
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {platforms.map((platform) => (
          <div key={platform.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{platform.name}</span>
              <span className="text-sm text-muted-foreground">{platform.scans} scans</span>
            </div>
            <Progress value={platform.coverage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PlatformCoverage;