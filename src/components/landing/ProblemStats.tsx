import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ProblemStat {
  icon: LucideIcon;
  value: string;
  description: string;
}

interface ProblemStatsProps {
  title: string;
  subtitle?: string;
  stats: ProblemStat[];
}

export const ProblemStats: React.FC<ProblemStatsProps> = ({
  title,
  subtitle,
  stats,
}) => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-destructive/5 border-destructive/20">
              <CardHeader>
                <stat.icon className="h-8 w-8 text-destructive mb-2" />
                <CardTitle>{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {stat.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
