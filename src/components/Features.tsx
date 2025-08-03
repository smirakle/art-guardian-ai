import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Zap, 
  FileText, 
  Users, 
  TrendingUp, 
  Lock,
  Search,
  AlertTriangle,
  Scale,
  ShieldCheck
} from "lucide-react";
import { useTranslation } from "react-i18next";

const Features = () => {
  const { t } = useTranslation();
  const features = [
    {
      icon: Eye,
      titleKey: "features.visualRecognition.title",
      descriptionKey: "features.visualRecognition.description",
      badge: "Core Feature",
      variant: "default" as const
    },
    {
      icon: Search,
      titleKey: "features.deepWebScanning.title",
      descriptionKey: "features.deepWebScanning.description",
      badge: "Pro",
      variant: "secondary" as const
    },
    {
      icon: AlertTriangle,
      titleKey: "features.instantAlerts.title",
      descriptionKey: "features.instantAlerts.description",
      badge: "Premium",
      variant: "destructive" as const
    },
    {
      icon: FileText,
      titleKey: "features.autoDocumentation.title",
      descriptionKey: "features.autoDocumentation.description",
      badge: "Legal",
      variant: "outline" as const
    },
    {
      icon: Scale,
      titleKey: "features.legalSupport.title",
      descriptionKey: "features.legalSupport.description",
      badge: "Pro",
      variant: "secondary" as const
    },
    {
      icon: TrendingUp,
      titleKey: "features.analyticsDashboard.title",
      descriptionKey: "features.analyticsDashboard.description",
      badge: "Insights",
      variant: "default" as const
    },
    {
      icon: Lock,
      titleKey: "features.blockchainVerification.title",
      descriptionKey: "features.blockchainVerification.description",
      badge: "Security",
      variant: "destructive" as const
    },
    {
      icon: Users,
      titleKey: "features.artistCommunity.title",
      descriptionKey: "features.artistCommunity.description",
      badge: "Community",
      variant: "outline" as const
    },
    {
      icon: Zap,
      titleKey: "features.apiIntegration.title",
      descriptionKey: "features.apiIntegration.description",
      badge: "Developer",
      variant: "secondary" as const
    },
    {
      icon: ShieldCheck,
      titleKey: "features.trademarkMonitoring.title",
      descriptionKey: "features.trademarkMonitoring.description",
      badge: "Intelligence",
      variant: "destructive" as const
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('features.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <feature.icon className="w-8 h-8 text-primary group-hover:text-accent transition-colors duration-300" />
                  <Badge variant={feature.variant} className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                  {t(feature.titleKey)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {t(feature.descriptionKey)}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;