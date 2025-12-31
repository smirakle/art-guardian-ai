import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, X, Sparkles, Bell, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EXIT_INTENT_KEY = "tsmo_exit_intent_shown";

export const ExitIntentPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger when mouse moves to top of page (leaving)
    if (e.clientY <= 0) {
      const alreadyShown = sessionStorage.getItem(EXIT_INTENT_KEY);
      if (!alreadyShown) {
        setOpen(true);
        sessionStorage.setItem(EXIT_INTENT_KEY, "true");
      }
    }
  }, []);

  useEffect(() => {
    // Wait 5 seconds before adding listener to avoid triggering immediately
    const timer = setTimeout(() => {
      document.addEventListener("mouseout", handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", handleMouseLeave);
    };
  }, [handleMouseLeave]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      navigate(`/auth?email=${encodeURIComponent(email)}&tab=signup`);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-primary" />
            Wait — Don't Leave Your Art Unprotected
          </DialogTitle>
          <DialogDescription className="text-base">
            Get 50 free image protections + email alerts when your art is found online.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base"
              required
            />
            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white">
              <Sparkles className="mr-2 h-4 w-4" />
              Get 50 Free Protections
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              No credit card
            </span>
            <span className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              Email alerts included
            </span>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            No thanks, I'll risk it
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
