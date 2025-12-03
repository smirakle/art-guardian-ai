import { Shield, Lock, Award, Globe, CheckCircle2 } from "lucide-react";

const TrustBadges = () => {
  const badges = [
    {
      icon: Shield,
      label: "256-bit Encryption",
      description: "Bank-level security"
    },
    {
      icon: Lock,
      label: "GDPR Compliant",
      description: "Data protection"
    },
    {
      icon: Award,
      label: "SOC 2 Certified",
      description: "Enterprise ready"
    },
    {
      icon: Globe,
      label: "Global Coverage",
      description: "180+ countries"
    },
    {
      icon: CheckCircle2,
      label: "99.9% Uptime",
      description: "Always monitoring"
    }
  ];

  return (
    <section className="py-12 bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Trusted & Secure Platform
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {badges.map((badge, index) => (
            <div 
              key={index}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                <badge.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  {badge.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;