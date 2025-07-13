import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Lock, 
  Shield, 
  Check,
  ArrowRight,
  Zap,
  Star
} from "lucide-react";

interface PlanDetails {
  name: string;
  price: number;
  features: string[];
  badge?: string;
}

const Checkout = () => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>("professional");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const plans: Record<string, PlanDetails> = {
    student: {
      name: "Student",
      price: 19,
      features: ["Up to 25 artworks", "Basic visual recognition", "Monthly reports", "Email support"],
      badge: "Student Discount"
    },
    starter: {
      name: "Starter",
      price: 29,
      features: ["Up to 50 artworks", "Basic visual recognition", "Weekly reports", "Email support"]
    },
    professional: {
      name: "Professional",
      price: 79,
      features: ["Up to 500 artworks", "Advanced AI recognition", "Real-time monitoring", "Blockchain verification", "Automated DMCA", "Priority support"],
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
  const finalPrice = billingCycle === "yearly" 
    ? currentPlan.price * 12 * (1 - yearlyDiscount)
    : currentPlan.price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Payment Successful!",
        description: `Welcome to TSMO ${currentPlan.name}! Your account is now active.`,
      });
      setIsProcessing(false);
      
      // Redirect to onboarding or dashboard
      setTimeout(() => {
        window.location.href = "/monitoring";
      }, 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Complete Your Order
          </h1>
          <p className="text-lg text-muted-foreground">
            Join thousands of artists protecting their creative work with TSMO
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
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Payment */}
          <div className="lg:col-span-2 space-y-8">
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
                      ${billingCycle === "yearly" ? Math.round(finalPrice) : currentPlan.price}
                      {billingCycle === "yearly" ? "/year" : "/month"}
                    </div>
                    {billingCycle === "yearly" && (
                      <div className="text-sm text-green-600">
                        Save ${Math.round(currentPlan.price * 12 - finalPrice)}
                      </div>
                    )}
                  </div>
                </div>

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
                    <span className="font-medium">14-Day Free Trial</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Try TSMO risk-free for 14 days. Cancel anytime during your trial period.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
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
                      I agree to the Terms of Service and Privacy Policy
                    </Label>
                  </div>

                  {/* Security Notice */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <Lock className="w-4 h-4" />
                    <span>Your payment information is encrypted and secure</span>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-accent text-lg py-6"
                    disabled={isProcessing}
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
                    You won't be charged until your 14-day free trial ends
                  </div>
                </form>
              </CardContent>
            </Card>
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