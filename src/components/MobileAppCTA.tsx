import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Download, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileAppCTAProps {
  variant?: 'hero' | 'dashboard' | 'compact';
  className?: string;
}

const MobileAppCTA: React.FC<MobileAppCTAProps> = ({ 
  variant = 'compact',
  className = ''
}) => {
  const navigate = useNavigate();

  if (variant === 'hero') {
    return (
      <Card className={`bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Get the Mobile App</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your art protection anywhere, anytime
              </p>
            </div>
            <Button onClick={() => navigate('/get-app')} className="shrink-0">
              Download
              <Download className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'dashboard') {
    return (
      <Card className={`hover:shadow-lg transition-all duration-300 ${className}`}>
        <CardContent className="p-6 text-center">
          <Smartphone className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Take TSMO Mobile</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get instant notifications and manage your portfolio on-the-go
          </p>
          <Button 
            onClick={() => navigate('/get-app')} 
            className="w-full"
            variant="outline"
          >
            Download App
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Compact variant
  return (
    <Button 
      onClick={() => navigate('/get-app')} 
      variant="outline" 
      size="sm"
      className={`gap-2 ${className}`}
    >
      <Smartphone className="w-4 h-4" />
      Get App
    </Button>
  );
};

export default MobileAppCTA;