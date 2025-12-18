import { Shield, Lock, Award, Globe, CheckCircle2 } from "lucide-react";

const TrustBadges = () => {
  const badges = [
    {
      icon: Shield,
      emoji: "🔒",
      label: "Your Art is Safe",
      description: "We protect it like a bank protects money"
    },
    {
      icon: Lock,
      emoji: "🛡️",
      label: "Private & Secure",
      description: "Only you can see your uploads"
    },
    {
      icon: Award,
      emoji: "✅",
      label: "Used by Big Companies",
      description: "Trusted by professional artists"
    },
    {
      icon: Globe,
      emoji: "🌍",
      label: "Works Worldwide",
      description: "We check 180+ countries"
    },
    {
      icon: CheckCircle2,
      emoji: "⏰",
      label: "Always On",
      description: "We never stop watching"
    }
  ];

  return (
    <section className="py-12 bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            You Can Trust Us
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {badges.map((badge, index) => (
            <div 
              key={index}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                <span className="text-2xl">{badge.emoji}</span>
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