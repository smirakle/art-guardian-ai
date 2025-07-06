import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

const DetectionTrends = () => {
  const trends = [
    { name: "Copyright Violations", change: "+12%", variant: "destructive" as const },
    { name: "Unauthorized Usage", change: "+8%", variant: "secondary" as const },
    { name: "License Breaches", change: "-3%", variant: "default" as const }
  ];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Detection Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trends.map((trend) => (
            <div key={trend.name} className="flex justify-between items-center">
              <span>{trend.name}</span>
              <Badge variant={trend.variant}>{trend.change}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DetectionTrends;