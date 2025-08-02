import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, AlertTriangle, FileText, Zap, Scale, Globe, 
  Download, Eye, Star, Clock, Users, TrendingUp, 
  CheckCircle, AlertCircle, DollarSign, Lock,
  Search, Filter, ArrowUp, ArrowDown, Calendar,
  BookOpen, Briefcase, Gavel, FileCheck, Award,
  LucideIcon
} from 'lucide-react';
import { format } from 'date-fns';

interface ProductionTemplate {
  id: string;
  title: string;
  description: string;
  category: 'dmca' | 'contracts' | 'compliance' | 'licensing' | 'employment' | 'privacy' | 'terms' | 'international';
  jurisdiction: string[];
  language: string[];
  format: 'pdf' | 'docx' | 'html';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  icon: LucideIcon;
  tags: string[];
  estimatedTime: string;
  popularity: number;
  lastUpdated: string;
  featured: boolean;
  verified: boolean;
  lawyerReviewed: boolean;
  price: number;
  memberPrice: number;
  downloadCount: number;
  rating: number;
  reviewCount: number;
  customFields: string[];
  legalRequirements: string[];
  complianceLevel: 'basic' | 'standard' | 'premium' | 'enterprise';
  industrySpecific: string[];
  autoFilingCapable: boolean;
  blockchainVerified: boolean;
}

const ProductionLegalTemplates: React.FC = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ProductionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating' | 'price'>('popular');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [userMembership, setUserMembership] = useState<any>(null);
  const [purchasedTemplates, setPurchasedTemplates] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>('user');
  const [downloadingTemplates, setDownloadingTemplates] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProductionTemplates();
    checkUserMembership();
    checkUserRole();
    loadUserPurchases();
  }, []);

  const loadProductionTemplates = async () => {
    try {
      // In production, this would load from a real database
      const productionTemplates: ProductionTemplate[] = [
        {
          id: 'dmca-pro-2024',
          title: 'DMCA Takedown Notice Pro',
          description: 'Professional DMCA takedown notice with automated filing, platform integration, and compliance tracking. Updated for 2024 legal standards.',
          category: 'dmca',
          jurisdiction: ['US', 'CA', 'UK', 'EU', 'AU'],
          language: ['en', 'es', 'fr', 'de'],
          format: 'pdf',
          difficulty: 'beginner',
          icon: Shield,
          tags: ['copyright', 'dmca', 'takedown', 'automated', 'platform-integration', '2024-updated'],
          estimatedTime: '8 min',
          popularity: 98,
          lastUpdated: '2024-12-15',
          featured: true,
          verified: true,
          lawyerReviewed: true,
          price: 1999, // $19.99
          memberPrice: 499, // $4.99
          downloadCount: 15847,
          rating: 4.9,
          reviewCount: 2847,
          customFields: ['workTitle', 'workDescription', 'creationDate', 'registrationNumber', 'infringingUrl', 'platformName', 'urgencyLevel'],
          legalRequirements: ['Copyright ownership proof', 'Platform agent contact', 'Good faith belief'],
          complianceLevel: 'premium',
          industrySpecific: ['photography', 'digital-art', 'music', 'video', 'software'],
          autoFilingCapable: true,
          blockchainVerified: true
        },
        {
          id: 'cease-desist-enterprise',
          title: 'Enterprise Cease & Desist',
          description: 'Comprehensive cease and desist letter with escalation protocols, multi-jurisdiction support, and automatic follow-up scheduling.',
          category: 'dmca',
          jurisdiction: ['US', 'CA', 'UK', 'EU', 'AU', 'JP'],
          language: ['en', 'es', 'fr', 'de', 'ja'],
          format: 'pdf',
          difficulty: 'intermediate',
          icon: AlertTriangle,
          tags: ['cease-desist', 'escalation', 'multi-jurisdiction', 'enterprise', 'automated-followup'],
          estimatedTime: '12 min',
          popularity: 94,
          lastUpdated: '2024-12-10',
          featured: true,
          verified: true,
          lawyerReviewed: true,
          price: 2999, // $29.99
          memberPrice: 799, // $7.99
          downloadCount: 8765,
          rating: 4.8,
          reviewCount: 1432,
          customFields: ['workTitle', 'infringingParty', 'violationType', 'evidenceUrls', 'escalationLevel', 'deadlineType'],
          legalRequirements: ['Infringement evidence', 'Prior notice documentation', 'Damage assessment'],
          complianceLevel: 'enterprise',
          industrySpecific: ['entertainment', 'fashion', 'technology', 'publishing'],
          autoFilingCapable: true,
          blockchainVerified: true
        },
        {
          id: 'licensing-agreement-2024',
          title: 'IP Licensing Agreement Suite',
          description: 'Complete intellectual property licensing package with royalty calculators, territory mapping, and compliance monitoring.',
          category: 'licensing',
          jurisdiction: ['US', 'CA', 'UK', 'EU', 'AU', 'JP', 'IN'],
          language: ['en', 'es', 'fr', 'de', 'ja', 'hi'],
          format: 'pdf',
          difficulty: 'advanced',
          icon: FileText,
          tags: ['licensing', 'royalties', 'territory', 'compliance', 'calculator', 'international'],
          estimatedTime: '25 min',
          popularity: 89,
          lastUpdated: '2024-12-05',
          featured: true,
          verified: true,
          lawyerReviewed: true,
          price: 4999, // $49.99
          memberPrice: 1499, // $14.99
          downloadCount: 5432,
          rating: 4.7,
          reviewCount: 987,
          customFields: ['licenseType', 'territory', 'duration', 'royaltyStructure', 'exclusivity', 'sublicensing'],
          legalRequirements: ['IP ownership verification', 'Territory clearance', 'Royalty structure approval'],
          complianceLevel: 'enterprise',
          industrySpecific: ['media', 'technology', 'manufacturing', 'pharmaceutical'],
          autoFilingCapable: false,
          blockchainVerified: true
        },
        {
          id: 'nft-terms-blockchain',
          title: 'NFT Terms & Smart Contract',
          description: 'Comprehensive NFT terms with smart contract integration, royalty enforcement, and metaverse compatibility.',
          category: 'compliance',
          jurisdiction: ['US', 'EU', 'UK', 'SG'],
          language: ['en', 'zh', 'ja'],
          format: 'pdf',
          difficulty: 'expert',
          icon: Zap,
          tags: ['nft', 'blockchain', 'smart-contracts', 'metaverse', 'royalties', 'web3'],
          estimatedTime: '35 min',
          popularity: 96,
          lastUpdated: '2024-12-12',
          featured: true,
          verified: true,
          lawyerReviewed: true,
          price: 7999, // $79.99
          memberPrice: 2499, // $24.99
          downloadCount: 12543,
          rating: 4.9,
          reviewCount: 3241,
          customFields: ['collectionName', 'royaltyPercentage', 'blockchainNetwork', 'smartContractAddress', 'metaverseRights'],
          legalRequirements: ['Smart contract audit', 'Blockchain compliance', 'Regulatory review'],
          complianceLevel: 'enterprise',
          industrySpecific: ['crypto', 'gaming', 'art', 'collectibles'],
          autoFilingCapable: true,
          blockchainVerified: true
        },
        {
          id: 'privacy-policy-gdpr',
          title: 'GDPR Privacy Policy Generator',
          description: 'AI-powered privacy policy generator with GDPR, CCPA, and international compliance. Real-time regulation updates.',
          category: 'privacy',
          jurisdiction: ['EU', 'US-CA', 'UK', 'CA', 'AU', 'BR'],
          language: ['en', 'de', 'fr', 'es', 'pt', 'it'],
          format: 'html',
          difficulty: 'intermediate',
          icon: Lock,
          tags: ['gdpr', 'ccpa', 'privacy', 'compliance', 'ai-powered', 'real-time-updates'],
          estimatedTime: '18 min',
          popularity: 91,
          lastUpdated: '2024-12-14',
          featured: true,
          verified: true,
          lawyerReviewed: true,
          price: 3999, // $39.99
          memberPrice: 999, // $9.99
          downloadCount: 9876,
          rating: 4.8,
          reviewCount: 2156,
          customFields: ['businessType', 'dataTypes', 'processingPurposes', 'thirdParties', 'retentionPeriods'],
          legalRequirements: ['DPA registration', 'Cookie consent', 'Data mapping'],
          complianceLevel: 'premium',
          industrySpecific: ['saas', 'ecommerce', 'healthcare', 'fintech'],
          autoFilingCapable: true,
          blockchainVerified: false
        },
        {
          id: 'employment-agreement-global',
          title: 'Global Employment Contract',
          description: 'International employment contract with remote work provisions, IP assignments, and multi-jurisdiction compliance.',
          category: 'employment',
          jurisdiction: ['US', 'CA', 'UK', 'EU', 'AU', 'IN', 'SG'],
          language: ['en', 'es', 'fr', 'de', 'hi'],
          format: 'pdf',
          difficulty: 'advanced',
          icon: Briefcase,
          tags: ['employment', 'remote-work', 'international', 'ip-assignment', 'compliance'],
          estimatedTime: '30 min',
          popularity: 85,
          lastUpdated: '2024-12-08',
          featured: false,
          verified: true,
          lawyerReviewed: true,
          price: 5999, // $59.99
          memberPrice: 1999, // $19.99
          downloadCount: 3421,
          rating: 4.6,
          reviewCount: 654,
          customFields: ['employeeType', 'workLocation', 'compensation', 'benefits', 'ipScope'],
          legalRequirements: ['Local labor law compliance', 'Tax documentation', 'Work authorization'],
          complianceLevel: 'enterprise',
          industrySpecific: ['technology', 'consulting', 'remote-first'],
          autoFilingCapable: false,
          blockchainVerified: false
        }
      ];

      setTemplates(productionTemplates);
      setLoading(false);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load legal templates",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (!error && data) {
          setUserRole(data.role);
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const checkUserMembership = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.rpc('user_has_membership', { _user_id: user.id });
        if (!error) {
          setUserMembership(data);
        }
      }
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const loadUserPurchases = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('template_purchases')
          .select('template_id')
          .eq('user_id', user.id)
          .eq('status', 'completed');
        
        if (!error && data) {
          setPurchasedTemplates(data.map(p => p.template_id));
        }
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
    }
  };

  const handlePurchaseTemplate = async (template: ProductionTemplate) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please sign in to access templates",
          variant: "destructive"
        });
        return;
      }

      // Check if user is admin - admins get free access
      if (userRole === 'admin') {
        toast({
          title: "Admin Access",
          description: "Admin access granted - template available for download",
        });
        // Add template to purchased list for admin
        setPurchasedTemplates(prev => [...prev, template.id]);
        return;
      }

      const { data, error } = await supabase.functions.invoke('purchase-template', {
        body: {
          templateId: template.id,
          templateTitle: template.title
        }
      });

      if (error) throw error;

      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Error",
        description: "Failed to initiate purchase",
        variant: "destructive"
      });
    }
  };

  const handleDownloadTemplate = async (template: ProductionTemplate) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please sign in to download templates",
          variant: "destructive"
        });
        return;
      }

      setDownloadingTemplates(prev => new Set(prev).add(template.id));

      const { data, error } = await supabase.functions.invoke('real-legal-document-processor', {
        body: {
          action: 'generate',
          templateId: template.id,
          templateTitle: template.title,
          customFields: template.customFields.reduce((acc, field) => {
            acc[field] = `[${field.replace(/([A-Z])/g, ' $1').toLowerCase()}]`;
            return acc;
          }, {} as Record<string, string>)
        }
      });

      if (error) throw error;

      if (data?.documentContent) {
        // Create and download the document
        const blob = new Blob([data.documentContent], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${template.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Download Complete",
          description: `${template.title} has been downloaded successfully`,
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Error",
        description: "Failed to download template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloadingTemplates(prev => {
        const newSet = new Set(prev);
        newSet.delete(template.id);
        return newSet;
      });
    }
  };

  const filteredAndSortedTemplates = templates
    .filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesJurisdiction = selectedJurisdiction === 'all' || template.jurisdiction.includes(selectedJurisdiction);
      const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesJurisdiction && matchesDifficulty;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'popular':
          return (b.popularity - a.popularity) * multiplier;
        case 'recent':
          return (new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()) * multiplier;
        case 'rating':
          return (b.rating - a.rating) * multiplier;
        case 'price':
          const priceA = userMembership ? a.memberPrice : a.price;
          const priceB = userMembership ? b.memberPrice : b.price;
          return (priceB - priceA) * multiplier;
        default:
          return 0;
      }
    });

  const getPrice = (template: ProductionTemplate) => {
    if (userRole === 'admin') return 0; // Free for admins
    return userMembership ? template.memberPrice : template.price;
  };

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'FREE';
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading legal templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Professional Legal Templates</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Market-ready legal documents with automated filing and compliance tracking
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Lawyer Reviewed
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Blockchain Verified
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Multi-Jurisdiction
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Auto-Filing Ready
            </Badge>
            {userRole === 'admin' && (
              <Badge variant="destructive" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Admin Access
              </Badge>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="dmca">DMCA & Copyright</SelectItem>
                  <SelectItem value="contracts">Contracts</SelectItem>
                  <SelectItem value="licensing">Licensing</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="employment">Employment</SelectItem>
                  <SelectItem value="privacy">Privacy</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="Jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jurisdictions</SelectItem>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="EU">European Union</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Popularity</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedTemplates.map((template) => {
            const isPurchased = purchasedTemplates.includes(template.id);
            const isAdmin = userRole === 'admin';
            const currentPrice = getPrice(template);
            const originalPrice = template.price;
            const discount = userMembership && template.memberPrice < template.price;

            return (
              <Card key={template.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-primary/10 rounded-lg">
                         <template.icon className="h-6 w-6 text-primary" />
                       </div>
                      <div>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{template.rating}</span>
                            <span className="text-sm text-muted-foreground">({template.reviewCount})</span>
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{template.downloadCount.toLocaleString()} downloads</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {template.featured && <Badge variant="secondary">Featured</Badge>}
                      {template.verified && <Badge variant="outline" className="text-xs">Verified</Badge>}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="mb-4 line-clamp-3">
                    {template.description}
                  </CardDescription>

                  <div className="space-y-3">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">{template.difficulty}</Badge>
                      <Badge variant="outline" className="text-xs">{template.estimatedTime}</Badge>
                      {template.autoFilingCapable && (
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Auto-Filing
                        </Badge>
                      )}
                      {template.blockchainVerified && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Blockchain
                        </Badge>
                      )}
                    </div>

                    {/* Compliance Level */}
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium capitalize">{template.complianceLevel}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {template.jurisdiction.length} jurisdiction{template.jurisdiction.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isAdmin ? (
                          <>
                            <span className="text-lg font-bold text-green-600">FREE</span>
                            <Badge variant="destructive" className="text-xs">Admin</Badge>
                          </>
                        ) : discount ? (
                          <>
                            <span className="text-lg font-bold text-primary">{formatPrice(currentPrice)}</span>
                            <span className="text-sm text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
                            <Badge variant="secondary" className="text-xs">Member Price</Badge>
                          </>
                        ) : (
                          <span className="text-lg font-bold">{formatPrice(currentPrice)}</span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Updated</div>
                        <div className="text-xs">{format(new Date(template.lastUpdated), 'MMM dd, yyyy')}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {isPurchased || isAdmin ? (
                        <Button 
                          className="flex-1" 
                          variant="secondary"
                          onClick={() => handleDownloadTemplate(template)}
                          disabled={downloadingTemplates.has(template.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {downloadingTemplates.has(template.id) ? 'Downloading...' : 'Download'}
                        </Button>
                      ) : (
                        <Button 
                          className="flex-1" 
                          onClick={() => handlePurchaseTemplate(template)}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Purchase
                        </Button>
                      )}
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredAndSortedTemplates.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p>Try adjusting your search criteria or filters</p>
            </div>
          </Card>
        )}

        {/* Legal Disclaimer */}
        <Card className="mt-12 border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium text-yellow-800 mb-2">Legal Disclaimer</h4>
                <p className="text-yellow-700">
                  These templates are provided for informational purposes and should be reviewed by qualified legal counsel 
                  before use. Laws vary by jurisdiction and individual circumstances may require modifications. 
                  TSMO Watch does not provide legal advice and is not responsible for outcomes from template usage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductionLegalTemplates;