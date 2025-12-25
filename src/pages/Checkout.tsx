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
  UserX
} from "lucide-react";
import { CheckoutTaxCalculation } from "@/components/billing/CheckoutTaxCalculation";
import { UserGuide } from "@/components/UserGuide";
import { checkoutGuide } from "@/data/userGuides";
import { BetaTestingAgreement } from "@/components/checkout/BetaTestingAgreement";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PlanDetails {
  name: string;
  price: number;
  features: string[];
  badge?: string;
}

const Checkout = () => {
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>("professional");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
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
    student: {
      name: "Student",
      price: 19,
      features: ["Up to 1,000 artworks", "Basic visual recognition", "Monthly reports", "Email support"],
      badge: "Student Discount"
    },
    starter: {
      name: "Starter",
      price: 29,
      features: ["Up to 3,500 artworks", "Basic visual recognition", "Weekly reports", "Email support"]
    },
    professional: {
      name: "Professional",
      price: 199,
      features: ["Up to 250,000 artworks", "Advanced AI recognition", "Real-time monitoring", "Blockchain verification", "Deepfake detection included", "Automated DMCA", "Priority support"],
      badge: "Most Popular"
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
  const yearlyDiscount = 0.2;
  let basePrice = billingCycle === "yearly" 
    ? currentPlan.price * 12 * (1 - yearlyDiscount)
    : currentPlan.price;
  
  // Add social media addon cost (available for all plans)
  const socialAddonCost = socialMediaAddon ? (billingCycle === "yearly" ? 1188 : 99) : 0;
  const socialStartupFee = socialMediaAddon ? 199 : 0;
  
  // Add AI training protection addon cost (available for all plans)
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
      // Get the current session to include the access token
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
        // Redirect to success page
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

    try {
      // Create subscription after successful payment
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          userId: user.id,
          planId: selectedPlan,
          billingCycle,
          socialMediaAddon,
          aiTrainingAddon,
          promoCode: promoCode.trim() || undefined,
          stripeCustomerId: 'demo_customer_' + Date.now(), // Demo mode
          stripeSubscriptionId: 'demo_sub_' + Date.now() // Demo mode
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Payment Successful!",
        description: `Welcome to TSMO ${currentPlan.name}! Your account is now active.`,
      });
      
      // Redirect to monitoring dashboard
      setTimeout(() => {
        window.location.href = "/monitoring";
      }, 2000);
    } catch (error) {
      toast({
        title: "Payment Failed",
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
                    <div key={key} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value={key} id={key} />
                      <Label htmlFor={key} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ${plan.price}/month
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

                <div>
                  <Label className="text-sm font-medium mb-3 block">Billing Cycle</Label>
                  <RadioGroup value={billingCycle} onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly">Monthly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yearly" id="yearly" />
                      <Label htmlFor="yearly" className="flex items-center gap-2">
                        Yearly 
                        <Badge variant="secondary" className="text-xs">
                          Save 20%
                        </Badge>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Social Media Monitoring Add-on */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Add-ons</Label>
                  
                  {/* Social Media Monitoring Add-on - Available for all plans */}
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

                  {/* Professional Plan Notice */}
                  {selectedPlan === 'professional' && (
                    <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <div className="text-sm font-medium text-green-800">
                          AI Training Protection included at no extra cost!
                        </div>
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        Social media monitoring and AI training protection available as add-ons
                      </div>
                    </div>
                  )}
                </div>
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
                    <div className="font-medium">{currentPlan.name} Plan</div>
                    <div className="text-sm text-muted-foreground">
                      {billingCycle === "yearly" ? "Annual" : "Monthly"} subscription
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${billingCycle === "yearly" ? Math.round(basePrice) : currentPlan.price}
                      {billingCycle === "yearly" ? "/year" : "/month"}
                    </div>
                    {billingCycle === "yearly" && (
                      <div className="text-sm text-green-600">
                        Save ${Math.round(currentPlan.price * 12 - basePrice)}
                      </div>
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

                 {/* Tax Calculation */}
                 <CheckoutTaxCalculation 
                   subtotal={subtotalPrice + totalStartupFees}
                   onTaxCalculated={handleTaxCalculated}
                 />

                 <Separator />

                 {/* Total */}
                 <div className="flex items-center justify-between text-lg font-bold">
                   <span>Total {(socialMediaAddon || aiTrainingAddon) ? "(First Payment)" : ""}</span>
                   <span>
                     ${finalPrice + totalStartupFees}
                     {billingCycle === "yearly" ? "/year" : "/month"}
                   </span>
                 </div>

                 {(socialMediaAddon || aiTrainingAddon) && (
                   <div className="text-sm text-muted-foreground">
                     * Future payments will be ${taxCalculation.total > 0 ? taxCalculation.total : subtotalPrice}{billingCycle === "yearly" ? "/year" : "/month"} (without setup fees)
                   </div>
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

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-medium">5-Day Free Trial</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Try TSMO risk-free for 5 days. Cancel anytime during your trial period.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form - Hidden for BETATESTER promo */}
            {promoCode.toLowerCase() !== 'betatester' && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Payment Method */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Payment Method</Label>
                    <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "card" | "paypal")}>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                          <CreditCard className="w-4 h-4" />
                          Credit/Debit Card
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="cursor-pointer">
                          PayPal
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input 
                          id="cardName" 
                          placeholder="John Doe" 
                          required 
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input 
                          id="cardNumber" 
                          placeholder="1234 5678 9012 3456" 
                          required 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input 
                            id="expiry" 
                            placeholder="MM/YY" 
                            required 
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input 
                            id="cvv" 
                            placeholder="123" 
                            required 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Billing Address */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Billing Address</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" required />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" required />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" required />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" required />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input id="zipCode" required />
                      </div>
                    </div>
                  </div>

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
                            <p>By accessing and using TSMO Technology's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                            
                            <h3 className="text-lg font-semibold mt-6 mb-3">2. Description of Service</h3>
                            <p>TSMO Technology provides AI-powered content protection, monitoring, and legal support services for creators. Our services include but are not limited to:</p>
                            <ul className="list-disc pl-6 space-y-1">
                              <li>Real-time content monitoring across multiple platforms</li>
                              <li>AI-powered deepfake detection</li>
                              <li>Automated DMCA takedown notice generation and filing</li>
                              <li>Legal document preparation and filing assistance</li>
                            </ul>

                            <h3 className="text-lg font-semibold mt-6 mb-3">3. User Responsibilities</h3>
                            <p>You agree to:</p>
                            <ul className="list-disc pl-6 space-y-1">
                              <li>Provide accurate and complete information</li>
                              <li>Maintain the security of your account credentials</li>
                              <li>Use the service only for lawful purposes</li>
                              <li>Not misuse or attempt to circumvent our security measures</li>
                            </ul>

                            <h3 className="text-lg font-semibold mt-6 mb-3">4. Payment and Billing</h3>
                            <p>Subscription fees are billed in advance on a monthly or annual basis. You authorize us to charge your payment method for all fees. Refunds are provided in accordance with our refund policy.</p>

                            <h3 className="text-lg font-semibold mt-6 mb-3">5. Intellectual Property</h3>
                            <p>You retain all rights to your content. We claim no ownership over any content you submit. Our services and technology remain our intellectual property.</p>

                            <h3 className="text-lg font-semibold mt-6 mb-3">6. Limitation of Liability</h3>
                            <p>TSMO Technology provides services "as is" and makes no warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of our services.</p>

                            <h3 className="text-lg font-semibold mt-6 mb-3">7. Termination</h3>
                            <p>We reserve the right to suspend or terminate your account for violation of these terms or any applicable law.</p>

                            <h3 className="text-lg font-semibold mt-6 mb-3">8. Changes to Terms</h3>
                            <p>We may modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.</p>
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
                            <p>We collect information you provide directly to us, including:</p>
                            <ul className="list-disc pl-6 space-y-1">
                              <li>Account information (name, email, payment details)</li>
                              <li>Content you upload for protection and monitoring</li>
                              <li>Communications with our support team</li>
                              <li>Usage data and analytics</li>
                            </ul>

                            <h3 className="text-lg font-semibold mt-6 mb-3">2. How We Use Your Information</h3>
                            <p>We use your information to:</p>
                            <ul className="list-disc pl-6 space-y-1">
                              <li>Provide and improve our services</li>
                              <li>Process payments and transactions</li>
                              <li>Send service updates and notifications</li>
                              <li>Monitor for unauthorized use of your content</li>
                              <li>Comply with legal obligations</li>
                            </ul>

                            <h3 className="text-lg font-semibold mt-6 mb-3">3. Data Security</h3>
                            <p>We implement industry-standard security measures including encryption, secure data storage, and regular security audits to protect your information.</p>

                            <h3 className="text-lg font-semibold mt-6 mb-3">4. Data Sharing</h3>
                            <p>We do not sell your personal information. We may share data with:</p>
                            <ul className="list-disc pl-6 space-y-1">
                              <li>Service providers who assist in our operations</li>
                              <li>Legal authorities when required by law</li>
                              <li>Third parties with your explicit consent</li>
                            </ul>

                            <h3 className="text-lg font-semibold mt-6 mb-3">5. Your Rights</h3>
                            <p>You have the right to:</p>
                            <ul className="list-disc pl-6 space-y-1">
                              <li>Access your personal data</li>
                              <li>Request corrections to your data</li>
                              <li>Request deletion of your data</li>
                              <li>Opt-out of marketing communications</li>
                              <li>Export your data</li>
                            </ul>

                            <h3 className="text-lg font-semibold mt-6 mb-3">6. Cookies and Tracking</h3>
                            <p>We use cookies and similar technologies to improve user experience, analyze usage patterns, and personalize content.</p>

                            <h3 className="text-lg font-semibold mt-6 mb-3">7. International Data Transfers</h3>
                            <p>Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.</p>

                            <h3 className="text-lg font-semibold mt-6 mb-3">8. Children's Privacy</h3>
                            <p>Our services are not intended for users under 18. We do not knowingly collect information from children.</p>

                            <h3 className="text-lg font-semibold mt-6 mb-3">9. Contact Us</h3>
                            <p>For privacy-related questions, contact us at privacy@tsmotech.com</p>
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

                  {/* Security Notice */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <Lock className="w-4 h-4" />
                    <span>Your payment information is encrypted and secure</span>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-accent text-lg py-6"
                    disabled={isProcessing || !betaAgreementAccepted}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        Start Free Trial
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    You won't be charged until your 5-day free trial ends
                  </div>
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

                    {/* Beta Testing Agreement */}
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