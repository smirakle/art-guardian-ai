import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import tsmoLogo from "@/assets/tsmo-transparent-logo.png";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setTimeout(onComplete, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-white to-accent/10 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="mb-8 animate-pulse">
          <img 
            src={tsmoLogo} 
            alt="TSMO Multimedia Creative Protection Logo" 
            className="h-32 w-32 mx-auto object-contain"
          />
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary animate-pulse" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            TSMO
          </h1>
        </div>
        
        <p className="text-lg text-muted-foreground mb-8">
          Your Art. Our Watch.
        </p>
        
        <div className="flex justify-center">
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent rounded-full">
            <div 
              className={`h-full bg-white rounded-full transition-all duration-2000 ${
                isLoaded ? 'w-full' : 'w-0'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;