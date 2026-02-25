import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  Lock, 
  Shield, 
  Check,
  ArrowRight,
  Zap,
  Star,
  User,
  Users,
  Building2
} from "lucide-react";
import { CheckoutTaxCalculation } from "@/components/billing/CheckoutTaxCalculation";
import { UserGuide } from "@/components/UserGuide";
import { checkoutGuide } from "@/data/userGuides";
import { BetaTestingAgreement } from "@/components/checkout/BetaTestingAgreement";
import StripeDisclosure from "@/components/billing/StripeDisclosure";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PlanDetails {
  name: string;
  price: number | null;
  originalPrice?: number | null;
  features: string[];
  badge?: string;
  discount?: string;
  isContactSales?: boolean;
}

const Checkout = () => {
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [socialMediaAddon, setSocialMediaAddon] = useState(false);
  const [aiTrainingAddon, setAiTrainingAddon] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);
  const [betaAgreementAccepted, setBetaAgreementAccepted] = useState(false);
  const [taxCalculation, setTaxCalculation] = useState({
    subtotal: 0,
    tax_amount: 0,
    total: 0,
    tax_breakdown: [],
    applicable_taxes: []
  });
  
  // Auth form states
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    fullName: '',
    username: ''
  });

  const plans: Record<string, PlanDetails> = {
    free: {
      name: "Free",
      price: 0,
      features: [
        "Up to 50 artworks protected",
        "Basic image upload & storage",
        "Basic monitoring",
        "Email alerts",
        "AI Training protection",
        "Community support"
      ],
    },
    pro: {
      name: "Pro",
      price: 29,
      originalPrice: 49,
      discount: "40% OFF",
      badge: "Most Popular",
      features: [
        "Up to 50,000 artworks protected",
        "Advanced image upload & storage",
        "Real-time monitoring",
        "Instant email & push alerts",
        "AI Training protection",
        "AI threat detection",
        "Portfolio monitoring",
        "Watermark protection",
        "Blockchain verification",
        "DMCA filing assistance",
        "Priority support"
      ],
    },
    enterprise: {
      name: "Enterprise",
      price: null,
      isContactSales: true,
      features: [
        "Unlimited artworks protected",
        "Everything in Pro, plus:",
        "Custom AI model training",
        "Dedicated account manager",
        "Custom integrations & API",
        "Team management",
        "Advanced analytics",
        "SLA guarantees",
        "White-label options"
      ],
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get("plan");
    if (plan && plans[plan]) {
      setSelectedPlan(plan);
    }
  }, []);

  const currentPlan = plans[selectedPlan];
  
  // Price calculations
  const getBasePrice = () => {
    if (!currentPlan.price) return 0;
    if (billingCycle === "yearly") {
      return selectedPlan === "pro" ? 290 : currentPlan.price * 12;
    }
    return currentPlan.price;
  };

  const basePrice = getBasePrice();
  
  // Add social media addon cost
  const socialAddonCost = socialMediaAddon ? (billingCycle === "yearly" ? 1188 : 99) : 0;
  const socialStartupFee = socialMediaAddon ? 199 : 0;
  
  // Add AI training protection addon cost
  const aiTrainingAddonCost = aiTrainingAddon ? (billingCycle === "yearly" ? 588 : 49) : 0;
  const aiTrainingStartupFee = aiTrainingAddon ? 100 : 0;
  
  const subtotalPrice = basePrice + socialAddonCost + aiTrainingAddonCost;
  const totalStartupFees = socialStartupFee + aiTrainingStartupFee;
  const finalPrice = taxCalculation.total > 0 ? taxCalculation.total + totalStartupFees : subtotalPrice + totalStartupFees;

  const handleAuthFormChange = (field: string, value: string) => {
    setAuthForm(prev => ({ ...prev, [field]: value }));
  };

  const handleTaxCalculated = (result: any) => {
    setTaxCalculation(result);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthProcessing(true);

    const { error } = await signIn(authForm.email, authForm.password);
    
    if (error) {
      toast({
        title: "Sign In Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome Back!",
        description: "You've been successfully signed in.",
      });
    }
    
    setIsAuthProcessing(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthProcessing(true);

    const { error } = await signUp(authForm.email, authForm.password, {
      full_name: authForm.fullName,
      username: authForm.username,
    });
    
    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
    }
    
    setIsAuthProcessing(false);
  };

  const handleBetaActivation = async () => {
    if (isProcessing) return;
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in or create an account to activate beta access.",
        variant: "destructive",
      });
      return;
    }

    if (!betaAgreementAccepted) {
      toast({
        title: "Agreement Required",
        description: "Please read and accept the Beta Testing Agreement to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error("No authentication token available");
      }

      const { data, error } = await supabase.functions.invoke('activate-beta-access', {
        body: {
          promoCode: promoCode
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (error) {
        console.error('Beta activation error:', error);
        toast({
          title: "Beta Activation Failed",
          description: error.message || "Failed to activate beta access",
          variant: "destructive",
        });
        return;
      }

      if (data?.success) {
        toast({
          title: "Beta Access Activated!",
          description: "Welcome to your free 60-day trial.",
        });
        setTimeout(() => {
          window.location.href = "/success?beta=true";
        }, 2000);
      } else {
        toast({
          title: "Beta Activation Failed",
          description: data?.error || "Failed to activate beta access",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Beta activation error:', error);
      toast({
        title: "Beta Activation Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in or create an account first.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    if (!betaAgreementAccepted) {
      toast({
        title: "Agreement Required",
        description: "Please read and accept the Beta Testing Agreement to continue.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    // Handle free plan
    if (selectedPlan === 'free') {
      toast({
        title: "Free Plan Activated!",
        description: "Your free plan is now active.",
      });
      setTimeout(() => {
        window.location.href = "/success?plan=free";
      }, 1500);
      setIsProcessing(false);
      return;
    }

    // Handle enterprise plan
    if (selectedPlan === 'enterprise') {
      toast({
        title: "Contact Sales",
        description: "Our enterprise team will contact you within 24 hours.",
      });
      setTimeout(() => {
        window.location.href = "/contact?plan=enterprise";
      }, 1500);
      setIsProcessing(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          planId: selectedPlan,
          billingCycle,
          email: user.email,
          promoCode: promoCode.trim() || undefined,
          socialMediaAddon,
          deepfakeAddon: false,
          aiTrainingAddon,
          userId: user.id,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirecting to Checkout",
          description: "Opening secure Stripe payment page in a new tab...",
        });
      } else if (data?.message) {
        toast({
          title: "Success",
          description: data.message,
        });
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Complete Your Order
            </h1>
            <UserGuide 
              title={checkoutGuide.title}
              description={checkoutGuide.description}
              sections={checkoutGuide.sections}
            />
          </div>
          <p className="text-lg text-muted-foreground">
            Join artists protecting their creative work with TSMO.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Plan Selection */}
          <div className="lg:col-span-1">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Choose Your Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                  {Object.entries(plans).map(([key, plan]) => (
                    <div key={key} className={`flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors ${key === 'pro' ? 'ring-2 ring-primary' : ''}`}>
                      <RadioGroupItem value={key} id={key} />
                      <Label htmlFor={key} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {plan.name}
                              {plan.discount && (
                                <Badge variant="destructive" className="text-xs">
                                  {plan.discount}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {plan.isContactSales ? (
                                "Contact Sales"
                              ) : plan.price === 0 ? (
                                "$0/month"
                              ) : (
                                <span className="flex items-center gap-1">
                                  {plan.originalPrice && (
                                    <span className="line-through text-muted-foreground/60">
                                      ${plan.originalPrice}
                                    </span>
                                  )}
                                  ${plan.price}/month
                                </span>
                              )}
                            </div>
                          </div>
                          {plan.badge && (
                            <Badge variant="default" className="ml-2">
                              {plan.badge}
                            </Badge>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <Separator />

                {/* Billing Cycle - hide for free/enterprise */}
                {selectedPlan === 'pro' && (
                  <>
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Billing Cycle</Label>
                      <RadioGroup value={billingCycle} onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="monthly" id="monthly" />
                          <Label htmlFor="monthly">Monthly - $29/mo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yearly" id="yearly" />
                          <Label htmlFor="yearly" className="flex items-center gap-2">
                            Yearly - $290/yr
                            <Badge variant="secondary" className="text-xs">
                              Save $58
                            </Badge>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />
                  </>
                )}

                {/* Add-ons - only for pro plan */}
                {selectedPlan === 'pro' && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Add-ons</Label>
                    
                    {/* Social Media Monitoring Add-on */}
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="social-addon" 
                          checked={socialMediaAddon}
                          onCheckedChange={(checked) => setSocialMediaAddon(!!checked)}
                        />
                        <Label htmlFor="social-addon" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <div>
                              <div className="font-medium">Social Media Monitoring</div>
                              <div className="text-xs text-muted-foreground">
                                Monitor unlimited social profiles for impersonation
                              </div>
                              <div className="text-xs text-orange-600 font-medium">
                                Includes $199 one-time setup fee
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="text-sm font-medium">
                        +${billingCycle === "yearly" ? "1,188" : "99"}/{billingCycle === "yearly" ? "year" : "month"}
                      </div>
                    </div>

                    {/* AI Training Protection Add-on */}
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="aitraining-addon" 
                          checked={aiTrainingAddon}
                          onCheckedChange={(checked) => setAiTrainingAddon(!!checked)}
                        />
                        <Label htmlFor="aitraining-addon" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            <div>
                              <div className="font-medium">AI Training Protection</div>
                              <div className="text-xs text-muted-foreground">
                                Advanced protection against AI training data harvesting
                              </div>
                              <div className="text-xs text-orange-600 font-medium">
                                Includes $100 one-time setup fee
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="text-sm font-medium">
                        +${billingCycle === "yearly" ? "588" : "49"}/{billingCycle === "yearly" ? "year" : "month"}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* Authentication Section */}
            {!user && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Sign In or Create Account
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="signin">Sign In</TabsTrigger>
                      <TabsTrigger value="signup">Create Account</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="signin" className="space-y-4">
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div>
                          <Label htmlFor="signin-email">Email Address</Label>
                          <Input 
                            id="signin-email" 
                            type="email" 
                            placeholder="your@email.com"
                            value={authForm.email}
                            onChange={(e) => handleAuthFormChange('email', e.target.value)}
                            required 
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="signin-password">Password</Label>
                          <Input 
                            id="signin-password" 
                            type="password" 
                            placeholder="Your password"
                            value={authForm.password}
                            onChange={(e) => handleAuthFormChange('password', e.target.value)}
                            required 
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={isAuthProcessing}
                        >
                          {isAuthProcessing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Signing In...
                            </>
                          ) : (
                            'Sign In'
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="signup" className="space-y-4">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div>
                          <Label htmlFor="signup-name">Full Name</Label>
                          <Input 
                            id="signup-name" 
                            placeholder="John Doe"
                            value={authForm.fullName}
                            onChange={(e) => handleAuthFormChange('fullName', e.target.value)}
                            required 
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="signup-username">Username</Label>
                          <Input 
                            id="signup-username" 
                            placeholder="johndoe"
                            value={authForm.username}
                            onChange={(e) => handleAuthFormChange('username', e.target.value)}
                            required 
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="signup-email">Email Address</Label>
                          <Input 
                            id="signup-email" 
                            type="email" 
                            placeholder="your@email.com"
                            value={authForm.email}
                            onChange={(e) => handleAuthFormChange('email', e.target.value)}
                            required 
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="signup-password">Password</Label>
                          <Input 
                            id="signup-password" 
                            type="password" 
                            placeholder="Create a password"
                            value={authForm.password}
                            onChange={(e) => handleAuthFormChange('password', e.target.value)}
                            required 
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={isAuthProcessing}
                        >
                          {isAuthProcessing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Creating Account...
                            </>
                          ) : (
                            'Create Account'
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* User Info Display */}
            {user && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-muted-foreground">Signed in successfully</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {currentPlan.name} Plan
                      {currentPlan.discount && (
                        <Badge variant="destructive" className="text-xs">{currentPlan.discount}</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {currentPlan.isContactSales
                        ? "Custom pricing"
                        : billingCycle === "yearly" ? "Annual subscription" : "Monthly subscription"}
                    </div>
                  </div>
                  <div className="text-right">
                    {currentPlan.isContactSales ? (
                      <div className="font-medium">Contact Sales</div>
                    ) : (
                      <>
                        <div className="font-medium flex items-center gap-2">
                          {currentPlan.originalPrice && (
                            <span className="line-through text-muted-foreground/60 text-sm">
                              ${billingCycle === "yearly" ? 490 : currentPlan.originalPrice}
                            </span>
                          )}
                          ${basePrice}
                          {billingCycle === "yearly" ? "/year" : "/month"}
                        </div>
                        {currentPlan.originalPrice && (
                          <div className="text-sm text-green-600">
                            You save ${billingCycle === "yearly" ? 200 : (currentPlan.originalPrice - (currentPlan.price || 0))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Social Media Add-on Line Item */}
                {socialMediaAddon && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          Social Media Monitoring
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Monthly/Annual subscription
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          +${billingCycle === "yearly" ? "1,188" : "99"}
                          {billingCycle === "yearly" ? "/year" : "/month"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-orange-600">Setup Fee</div>
                        <div className="text-sm text-muted-foreground">
                          One-time social media monitoring setup
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-orange-600">
                          +$199 (one-time)
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* AI Training Protection Add-on Line Item */}
                {aiTrainingAddon && (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        AI Training Protection
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Monthly/Annual subscription
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        +${billingCycle === "yearly" ? "588" : "49"}
                        {billingCycle === "yearly" ? "/year" : "/month"}
                      </div>
                      <div className="font-medium text-orange-600">
                        +$100 (one-time)
                      </div>
                    </div>
                  </div>
                )}

                {/* Promo Code Section */}
                <div className="space-y-3">
                  <Label htmlFor="promoCode" className="text-sm font-medium">
                    Promo Code (Optional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="promoCode"
                      placeholder="Enter promo code (e.g., BETATESTER)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  {promoCode.toLowerCase() === 'betatester' && (
                    <div className="text-sm text-green-600 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      2 months free applied!
                    </div>
                  )}
                  {promoCode.toLowerCase() === 'freemonth' && (
                    <div className="text-sm text-green-600 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      1 month free applied!
                    </div>
                  )}
                </div>

                 <Separator />

                 {/* Tax Calculation - only for paid plans */}
                 {selectedPlan === 'pro' && (
                   <CheckoutTaxCalculation 
                     subtotal={subtotalPrice + totalStartupFees}
                     onTaxCalculated={handleTaxCalculated}
                   />
                 )}

                 <Separator />

                 {/* Total */}
                 {!currentPlan.isContactSales && (
                   <>
                     <div className="flex items-center justify-between text-lg font-bold">
                       <span>Total {(socialMediaAddon || aiTrainingAddon) ? "(First Payment)" : ""}</span>
                       <span>
                         ${currentPlan.price === 0 ? "0" : finalPrice}
                         {currentPlan.price !== 0 && (billingCycle === "yearly" ? "/year" : "/month")}
                       </span>
                     </div>

                     {(socialMediaAddon || aiTrainingAddon) && (
                       <div className="text-sm text-muted-foreground">
                         * Future payments will be ${taxCalculation.total > 0 ? taxCalculation.total : subtotalPrice}{billingCycle === "yearly" ? "/year" : "/month"} (without setup fees)
                       </div>
                     )}
                   </>
                 )}

                <Separator />

                <div className="space-y-2">
                  <div className="font-medium mb-2">What's included:</div>
                  {currentPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {selectedPlan !== 'free' && !currentPlan.isContactSales && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-medium">5-Day Free Trial</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Try TSMO risk-free for 5 days. Cancel anytime during your trial period.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Section - Stripe Redirect */}
            {promoCode.toLowerCase() !== 'betatester' && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    {currentPlan.isContactSales ? "Contact Sales" : "Payment"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Stripe Redirect Notice */}
                    {!currentPlan.isContactSales && currentPlan.price !== 0 && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-primary">Secure Checkout</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          You'll be redirected to Stripe's secure checkout to complete your payment. 
                          Your payment information is handled securely by Stripe.
                        </p>
                      </div>
                    )}

                    {currentPlan.isContactSales && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-primary">Enterprise Solutions</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Our enterprise team will create a custom solution tailored to your organization's needs.
                        </p>
                      </div>
                    )}

                    {/* Terms */}
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the{' '}
                        <Dialog>
                          <DialogTrigger asChild>
                            <button type="button" className="text-primary underline hover:text-primary/80">
                              Terms of Service
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Terms of Service</DialogTitle>
                            </DialogHeader>
                            <div className="prose prose-sm max-w-none">
                              <p className="text-muted-foreground mb-4">Last Updated: January 15, 2025</p>
                              <h3 className="text-lg font-semibold mt-6 mb-3">1. Acceptance of Terms</h3>
                              <p>By accessing and using TSMO Technology's services, you agree to be bound by these Terms of Service.</p>
                              <h3 className="text-lg font-semibold mt-6 mb-3">2. Description of Service</h3>
                              <p>TSMO Technology provides AI-powered content protection, monitoring, and legal support services for creators.</p>
                              <h3 className="text-lg font-semibold mt-6 mb-3">3. Payment and Billing</h3>
                              <p>Subscription fees are billed in advance on a monthly or annual basis. You authorize us to charge your payment method for all fees.</p>
                              <h3 className="text-lg font-semibold mt-6 mb-3">4. Intellectual Property</h3>
                              <p>You retain all rights to your content. We claim no ownership over any content you submit.</p>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {' '}and{' '}
                        <Dialog>
                          <DialogTrigger asChild>
                            <button type="button" className="text-primary underline hover:text-primary/80">
                              Privacy Policy
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Privacy Policy</DialogTitle>
                            </DialogHeader>
                            <div className="prose prose-sm max-w-none">
                              <p className="text-muted-foreground mb-4">Last Updated: January 15, 2025</p>
                              <h3 className="text-lg font-semibold mt-6 mb-3">1. Information We Collect</h3>
                              <p>We collect information you provide directly to us, including account information and content you upload.</p>
                              <h3 className="text-lg font-semibold mt-6 mb-3">2. Data Security</h3>
                              <p>We implement industry-standard security measures including encryption and secure data storage.</p>
                              <h3 className="text-lg font-semibold mt-6 mb-3">3. Your Rights</h3>
                              <p>You have the right to access, correct, delete, and export your personal data.</p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </Label>
                    </div>

                    {/* Beta Testing Agreement */}
                    <BetaTestingAgreement 
                      accepted={betaAgreementAccepted}
                      onAcceptedChange={setBetaAgreementAccepted}
                    />

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-primary to-accent text-lg py-6"
                      disabled={isProcessing || !betaAgreementAccepted}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : currentPlan.isContactSales ? (
                        <>
                          Contact Sales
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      ) : currentPlan.price === 0 ? (
                        <>
                          Activate Free Plan
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      ) : (
                        <>
                          Continue to Secure Checkout
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>

                    {selectedPlan === 'pro' && (
                      <div className="text-center text-sm text-muted-foreground">
                        You won't be charged until your 5-day free trial ends
                      </div>
                    )}

                    <StripeDisclosure />
                  </form>
                </CardContent>
              </Card>
            )}

            {/* BETATESTER Special Access */}
            {promoCode.toLowerCase() === 'betatester' && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Beta Tester Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Free Beta Access Approved!</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Get 2 months of free access to test all features. No payment required.
                      </p>
                    </div>

                    <BetaTestingAgreement 
                      accepted={betaAgreementAccepted}
                      onAcceptedChange={setBetaAgreementAccepted}
                    />
                    
                    <Button 
                      type="button" 
                      onClick={handleBetaActivation}
                      className="w-full bg-gradient-to-r from-primary to-accent text-lg py-6"
                      disabled={isProcessing || !betaAgreementAccepted}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Activating Beta Access...
                        </>
                      ) : (
                        <>
                          Activate Free Beta Access
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>256-bit SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Trusted by 10,000+ artists</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-500" />
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
