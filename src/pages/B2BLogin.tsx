import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Building2, 
  Shield, 
  Users, 
  Zap,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Globe,
  Lock,
  BarChart3
} from 'lucide-react';

const B2BLogin = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      if (activeTab === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Welcome back to TSMO Watch Technology!');
        }
      } else {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }

        const metadata = {
          full_name: fullName,
          company_name: companyName,
          account_type: 'b2b'
        };

        const { error } = await signUp(email, password, metadata);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Enterprise account created! Please check your email for verification.');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const enterpriseFeatures = [
    {
      icon: Shield,
      title: "Advanced AI Protection",
      description: "Enterprise-grade deepfake detection and content protection"
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Manage multiple users with role-based access controls"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive insights and reporting for your organization"
    },
    {
      icon: Globe,
      title: "Global Monitoring",
      description: "24/7 worldwide monitoring and threat detection"
    },
    {
      icon: Lock,
      title: "Compliance Ready",
      description: "GDPR, CCPA, and industry compliance built-in"
    },
    {
      icon: Zap,
      title: "Priority Support",
      description: "Dedicated support team and SLA guarantees"
    }
  ];

  const benefits = [
    "Unlimited content protection",
    "Advanced threat detection",
    "Custom API integration",
    "White-label solutions",
    "24/7 priority support",
    "Enterprise-grade security"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Side - Branding & Features */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">TSMO Watch Technology</h1>
                  <p className="text-muted-foreground">Enterprise AI Protection Platform</p>
                </div>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                Protect Your Business with 
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Advanced AI Detection</span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Join leading enterprises using TSMO's cutting-edge technology to detect deepfakes, 
                protect intellectual property, and maintain brand integrity across all digital channels.
              </p>
            </div>

            {/* Enterprise Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enterpriseFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">What's Included:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-2xl border-border/50">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Enterprise Access</CardTitle>
                <CardDescription>
                  Sign in to your enterprise account or create a new one
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Get Started</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4 mt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Business Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-11 px-3"
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

                      <Button
                        type="submit"
                        className="w-full h-11 font-semibold"
                        disabled={loading}
                      >
                        {loading ? "Signing In..." : (
                          <>
                            Sign In to Dashboard
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4 mt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            type="text"
                            placeholder="John Smith"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="h-11"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input
                            id="companyName"
                            type="text"
                            placeholder="Your Company Inc."
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                            className="h-11"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signupEmail">Business Email</Label>
                        <Input
                          id="signupEmail"
                          type="email"
                          placeholder="your.name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signupPassword">Password</Label>
                        <div className="relative">
                          <Input
                            id="signupPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-11 px-3"
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
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="h-11 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-11 px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 font-semibold"
                        disabled={loading}
                      >
                        {loading ? "Creating Account..." : (
                          <>
                            Start Enterprise Trial
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <Separator />
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Need help? Contact our enterprise team
                  </p>
                  <Button variant="link" className="p-0 h-auto font-semibold">
                    enterprise@tsmo.com
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="mt-6 text-center space-y-3">
              <p className="text-xs text-muted-foreground">Trusted by leading enterprises worldwide</p>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  SOC 2 Compliant
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Enterprise Security
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  99.9% Uptime
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2BLogin;