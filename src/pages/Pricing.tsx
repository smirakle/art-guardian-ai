import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, Star, Shield, Zap, Crown, Building2, User, Mail, Tag, FileCheck2, Clock } from "lucide-react";
import { SLAGuarantees } from "@/components/sla/SLAGuarantees";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import StripeDisclosure from "@/components/billing/StripeDisclosure";
interface SignUpFormProps {
  plan: any;
  formData: { firstName: string; lastName: string; email: string };
  handleInputChange: (field: string, value: string) => void;
  promoCode: string;
  setPromoCode: (value: string) => void;
  emailError: string;
  validateEmail: (email: string) => boolean;
  billingCycle: 'monthly' | 'yearly';
  isProcessing: boolean;
  handleFormSubmit: (planId: string) => void;
  formatPrice: (price: number | string) => string;
}

const SignUpForm = ({
  plan, formData, handleInputChange, promoCode, setPromoCode,
  emailError, validateEmail, billingCycle, isProcessing, handleFormSubmit, formatPrice,
}: SignUpFormProps) => {
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
        {plan.discount && (
          <div className="text-sm text-green-600 mt-1">
            {plan.discount} - You save ${typeof plan.originalPrice?.[billingCycle] === 'number' && typeof plan.price[billingCycle] === 'number' ? 
              plan.originalPrice[billingCycle] - plan.price[billingCycle] : 0}!
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

      <StripeDisclosure className="mt-3 max-w-md mx-auto" />
    </div>
  );
};

const Pricing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [emailError, setEmailError] = useState('');
  const [conversionSource, setConversionSource] = useState<string | null>(null);
  const [pluginVersion, setPluginVersion] = useState<string | null>(null);

  // Track landing from Adobe plugin and capture conversion data
  useEffect(() => {
    const source = searchParams.get('source');
    const email = searchParams.get('email');
    const version = searchParams.get('plugin_version');
    
    // Pre-fill email if coming from plugin
    if (email) {
      setFormData(prev => ({ ...prev, email: decodeURIComponent(email) }));
    }
    
    // Store source for checkout attribution
    if (source === 'adobe_plugin') {
      setConversionSource(source);
      setPluginVersion(version);
      sessionStorage.setItem('conversion_source', 'adobe_plugin');
      if (version) sessionStorage.setItem('plugin_version', version);
      
      // Track pricing page landing
      trackConversionEvent('pricing_landed', {
        source: 'adobe_plugin',
        plugin_version: version,
        has_email: !!email
      });
    }
  }, [searchParams]);

  // Track conversion events
  const trackConversionEvent = async (eventType: string, metadata: Record<string, any>) => {
    try {
      await supabase.from('plugin_conversion_events').insert({
        event_type: eventType,
        source: metadata.source || conversionSource || 'web',
        user_email: formData.email || searchParams.get('email') || null,
        plugin_version: metadata.plugin_version || pluginVersion,
        metadata
      });
    } catch (error) {
      console.log('Conversion tracking skipped:', error);
    }
  };

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
    
    // Track checkout initiation
    const source = sessionStorage.getItem('conversion_source') || conversionSource || 'web';
    const version = sessionStorage.getItem('plugin_version') || pluginVersion;
    
    if (source === 'adobe_plugin') {
      trackConversionEvent('checkout_started', {
        plan_id: planId,
        billing_cycle: billingCycle,
        source,
        plugin_version: version,
        has_promo_code: !!promoCode.trim()
      });
    }
    
    try {
      console.log('Calling create-checkout-session with:', {
        planId: planId.toLowerCase(),
        billingCycle,
        email: formData.email,
        promoCode: promoCode.trim() || undefined,
        source,
        pluginVersion: version
      });

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          planId: planId.toLowerCase(),
          billingCycle,
          email: formData.email,
          promoCode: promoCode.trim() || undefined,
          source,
          pluginVersion: version
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
        'AI Training protection',
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



  return (
    <div className="min-h-screen bg-background">
      {/* ── Dramatic Hero ── */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,hsl(var(--primary)/0.12),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_20%,hsl(var(--accent)/0.06),transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        </div>

        <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 mb-8">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Launch Pricing — Save 40%</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-[1.05]">
            <span className="block">Plans that scale</span>
            <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">with your art</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            From individual creators to enterprise studios. Start free, upgrade when you're ready.
          </p>

          {/* Billing Toggle — Pill with glow */}
          <div className="relative inline-flex items-center bg-card border border-border/50 rounded-full p-1.5 shadow-lg shadow-primary/5">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative px-7 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-foreground text-background shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative px-7 py-3 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2.5 ${
                billingCycle === 'yearly'
                  ? 'bg-foreground text-background shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full">SAVE 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Pay-As-You-Go Single Proof Tier ── */}
      <section className="py-10 lg:py-12 border-y border-border/40 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/60 p-6 md:p-8 shadow-lg shadow-primary/5">
            <div className="flex items-start gap-4 flex-1">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20">
                <FileCheck2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">Single Proof — Pay as you go</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-accent/15 text-accent px-2 py-0.5 rounded-md">No subscription</span>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3">
                  Need to timestamp <strong className="text-foreground">one file</strong> before you send it to a client?
                  Generate a court-ready, blockchain-anchored proof of ownership in 30 seconds. No account upgrade required.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> 30-second proof</span>
                  <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> SHA-256 + blockchain anchor</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-primary" /> Verifiable forever</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-3 shrink-0 w-full md:w-auto">
              <div className="text-center md:text-right">
                <div className="flex items-baseline gap-1.5 justify-center md:justify-end">
                  <span className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">$0.49</span>
                  <span className="text-sm text-muted-foreground font-medium">/ proof</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">One-time payment · No card on file</p>
              </div>
              <Button
                size="lg"
                className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold shadow-md shadow-primary/20"
                onClick={() => navigate('/checkout?plan=single_proof')}
              >
                Generate a single proof →
              </Button>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Protecting more than one piece? The plans below give you continuous monitoring, DMCA automation, and AI-training defense — not just timestamps.
          </p>
        </div>
      </section>

      {/* ── Pricing Cards ── */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {plans.map((plan, idx) => {
              const Icon = plan.icon;
              const currentPrice = plan.price[billingCycle];
              const originalPrice = plan.originalPrice?.[billingCycle];
              const isPopular = plan.popular;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl transition-all duration-500 ${
                    isPopular
                      ? 'md:-mt-6 md:mb-0'
                      : ''
                  }`}
                >
                  {/* Popular card outer glow */}
                  {isPopular && (
                    <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-primary via-primary/50 to-accent opacity-100" />
                  )}

                  <div className={`relative rounded-3xl overflow-hidden ${
                    isPopular
                      ? 'bg-card shadow-2xl shadow-primary/15'
                      : 'bg-card border border-border/40 shadow-lg shadow-primary/[0.02] hover:shadow-xl hover:border-border/60'
                  } transition-all duration-500`}>

                    {/* Popular header strip */}
                    {isPopular && (
                      <div className="bg-gradient-to-r from-primary to-accent px-6 py-3 text-center">
                        <span className="text-primary-foreground text-xs font-bold uppercase tracking-[0.2em]">
                          ★ Most Popular ★
                        </span>
                      </div>
                    )}

                    <div className={`p-8 lg:p-10 ${isPopular ? '' : 'pt-8 lg:pt-10'}`}>
                      {/* Icon + Name */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          isPopular
                            ? 'bg-gradient-to-br from-primary/20 to-accent/20'
                            : plan.id === 'enterprise'
                              ? 'bg-gradient-to-br from-secondary/15 to-accent/15'
                              : 'bg-muted'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            isPopular ? 'text-primary' : plan.id === 'enterprise' ? 'text-secondary' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-8">{plan.description}</p>

                      {/* Price block */}
                      <div className="mb-8">
                        <div className="flex items-end gap-2">
                          <span className={`font-bold tracking-tight text-foreground ${
                            typeof currentPrice === 'string' ? 'text-4xl' : 'text-6xl'
                          }`}>
                            {formatPrice(currentPrice)}
                          </span>
                          {typeof currentPrice === 'number' && currentPrice > 0 && (
                            <span className="text-muted-foreground text-base mb-2">
                              /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                            </span>
                          )}
                        </div>
                        {originalPrice && typeof originalPrice === 'number' && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-muted-foreground line-through">${originalPrice}/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                            <span className="text-xs font-bold bg-accent/15 text-accent px-2 py-0.5 rounded-md">{plan.discount}</span>
                          </div>
                        )}
                        {typeof currentPrice === 'number' && currentPrice === 0 && (
                          <p className="text-sm text-muted-foreground mt-1">Free forever · No limits on time</p>
                        )}
                        {typeof currentPrice === 'string' && (
                          <p className="text-sm text-muted-foreground mt-1">Custom pricing for your team</p>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="mb-10">
                        {plan.id === 'enterprise' ? (
                          <Button
                            onClick={() => handleSignUp(plan.id)}
                            className="w-full h-13 text-sm font-bold rounded-xl border-2"
                            variant="outline"
                          >
                            <Building2 className="w-4 h-4 mr-2" />
                            Contact Sales
                          </Button>
                        ) : plan.id === 'free' ? (
                          <Button
                            onClick={() => navigate('/upload')}
                            className="w-full h-13 text-sm font-bold rounded-xl border-2"
                            variant="outline"
                          >
                            Get Started Free
                          </Button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                className="w-full h-13 text-sm font-bold rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-xl shadow-primary/25 glow-pulse"
                              >
                                Start 14-Day Free Trial
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
                              <SignUpForm
                                plan={plan}
                                formData={formData}
                                handleInputChange={handleInputChange}
                                promoCode={promoCode}
                                setPromoCode={setPromoCode}
                                emailError={emailError}
                                validateEmail={validateEmail}
                                billingCycle={billingCycle}
                                isProcessing={isProcessing}
                                handleFormSubmit={handleFormSubmit}
                                formatPrice={formatPrice}
                              />
                            </DialogContent>
                          </Dialog>
                        )}
                        {plan.id === 'pro' && (
                          <p className="text-[11px] text-center text-muted-foreground mt-3">No credit card required · Cancel anytime</p>
                        )}
                      </div>

                      {/* Features */}
                      <div className="space-y-4">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                          {plan.id === 'free' ? 'Includes:' : plan.id === 'enterprise' ? 'Everything in Pro, plus:' : 'Everything in Free, plus:'}
                        </p>
                        {plan.features
                          .filter(f => f !== 'Everything in Pro, plus:')
                          .map((feature, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isPopular ? 'bg-primary/15' : 'bg-muted'
                            }`}>
                              <CheckCircle className={`w-3 h-3 ${isPopular ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                            <span className="text-sm text-foreground/80 leading-snug">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Social Proof Strip ── */}
      <section className="py-16 border-y border-border/30 bg-muted/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "2,400+", label: "Artworks Protected" },
              { value: "50+", label: "Platforms Scanned" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "24/7", label: "AI Monitoring" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent tabular-nums mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enterprise CTA — Dark dramatic ── */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="relative rounded-3xl overflow-hidden bg-foreground text-background">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_-20%,hsl(var(--primary)/0.3),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,hsl(var(--accent)/0.15),transparent)]" />

            <div className="relative px-10 py-16 md:px-16 md:py-20 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-background/10 border border-background/20 rounded-full px-4 py-1.5 mb-6">
                  <Crown className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-background/80">Enterprise</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-background">
                  Built for teams that<br />take IP seriously
                </h2>
                <p className="text-background/60 max-w-md leading-relaxed">
                  Dedicated account manager, custom AI training, unlimited seats, SLA guarantees, and white-label deployment.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <a
                  href="mailto:Shirleena.Cunningham@tsmowatch.com"
                  className="inline-flex items-center justify-center h-13 px-10 rounded-xl text-sm font-bold bg-background text-foreground hover:bg-background/90 transition-colors shadow-xl"
                >
                  Talk to Sales →
                </a>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-13 px-10 rounded-xl text-sm font-semibold text-background/70 hover:text-background hover:bg-background/10"
                >
                  Request Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SLA Guarantees ── */}
      <section className="pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <SLAGuarantees showComparison={true} />
        </div>
      </section>

      {/* ── FAQ — Refined ── */}
      <section className="pb-32 border-t border-border/30 pt-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-[0.15em] mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Questions? We've got answers.</h2>
          </div>
          <div className="space-y-0 rounded-2xl border border-border/40 overflow-hidden bg-card">
            {[
              { q: "Can I upgrade or downgrade my plan?", a: "Yes, you can change your plan at any time. Changes take effect immediately and billing is prorated." },
              { q: "What happens if I cancel?", a: "Your protection continues until the end of your billing period. You can reactivate anytime without losing data." },
              { q: "Is there a free trial?", a: "Yes! Start with our Free plan or try any paid plan with a 14-day free trial — no credit card required." },
              { q: "What file types are supported?", a: "We support images (PNG, JPG, TIFF, PSD), videos, audio files, PDFs, and folder uploads for bulk protection." },
            ].map((faq, i, arr) => (
              <div key={i} className={`px-8 py-6 ${i < arr.length - 1 ? 'border-b border-border/30' : ''} hover:bg-muted/30 transition-colors`}>
                <h3 className="text-base font-semibold text-foreground mb-1.5">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;