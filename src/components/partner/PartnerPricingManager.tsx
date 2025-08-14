import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  Crown,
  Zap,
  Shield,
  Star,
  Rocket,
  CheckCircle,
  ArrowRight,
  Globe,
  Users,
  Palette,
  Settings,
  BarChart3,
  Phone,
  Code
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FeatureGuard from '@/components/FeatureGuard';

interface PartnerTier {
  id: string;
  tier_name: string;
  monthly_price: number;
  api_calls_included: number;
  rate_limit_per_hour: number;
  white_label_included: boolean;
  custom_branding: boolean;
  dedicated_support: boolean;
  custom_integrations: boolean;
  max_organizations: number | null;
  max_users_per_org: number;
  max_domains: number;
  features: string[];
  is_active: boolean;
}

interface UserPartnerSubscription {
  tier_name: string;
  monthly_price: number;
  api_calls_included: number;
  rate_limit_per_hour: number;
  white_label_included: boolean;
  custom_branding: boolean;
  dedicated_support: boolean;
  custom_integrations: boolean;
  max_organizations: number;
  max_users_per_org: number;
  max_domains: number;
  features: string[];
  subscription_status: string;
  api_calls_used: number;
  api_calls_remaining: number;
}

export const PartnerPricingManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [partnerTiers, setPartnerTiers] = useState<PartnerTier[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserPartnerSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPartnerTiers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('partner_pricing_tiers')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(tier => ({
        ...tier,
        features: Array.isArray(tier.features) ? tier.features as string[] : []
      }));
      
      setPartnerTiers(transformedData);
    } catch (error) {
      console.error('Failed to load partner tiers:', error);
      toast({
        title: "Error",
        description: "Failed to load partner pricing tiers",
        variant: "destructive"
      });
    }
  }, [toast]);

  const loadCurrentSubscription = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_user_partner_tier');
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data && data.length > 0) {
        // Transform the data to match our interface
        const subscription = {
          ...data[0],
          features: Array.isArray(data[0].features) ? data[0].features as string[] : []
        };
        setCurrentSubscription(subscription);
      }
    } catch (error) {
      console.error('Failed to load current subscription:', error);
    }
  }, [user]);

  useEffect(() => {
    loadPartnerTiers();
    loadCurrentSubscription();
    setLoading(false);
  }, [loadPartnerTiers, loadCurrentSubscription]);

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'Partner Starter': return <Building2 className="w-6 h-6" />;
      case 'Partner Professional': return <Star className="w-6 h-6" />;
      case 'Partner Enterprise': return <Shield className="w-6 h-6" />;
      case 'Partner Plus': return <Crown className="w-6 h-6" />;
      case 'Partner Custom': return <Rocket className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'Partner Starter': return 'from-blue-500 to-cyan-500';
      case 'Partner Professional': return 'from-purple-500 to-pink-500';
      case 'Partner Enterprise': return 'from-emerald-500 to-teal-500';
      case 'Partner Plus': return 'from-amber-500 to-orange-500';
      case 'Partner Custom': return 'from-red-500 to-rose-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(priceInCents / 100);
  };

  const getFeatureIcon = (feature: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'white_label': <Building2 className="w-4 h-4" />,
      'custom_branding': <Palette className="w-4 h-4" />,
      'priority_support': <Phone className="w-4 h-4" />,
      'advanced_analytics': <BarChart3 className="w-4 h-4" />,
      'custom_integrations': <Code className="w-4 h-4" />,
      'dedicated_support': <Shield className="w-4 h-4" />,
      'unlimited_portfolios': <Globe className="w-4 h-4" />,
      'custom_solutions': <Settings className="w-4 h-4" />
    };
    return iconMap[feature] || <CheckCircle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <FeatureGuard feature="enterprise_integrations">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Crown className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Partner Program
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive white-label solutions and enterprise API access for partners. 
            Build your own branded AI protection platform with our advanced infrastructure.
          </p>
        </div>

        {/* Current Subscription */}
        {currentSubscription && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getTierIcon(currentSubscription.tier_name)}
                  <div>
                    <CardTitle className="text-primary">Current Plan: {currentSubscription.tier_name}</CardTitle>
                    <CardDescription>
                      {formatPrice(currentSubscription.monthly_price)}/month • {currentSubscription.subscription_status}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{currentSubscription.api_calls_remaining.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">API Calls Remaining</div>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{currentSubscription.rate_limit_per_hour.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Calls/Hour</div>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {currentSubscription.max_organizations === null ? '∞' : currentSubscription.max_organizations}
                  </div>
                  <div className="text-sm text-muted-foreground">Organizations</div>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{currentSubscription.max_domains}</div>
                  <div className="text-sm text-muted-foreground">Custom Domains</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>API Usage</span>
                  <span>{currentSubscription.api_calls_used.toLocaleString()} / {currentSubscription.api_calls_included.toLocaleString()}</span>
                </div>
                <Progress 
                  value={(currentSubscription.api_calls_used / currentSubscription.api_calls_included) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Tiers */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Choose Your Partner Tier</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerTiers.map((tier) => (
              <Card 
                key={tier.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  currentSubscription?.tier_name === tier.tier_name 
                    ? 'ring-2 ring-primary shadow-lg scale-105' 
                    : 'hover:scale-105'
                }`}
              >
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${getTierColor(tier.tier_name)}`} />
                
                <CardHeader className="text-center space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${getTierColor(tier.tier_name)} flex items-center justify-center`}>
                    <div className="text-white">
                      {getTierIcon(tier.tier_name)}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold">{tier.tier_name}</h3>
                    <div className="text-3xl font-bold text-primary mt-2">
                      {formatPrice(tier.monthly_price)}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="font-semibold">{tier.api_calls_included.toLocaleString()}</div>
                      <div className="text-muted-foreground">API Calls</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="font-semibold">{tier.rate_limit_per_hour.toLocaleString()}/h</div>
                      <div className="text-muted-foreground">Rate Limit</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm uppercase tracking-wide">Features</h4>
                    <div className="space-y-2">
                      {tier.white_label_included && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Building2 className="w-4 h-4 text-green-500" />
                          <span>White Label Platform</span>
                        </div>
                      )}
                      {tier.custom_branding && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Palette className="w-4 h-4 text-green-500" />
                          <span>Custom Branding</span>
                        </div>
                      )}
                      {tier.dedicated_support && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span>Dedicated Support</span>
                        </div>
                      )}
                      {tier.custom_integrations && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Code className="w-4 h-4 text-green-500" />
                          <span>Custom Integrations</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Limits */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Organizations</span>
                      <span className="font-medium">
                        {tier.max_organizations === null ? 'Unlimited' : tier.max_organizations}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Users per Org</span>
                      <span className="font-medium">{tier.max_users_per_org.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custom Domains</span>
                      <span className="font-medium">{tier.max_domains}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className={`w-full ${
                      currentSubscription?.tier_name === tier.tier_name 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : ''
                    }`}
                    disabled={currentSubscription?.tier_name === tier.tier_name}
                  >
                    {currentSubscription?.tier_name === tier.tier_name ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Current Plan
                      </>
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>White Label Benefits</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Complete brand customization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Custom domain support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Multi-tenant architecture</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Organization management</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="w-5 h-5" />
                <span>Enterprise API Access</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>High-volume API calls</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Priority rate limits</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Advanced analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Webhook integrations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </FeatureGuard>
  );
};