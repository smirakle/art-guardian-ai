import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

const ResponseTimes = () => {
  const metrics = [
    { name: "Average Detection", time: "2.3s" },
    { name: "Alert Generation", time: "0.8s" },
    { name: "Takedown Request", time: "14.2s" }
  ];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          Response Times
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.name} className="flex justify-between items-center">
              <span>{metric.name}</span>
              <span className="font-mono">{metric.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponseTimes;