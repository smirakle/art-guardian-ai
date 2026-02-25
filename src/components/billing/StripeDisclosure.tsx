import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StripeDisclosureProps {
  className?: string;
}

const StripeDisclosure = ({ className }: StripeDisclosureProps) => {
  return (
    <div className={cn("flex items-start gap-2 mt-4 p-3 rounded-md bg-muted/50 border border-border/50", className)}>
      <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        Payments are securely processed by{" "}
        <span className="font-semibold">Stripe</span>. TSMO does not store your
        credit card details. By proceeding, you agree to Stripe's{" "}
        <a
          href="https://stripe.com/legal/consumer"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="https://stripe.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
};

export default StripeDisclosure;
