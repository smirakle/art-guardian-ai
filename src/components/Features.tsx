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
  Scale
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Eye,
      title: "Visual Recognition",
      description: "Advanced AI scans images and artwork across millions of websites and social platforms",
      badge: "Core Feature",
      variant: "default" as const
    },
    {
      icon: Search,
      title: "Deep Web Scanning",
      description: "Comprehensive search through marketplaces, social media, and content platforms",
      badge: "Pro",
      variant: "secondary" as const
    },
    {
      icon: AlertTriangle,
      title: "Instant Alerts",
      description: "Real-time notifications when unauthorized use of your work is detected",
      badge: "Premium",
      variant: "destructive" as const
    },
    {
      icon: FileText,
      title: "Auto-Documentation",
      description: "Automatic evidence collection and timestamping for legal proceedings",
      badge: "Legal",
      variant: "outline" as const
    },
    {
      icon: Scale,
      title: "Legal Support",
      description: "Direct connection to IP lawyers and automated cease & desist generation",
      badge: "Pro",
      variant: "secondary" as const
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Track your work's reach, unauthorized usage patterns, and protection metrics",
      badge: "Insights",
      variant: "default" as const
    },
    {
      icon: Lock,
      title: "Blockchain Verification",
      description: "Immutable proof of creation and ownership through blockchain technology",
      badge: "Security",
      variant: "destructive" as const
    },
    {
      icon: Users,
      title: "Artist Community",
      description: "Connect with other artists, share protection strategies, and learn from experts",
      badge: "Community",
      variant: "outline" as const
    },
    {
      icon: Zap,
      title: "API Integration",
      description: "Seamlessly integrate with your existing workflow and portfolio platforms",
      badge: "Developer",
      variant: "secondary" as const
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Comprehensive Protection Suite
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every tool you need to safeguard your creative work, powered by cutting-edge AI technology
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
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
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