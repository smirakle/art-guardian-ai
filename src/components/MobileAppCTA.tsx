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
    return;
  }
  if (variant === 'dashboard') {
    return <Card className={`hover:shadow-lg transition-all duration-300 ${className}`}>
        <CardContent className="p-6 text-center">
          <Smartphone className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Take TSMO Mobile</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get instant notifications and manage your portfolio on-the-go
          </p>
          <Button onClick={() => navigate('/get-app')} className="w-full" variant="outline">
            Download App
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>;
  }

  // Compact variant
  return <Button onClick={() => navigate('/get-app')} variant="outline" size="sm" className={`gap-2 ${className}`}>
      <Smartphone className="w-4 h-4" />
      Get App
    </Button>;
};
export default MobileAppCTA;