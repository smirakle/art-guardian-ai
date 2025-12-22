import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ban, CheckCircle2 } from "lucide-react";

interface PainPointSectionProps {
  title: string;
  withoutTitle: string;
  withoutPoints: string[];
  withTitle: string;
  withPoints: string[];
}

export const PainPointSection: React.FC<PainPointSectionProps> = ({
  title,
  withoutTitle,
  withoutPoints,
  withTitle,
  withPoints,
}) => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">{withoutTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {withoutPoints.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground">
                    <Ban className="h-4 w-4 text-destructive shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">{withTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {withPoints.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
