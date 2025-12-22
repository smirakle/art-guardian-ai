import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface HeroAction {
  label: string;
  href: string;
  variant?: "default" | "outline" | "secondary";
  icon?: LucideIcon;
}

interface LandingPageHeroProps {
  badge?: {
    icon?: LucideIcon;
    text: string;
  };
  title: string;
  subtitle: string;
  actions: HeroAction[];
  gradient?: "primary" | "destructive" | "secondary" | "accent";
}

const gradientClasses = {
  primary: "from-primary/10 via-background to-background",
  destructive: "from-destructive/10 via-background to-background",
  secondary: "from-secondary/10 via-background to-background",
  accent: "from-accent/10 via-background to-background",
};

const badgeClasses = {
  primary: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-accent",
};

export const LandingPageHero: React.FC<LandingPageHeroProps> = ({
  badge,
  title,
  subtitle,
  actions,
  gradient = "primary",
}) => {
  const BadgeIcon = badge?.icon;

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[gradient]}`} />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {badge && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${badgeClasses[gradient]} mb-6`}>
              {BadgeIcon && <BadgeIcon className="h-4 w-4" />}
              <span className="text-sm font-medium">{badge.text}</span>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {title}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {actions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={index}
                  size="lg"
                  variant={action.variant || "default"}
                  asChild
                  className="gap-2"
                >
                  <Link to={action.href}>
                    {ActionIcon && <ActionIcon className="h-5 w-5" />}
                    {action.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
