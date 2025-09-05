import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Shield, Star, Check, AlertCircle, Calendar, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface InsuranceProduct {
  id: string;
  name: string;
  provider: string;
  coverage: string;
  premium: number;
  features: string[];
  rating: number;
  eligibility: string[];
  claims: number;
}

interface UserCoverage {
  productId: string;
  status: 'active' | 'pending' | 'expired';
  coverageAmount: number;
  premium: number;
  nextPayment: string;
  claimsRemaining: number;
}

export const IPInsurancePartnership: React.FC = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [products, setProducts] = useState<InsuranceProduct[]>([]);
  const [userCoverage, setUserCoverage] = useState<UserCoverage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadInsuranceData();
  }, []);

  const loadInsuranceData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ip-insurance-partnership', {
        body: { action: 'getProducts' }
      });

      if (error) throw error;

      // Mock data for demonstration
      const mockProducts: InsuranceProduct[] = [
        {
          id: '1',
          name: 'IP Shield Pro',
          provider: 'CyberGuard Insurance',
          coverage: 'Up to $1M for IP theft and unauthorized use',
          premium: 299,
          features: [
            'Global coverage across 50+ countries',
            'Legal fee protection up to $500K',
            'Emergency takedown services',
            '24/7 incident response team',
            'AI-powered threat monitoring'
          ],
          rating: 4.9,
          eligibility: ['Active content creators', 'Verified IP ownership', 'No prior claims'],
          claims: 12
        },
        {
          id: '2',
          name: 'Creator Defense',
          provider: 'Digital Rights Insurance',
          coverage: 'Up to $500K for content theft and deepfakes',
          premium: 149,
          features: [
            'Deepfake protection coverage',
            'Social media monitoring',
            'DMCA enforcement support',
            'Identity theft protection',
            'Revenue loss compensation'
          ],
          rating: 4.7,
          eligibility: ['Social media presence', 'Regular content creation', 'Good credit score'],
          claims: 8
        },
        {
          id: '3',
          name: 'Enterprise IP Suite',
          provider: 'Global IP Protectors',
          coverage: 'Up to $5M for comprehensive IP protection',
          premium: 899,
          features: [
            'Patent infringement coverage',
            'Trade secret protection',
            'International litigation support',
            'Regulatory compliance insurance',
            'Crisis management services'
          ],
          rating: 4.8,
          eligibility: ['Business entity', 'Substantial IP portfolio', 'Annual revenue >$1M'],
          claims: 25
        }
      ];

      const mockUserCoverage: UserCoverage[] = [
        {
          productId: '2',
          status: 'active',
          coverageAmount: 500000,
          premium: 149,
          nextPayment: '2024-02-15',
          claimsRemaining: 3
        }
      ];

      setProducts(mockProducts);
      setUserCoverage(mockUserCoverage);

    } catch (error) {
      console.error('Failed to load insurance data:', error);
      toast({
        title: "Error",
        description: "Failed to load insurance products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (productId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ip-insurance-partnership', {
        body: { 
          action: 'initiatePurchase',
          productId 
        }
      });

      if (error) throw error;

      toast({
        title: "Purchase Initiated",
        description: "You'll be redirected to complete your insurance application",
      });

      // In a real implementation, redirect to insurance provider's application flow
      window.open('https://insurance-partner.com/apply', '_blank');

    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Unable to initiate purchase. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClaim = async (productId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ip-insurance-partnership', {
        body: { 
          action: 'initiateClaim',
          productId 
        }
      });

      if (error) throw error;

      toast({
        title: "Claim Initiated",
        description: "Your claim has been submitted for review",
      });

    } catch (error) {
      toast({
        title: "Claim Failed",
        description: "Unable to submit claim. Please contact support.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading insurance products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            IP Insurance Partnerships
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse">Browse Products</TabsTrigger>
              <TabsTrigger value="coverage">My Coverage</TabsTrigger>
              <TabsTrigger value="claims">Claims</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Protect your intellectual property with comprehensive insurance coverage from our trusted partners.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="relative">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{product.provider}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{product.rating}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-semibold text-2xl">${product.premium}/mo</p>
                        <p className="text-sm text-gray-600">{product.coverage}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Features</h4>
                        <ul className="space-y-1">
                          {product.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="text-sm flex items-center gap-2">
                              <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                          {product.features.length > 3 && (
                            <li className="text-xs text-gray-500">
                              +{product.features.length - 3} more features
                            </li>
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Eligibility</h4>
                        <ul className="space-y-1">
                          {product.eligibility.map((req, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-center gap-2">
                              <div className="w-1 h-1 bg-gray-400 rounded-full" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button 
                        onClick={() => handlePurchase(product.id)}
                        className="w-full"
                      >
                        Get Quote
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="coverage" className="space-y-4">
              {userCoverage.length > 0 ? (
                <div className="space-y-4">
                  {userCoverage.map((coverage) => {
                    const product = products.find(p => p.id === coverage.productId);
                    if (!product) return null;

                    return (
                      <Card key={coverage.productId}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{product.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">{product.provider}</p>
                            </div>
                            <Badge variant={coverage.status === 'active' ? 'default' : 'secondary'}>
                              {coverage.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Coverage</p>
                              <p className="font-semibold">
                                ${coverage.coverageAmount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Monthly Premium</p>
                              <p className="font-semibold">${coverage.premium}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Next Payment</p>
                              <p className="font-semibold">{coverage.nextPayment}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Claims Left</p>
                              <p className="font-semibold">{coverage.claimsRemaining}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Manage Policy
                            </Button>
                            <Button variant="outline" className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Update Payment
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Active Coverage</h3>
                  <p className="text-gray-600 mb-4">
                    Protect your intellectual property with our insurance partners
                  </p>
                  <Button onClick={() => setActiveTab('browse')}>
                    Browse Insurance Products
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="claims" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  File a claim if your intellectual property has been infringed or stolen.
                </AlertDescription>
              </Alert>

              {userCoverage.length > 0 ? (
                <div className="space-y-4">
                  {userCoverage.map((coverage) => {
                    const product = products.find(p => p.id === coverage.productId);
                    if (!product) return null;

                    return (
                      <Card key={coverage.productId}>
                        <CardHeader>
                          <CardTitle>{product.name} - File Claim</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Coverage Amount</p>
                              <p className="font-semibold">
                                ${coverage.coverageAmount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Claims Remaining</p>
                              <p className="font-semibold">{coverage.claimsRemaining}</p>
                            </div>
                          </div>

                          <Button 
                            onClick={() => handleClaim(coverage.productId)}
                            disabled={coverage.claimsRemaining === 0}
                            className="w-full"
                          >
                            {coverage.claimsRemaining > 0 ? 'File New Claim' : 'No Claims Remaining'}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Insurance Coverage</h3>
                  <p className="text-gray-600 mb-4">
                    You need active insurance coverage to file claims
                  </p>
                  <Button onClick={() => setActiveTab('browse')}>
                    Get Insurance Coverage
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};