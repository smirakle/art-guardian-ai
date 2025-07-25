import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, ArrowUp } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

interface FeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  plan?: 'professional' | 'addon';
}

const FeatureGuard: React.FC<FeatureGuardProps> = ({
  feature,
  children,
  fallbackTitle,
  fallbackDescription,
  plan = 'professional'
}) => {
  const { hasFeature, subscription } = useSubscription();
  const navigate = useNavigate();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  const getFeatureInfo = () => {
    switch (feature) {
      case 'blockchain_verification':
        return {
          title: 'Blockchain Verification',
          description: 'Secure your artwork with blockchain technology',
          requiredPlan: 'Professional'
        };
      case 'real_time_monitoring':
        return {
          title: 'Real-time Monitoring',
          description: 'Monitor your artwork across the web in real-time',
          requiredPlan: 'Professional'
        };
      case 'automated_dmca':
        return {
          title: 'Automated DMCA',
          description: 'Automatically file DMCA takedown notices',
          requiredPlan: 'Professional'
        };
      case 'social_media_monitoring':
        return {
          title: 'Social Media Monitoring',
          description: 'Monitor social media platforms for unauthorized use',
          requiredPlan: 'Social Media Add-on'
        };
      case 'deepfake_detection':
        return {
          title: 'Deepfake Detection',
          description: 'AI-powered deepfake detection and monitoring',
          requiredPlan: subscription?.plan_id === 'professional' ? 'Professional (Included)' : 'Deepfake Add-on'
        };
      case 'advanced_ai':
        return {
          title: 'Advanced AI Recognition',
          description: 'Enhanced AI-powered visual recognition capabilities',
          requiredPlan: 'Professional'
        };
      default:
        return {
          title: fallbackTitle || 'Premium Feature',
          description: fallbackDescription || 'This feature requires a premium subscription',
          requiredPlan: 'Professional'
        };
    }
  };

  const featureInfo = getFeatureInfo();

  return (
    <Card className="border-2 border-dashed border-border/50 bg-muted/20">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            {plan === 'addon' ? (
              <ArrowUp className="w-8 h-8 text-primary" />
            ) : (
              <Crown className="w-8 h-8 text-primary" />
            )}
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Lock className="w-5 h-5" />
          {featureInfo.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          {featureInfo.description}
        </p>
        
        <Badge variant="secondary" className="mb-4">
          Requires {featureInfo.requiredPlan}
        </Badge>

        <div className="space-y-2">
          <Button 
            onClick={() => navigate('/checkout')}
            className="w-full"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
          
          {!subscription?.is_active && (
            <p className="text-sm text-muted-foreground">
              No active subscription found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureGuard;