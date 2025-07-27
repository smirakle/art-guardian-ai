import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  Shield, 
  Upload, 
  Eye, 
  CreditCard,
  MessageSquare,
  Mail,
  Phone,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'protection' | 'upload' | 'monitoring' | 'billing' | 'technical';
  tags: string[];
}

const UserHelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = [
    { id: 'all', label: 'All Topics', icon: BookOpen },
    { id: 'protection', label: 'Art Protection', icon: Shield },
    { id: 'upload', label: 'Uploading', icon: Upload },
    { id: 'monitoring', label: 'Monitoring', icon: Eye },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'technical', label: 'Technical', icon: HelpCircle }
  ];

  const faqs: FAQItem[] = [
    {
      question: 'How does TSMO protect my artwork?',
      answer: 'TSMO uses advanced AI-powered visual recognition to scan the internet 24/7 for unauthorized use of your artwork. We monitor social media platforms, e-commerce sites, and the dark web to detect potential theft or misuse.',
      category: 'protection',
      tags: ['ai', 'monitoring', 'protection']
    },
    {
      question: 'What file formats can I upload?',
      answer: 'You can upload JPG, PNG, GIF, WebP, and SVG image files. We also support video files (MP4, AVI, MOV) and text content for comprehensive protection.',
      category: 'upload',
      tags: ['formats', 'upload', 'files']
    },
    {
      question: 'How quickly will I be notified of potential theft?',
      answer: 'Our real-time monitoring system typically detects unauthorized use within minutes to hours of it appearing online. You\'ll receive instant notifications via email and through your dashboard.',
      category: 'monitoring',
      tags: ['alerts', 'notifications', 'speed']
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time from your account settings. Your protection will continue until the end of your current billing period.',
      category: 'billing',
      tags: ['cancel', 'subscription', 'billing']
    },
    {
      question: 'What happens when unauthorized use is detected?',
      answer: 'When we detect unauthorized use, you\'ll receive an alert with details about where your artwork was found. You can then choose to file automated DMCA takedown notices or take other legal action.',
      category: 'protection',
      tags: ['dmca', 'takedown', 'legal']
    },
    {
      question: 'Is my uploaded content secure?',
      answer: 'Absolutely. All uploaded content is encrypted and stored securely. We never share your artwork with third parties and only use it for protection monitoring purposes.',
      category: 'technical',
      tags: ['security', 'privacy', 'encryption']
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Help Center</h1>
        <p className="text-muted-foreground mb-6">
          Find answers to common questions and get help with TSMO
        </p>
        
        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Get instant help from our support team
            </p>
            <Button size="sm" className="w-full">
              Start Chat
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Send us a detailed message
            </p>
            <Button size="sm" variant="outline" className="w-full">
              Send Email
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">User Guide</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Complete step-by-step tutorials
            </p>
            <Button size="sm" variant="outline" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Guide
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Frequently Asked Questions
          </h2>
          <Badge variant="secondary">
            {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or browse different categories
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredFAQs.map((faq, index) => (
              <Collapsible key={index}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-left text-base font-medium">
                          {faq.question}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.id === faq.category)?.label}
                          </Badge>
                          <ChevronDown className="w-4 h-4 transition-transform" />
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                      <div className="flex gap-1 mt-3">
                        {faq.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </div>

      {/* Contact Information */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Still need help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>support@tsmo.app</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>1-800-TSMO-HELP</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Support hours: Monday-Friday 9AM-6PM EST
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserHelpCenter;