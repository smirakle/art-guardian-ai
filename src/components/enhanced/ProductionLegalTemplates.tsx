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
import jsPDF from 'jspdf';

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
        // Get subscription info using the get_user_subscription function
        const { data, error } = await supabase.rpc('get_user_subscription');
        if (!error && data) {
          setUserMembership(data);
        } else {
          // Fallback: check subscriptions table directly
          const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('plan_id, status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();
          
          if (!subError && subData) {
            setUserMembership(subData);
          }
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

      // Check if user is admin - only admins get free access
      if (userRole === 'admin') {
        toast({
          title: "Admin Access",
          description: "Admin access granted - template available for download",
        });
        setPurchasedTemplates(prev => [...prev, template.id]);
        return;
      }

      const { data, error } = await supabase.functions.invoke('purchase-template', {
        body: {
          templateId: template.id,
          templateTitle: template.title,
          regularPrice: template.price,
          memberPrice: template.memberPrice,
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
      // Free download for everyone (guest allowed)

      setDownloadingTemplates(prev => new Set(prev).add(template.id));

      // Generate PDF document
      const pdfDoc = generateLegalPDF(template, user || { email: 'guest@example.com' });
      
      // Download the PDF
      pdfDoc.save(`${template.title.replace(/[^a-zA-Z0-9]/g, '_')}_Legal_Document.pdf`);

      toast({
        title: "PDF Download Complete",
        description: `${template.title} has been downloaded as a professional legal PDF with compliance formatting`,
      });

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

  const generateSimpleLegalDocument = (template: ProductionTemplate, user: any) => {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const caseReference = `TSMO-${Date.now()}`;
    
    return {
      title: template.title,
      caseReference,
      currentDate,
      userEmail: user.email,
      content: getTemplateContent(template.id),
      jurisdiction: 'US',
      complianceLevel: template.complianceLevel
    };
  };

  const getTemplateContent = (templateId: string) => {
    const templates: Record<string, string> = {
      'dmca-pro-2024': `DIGITAL MILLENNIUM COPYRIGHT ACT TAKEDOWN NOTICE

To: [Platform Name] Legal Department / DMCA Agent
Date: [Current Date]
Subject: DMCA Takedown Notice - Copyright Infringement Claim

NOTICE TO AGENT DESIGNATED TO RECEIVE NOTIFICATION OF CLAIMED INFRINGEMENT

To Whom It May Concern:

I, [Your Full Name], certify under penalty of perjury that I am the owner, or authorized to act on behalf of the owner, of the exclusive rights that are allegedly infringed.

COPYRIGHT OWNER INFORMATION:
Full Legal Name: [Your Full Name]
Business Name: [Your Business Name]
Address: [Your Address]
Telephone: [Your Phone Number]
Email: [Your Email Address]

COPYRIGHTED WORK IDENTIFICATION:
Work Title: [Work Title]
Work Description: [Work Description]
Creation Date: [Creation Date]
Copyright Registration: [Registration Number if applicable]
Original Publication: [Original Location/URL]

INFRINGING MATERIAL:
Infringing URL(s): [URLs of infringing content]
Specific Content Location: [Describe where content appears]
Infringement Description: [Describe how your work is being infringed]

SWORN STATEMENTS:
I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.

I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner, or am authorized to act on behalf of the owner, of an exclusive right that is allegedly infringed.

CONTACT FOR RESOLUTION:
[Your Full Name]
[Your Email Address]
[Your Phone Number]

ELECTRONIC SIGNATURE:
/s/ [Your Electronic Signature]
Date: [Current Date]`,
      
      'cease-desist-enterprise': `CEASE AND DESIST NOTICE

TO: [Infringing Party Name]
FROM: [Your Full Name]
DATE: [Current Date]
RE: CEASE AND DESIST - COPYRIGHT INFRINGEMENT

NOTICE TO CEASE AND DESIST COPYRIGHT INFRINGEMENT

You are hereby notified that your unauthorized use of [Work Title], owned by [Your Full Name], constitutes copyright infringement under applicable law.

DETAILS OF INFRINGEMENT:
Work Title: [Work Title]
Your Unauthorized Use: [Description of infringement]
Evidence URLs: [URLs showing infringement]

DEMAND TO CEASE AND DESIST:
You are hereby demanded to immediately cease and desist all use of the copyrighted work and to remove all infringing content within 10 business days of receipt of this notice.

This letter serves as formal notice of my rights and your infringement. Failure to comply may result in legal action seeking monetary damages and injunctive relief.

Sincerely,
/s/ [Your Full Name]
[Current Date]`,

      'licensing-agreement-2024': `INTELLECTUAL PROPERTY LICENSING AGREEMENT

This Licensing Agreement is entered into on [Current Date] between:

LICENSOR: [Your Full Name]
LICENSEE: [Licensee Name]

LICENSE TERMS:
License Type: [Exclusive/Non-exclusive]
Territory: [Geographic area]
Duration: [Time period]
Royalty Structure: [Percentage or fee structure]

The Licensor grants to Licensee the right to use the intellectual property under the terms specified herein.

GOVERNING LAW: [Jurisdiction]

IN WITNESS WHEREOF, the parties execute this Agreement.

LICENSOR: [Your Full Name]
LICENSEE: [Licensee Name]
Date: [Current Date]`,

      'nft-terms-blockchain': `NFT TERMS OF SERVICE & SMART CONTRACT AGREEMENT

Collection Name: [Collection Name]
Blockchain Network: [Network Name]
Smart Contract Address: [Contract Address]
Royalty Percentage: [Percentage]%

TERMS AND CONDITIONS:
1. OWNERSHIP RIGHTS
The NFT represents ownership of unique digital assets with specific rights and limitations.

2. ROYALTY ENFORCEMENT
Creator royalties shall be enforced through smart contract technology.

3. METAVERSE RIGHTS
[Specify metaverse usage rights]

4. BLOCKCHAIN COMPLIANCE
This agreement is governed by applicable law and blockchain regulations.

/s/ [Your Full Name]
Date: [Current Date]`,

      'privacy-policy-gdpr': `PRIVACY POLICY
GDPR COMPLIANT

Business Type: [Your Business Type]
Data Types Collected: [Types of data you collect]
Processing Purposes: [Why you process data]
Third Parties: [Any third parties involved]
Retention Periods: [How long you keep data]

GDPR COMPLIANCE STATEMENT:
This privacy policy complies with the General Data Protection Regulation (GDPR) and applicable privacy laws.

YOUR RIGHTS:
- Right to access your personal data
- Right to rectification
- Right to erasure
- Right to data portability

CONTACT INFORMATION:
[Your Full Name]
[Your Email Address]

Last Updated: [Current Date]`,

      'employment-agreement-global': `GLOBAL EMPLOYMENT AGREEMENT

THIS EMPLOYMENT AGREEMENT is entered into on [Current Date], between:

EMPLOYER:
Company Name: [Company Name]
Address: [Company Address]
Legal Representative: [Your Full Name]

EMPLOYEE:
Full Name: [Employee Name]
Address: [Employee Address]

TERMS OF EMPLOYMENT:

1. POSITION AND DUTIES
The Employee shall serve as [Job Title] and shall perform duties as assigned.

2. COMPENSATION
Base Salary: [Salary Amount]
Benefits: [Benefits Package]

3. TERM
This agreement shall commence on [Start Date] and continue until terminated.

4. CONFIDENTIALITY
Employee agrees to maintain strict confidentiality regarding proprietary information.

5. INTELLECTUAL PROPERTY
All work product created during employment shall be the property of the Company.

IN WITNESS WHEREOF, the parties have executed this Agreement.

EMPLOYER: [Your Full Name]
EMPLOYEE: [Employee Name]
Date: [Current Date]`
    };
    
    return templates[templateId] || 'Template content not found. Please contact support.';
  };

  const formatAsLegalDocument = (document: any, template: ProductionTemplate) => {
    return `
================================================================================
                          LEGAL DOCUMENT
================================================================================

${document.title.toUpperCase()}
Generated by TSMO Watch Legal System

Document Details:
- Case Reference: ${document.caseReference}
- Generated: ${document.currentDate}
- Jurisdiction: ${document.jurisdiction}
- Compliance Level: ${document.complianceLevel.toUpperCase()}
- Template Category: ${template.category.toUpperCase()}

================================================================================

${document.content}

================================================================================
                       DOCUMENT VERIFICATION
================================================================================

LEGAL DISCLAIMER:
This document was generated using TSMO Watch Legal Templates and has been
reviewed for compliance with applicable laws and regulations. For legal advice
specific to your situation, consult with a qualified attorney.

VERIFICATION INFORMATION:
- Document Generated: ${document.currentDate}
- Case Reference: ${document.caseReference}
- User Email: ${document.userEmail}
- Compliance Level: ${document.complianceLevel}
- Jurisdiction: ${document.jurisdiction}

INSTRUCTIONS FOR USE:
1. Replace all placeholder text in [brackets] with your specific information
2. Review all sections for accuracy and completeness
3. Consult with a legal professional if needed
4. Keep this document for your records

TSMO Watch Legal System
https://tsmowatch.com/legal-templates
Generated on: ${new Date().toISOString()}

================================================================================
                           END OF DOCUMENT
================================================================================
`;
  };

  const generateLegalPDF = (template: ProductionTemplate, user: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    
    let currentY = margin;
    
    // Helper function to add new page if needed
    const checkNewPage = (neededHeight: number) => {
      if (currentY + neededHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
    };

    // Helper function to add text with proper wrapping
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const lines = doc.splitTextToSize(text, maxWidth);
      const lineHeight = fontSize * 0.6;
      
      checkNewPage(lines.length * lineHeight);
      
      lines.forEach((line: string, index: number) => {
        doc.text(line, margin, currentY + (index * lineHeight));
      });
      
      currentY += lines.length * lineHeight + 5;
    };

    // Add header
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(template.title.toUpperCase(), pageWidth / 2, 25, { align: 'center' });
    
    currentY = 50;
    
    // Add document metadata
    addText('LEGAL DOCUMENT', 16, true);
    addText('Generated by TSMO Watch Legal System', 10);
    addText('', 8); // Spacing
    
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    const caseReference = `TSMO-${Date.now()}`;
    
    addText(`Case Reference: ${caseReference}`, 10);
    addText(`Generated: ${currentDate}`, 10);
    addText(`Jurisdiction: US`, 10);
    addText(`Compliance Level: ${template.complianceLevel.toUpperCase()}`, 10);
    addText(`Template Category: ${template.category.toUpperCase()}`, 10);
    addText(`User Email: ${user.email}`, 10);
    addText('', 8); // Spacing
    
    // Add separator line
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;
    
    // Add main content
    addText('DOCUMENT CONTENT', 14, true);
    addText('', 5);
    
    const content = getTemplateContent(template.id);
    const paragraphs = content.split('\n\n');
    
    paragraphs.forEach(paragraph => {
      if (paragraph.trim()) {
        // Check if it's a header (all caps or starts with number)
        const isHeader = /^[A-Z\s\d:.-]+$/.test(paragraph.trim()) && paragraph.length < 100;
        const isNumberedSection = /^\d+\./.test(paragraph.trim());
        
        if (isHeader || isNumberedSection) {
          addText('', 5); // Extra spacing before headers
          addText(paragraph.trim(), 12, true);
        } else {
          addText(paragraph.trim(), 11);
        }
        addText('', 3); // Spacing between paragraphs
      }
    });
    
    // Add footer section
    checkNewPage(60);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;
    
    addText('DOCUMENT VERIFICATION & COMPLIANCE', 14, true);
    addText('', 5);
    
    addText('LEGAL DISCLAIMER:', 12, true);
    addText('This document was generated using TSMO Watch Legal Templates and has been reviewed for compliance with applicable laws and regulations. For legal advice specific to your situation, consult with a qualified attorney.', 10);
    addText('', 5);
    
    addText('VERIFICATION INFORMATION:', 12, true);
    addText(`• Document Generated: ${currentDate}`, 10);
    addText(`• Case Reference: ${caseReference}`, 10);
    addText(`• User Email: ${user.email}`, 10);
    addText(`• Compliance Level: ${template.complianceLevel}`, 10);
    addText(`• Jurisdiction: US`, 10);
    addText('', 5);
    
    addText('INSTRUCTIONS FOR USE:', 12, true);
    addText('1. Replace all placeholder text in [brackets] with your specific information', 10);
    addText('2. Review all sections for accuracy and completeness', 10);
    addText('3. Consult with a legal professional if needed', 10);
    addText('4. Keep this document for your records', 10);
    addText('', 5);
    
    addText('TSMO Watch Legal System', 10, true);
    addText('https://tsmowatch.com/legal-templates', 10);
    addText(`Generated on: ${new Date().toISOString()}`, 9);
    
    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }
    
    return doc;
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
    if (userRole === 'admin') return 0; // Free for admins only
    // Students and starters get member prices, not free
    if (userMembership?.plan_id === 'student' || userMembership?.plan_id === 'starter' || userMembership) {
      return template.memberPrice;
    }
    return template.price;
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
            const isStudent = userMembership?.plan_id === 'student';
            const isStarter = userMembership?.plan_id === 'starter';
            const isFreeAccess = isAdmin; // Only admins get free access now
            const isMember = userMembership && (isStudent || isStarter || userMembership.plan_id);
            const currentPrice = getPrice(template);
            const originalPrice = template.price;
            const discount = isMember && template.memberPrice < template.price;

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
                      <Badge variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        PDF Format
                      </Badge>
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
                      <span className="text-lg font-bold text-green-600">FREE</span>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Updated</div>
                        <div className="text-xs">{format(new Date(template.lastUpdated), 'MMM dd, yyyy')}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1" 
                        variant="secondary"
                        onClick={() => handleDownloadTemplate(template)}
                        disabled={downloadingTemplates.has(template.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {downloadingTemplates.has(template.id) ? 'Downloading...' : 'Download'}
                      </Button>
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