import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, Star, Shield, Zap, Crown, Building2, CreditCard, User, Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (planId: string) => {
    // Basic validation
    const requiredFields = ['firstName', 'lastName', 'email', 'cardNumber', 'expiryDate', 'cvv'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Account Created Successfully!",
      description: `Welcome to ${planId} plan! Your protection is now active.`,
    });

    // Reset form and redirect
    setFormData({
      firstName: '', lastName: '', email: '', phone: '', company: '',
      address: '', city: '', state: '', zipCode: '', country: '',
      cardNumber: '', expiryDate: '', cvv: '', cardName: ''
    });
    setSelectedPlan(null);
    
    setTimeout(() => {
      navigate('/upload');
    }, 2000);
  };

  const plans = [
    {
      id: 'student',
      name: 'Student',
      icon: Star,
      description: 'Perfect for students and emerging artists',
      price: { monthly: 19, yearly: 190 },
      originalPrice: { monthly: 25, yearly: 250 },
      discount: '24% OFF',
      color: 'from-blue-500 to-purple-600',
      features: [
        'Up to 50 artworks protected',
        'Basic AI monitoring',
        'Email alerts',
        'Educational resources',
        'Community support',
        'Mobile app access'
      ],
      limitations: [
        'Limited to personal use',
        'Standard response time (48hrs)'
      ],
      popular: false
    },
    {
      id: 'starter',
      name: 'Starter',
      icon: Shield,
      description: 'Ideal for freelancers and small creators',
      price: { monthly: 29, yearly: 290 },
      originalPrice: { monthly: 39, yearly: 390 },
      discount: '25% OFF',
      color: 'from-green-500 to-emerald-600',
      features: [
        'Up to 200 artworks protected',
        'Advanced AI monitoring',
        'Real-time alerts',
        'Watermark protection',
        'Basic legal support',
        'API access',
        'Priority support'
      ],
      limitations: [
        'Commercial use allowed',
        'Standard takedown assistance'
      ],
      popular: true
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: Zap,
      description: 'For established artists and agencies',
      price: { monthly: 79, yearly: 790 },
      originalPrice: { monthly: 99, yearly: 990 },
      discount: '20% OFF',
      color: 'from-orange-500 to-red-600',
      features: [
        'Up to 1,000 artworks protected',
        'Premium AI monitoring',
        'Instant alerts & notifications',
        'Advanced watermarking',
        'Blockchain verification',
        'Legal action support',
        'White-label options',
        'Dedicated account manager'
      ],
      limitations: [],
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise Custom',
      icon: Building2,
      description: 'Tailored solutions for large organizations',
      price: { monthly: 'Custom', yearly: 'Custom' },
      originalPrice: null,
      discount: null,
      color: 'from-purple-600 to-pink-600',
      features: [
        'Unlimited artworks protected',
        'Custom AI model training',
        '24/7 monitoring & support',
        'Advanced blockchain integration',
        'Custom legal team',
        'Enterprise SSO',
        'Custom integrations',
        'On-premise deployment options',
        'SLA guarantees',
        'Custom reporting & analytics'
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

  const SignUpForm = ({ plan }: { plan: any }) => {
    return (
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Personal Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Personal Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@example.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="pl-10"
              />
            </div>
          </div>

          {(plan.id === 'professional' || plan.id === 'enterprise') && (
            <div className="space-y-2">
              <Label htmlFor="company">Company/Organization</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Your Company Name"
              />
            </div>
          )}
        </div>

        {/* Billing Address */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Billing Address</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="New York"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="NY"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="10001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
                <SelectItem value="de">Germany</SelectItem>
                <SelectItem value="fr">France</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Credit Card Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Payment Information</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardName">Name on Card *</Label>
            <Input
              id="cardName"
              value={formData.cardName}
              onChange={(e) => handleInputChange('cardName', e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number *</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                placeholder="1234 5678 9012 3456"
                className="pl-10"
                maxLength={19}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <Input
                id="expiryDate"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                value={formData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
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
          onClick={() => handleFormSubmit(plan.name)}
          className="w-full py-3 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          Start My Protection Plan
        </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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

                  {/* Sign Up Button */}
                  {plan.id === 'enterprise' ? (
                    <Button
                      onClick={() => handleSignUp(plan.id)}
                      className="w-full py-6 text-lg font-semibold"
                      variant="outline"
                    >
                      Contact Sales
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

                  {plan.id !== 'enterprise' && (
                    <p className="text-xs text-center text-muted-foreground">
                      14-day free trial • Cancel anytime
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
              including custom AI model training, dedicated legal teams, and on-premise deployment options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                Schedule Consultation
              </Button>
              <Button size="lg" variant="outline">
                Request Demo
              </Button>
            </div>
          </CardContent>
        </Card>

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
                  Yes, all paid plans include a 14-day free trial with full access to features.
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