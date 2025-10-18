import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Lock, Mail, User, Check, CreditCard } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<'free' | 'paid'>('free');
  const [promoCode, setPromoCode] = useState('');
  const [promoValidated, setPromoValidated] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const freeFeatures = [
    'Upload up to 5 artworks',
    'Basic copyright monitoring', 
    'Email alerts for violations',
    'Community access',
    'Basic legal templates'
  ];

  const paidPlans = {
    starter: {
      name: 'Starter',
      monthly: 29,
      yearly: 290,
      features: ['Advanced monitoring', '25 artworks', 'Real-time alerts', 'Basic reporting']
    },
    professional: {
      name: 'Professional', 
      monthly: 79,
      yearly: 790,
      features: ['Premium monitoring', 'Unlimited artworks', 'Priority alerts', 'Advanced analytics', 'DMCA assistance']
    }
  };

  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;
    
    try {
      const { data, error } = await supabase.rpc('validate_promo_code', {
        code_param: promoCode.toUpperCase()
      });

      if (error) throw error;

      const result = data as { valid: boolean; discount_percentage?: number; error?: string };

      if (result.valid && result.discount_percentage) {
        setPromoValidated(true);
        setPromoDiscount(result.discount_percentage);
        toast({
          title: "Promo code validated!",
          description: `You'll get ${result.discount_percentage}% lifetime discount on all plans!`,
        });
      } else {
        toast({
          title: "Invalid promo code",
          description: result.error || "This promo code is not valid",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Promo validation error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email.trim(), password.trim());
        if (!error) {
          navigate('/dashboard');
        }
      } else {
        // For free account signup
        const { error } = await signUp(email, password, {
          full_name: fullName,
          username: username,
          account_type: 'free',
          promo_code: promoValidated ? promoCode.toUpperCase() : undefined
        });
        
        if (!error) {
          if (promoValidated) {
            toast({
              title: "Account created with promo code!",
              description: `Check your email to verify. You have ${promoDiscount}% lifetime discount on all plans!`,
            });
          } else {
            toast({
              title: "Account created successfully!",
              description: "Check your email to verify your account, then you can start using TSMO for free.",
            });
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user) {
      toast({
        title: "Please sign in first",
        description: "You need to be signed in to upgrade your account.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          planId: 'starter',
          billingCycle: 'monthly',
          email
        }
      });

      if (error) {
        toast({
          title: "Upgrade failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Upgrade opened",
          description: "Complete your payment in the new tab to upgrade your account.",
        });
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "Upgrade error",
        description: "Failed to setup upgrade. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Welcome back' : 'Join TSMO for Free'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin
              ? 'Sign in to your TSMO account'
              : 'Create your free account and start protecting your content today'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={isLogin ? 'login' : 'signup'} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="login" 
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Promo Code Field */}
                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="promo-code" className="flex items-center gap-2">
                    Promo Code <Badge variant="secondary" className="text-xs">Optional</Badge>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="promo-code"
                      type="text"
                      placeholder="Enter BETA200 for 30% off"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1"
                      disabled={promoValidated}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={validatePromoCode}
                      disabled={!promoCode.trim() || promoValidated}
                    >
                      {promoValidated ? 'Applied' : 'Apply'}
                    </Button>
                  </div>
                  {promoValidated && (
                    <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      {promoDiscount}% lifetime discount activated!
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Beta testers: First 200 signups get 30% off all plans forever!
                  </p>
                </div>

                {/* Free Account Benefits */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-green-600">Free Account Includes:</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {freeFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center text-xs text-muted-foreground">
                    You can upgrade to premium features anytime after creating your account.
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Free Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          {!isLogin && (
            <Button
              variant="outline"
              onClick={() => navigate('/pricing')}
              className="w-full"
            >
              View Premium Plans
            </Button>
          )}
          <p className="text-sm text-muted-foreground text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;