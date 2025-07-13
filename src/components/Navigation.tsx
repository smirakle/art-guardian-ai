import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Upload, Activity, Home, Users, Link2, Settings, UserCog, LogIn, LogOut, User } from "lucide-react";

const Navigation = () => {
  const currentPath = window.location.pathname;
  const { user, profile, role, signOut, loading } = useAuth();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/upload", label: "Upload", icon: Upload },
    { path: "/monitoring", label: "Monitoring", icon: Activity },
    { path: "/deep-scan", label: "Deep Scan", icon: Shield },
    { path: "/blockchain", label: "Blockchain", icon: Link2 },
    { path: "/pricing", label: "Pricing", icon: Settings },
    { path: "/community", label: "Community", icon: Users },
    { path: "/admin", label: "Admin", icon: UserCog, isAdmin: true }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TSMO
              </span>
              
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
                      : item.isAdmin
                      ? "hover:bg-destructive/20 text-destructive hover:text-destructive"
                      : "hover:bg-secondary/50"
                  } ${item.isAdmin ? "border border-destructive/30" : ""}`}
                  size="sm"
                >
                  <Icon className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || 'User'} />
                          <AvatarFallback>
                            {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {profile?.full_name || profile?.username || 'User'}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                          {role && (
                            <p className="text-xs leading-none text-muted-foreground capitalize">
                              Role: {role}
                            </p>
                          )}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => window.location.href = "/auth"}
                      className="hidden sm:flex"
                      size="sm"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                    <Button
                      className="hidden md:flex bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground text-sm"
                      onClick={() => window.location.href = "/pricing"}
                      size="sm"
                    >
                      Get Protected
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;