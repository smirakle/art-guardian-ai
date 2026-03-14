import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, Star, Shield, Zap, Crown, Building2, User, Mail, Tag } from "lucide-react";
import { SLAGuarantees } from "@/components/sla/SLAGuarantees";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import StripeDisclosure from "@/components/billing/StripeDisclosure";

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

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Header ── */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)]" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 tracking-tight">
            Protect your art at<br />every stage
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered monitoring, legal enforcement tools, and blockchain verification — all in one platform.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-muted/60 border border-border/40 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">−20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Pricing Cards ── */}
      <section className="pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-0 md:gap-0 rounded-2xl border border-border/40 overflow-hidden shadow-xl shadow-primary/5">
            {plans.map((plan, idx) => {
              const Icon = plan.icon;
              const currentPrice = plan.price[billingCycle];
              const originalPrice = plan.originalPrice?.[billingCycle];
              const isPopular = plan.popular;
              const isLast = idx === plans.length - 1;
              const isFirst = idx === 0;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col ${
                    isPopular
                      ? 'bg-primary/[0.03] border-x border-primary/20 z-10 md:-my-4 md:rounded-2xl md:shadow-2xl md:shadow-primary/10 md:border md:border-primary/25'
                      : 'bg-card'
                  } ${!isPopular && !isLast ? 'md:border-r md:border-border/30' : ''}`}
                >
                  {/* Popular tag */}
                  {isPopular && (
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg shadow-primary/30">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className={`flex flex-col flex-1 p-8 ${isPopular ? 'pt-12' : 'pt-8'}`}>
                    {/* Plan header */}
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isPopular ? 'bg-primary/15' : 'bg-muted/80'
                        }`}>
                          <Icon className={`w-5 h-5 ${isPopular ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold tracking-tight text-foreground">
                          {formatPrice(currentPrice)}
                        </span>
                        {typeof currentPrice === 'number' && currentPrice > 0 && (
                          <span className="text-muted-foreground text-sm ml-1">
                            / {billingCycle === 'monthly' ? 'month' : 'year'}
                          </span>
                        )}
                      </div>
                      {originalPrice && typeof originalPrice === 'number' && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="line-through">${originalPrice}</span>
                          <span className="text-primary font-semibold ml-2">{plan.discount}</span>
                        </p>
                      )}
                      {typeof currentPrice === 'number' && currentPrice === 0 && (
                        <p className="text-sm text-muted-foreground mt-1">Free forever</p>
                      )}
                      {typeof currentPrice === 'string' && (
                        <p className="text-sm text-muted-foreground mt-1">Tailored to your needs</p>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mb-8">
                      {plan.id === 'enterprise' ? (
                        <Button
                          onClick={() => handleSignUp(plan.id)}
                          className="w-full h-12 text-sm font-semibold"
                          variant="outline"
                        >
                          Contact Sales
                        </Button>
                      ) : plan.id === 'free' ? (
                        <Button
                          onClick={() => navigate('/upload')}
                          className="w-full h-12 text-sm font-semibold"
                          variant="outline"
                        >
                          Get Started Free
                        </Button>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="w-full h-12 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
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
                      {plan.id === 'free' && (
                        <p className="text-[11px] text-center text-muted-foreground mt-3">No credit card required</p>
                      )}
                      {plan.id === 'pro' && (
                        <p className="text-[11px] text-center text-muted-foreground mt-3">14-day free trial · No credit card required</p>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border/40 mb-6" />

                    {/* Features */}
                    <div className="space-y-3 flex-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        {plan.id === 'enterprise' ? 'Everything in Pro, plus:' : 'What\'s included:'}
                      </p>
                      {plan.features
                        .filter(f => f !== 'Everything in Pro, plus:')
                        .map((feature, index) => (
                        <div key={index} className="flex items-start gap-2.5">
                          <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? 'text-primary' : 'text-muted-foreground/60'}`} />
                          <span className="text-sm text-foreground/80">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Enterprise CTA ── */}
      <section className="pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="relative rounded-2xl overflow-hidden bg-card border border-border/40">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,hsl(var(--primary)/0.06),transparent)]" />
            <div className="relative p-10 md:p-14 text-center">
              <Crown className="w-10 h-10 mx-auto mb-5 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Need a custom solution?</h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Custom AI model training, dedicated account management, and on-premise deployment for large organizations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="mailto:Shirleena.Cunningham@tsmowatch.com"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                >
                  Talk to Sales
                </a>
                <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl">
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

      {/* ── FAQ ── */}
      <section className="pb-28 border-t border-border/30 pt-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Frequently asked questions</h2>
          </div>
          <div className="space-y-0 divide-y divide-border/40">
            {[
              { q: "Can I upgrade or downgrade my plan?", a: "Yes, you can change your plan at any time. Changes take effect immediately and billing is prorated." },
              { q: "What happens if I cancel?", a: "Your protection continues until the end of your billing period. You can reactivate anytime." },
              { q: "Is there a free trial?", a: "Yes! Start with our Free plan or try any paid plan with a 14-day free trial — no credit card required." },
              { q: "What file types are supported?", a: "We support images, videos, audio files, PDFs, and folder uploads for bulk protection." },
            ].map((faq, i) => (
              <div key={i} className="py-6">
                <h3 className="text-base font-semibold text-foreground mb-2">{faq.q}</h3>
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