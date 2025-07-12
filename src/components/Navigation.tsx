import { Button } from "@/components/ui/button";
import { Shield, Upload, Activity, Home, Users, Link2, Settings } from "lucide-react";

const Navigation = () => {
  const currentPath = window.location.pathname;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/upload", label: "Upload", icon: Upload },
    { path: "/monitoring", label: "Monitoring", icon: Activity },
    { path: "/deep-scan", label: "Deep Scan", icon: Shield },
    { path: "/blockchain", label: "Blockchain", icon: Link2 },
    { path: "/admin", label: "Admin", icon: Settings },
    { path: "/community", label: "Community", icon: Users }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="w-16 h-16 md:w-24 md:h-24 text-primary" />
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TSMO
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">Your Art. Our Watch</span>
            </div>
          </div>

          {/* Mobile Navigation Links - Horizontal Scroll */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[50vw] md:max-w-none scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => window.location.href = item.path}
                  className={`flex items-center gap-1 md:gap-2 min-w-max px-2 md:px-3 text-xs md:text-sm ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-secondary/50"
                  }`}
                  size="sm"
                >
                  <Icon className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* CTA Button - Hidden on smallest screens */}
          <Button
            className="hidden md:flex bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground text-sm"
            onClick={() => window.location.href = "/upload"}
            size="sm"
          >
            Protect Your Art
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;