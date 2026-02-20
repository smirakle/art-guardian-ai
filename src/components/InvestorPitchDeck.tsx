import React, { useState } from 'react';
import MeetingScheduler from '@/components/MeetingScheduler';
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
  Award,
  FileDown,
  FileText,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import { toast } from 'sonner';

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
              <div className="text-2xl font-bold text-primary">$100K Seed</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Valuation</div>
              <div className="text-2xl font-bold text-primary">$1M pre-money</div>
            </div>
          </div>
          
          <Badge variant="secondary" className="text-lg px-6 py-2">
            🚀 Founded 2025 • Seed Stage
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
                  <h3 className="text-lg font-semibold">AI Training Protection</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• Revolutionary fingerprinting technology</li>
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
                  <li>• Expert legal network integration</li>
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
                  <span className="text-sm">Enterprise API</span>
                  <span className="font-semibold">$5K-$50K/month</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Proven Unit Economics</h3>
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">$15</div>
                  <div className="text-sm text-green-700">Blended CAC</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">$583</div>
                  <div className="text-sm text-green-700">Customer LTV</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">39x</div>
                  <div className="text-sm text-green-700">LTV/CAC Ratio</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">0.4mo</div>
                  <div className="text-sm text-green-700">Payback Period</div>
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
        <p className="text-xl text-muted-foreground">Current metrics demonstrating rapid growth trajectory</p>
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
                  <span className="text-sm">Expert legal network integration</span>
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
            <h2 className="text-4xl font-bold mb-4">Financial Projections</h2>
            <p className="text-xl text-muted-foreground">Bootstrap model with clear path to Series A</p>
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
                  <td className="p-3 font-medium">Customers</td>
                  <td className="p-3 text-center">120</td>
                  <td className="p-3 text-center">350</td>
                  <td className="p-3 text-center text-primary font-bold">750</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">ARPU</td>
                  <td className="p-3 text-center">$35</td>
                  <td className="p-3 text-center">$43</td>
                  <td className="p-3 text-center">$56</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Monthly Recurring Revenue</td>
                  <td className="p-3 text-center">$4.2K</td>
                  <td className="p-3 text-center">$15K</td>
                  <td className="p-3 text-center text-primary font-bold">$42K</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Professional Services</td>
                  <td className="p-3 text-center">$2.4K</td>
                  <td className="p-3 text-center">$9K</td>
                  <td className="p-3 text-center text-primary font-bold">$15K</td>
                </tr>
                <tr className="border-b bg-primary/5">
                  <td className="p-3 font-bold">Annual Revenue</td>
                  <td className="p-3 text-center font-bold">$50K</td>
                  <td className="p-3 text-center font-bold">$180K</td>
                  <td className="p-3 text-center font-bold text-primary text-lg">$500K</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Monthly Growth Rate</span>
                    <span className="font-bold text-green-600">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Acquisition Cost</span>
                    <span className="font-bold text-blue-600">$15</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Lifetime Value</span>
                    <span className="font-bold text-purple-600">$583</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LTV/CAC Ratio</span>
                    <span className="font-bold text-primary">39x</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Series A Readiness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Break-even Timeline</span>
                    <span className="font-bold">18 months</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Series A ARR Target</span>
                    <span className="font-bold text-green-600">$50K+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Series A Valuation</span>
                    <span className="font-bold text-primary">$3M-$10M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeline to Series A</span>
                    <span className="font-bold">15-18 months</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
            
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-lg text-purple-800">Valuation Methodology</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-purple-700">
                <div>• Revenue Multiple: 20x Year 1 ARR</div>
                <div>• Technology Premium: 2-3x multiplier</div>
                <div>• Early-stage Comparables: $500K-$2M</div>
                <div>• Conservative: $1M pre-money</div>
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
            <h2 className="text-4xl font-bold mb-4">Seed Investment</h2>
            <p className="text-xl text-muted-foreground">Bootstrap funding to achieve Series A readiness</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-xl">Investment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Amount Seeking:</span>
                  <span className="text-2xl font-bold text-primary">$100K</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Pre-money Valuation:</span>
                  <span className="text-xl font-bold">$1M</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Post-money Valuation:</span>
                  <span className="text-xl font-bold">$1.1M</span>
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
                    <span className="text-sm">Product Development (50%)</span>
                    <span className="font-bold">$50K</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customer Acquisition (30%)</span>
                    <span className="font-bold">$30K</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Operations & Legal (15%)</span>
                    <span className="font-bold">$15K</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Working Capital (5%)</span>
                    <span className="font-bold">$5K</span>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">18-Month Milestones</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">250</div>
                <div className="text-sm">Customers (6 months)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">$4.2K</div>
                <div className="text-sm">MRR (12 months)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">$50K</div>
                <div className="text-sm">ARR → Series A Ready</div>
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

  const addPDFPage = (doc: jsPDF, title: string, pageNum: number, totalPages: number) => {
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    // Header band
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pw, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TSMO — Investor Pitch Deck', 14, 12);
    doc.text(title, pw - 14, 12, { align: 'right' });
    // Footer
    doc.setFillColor(240, 240, 240);
    doc.rect(0, ph - 14, pw, 14, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${pageNum} of ${totalPages}`, pw / 2, ph - 5, { align: 'center' });
    doc.text('CONFIDENTIAL — For Authorized Recipients Only', 14, ph - 5);
    // Reset text color
    doc.setTextColor(0, 0, 0);
  };

  const downloadPDF = () => {
    toast.info('Generating PDF...');
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pw = doc.internal.pageSize.getWidth();
      const totalPages = 9;
      let y = 0;

      const addText = (text: string, x: number, yPos: number, opts?: { size?: number; style?: string; color?: number[] }) => {
        doc.setFontSize(opts?.size ?? 11);
        doc.setFont('helvetica', opts?.style ?? 'normal');
        if (opts?.color) doc.setTextColor(opts.color[0], opts.color[1], opts.color[2]);
        else doc.setTextColor(0, 0, 0);
        doc.text(text, x, yPos);
      };

      // Page 1 — Cover
      addPDFPage(doc, 'Cover', 1, totalPages);
      y = 60;
      addText('TSMO', pw / 2, y, { size: 36, style: 'bold', color: [30, 58, 138] }); y += 12;
      addText('The Future of Digital IP Protection', pw / 2, y, { size: 16 }); y += 8;
      addText('Protecting creators in the age of AI', pw / 2, y, { size: 12 }); y += 20;
      doc.setDrawColor(200, 200, 200); doc.line(30, y, pw - 30, y); y += 12;
      addText('Seeking:', 40, y, { size: 11, style: 'bold' });
      addText('$100K Seed Round', pw - 40, y, { size: 14, style: 'bold', color: [30, 58, 138] }); y += 10;
      addText('Pre-money Valuation:', 40, y, { size: 11, style: 'bold' });
      addText('$1,000,000', pw - 40, y, { size: 14, style: 'bold' }); y += 10;
      addText('Post-money Valuation:', 40, y, { size: 11, style: 'bold' });
      addText('$1,100,000', pw - 40, y, { size: 14, style: 'bold' }); y += 10;
      addText('Founded:', 40, y, { size: 11, style: 'bold' });
      addText('2025  •  Seed Stage', pw - 40, y, { size: 11 }); y += 20;
      addText('investors@tsmo.app  |  tsmo.app', pw / 2, y, { size: 10, color: [100, 100, 100] });

      // Page 2 — Problem
      doc.addPage();
      addPDFPage(doc, 'The Problem', 2, totalPages);
      y = 30;
      addText('The $24.3B Problem: Creators Are Defenseless Against AI', 14, y, { size: 14, style: 'bold' }); y += 14;
      const problems = [
        'AI Training Theft: AI models trained on copyrighted content without permission or compensation.',
        'Trademark Infringement: Up 400% since 2020 — creators cannot keep up manually.',
        'Legal Costs: Taking legal action costs $50K–$500K and takes 18+ months.',
        'Global Losses: $24.3B in annual losses to IP theft globally.',
        'Current solutions are reactive, not preventive, and have no AI training protection.',
      ];
      problems.forEach(p => { addText(`• ${p}`, 14, y, { size: 11 }); y += 8; });

      // Page 3 — Solution
      doc.addPage();
      addPDFPage(doc, 'Our Solution', 3, totalPages);
      y = 30;
      addText('Four-Layer Defense System™', 14, y, { size: 14, style: 'bold' }); y += 12;
      const layers = [
        ['1. AI Training Protection', 'Patent-pending fingerprinting technology, real-time AI training detection, proactive content cloaking.'],
        ['2. Comprehensive Monitoring', '70+ platforms scanned continuously, multi-modal detection (image, text, video), 95%+ accuracy rate.'],
        ['3. Instant Response', 'Automated DMCA filing, blockchain verification, legal document generation in <24 hours.'],
        ['4. Legal Enforcement', 'Expert legal network integration, automated compliance workflows, government filing integration.'],
      ];
      layers.forEach(([title, body]) => {
        addText(title, 14, y, { size: 12, style: 'bold', color: [30, 58, 138] }); y += 7;
        const lines = doc.splitTextToSize(body, pw - 28);
        lines.forEach((l: string) => { addText(l, 18, y, { size: 10 }); y += 6; });
        y += 4;
      });

      // Page 4 — Market
      doc.addPage();
      addPDFPage(doc, 'Market Opportunity', 4, totalPages);
      y = 30;
      addText('$15.7B Total Addressable Market', 14, y, { size: 14, style: 'bold' }); y += 12;
      [
        ['Digital Content Creators', '$8.2B', '52% of market'],
        ['Enterprise IP Management', '$4.7B', '30% of market'],
        ['Legal Technology', '$2.8B', '18% of market'],
      ].forEach(([seg, val, pct]) => {
        addText(`${seg}:`, 14, y, { size: 11, style: 'bold' });
        addText(`${val} (${pct})`, pw - 14, y, { size: 11, style: 'bold', color: [30, 58, 138] }); y += 9;
      });
      y += 6;
      addText('Market Drivers:', 14, y, { size: 12, style: 'bold' }); y += 8;
      ['Creator economy growing 23% annually', 'AI adoption accelerating IP theft', 'Regulatory pressure increasing globally', 'Global IP protection demand rising'].forEach(d => {
        addText(`• ${d}`, 18, y, { size: 10 }); y += 7;
      });

      // Page 5 — Business Model
      doc.addPage();
      addPDFPage(doc, 'Business Model', 5, totalPages);
      y = 30;
      addText('Multiple Revenue Streams', 14, y, { size: 14, style: 'bold' }); y += 12;
      addText('Subscription Tiers (70% of revenue):', 14, y, { size: 12, style: 'bold' }); y += 8;
      [['Free', '$0/mo'], ['Student', '$19.99/mo'], ['Starter', '$29.99/mo'], ['Professional', '$199.99/mo'], ['Enterprise', '$5,000/mo']].forEach(([t, p]) => {
        addText(`  ${t}:`, 18, y, { size: 10 }); addText(p, pw - 14, y, { size: 10, style: 'bold' }); y += 6;
      });
      y += 4;
      addText('Transaction Fees (20%): 15–20% commission on legal docs, $25–$100/case DMCA.', 14, y, { size: 10 }); y += 8;
      addText('Enterprise (10%): White-label $10K–$100K/yr, Custom integrations $25K–$250K.', 14, y, { size: 10 }); y += 12;
      addText('Unit Economics:', 14, y, { size: 12, style: 'bold' }); y += 8;
      [['CAC', '$15'], ['LTV', '$583'], ['LTV/CAC Ratio', '39x'], ['Payback Period', '0.4 months']].forEach(([k, v]) => {
        addText(`${k}:`, 14, y, { size: 10, style: 'bold' }); addText(v, 80, y, { size: 10, color: [30, 58, 138] }); y += 7;
      });

      // Page 6 — Traction
      doc.addPage();
      addPDFPage(doc, 'Traction & Metrics', 6, totalPages);
      y = 30;
      addText('Strong Early Adoption', 14, y, { size: 14, style: 'bold' }); y += 12;
      [
        ['Monthly Recurring Revenue', '$200/mo (+45% MoM)'],
        ['Active Users', '50+'],
        ['Protected Artworks', '500+'],
        ['Monitoring Scans Completed', '2,000+'],
        ['DMCA Notices Filed', '25+'],
        ['Customer Satisfaction', '94%'],
        ['Monthly Retention Rate', '89%'],
        ['Average Revenue Per User', '$85/month'],
      ].forEach(([k, v]) => {
        addText(`${k}:`, 14, y, { size: 11, style: 'bold' }); addText(v, 110, y, { size: 11, color: [30, 138, 58] }); y += 8;
      });

      // Page 7 — Financial Projections
      doc.addPage();
      addPDFPage(doc, 'Financial Projections', 7, totalPages);
      y = 30;
      addText('3-Year Financial Projections', 14, y, { size: 14, style: 'bold' }); y += 12;
      // Table header
      doc.setFillColor(30, 58, 138); doc.rect(14, y - 5, pw - 28, 9, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
      doc.text('Metric', 16, y); doc.text('Year 1', 80, y); doc.text('Year 2', 120, y); doc.text('Year 3', 160, y);
      y += 8;
      [
        ['Customers', '120', '350', '750'],
        ['ARPU', '$35', '$43', '$56'],
        ['Monthly Recurring Revenue', '$4.2K', '$15K', '$42K'],
        ['Annual Revenue', '$50K', '$180K', '$500K'],
      ].forEach((row, i) => {
        if (i % 2 === 0) { doc.setFillColor(245, 247, 255); doc.rect(14, y - 5, pw - 28, 9, 'F'); }
        doc.setTextColor(0, 0, 0); doc.setFont('helvetica', i === 3 ? 'bold' : 'normal'); doc.setFontSize(10);
        doc.text(row[0], 16, y); doc.text(row[1], 80, y); doc.text(row[2], 120, y); doc.text(row[3], 160, y);
        y += 9;
      });
      y += 8;
      doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      addText('Series A readiness: 15–18 months | Expected Series A Valuation: $3M–$10M', 14, y, { size: 10 });

      // Page 8 — Investment
      doc.addPage();
      addPDFPage(doc, 'Investment Opportunity', 8, totalPages);
      y = 30;
      addText('Seed Investment Opportunity', 14, y, { size: 14, style: 'bold' }); y += 12;
      [
        ['Amount Seeking:', '$100,000'],
        ['Pre-money Valuation:', '$1,000,000'],
        ['Post-money Valuation:', '$1,100,000'],
        ['Security Type:', 'Series A Preferred Stock'],
        ['Option Pool:', '15%'],
      ].forEach(([k, v]) => {
        addText(k, 14, y, { size: 11, style: 'bold' }); addText(v, 100, y, { size: 11 }); y += 9;
      });
      y += 6;
      addText('Use of Funds:', 14, y, { size: 12, style: 'bold' }); y += 8;
      [['Product Development (50%)', '$50,000'], ['Customer Acquisition (30%)', '$30,000'], ['Operations & Legal (15%)', '$15,000'], ['Working Capital (5%)', '$5,000']].forEach(([k, v]) => {
        addText(`  • ${k}:`, 14, y, { size: 10 }); addText(v, pw - 14, y, { size: 10, style: 'bold' }); y += 7;
      });
      y += 6;
      addText('18-Month Milestones:', 14, y, { size: 12, style: 'bold' }); y += 8;
      ['250 customers by month 6', '$4.2K MRR by month 12', '$50K ARR by month 18 → Series A ready'].forEach(m => {
        addText(`  • ${m}`, 14, y, { size: 10 }); y += 7;
      });

      // Page 9 — Contact
      doc.addPage();
      addPDFPage(doc, 'Contact', 9, totalPages);
      y = 70;
      addText('Ready to Protect the Creator Economy?', pw / 2, y, { size: 16, style: 'bold' }); y += 14;
      addText('Contact us to schedule a demo and access due diligence materials.', pw / 2, y, { size: 11 }); y += 20;
      addText('Email:', 50, y, { size: 11, style: 'bold' }); addText('investors@tsmo.app', 80, y, { size: 11, color: [30, 58, 138] }); y += 10;
      addText('Website:', 50, y, { size: 11, style: 'bold' }); addText('tsmo.app', 80, y, { size: 11, color: [30, 58, 138] }); y += 10;
      addText('Founder:', 50, y, { size: 11, style: 'bold' }); addText('shirleena.cunningham@tsmowatch.com', 80, y, { size: 11 });

      doc.save('TSMO_Investor_Pitch_Deck.pdf');
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const downloadWord = async () => {
    toast.info('Generating Word document...');
    try {
      const heading1 = (text: string) => new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } });
      const heading2 = (text: string) => new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } });
      const body = (text: string) => new Paragraph({ children: [new TextRun({ text, size: 22 })], spacing: { after: 100 } });
      const bullet = (text: string) => new Paragraph({ children: [new TextRun({ text: `• ${text}`, size: 22 })], indent: { left: 360 }, spacing: { after: 80 } });
      const pageBreak = () => new Paragraph({ children: [new TextRun({ text: '', break: 1 })] });

      const makeTable = (headers: string[], rows: string[][]) => new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: headers.map(h => new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 22 })] })],
              shading: { fill: '1E3A8A', color: 'FFFFFF' },
            })),
            tableHeader: true,
          }),
          ...rows.map((row, ri) => new TableRow({
            children: row.map(cell => new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: cell, size: 22, bold: ri === rows.length - 1 })] })],
              shading: { fill: ri % 2 === 0 ? 'F5F7FF' : 'FFFFFF' },
            })),
          })),
        ],
      });

      const doc = new Document({
        sections: [{
          children: [
            // Title Page
            new Paragraph({ children: [new TextRun({ text: 'TSMO', bold: true, size: 72, color: '1E3A8A' })], alignment: AlignmentType.CENTER }),
            new Paragraph({ children: [new TextRun({ text: 'The Future of Digital IP Protection', size: 36 })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: 'Protecting creators in the age of AI', size: 28, italics: true })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
            new Paragraph({ children: [new TextRun({ text: 'Seeking: $100K Seed Round', bold: true, size: 28 })], alignment: AlignmentType.CENTER }),
            new Paragraph({ children: [new TextRun({ text: 'Pre-money Valuation: $1,000,000  |  Post-money: $1,100,000', size: 24 })], alignment: AlignmentType.CENTER }),
            new Paragraph({ children: [new TextRun({ text: 'Founded 2025  •  Seed Stage', size: 22 })], alignment: AlignmentType.CENTER, spacing: { after: 600 } }),
            new Paragraph({ children: [new TextRun({ text: 'investors@tsmo.app  |  tsmo.app', size: 22, color: '1E3A8A' })], alignment: AlignmentType.CENTER }),
            pageBreak(),

            // Section 1 — Problem
            heading1('1. The $24.3B Problem'),
            body('Creators are defenseless against AI-era intellectual property theft.'),
            bullet('AI Training Theft: AI models trained on copyrighted content without permission or compensation.'),
            bullet('400% increase in trademark infringement since 2020.'),
            bullet('Legal action costs $50K–$500K and takes 18+ months.'),
            bullet('$24.3B in annual global IP theft losses.'),
            bullet('Current solutions are reactive, expensive, and have no AI training protection.'),
            pageBreak(),

            // Section 2 — Solution
            heading1('2. Our Solution: Four-Layer Defense System™'),
            heading2('Layer 1: AI Training Protection'),
            bullet('Patent-pending fingerprinting technology'),
            bullet('Real-time AI training detection'),
            bullet('Proactive content protection and cloaking'),
            heading2('Layer 2: Comprehensive Monitoring'),
            bullet('70+ platforms scanned continuously'),
            bullet('Multi-modal detection (image, text, video)'),
            bullet('95%+ accuracy rate'),
            heading2('Layer 3: Instant Response'),
            bullet('Automated DMCA filing'),
            bullet('Blockchain verification'),
            bullet('Legal document generation in <24 hours'),
            heading2('Layer 4: Legal Enforcement'),
            bullet('Expert legal network integration'),
            bullet('Automated compliance workflows'),
            bullet('Government filing integration'),
            pageBreak(),

            // Section 3 — Market
            heading1('3. Market Opportunity: $15.7B TAM'),
            makeTable(
              ['Market Segment', 'Size', 'Share'],
              [['Digital Content Creators', '$8.2B', '52%'], ['Enterprise IP Management', '$4.7B', '30%'], ['Legal Technology', '$2.8B', '18%'], ['Total Addressable Market', '$15.7B', '100%']]
            ),
            new Paragraph({ text: '' }),
            heading2('Market Drivers'),
            bullet('Creator economy growing 23% annually'),
            bullet('AI adoption accelerating IP theft'),
            bullet('Increasing regulatory pressure globally'),
            bullet('Rising global demand for IP protection'),
            pageBreak(),

            // Section 4 — Business Model
            heading1('4. Business Model'),
            heading2('Subscription Tiers (70% of Revenue)'),
            makeTable(['Tier', 'Price'], [['Free', '$0/mo'], ['Student', '$19.99/mo'], ['Starter', '$29.99/mo'], ['Professional', '$199.99/mo'], ['Enterprise', '$5,000/mo']]),
            new Paragraph({ text: '' }),
            heading2('Transaction Fees (20%)'),
            bullet('15–20% commission on legal documents and consultations'),
            bullet('$25–$100 per DMCA case'),
            heading2('Enterprise Solutions (10%)'),
            bullet('White-label licensing: $10K–$100K/year'),
            bullet('Custom integrations: $25K–$250K'),
            heading2('Unit Economics'),
            makeTable(['Metric', 'Value'], [['Customer Acquisition Cost (CAC)', '$15'], ['Customer Lifetime Value (LTV)', '$583'], ['LTV/CAC Ratio', '39x'], ['Payback Period', '0.4 months']]),
            pageBreak(),

            // Section 5 — Traction
            heading1('5. Traction & Metrics'),
            makeTable(
              ['Metric', 'Current Value'],
              [
                ['Monthly Recurring Revenue', '$200/mo (+45% MoM)'],
                ['Active Users', '50+'],
                ['Protected Artworks', '500+'],
                ['Monitoring Scans', '2,000+'],
                ['DMCA Notices Filed', '25+'],
                ['Customer Satisfaction', '94%'],
                ['Monthly Retention Rate', '89%'],
                ['Average Revenue Per User', '$85/month'],
              ]
            ),
            pageBreak(),

            // Section 6 — Financials
            heading1('6. Financial Projections'),
            makeTable(
              ['Metric', 'Year 1', 'Year 2', 'Year 3'],
              [['Customers', '120', '350', '750'], ['ARPU', '$35', '$43', '$56'], ['Monthly Recurring Revenue', '$4.2K', '$15K', '$42K'], ['Annual Revenue', '$50K', '$180K', '$500K']]
            ),
            new Paragraph({ text: '' }),
            bullet('Series A readiness: 15–18 months'),
            bullet('Expected Series A valuation: $3M–$10M'),
            bullet('Monthly growth rate: 15% (conservative)'),
            bullet('Annual retention rate: 85%'),
            pageBreak(),

            // Section 7 — Investment
            heading1('7. Investment Opportunity'),
            heading2('Investment Terms'),
            makeTable(
              ['Term', 'Details'],
              [['Amount Seeking', '$100,000'], ['Pre-money Valuation', '$1,000,000'], ['Post-money Valuation', '$1,100,000'], ['Security Type', 'Series A Preferred Stock'], ['Option Pool', '15%']]
            ),
            new Paragraph({ text: '' }),
            heading2('Use of Funds'),
            makeTable(
              ['Category', 'Allocation', 'Amount'],
              [['Product Development', '50%', '$50,000'], ['Customer Acquisition', '30%', '$30,000'], ['Operations & Legal', '15%', '$15,000'], ['Working Capital', '5%', '$5,000']]
            ),
            new Paragraph({ text: '' }),
            heading2('18-Month Milestones'),
            bullet('250 customers by month 6'),
            bullet('$4.2K MRR by month 12'),
            bullet('$50K ARR by month 18 → Series A ready'),
            pageBreak(),

            // Contact
            heading1('Contact Information'),
            body('Ready to protect the creator economy? Get in touch to schedule a demo and access due diligence materials.'),
            new Paragraph({ children: [new TextRun({ text: 'Email: ', bold: true, size: 22 }), new TextRun({ text: 'investors@tsmo.app', size: 22, color: '1E3A8A' })] }),
            new Paragraph({ children: [new TextRun({ text: 'Website: ', bold: true, size: 22 }), new TextRun({ text: 'tsmo.app', size: 22, color: '1E3A8A' })] }),
            new Paragraph({ children: [new TextRun({ text: 'Founder: ', bold: true, size: 22 }), new TextRun({ text: 'shirleena.cunningham@tsmowatch.com', size: 22 })] }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TSMO_Investor_Pitch_Deck.docx';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Word document downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Word document. Please try again.');
    }
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

        {/* Download Pitch Deck */}
        <div className="mt-10">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Download className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Download Pitch Deck</h3>
              </div>
              <p className="text-muted-foreground mb-5 text-sm">
                Take a copy of the full TSMO investor presentation — all 8 slides, financial projections, and investment terms.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Button onClick={downloadPDF} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button onClick={downloadWord} variant="outline" className="gap-2">
                  <FileDown className="h-4 w-4" />
                  Download Word Doc (.docx)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                PDF is print-ready · Word doc is fully editable · Both files are text-based and under 1 MB
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Ready to Learn More?</h3>
              <p className="text-muted-foreground mb-4">
                Contact our team to access detailed financial models, technical specifications, and due diligence materials.
              </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="px-6">
                    <Mail className="mr-2 h-4 w-4" />
                    shirleena.cunningham@tsmowatch.com
                  </Button>
                  <MeetingScheduler />
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvestorPitchDeck;