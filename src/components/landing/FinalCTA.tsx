import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LucideIcon, ArrowRight } from "lucide-react";

interface CTAAction {
  label: string;
  href: string;
  variant?: "default" | "outline" | "secondary";
  icon?: LucideIcon;
}

interface FinalCTAProps {
  title: string;
  subtitle: string;
  primaryAction: CTAAction;
  secondaryAction?: CTAAction;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
}) => {
  const PrimaryIcon = primaryAction.icon;
  const SecondaryIcon = secondaryAction?.icon || ArrowRight;

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">{subtitle}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild className="gap-2">
            <Link to={primaryAction.href}>
              {PrimaryIcon && <PrimaryIcon className="h-5 w-5" />}
              {primaryAction.label}
            </Link>
          </Button>
          {secondaryAction && (
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary-foreground/20 hover:bg-primary-foreground/10 gap-2"
            >
              <Link to={secondaryAction.href}>
                {secondaryAction.label}
                <SecondaryIcon className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
