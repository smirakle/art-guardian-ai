import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, Star, Shield, Zap, Crown, Building2, User, Mail, Tag, Users } from "lucide-react";
import { SLAGuarantees } from "@/components/sla/SLAGuarantees";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Pricing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [socialMediaAddon, setSocialMediaAddon] = useState<{[key: string]: boolean}>({});
  const [aiTrainingAddon, setAiTrainingAddon] = useState<{[key: string]: boolean}>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [emailError, setEmailError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = async (planId: string) => {
    console.log('Form submit triggered for plan:', planId);
    console.log('Form data:', formData);
    
    if (!formData.email || !formData.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to continue",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Calling create-checkout-session with:', {
        planId: planId.toLowerCase(),
        billingCycle,
        email: formData.email,
        promoCode: promoCode.trim() || undefined,
        socialMediaAddon: socialMediaAddon[planId] || false,
        aiTrainingAddon: aiTrainingAddon[planId] || false
      });

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          planId: planId.toLowerCase(),
          billingCycle,
          email: formData.email,
          promoCode: promoCode.trim() || undefined,
          socialMediaAddon: socialMediaAddon[planId] || false,
          aiTrainingAddon: aiTrainingAddon[planId] || false
        }
      });

      console.log('Checkout response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to Checkout",
          description: promoCode && promoCode.toLowerCase() === 'feedback' 
            ? "Your promotional code has been applied! One month free." 
            : "Opening secure payment page in new tab...",
        });
      } else if (data?.message) {
        toast({
          title: "Success",
          description: data.message,
        });
      } else {
        console.error('No URL in response:', data);
        toast({
          title: "Checkout Error",
          description: "No checkout URL received. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: error?.message || "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Shield,
      description: 'Get started with basic protection',
      price: { monthly: 0, yearly: 0 },
      originalPrice: null,
      discount: null,
      color: 'from-gray-400 to-gray-600',
      features: [
        'Up to 50 artworks protected',
        'Basic image upload & storage',
        'Basic monitoring',
        'Email alerts',
        'Community support'
      ],
      limitations: [
        'Personal use only',
        'No AI features'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Zap,
      description: 'Everything you need to protect your creative work',
      price: { monthly: 29, yearly: 290 },
      originalPrice: { monthly: 49, yearly: 490 },
      discount: '40% OFF',
      color: 'from-primary to-accent',
      features: [
        'Up to 50,000 artworks protected',
        'Advanced image upload & storage',
        'Real-time monitoring',
        'Instant email & push alerts',
        'AI Training protection',
        'AI threat detection',
        'Portfolio monitoring',
        'Watermark protection',
        'Blockchain verification',
        'DMCA filing assistance',
        'Priority support'
      ],
      limitations: [],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Building2,
      description: 'Custom solutions for teams and organizations',
      price: { monthly: 'Custom', yearly: 'Custom' },
      originalPrice: null,
      discount: null,
      color: 'from-purple-600 to-pink-600',
      features: [
        'Unlimited artworks protected',
        'Everything in Pro, plus:',
        'Custom AI model training',
        'Dedicated account manager',
        'Custom integrations & API',
        'Team management',
        'Advanced analytics',
        'SLA guarantees',
        'White-label options'
      ],
      limitations: [],
      popular: false
    }
  ];

  const handleSignUp = (planId: string) => {
    if (planId === 'enterprise') {
      toast({
        title: "Contact Sales",
        description: "Our enterprise team will contact you within 24 hours to discuss your custom solution.",
      });
      // In a real app, this would open a contact form or redirect to a contact page
      return;
    }

    toast({
      title: "Redirecting to Sign Up",
      description: `Setting up your ${planId} plan...`,
    });

    // For now, redirect to upload page. In a real app, this would go to Stripe checkout
    setTimeout(() => {
      navigate('/upload');
    }, 1500);
  };

  const formatPrice = (price: number | string) => {
    if (typeof price === 'string') return price;
    return `$${price}`;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const SignUpForm = ({ plan }: { plan: any }) => {
    return (
      <div className="space-y-6">
        {/* Stripe Redirect Notice */}
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

        {/* Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Your Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  handleInputChange('email', e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={(e) => validateEmail(e.target.value)}
                placeholder="john@example.com"
                className={`pl-10 ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                required
              />
            </div>
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
          </div>
        </div>

        {/* Promotional Code */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Promotional Code</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="promoCode">Promo Code (Optional)</Label>
            <div className="relative">
              <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="promoCode"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter "FEEDBACK" for one month free!
            </p>
          </div>
        </div>

        {/* Plan Summary */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Plan Summary</h4>
          <div className="flex justify-between items-center">
            <span>{plan.name} Plan ({billingCycle})</span>
            <span className="font-bold">
              {formatPrice(plan.price[billingCycle])}{typeof plan.price[billingCycle] === 'number' ? `/${billingCycle === 'monthly' ? 'mo' : 'yr'}` : ''}
            </span>
          </div>
          {/* Add-ons */}
          {socialMediaAddon[plan.id] && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm">Social Media Monitoring</span>
              <span className="font-semibold">+$100/mo + $199 setup fee</span>
            </div>
          )}
          {aiTrainingAddon[plan.id] && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm">AI Training Protection</span>
              <span className="font-semibold">+$49/mo</span>
            </div>
          )}
          {plan.discount && (
            <div className="text-sm text-green-600 mt-1">
              {plan.discount} - You save ${typeof plan.originalPrice?.[billingCycle] === 'number' && typeof plan.price[billingCycle] === 'number' ? 
                plan.originalPrice[billingCycle] - plan.price[billingCycle] : 0}!
            </div>
          )}
          {(socialMediaAddon[plan.id] || aiTrainingAddon[plan.id]) && (
            <div className="border-t mt-2 pt-2">
              <div className="flex justify-between items-center font-bold">
                <span>Total</span>
                <span>
                  {typeof plan.price[billingCycle] === 'number' 
                    ? `$${plan.price[billingCycle] + 
                        (socialMediaAddon[plan.id] ? (billingCycle === 'monthly' ? 100 : 1200) : 0) +
                        (aiTrainingAddon[plan.id] ? (billingCycle === 'monthly' ? 49 : 588) : 0)
                      }/${billingCycle === 'monthly' ? 'mo' : 'yr'}`
                    : 'Custom'
                  }
                </span>
              </div>
              {socialMediaAddon[plan.id] && (
                <div className="text-xs text-muted-foreground mt-1">
                  *Plus $199 one-time setup fee for social media monitoring
                </div>
              )}
              {aiTrainingAddon[plan.id] && (
                <div className="text-xs text-muted-foreground mt-1">
                  *Plus $100 one-time setup fee for AI training protection
                </div>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={() => {
            if (!validateEmail(formData.email)) return;
            handleFormSubmit(plan.id);
          }}
          disabled={isProcessing}
          className="w-full py-3 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "Continue to Secure Checkout →"}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-3">
          🔒 Secure payment powered by Stripe
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
            Choose Your Protection Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Secure your creative work with AI-powered monitoring, legal support, and blockchain verification. 
            Start protecting your art today.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-muted rounded-lg p-1 mb-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md transition-all ${
                billingCycle === 'monthly' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md transition-all ${
                billingCycle === 'yearly' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <Badge variant="secondary" className="ml-2 text-xs">Save 20%</Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const currentPrice = plan.price[billingCycle];
            const originalPrice = plan.originalPrice?.[billingCycle];
            
            return (
              <Card 
                key={plan.id}
                className={`relative bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {plan.discount && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="destructive" className="text-xs">
                      {plan.discount}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Pricing */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-4xl font-bold">
                        {formatPrice(currentPrice)}
                      </span>
                      {typeof currentPrice === 'number' && (
                        <span className="text-muted-foreground">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>
                    {originalPrice && typeof originalPrice === 'number' && (
                      <div className="text-sm text-muted-foreground line-through">
                        Was ${originalPrice}/{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </div>
                    )}
                  </div>

                   {/* Features */}
                   <div className="space-y-3">
                     {plan.features.map((feature, index) => (
                       <div key={index} className="flex items-start gap-3">
                         <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                         <span className="text-sm">{feature}</span>
                       </div>
                     ))}
                   </div>

                   {/* Social Media Addon */}
                   {plan.id !== 'enterprise' && (
                     <div className="border-t pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Social Media Profile Monitoring</span>
                            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                          </div>
                         <label className="flex items-center cursor-pointer">
                           <input
                             type="checkbox"
                             checked={socialMediaAddon[plan.id] || false}
                             onChange={(e) => setSocialMediaAddon(prev => ({ ...prev, [plan.id]: e.target.checked }))}
                             className="sr-only"
                           />
                           <div className={`w-11 h-6 bg-gray-200 rounded-full relative transition-colors ${socialMediaAddon[plan.id] ? 'bg-primary' : ''}`}>
                             <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${socialMediaAddon[plan.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                           </div>
                         </label>
                       </div>
                        <div className="text-xs text-muted-foreground">
                          Monitor unlimited social media profiles for impersonation and unauthorized use. +$100/month (Coming Soon)
                        </div>
                       {socialMediaAddon[plan.id] && (
                          <div className="bg-primary/10 p-2 rounded text-xs text-primary">
                            ✓ Social Media Monitoring: +$100/month (Coming Soon)
                          </div>
                       )}
                      </div>
                    )}

                     {/* Deepfake Scanning Addon */}
                     {plan.id !== 'enterprise' && (
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">AI Training Protection</span>
                        </div>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={aiTrainingAddon[plan.id] || false}
                            onChange={(e) => setAiTrainingAddon(prev => ({ ...prev, [plan.id]: e.target.checked }))}
                            className="sr-only"
                          />
                          <div className={`w-11 h-6 bg-gray-200 rounded-full relative transition-colors ${aiTrainingAddon[plan.id] ? 'bg-primary' : ''}`}>
                            <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${aiTrainingAddon[plan.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                          </div>
                        </label>
                      </div>
                       <div className="text-xs text-muted-foreground">
                         Advanced protection against AI training data harvesting and unauthorized use. +$49/month
                       </div>
                        {aiTrainingAddon[plan.id] && (
                          <div className="bg-primary/10 p-2 rounded text-xs text-primary">
                            ✓ AI Training Protection: +$49/month + $100 setup fee
                          </div>
                        )}
                     </div>
                     )}

                  {/* Sign Up Button */}
                  {plan.id === 'enterprise' ? (
                    <Button
                      onClick={() => handleSignUp(plan.id)}
                      className="w-full py-6 text-lg font-semibold"
                      variant="outline"
                    >
                      Contact Sales
                    </Button>
                  ) : plan.id === 'free' ? (
                    <Button
                      onClick={() => navigate('/upload')}
                      className="w-full py-6 text-lg font-semibold"
                      variant="outline"
                    >
                      Get Started Free
                    </Button>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className={`w-full py-6 text-lg font-semibold ${
                            plan.popular 
                              ? 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90' 
                              : ''
                          }`}
                          variant={plan.popular ? 'default' : 'outline'}
                        >
                          Start Protection
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                              <plan.icon className="w-4 h-4 text-white" />
                            </div>
                            Sign Up for {plan.name} Plan
                          </DialogTitle>
                          <DialogDescription>
                            Complete your information to start protecting your creative work
                          </DialogDescription>
                        </DialogHeader>
                        <SignUpForm plan={plan} />
                      </DialogContent>
                    </Dialog>
                  )}

                  {plan.id !== 'enterprise' && plan.id !== 'free' && (
                    <p className="text-xs text-center text-muted-foreground">
                      14-day free trial • No credit card required
                    </p>
                  )}
                  {plan.id === 'free' && (
                    <p className="text-xs text-center text-muted-foreground">
                      No credit card required • Upgrade anytime
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enterprise Contact Section */}
        <Card className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-purple-200/50">
          <CardContent className="p-8 text-center">
            <Crown className="w-12 h-12 mx-auto mb-4 text-purple-600" />
            <h3 className="text-2xl font-bold mb-4">Need a Custom Solution?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our Enterprise Custom plan offers tailored solutions for large organizations, 
              including custom AI model training, advanced security features, and on-premise deployment options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:Shirleena.Cunningham@tsmowatch.com"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-11 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
              >
                Email us
              </a>
              <Button size="lg" variant="outline">
                Request Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SLA Guarantees Section */}
        <div className="mt-16">
          <SLAGuarantees showComparison={true} />
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-8">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">Can I upgrade or downgrade my plan?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, you can change your plan at any time. Changes take effect immediately and billing is prorated.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">What happens if I cancel?</h4>
                <p className="text-sm text-muted-foreground">
                  Your protection continues until the end of your billing period. You can reactivate anytime.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">Is there a free trial?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! Start with our Free plan or try any paid plan with a 14-day free trial (no credit card required).
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">What file types are supported?</h4>
                <p className="text-sm text-muted-foreground">
                  We support images, videos, audio files, PDFs, and now folder uploads for bulk protection.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;