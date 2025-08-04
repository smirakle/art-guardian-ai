import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Zap, 
  Shield, 
  Globe, 
  Brain,
  ChevronLeft,
  ChevronRight,
  Play,
  Mail,
  ExternalLink,
  BarChart3,
  PieChart,
  Briefcase,
  Award
} from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  content: React.ReactNode;
}

const InvestorPitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: "cover",
      title: "TSMO - AI-Powered IP Protection",
      content: (
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              TSMO
            </h1>
            <p className="text-2xl text-muted-foreground">
              The Future of Digital IP Protection
            </p>
            <p className="text-lg text-muted-foreground italic">
              Protecting creators in the age of AI
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Seeking</div>
              <div className="text-2xl font-bold text-primary">$2.5M Series A</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Valuation</div>
              <div className="text-2xl font-bold text-primary">$15M pre-money</div>
            </div>
          </div>
          
          <Badge variant="secondary" className="text-lg px-6 py-2">
            🚀 Founded 2024 • Legal Technology • AI Protection
          </Badge>
        </div>
      )
    },
    {
      id: "problem",
      title: "The $24.3B Problem",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Creators Are Defenseless Against AI</h2>
            <p className="text-xl text-muted-foreground">The digital creative industry faces an unprecedented crisis</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="h-8 w-8 text-red-600" />
                  <h3 className="text-lg font-semibold">AI Training Theft</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  AI models trained on copyrighted content without permission or compensation
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-8 w-8 text-red-600" />
                  <h3 className="text-lg font-semibold">400% Increase</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Trademark infringement up 400% since 2020
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="h-8 w-8 text-red-600" />
                  <h3 className="text-lg font-semibold">$50K-$500K Cost</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Legal action takes 18+ months and costs $50K-$500K
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="h-8 w-8 text-red-600" />
                  <h3 className="text-lg font-semibold">$24.3B Loss</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Annual losses to IP theft globally
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <p className="text-lg font-semibold text-yellow-800">
              Current solutions are reactive, expensive, and don't protect against AI training
            </p>
          </div>
        </div>
      )
    },
    {
      id: "solution",
      title: "Four-Layer Defense System™",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Revolutionary IP Protection</h2>
            <p className="text-xl text-muted-foreground">The world's first comprehensive AI-era protection platform</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">AI Training Protection</h3>
                    <Badge className="text-xs">Patent-pending</Badge>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• Patent-pending fingerprinting technology</li>
                  <li>• Real-time AI training detection</li>
                  <li>• Proactive content protection</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">Comprehensive Monitoring</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• 70+ platforms scanned continuously</li>
                  <li>• Multi-modal detection (image, text, video)</li>
                  <li>• 95%+ accuracy rate</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">Instant Response</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• Automated DMCA filing</li>
                  <li>• Blockchain verification</li>
                  <li>• Legal document generation</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">Legal Enforcement</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• 500+ verified IP lawyers network</li>
                  <li>• Automated compliance workflows</li>
                  <li>• Government filing integration</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "market",
      title: "Market Opportunity",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">$15.7B Total Addressable Market</h2>
            <p className="text-xl text-muted-foreground">Multiple high-growth segments converging</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">$8.2B</div>
                <h3 className="font-semibold mb-2">Digital Content Creators</h3>
                <div className="text-sm text-muted-foreground">52% of market</div>
                <Progress value={52} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">$4.7B</div>
                <h3 className="font-semibold mb-2">Enterprise IP Management</h3>
                <div className="text-sm text-muted-foreground">30% of market</div>
                <Progress value={30} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">$2.8B</div>
                <h3 className="font-semibold mb-2">Legal Technology</h3>
                <div className="text-sm text-muted-foreground">18% of market</div>
                <Progress value={18} className="mt-2" />
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Market Drivers</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Creator economy growing 23% annually</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span>AI adoption accelerating IP theft</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Regulatory pressure increasing</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span>Global IP protection demand rising</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "business-model",
      title: "Business Model",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Multiple Revenue Streams</h2>
            <p className="text-xl text-muted-foreground">Diversified monetization strategy</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subscription Tiers</CardTitle>
                <CardDescription>70% of revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Free</span>
                  <span className="font-semibold">$0/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Student</span>
                  <span className="font-semibold">$19.99/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Starter</span>
                  <span className="font-semibold">$29.99/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Professional</span>
                  <span className="font-semibold">$199.99/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Enterprise</span>
                  <span className="font-semibold">$5,000/month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transaction Fees</CardTitle>
                <CardDescription>20% of revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Legal Documents</span>
                  <span className="font-semibold">15% commission</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Legal Consultations</span>
                  <span className="font-semibold">20% commission</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">DMCA Services</span>
                  <span className="font-semibold">$25-$100/case</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enterprise Solutions</CardTitle>
                <CardDescription>10% of revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">White-label</span>
                  <span className="font-semibold">$10K-$100K/year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Custom Integrations</span>
                  <span className="font-semibold">$25K-$250K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">API Licensing</span>
                  <span className="font-semibold">$5K-$50K/month</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Unit Economics</h3>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">$40</div>
                <div className="text-sm text-green-700">Customer Acquisition Cost</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">$65</div>
                <div className="text-sm text-green-700">Lifetime Value</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">6.5x</div>
                <div className="text-sm text-green-700">LTV/CAC Ratio</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">92%</div>
                <div className="text-sm text-green-700">Gross Margin</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "traction",
      title: "Traction & Metrics",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Strong Early Adoption</h2>
            <p className="text-xl text-muted-foreground">Growing 45% month-over-month</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">$200</div>
                <div className="text-sm font-semibold mb-1">Monthly Recurring Revenue</div>
                <Badge className="bg-green-600 text-white text-xs">+45% MoM</Badge>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-sm font-semibold mb-1">Active Users</div>
                <div className="text-xs text-blue-600">Across all tiers</div>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-sm font-semibold mb-1">Protected Artworks</div>
                <div className="text-xs text-purple-600">Under active monitoring</div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">2,000+</div>
                <div className="text-sm font-semibold mb-1">Monitoring Scans</div>
                <div className="text-xs text-orange-600">Completed successfully</div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">25+</div>
                <div className="text-sm font-semibold mb-1">DMCA Notices</div>
                <div className="text-xs text-red-600">Successfully filed</div>
              </CardContent>
            </Card>
            
            <Card className="border-indigo-200 bg-indigo-50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">94%</div>
                <div className="text-sm font-semibold mb-1">Customer Satisfaction</div>
                <div className="text-xs text-indigo-600">Based on user surveys</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Monthly Retention Rate</span>
                  <span className="font-semibold text-green-600">89%</span>
                </div>
                <div className="flex justify-between">
                  <span>Free to Paid Conversion</span>
                  <span className="font-semibold text-blue-600">3.2x</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Revenue Per User</span>
                  <span className="font-semibold text-purple-600">$85/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Detection Accuracy</span>
                  <span className="font-semibold text-orange-600">95%+</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Market Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">500+ verified IP lawyers network</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Multi-chain blockchain integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Government filing systems connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Enterprise pilot programs active</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "financials",
      title: "Financial Projections",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Path to $23.5M Revenue</h2>
            <p className="text-xl text-muted-foreground">Conservative 3-year growth projections</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Metric</th>
                  <th className="text-center p-3 font-semibold">Year 1</th>
                  <th className="text-center p-3 font-semibold">Year 2</th>
                  <th className="text-center p-3 font-semibold">Year 3</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b">
                  <td className="p-3 font-medium">Subscribers</td>
                  <td className="p-3 text-center">2,500</td>
                  <td className="p-3 text-center">15,000</td>
                  <td className="p-3 text-center text-primary font-bold">45,000</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">ARPU</td>
                  <td className="p-3 text-center">$85</td>
                  <td className="p-3 text-center">$78</td>
                  <td className="p-3 text-center">$72</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Subscription Revenue</td>
                  <td className="p-3 text-center">$1.26M</td>
                  <td className="p-3 text-center">$6.84M</td>
                  <td className="p-3 text-center text-primary font-bold">$18.9M</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Transaction Revenue</td>
                  <td className="p-3 text-center">$0.32M</td>
                  <td className="p-3 text-center">$1.71M</td>
                  <td className="p-3 text-center text-primary font-bold">$4.73M</td>
                </tr>
                <tr className="border-b bg-primary/5">
                  <td className="p-3 font-bold">Total Revenue</td>
                  <td className="p-3 text-center font-bold">$1.58M</td>
                  <td className="p-3 text-center font-bold">$8.55M</td>
                  <td className="p-3 text-center font-bold text-primary text-lg">$23.5M</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Assumptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• 15% monthly growth rate (conservative)</div>
                <div>• 85% annual retention rate</div>
                <div>• Market expansion into enterprise</div>
                <div>• International rollout by Year 2</div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">Improving Unit Economics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-green-700">
                <div>• CAC: $40 → $32 by Year 3</div>
                <div>• LTV: $265 → $385 by Year 3</div>
                <div>• LTV/CAC: 6.5x → 12.0x</div>
                <div>• Gross Margin: 92% maintained</div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">Path to Profitability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-blue-700">
                <div>• Break-even: Month 18</div>
                <div>• Positive cash flow: Month 24</div>
                <div>• 30%+ EBITDA margin by Year 3</div>
                <div>• Series B ready: Month 18-24</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "investment",
      title: "Investment Opportunity",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Series A Investment</h2>
            <p className="text-xl text-muted-foreground">Join us in revolutionizing IP protection</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-xl">Investment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Amount Seeking:</span>
                  <span className="text-2xl font-bold text-primary">$2.5M</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Pre-money Valuation:</span>
                  <span className="text-xl font-bold">$15M</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Post-money Valuation:</span>
                  <span className="text-xl font-bold">$17.5M</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Security Type:</span>
                  <span className="font-semibold">Series A Preferred</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Option Pool:</span>
                  <span className="font-semibold">15%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Use of Funds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Team Expansion (40%)</span>
                    <span className="font-bold">$1.0M</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">R&D & Product (30%)</span>
                    <span className="font-bold">$750K</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sales & Marketing (20%)</span>
                    <span className="font-bold">$500K</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Operations (10%)</span>
                    <span className="font-bold">$250K</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">18-Month Milestones</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10,000</div>
                <div className="text-sm">Active Users (6 months)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">$200K</div>
                <div className="text-sm">MRR (12 months)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">$500K</div>
                <div className="text-sm">MRR Target (18 months)</div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Ready to Protect the Creator Economy?</h3>
              <div className="text-center">
                <Button size="lg" className="px-8">
                  <Mail className="mr-2 h-5 w-5" />
                  shirleena.cunningham@tsmowatch.com
                </Button>
              </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="bg-gradient-to-br from-background to-secondary/20 py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            💰 Investment Opportunity
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Investor Pitch Deck
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how TSMO is revolutionizing intellectual property protection in the age of AI
          </p>
        </div>

        {/* Slide Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 p-2 bg-background/80 backdrop-blur-sm rounded-lg border">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide 
                    ? 'bg-primary' 
                    : 'bg-muted hover:bg-muted-foreground/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Slide Content */}
        <Card className="min-h-[600px] bg-background/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-8">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={prevSlide}
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="text-center">
                <Badge variant="outline" className="text-sm">
                  Slide {currentSlide + 1} of {slides.length}
                </Badge>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="slide-content">
              {slides[currentSlide].content}
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-2">
            {slides.map((slide, index) => (
              <Button
                key={slide.id}
                variant={index === currentSlide ? "default" : "outline"}
                size="sm"
                onClick={() => goToSlide(index)}
                className="text-xs px-3 py-1"
              >
                {slide.title}
              </Button>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Ready to Learn More?</h3>
              <p className="text-muted-foreground mb-4">
                Contact our team to access detailed financial models, technical specifications, and due diligence materials.
              </p>
                <div className="text-center">
                  <Button className="px-6">
                    <Mail className="mr-2 h-4 w-4" />
                    shirleena.cunningham@tsmowatch.com
                  </Button>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvestorPitchDeck;