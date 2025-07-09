import { Button } from "@/components/ui/button";
import { Shield, Upload, Activity, Home, Users } from "lucide-react";

const Navigation = () => {
  const currentPath = window.location.pathname;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/upload", label: "Upload", icon: Upload },
    { path: "/monitoring", label: "Monitoring", icon: Activity },
    { path: "/community", label: "Community", icon: Users }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TSMO
              </span>
              <span className="text-xs text-muted-foreground">Your Art. Our Watch</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => window.location.href = item.path}
                  className={`flex items-center gap-2 ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* CTA Button */}
          <Button
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
            onClick={() => window.location.href = "/upload"}
          >
            Protect Your Art
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;