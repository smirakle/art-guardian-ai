import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  Scale, 
  Shield, 
  Eye, 
  AlertTriangle, 
  Search, 
  Filter,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  Users,
  Gavel,
  FileCheck,
  BookOpen,
  Zap,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

interface LegalTemplate {
  id: string;
  title: string;
  description: string;
  category: 'dmca' | 'contracts' | 'policies' | 'notices' | 'compliance' | 'licensing';
  format: 'pdf' | 'docx' | 'txt';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: React.ComponentType<any>;
  content: string;
  tags: string[];
  estimatedTime: string;
  popularity: number;
  lastUpdated: string;
  featured?: boolean;
}

const LegalTemplates = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'alphabetical'>('popular');
  const [previewTemplate, setPreviewTemplate] = useState<LegalTemplate | null>(null);
  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    checkLoginStatus();
    fetchDownloadCounts();
    
    // Set up real-time subscription for template purchases
    const channel = supabase
      .channel('template-purchases-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'template_purchases'
        },
        () => {
          // Refetch download counts when purchases change
          fetchDownloadCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkLoginStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    }
  };

  const fetchDownloadCounts = async () => {
    try {
      const { data, error } = await supabase.rpc('get_all_template_download_counts');
      if (error) {
        console.error('Error fetching download counts:', error);
        return;
      }
      
      const countMap: Record<string, number> = {};
      data?.forEach((item: { template_id: string; download_count: number }) => {
        countMap[item.template_id] = Number(item.download_count);
      });
      setDownloadCounts(countMap);
    } catch (error) {
      console.error('Error fetching download counts:', error);
    }
  };

  const handleDownloadTemplate = async (template: LegalTemplate) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to download templates.",
        variant: "destructive",
      });
      return;
    }

    downloadTemplate(template);
  };

  const templates: LegalTemplate[] = [
    {
      id: 'dmca-takedown',
      title: 'DMCA Takedown Notice',
      description: 'Complete DMCA takedown notice template for copyright infringement with step-by-step guidance',
      category: 'dmca',
      format: 'pdf',
      difficulty: 'beginner',
      icon: Shield,
      tags: ['copyright', 'dmca', 'takedown', 'infringement'],
      estimatedTime: '15 min',
      popularity: 95,
      lastUpdated: '2024-01-15',
      featured: true,
      content: `
DMCA TAKEDOWN NOTICE

To: [Service Provider/Website Owner]
Date: [Date]

RE: Notice of Infringement under Digital Millennium Copyright Act (DMCA)

Dear Sir/Madam,

I am writing to notify you of copyright infringement occurring on your platform.

COPYRIGHT OWNER INFORMATION:
Name: [Your Full Name]
Title: [Your Title]
Company: [Company Name (if applicable)]
Address: [Your Full Address]
Phone: [Your Phone Number]
Email: [Your Email Address]

COPYRIGHTED WORK:
I am the owner of the following copyrighted work:
- Title: [Title of Your Work]
- Description: [Detailed description of your copyrighted work]
- Date of Creation: [Date]
- Registration Number: [Copyright registration number if applicable]

INFRINGING MATERIAL:
The following material on your website infringes my copyright:
- URL: [Full URL of infringing content]
- Description of Infringement: [How your work is being used without permission]

GOOD FAITH STATEMENT:
I have a good faith belief that use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law.

ACCURACY STATEMENT:
I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.

ELECTRONIC SIGNATURE:
[Your Full Legal Name]
[Date]

Please remove or disable access to the infringing material immediately.

Thank you for your prompt attention to this matter.

Sincerely,
[Your Signature]
[Your Printed Name]
      `
    },
    {
      id: 'cease-desist',
      title: 'Cease and Desist Letter',
      description: 'Professional cease and desist letter for copyright infringement with legal backing',
      category: 'notices',
      format: 'pdf',
      difficulty: 'intermediate',
      icon: AlertTriangle,
      tags: ['cease-desist', 'copyright', 'legal-notice', 'enforcement'],
      estimatedTime: '20 min',
      popularity: 87,
      lastUpdated: '2024-01-10',
      content: `
CEASE AND DESIST LETTER

[Date]

[Infringer's Name]
[Infringer's Address]

RE: CEASE AND DESIST - COPYRIGHT INFRINGEMENT

Dear [Infringer's Name],

I am writing to demand that you immediately cease and desist from the unauthorized use of my copyrighted material.

BACKGROUND:
I am the owner of the copyright in the following work(s):
[Description of copyrighted work]

INFRINGEMENT:
You are currently using my copyrighted material without authorization at:
[URL or location of infringement]

This unauthorized use constitutes copyright infringement under federal law.

DEMAND:
I hereby demand that you:
1. Immediately cease all use of my copyrighted material
2. Remove all infringing content from your website/platform
3. Provide written confirmation of compliance within 10 days
4. Refrain from any future use of my copyrighted works

CONSEQUENCES:
Failure to comply with this demand may result in:
- Federal court action for copyright infringement
- Monetary damages and attorney's fees
- Injunctive relief

This letter serves as formal notice of your infringement and my intent to pursue all available legal remedies.

Please confirm your compliance in writing within 10 days.

Sincerely,
[Your Name]
[Your Title]
[Your Contact Information]
      `
    },
    {
      id: 'licensing-agreement',
      title: 'Art Licensing Agreement',
      description: 'Comprehensive licensing agreement template for artwork usage with royalty structures',
      category: 'licensing',
      format: 'pdf',
      difficulty: 'advanced',
      icon: FileText,
      tags: ['licensing', 'contracts', 'royalties', 'artwork'],
      estimatedTime: '45 min',
      popularity: 78,
      lastUpdated: '2024-01-05',
      featured: true,
      content: `
ARTWORK LICENSING AGREEMENT

This Licensing Agreement ("Agreement") is entered into on [Date] between:

LICENSOR:
[Your Name/Company]
[Address]
[Contact Information]

LICENSEE:
[Licensee Name/Company]
[Address]
[Contact Information]

1. LICENSED ARTWORK
The artwork being licensed includes:
- Title: [Artwork Title]
- Description: [Detailed description]
- Medium: [Digital/Physical/etc.]

2. GRANT OF LICENSE
Licensor grants Licensee a [exclusive/non-exclusive] license to use the artwork for:
[Specific uses allowed]

3. TERM
This license is effective from [Start Date] to [End Date].

4. TERRITORY
This license applies to: [Geographic limitations]

5. ROYALTIES AND PAYMENT
Licensee agrees to pay:
- License Fee: $[Amount]
- Royalty Rate: [Percentage]% of net sales
- Payment Schedule: [Payment terms]

6. QUALITY CONTROL
Licensee must maintain quality standards and submit samples for approval.

7. COPYRIGHT NOTICE
All uses must include: "© [Year] [Your Name]. All rights reserved."

8. TERMINATION
This agreement may be terminated by either party with [Notice Period] written notice.

9. GOVERNING LAW
This agreement is governed by the laws of [State/Country].

SIGNATURES:
Licensor: _________________ Date: _______
Licensee: _________________ Date: _______
      `
    },
    {
      id: 'nft-terms',
      title: 'NFT Terms & Conditions',
      description: 'Modern terms and conditions specifically designed for NFT creators and marketplaces',
      category: 'compliance',
      format: 'pdf',
      difficulty: 'advanced',
      icon: Zap,
      tags: ['nft', 'blockchain', 'digital-rights', 'terms'],
      estimatedTime: '35 min',
      popularity: 92,
      lastUpdated: '2024-01-20',
      featured: true,
      content: `
NFT TERMS AND CONDITIONS

1. DEFINITIONS
- "NFT" means non-fungible token
- "Digital Asset" means the artwork or content associated with the NFT
- "Creator" means the original artist or content creator
- "Owner" means the current holder of the NFT

2. OWNERSHIP RIGHTS
- Purchase of NFT grants ownership of the token, not the underlying artwork
- Creator retains all intellectual property rights
- Owner receives limited usage rights as specified

3. PERMITTED USES
NFT owners may:
- Display the digital asset for personal use
- Resell the NFT through compatible platforms
- Use in virtual worlds and metaverse platforms (where applicable)

4. RESTRICTIONS
NFT owners may NOT:
- Create derivative works without permission
- Use for commercial purposes beyond specified rights
- Claim ownership of intellectual property
- Remove or alter copyright notices

5. MARKETPLACE OBLIGATIONS
- All sales must comply with platform terms
- Royalties must be paid to creators as specified
- Accurate representation of NFT contents required

6. ENVIRONMENTAL CONSIDERATIONS
- Platform commits to carbon-neutral blockchain operations
- Support for eco-friendly blockchain networks

7. DISPUTE RESOLUTION
Disputes will be resolved through:
- Initial mediation
- Binding arbitration if necessary
- Applicable jurisdiction: [Location]

8. SMART CONTRACT TERMS
- NFT governed by underlying smart contract
- Platform not responsible for blockchain-level issues
- Gas fees responsibility of transacting party

Last Updated: [Date]
      `
    },
    {
      id: 'copyright-registration',
      title: 'Copyright Registration Guide',
      description: 'Complete step-by-step guide for registering your artwork with copyright offices worldwide',
      category: 'compliance',
      format: 'pdf',
      difficulty: 'beginner',
      icon: Scale,
      tags: ['copyright', 'registration', 'protection', 'legal'],
      estimatedTime: '30 min',
      popularity: 84,
      lastUpdated: '2024-01-12',
      content: `
COPYRIGHT REGISTRATION GUIDE

WHY REGISTER YOUR COPYRIGHT?
- Legal presumption of ownership
- Ability to sue for infringement
- Eligibility for statutory damages
- Public record of your claim

WHAT CAN BE REGISTERED?
- Original artistic works
- Digital artwork
- Photographs
- Graphic designs
- Sculptures and installations

REGISTRATION PROCESS:

STEP 1: GATHER MATERIALS
- Completed application (Form CO or Form VA)
- Non-refundable filing fee ($45-$125)
- Copy of your work (deposit copy)

STEP 2: COMPLETE APPLICATION
Online at www.copyright.gov:
- Title of work
- Author information
- Creation date
- Publication date (if applicable)
- Rights and permissions

STEP 3: SUBMIT DEPOSIT
For artwork, submit:
- High-resolution digital files
- Physical copies (if required)
- Identifying material

STEP 4: PAY FEES
- Standard application: $125
- Online filing: $45-$65
- Group registration: varies

STEP 5: WAIT FOR PROCESSING
- Processing time: 3-12 months
- Certificate mailed upon approval
- Registration effective from submission date

TIPS FOR SUCCESS:
- Use consistent naming
- Keep detailed records
- Register promptly after creation
- Consider group registrations for multiple works

INTERNATIONAL PROTECTION:
- File in target countries
- Use Madrid Protocol for trademarks
- Consider international copyright treaties

For questions, contact:
U.S. Copyright Office
Library of Congress
Washington, DC 20559
(877) 476-0778
      `
    },
    {
      id: 'privacy-policy',
      title: 'GDPR Privacy Policy',
      description: 'Comprehensive GDPR-compliant privacy policy template for creative platforms and digital services',
      category: 'policies',
      format: 'pdf',
      difficulty: 'intermediate',
      icon: Eye,
      tags: ['privacy', 'gdpr', 'compliance', 'data-protection'],
      estimatedTime: '25 min',
      popularity: 89,
      lastUpdated: '2024-01-18',
      content: `
PRIVACY POLICY

Last Updated: [Date]

INTRODUCTION
This Privacy Policy describes how [Your Company] collects, uses, and protects your personal information.

INFORMATION WE COLLECT
We may collect:
- Personal identification information
- Artwork and creative content
- Usage data and analytics
- Communication records

HOW WE USE INFORMATION
Your information is used to:
- Provide copyright protection services
- Monitor for infringement
- Communicate with you
- Improve our services

DATA SHARING
We do not sell personal information. We may share data with:
- Legal authorities (when required)
- Service providers (under strict agreements)
- Law enforcement (for legitimate requests)

YOUR RIGHTS (GDPR)
You have the right to:
- Access your personal data
- Correct inaccurate information
- Delete your data
- Restrict processing
- Data portability

SECURITY MEASURES
We implement:
- Encryption in transit and at rest
- Access controls and authentication
- Regular security audits
- Incident response procedures

COOKIES AND TRACKING
We use cookies for:
- Essential site functionality
- Analytics and improvements
- User preferences

RETENTION POLICY
We retain data only as long as necessary for:
- Service provision
- Legal compliance
- Legitimate business interests

CHILDREN'S PRIVACY
We do not knowingly collect information from children under 13.

INTERNATIONAL TRANSFERS
Data may be transferred to countries with adequate protection levels.

CONTACT INFORMATION
For privacy questions, contact:
Privacy Officer
[Your Company]
[Address]
[Email]
[Phone]

UPDATES TO POLICY
We will notify you of material changes to this policy.
      `
    },
    {
      id: 'commission-agreement',
      title: 'Art Commission Agreement',
      description: 'Professional commission agreement for custom artwork with clear terms, payment schedules, and rights',
      category: 'contracts',
      format: 'pdf',
      difficulty: 'intermediate',
      icon: FileText,
      tags: ['commission', 'custom-art', 'payment', 'deadlines'],
      estimatedTime: '25 min',
      popularity: 91,
      lastUpdated: '2024-01-25',
      featured: true,
      content: `
ART COMMISSION AGREEMENT

This Commission Agreement is entered into on [Date] between:

ARTIST:
Name: [Artist Name]
Address: [Artist Address]
Email: [Artist Email]
Phone: [Artist Phone]

CLIENT:
Name: [Client Name]
Address: [Client Address]
Email: [Client Email]
Phone: [Client Phone]

1. COMMISSION DETAILS
- Artwork Description: [Detailed description of commissioned work]
- Medium: [Oil, watercolor, digital, etc.]
- Dimensions: [Size specifications]
- Style: [Artistic style/approach]
- Subject Matter: [What will be depicted]

2. TIMELINE
- Start Date: [Date]
- Completion Date: [Date]
- Progress Updates: [Frequency of updates]
- Approval Stages: [When client approval is required]

3. PRICING AND PAYMENT
- Total Commission Fee: $[Amount]
- Deposit (50%): $[Amount] - Due upon signing
- Final Payment (50%): $[Amount] - Due upon completion
- Additional Fees: [Rush orders, revisions, etc.]

4. REVISION POLICY
- Included Revisions: [Number] minor revisions included
- Major Changes: Additional $[Amount] per significant revision
- Client must approve sketches before proceeding to final artwork

5. MATERIALS AND DELIVERY
- Artist provides all materials unless otherwise specified
- Artwork delivered as: [Physical/Digital/Both]
- Shipping/Delivery: [Who pays and method]
- Framing: [If included or separate]

6. COPYRIGHT AND USAGE RIGHTS
- Artist retains copyright to the artwork
- Client receives: [Specific usage rights granted]
- Artist may: Display in portfolio, use for promotional purposes
- Commercial Usage: [Additional fees if applicable]

7. CANCELLATION POLICY
- Client cancellation: Deposit non-refundable if work has begun
- Artist cancellation: Full refund if unable to complete
- Force Majeure: [Natural disasters, illness, etc.]

8. APPROVAL AND SATISFACTION
- Client has [Number] days to request changes after delivery
- Final approval constitutes acceptance of work
- No refunds after final approval

9. ADDITIONAL TERMS
- Artist not liable for color variations in reproductions
- Client responsible for providing clear reference materials
- All communications to be in writing

SIGNATURES:
Artist: _________________ Date: _______
Client: _________________ Date: _______
      `
    },
    {
      id: 'collaboration-agreement',
      title: 'Artist Collaboration Agreement',
      description: 'Comprehensive agreement for artist collaborations covering credit, ownership, and revenue sharing',
      category: 'contracts',
      format: 'pdf',
      difficulty: 'advanced',
      icon: Users,
      tags: ['collaboration', 'partnership', 'revenue-sharing', 'credit'],
      estimatedTime: '35 min',
      popularity: 76,
      lastUpdated: '2024-01-22',
      content: `
ARTIST COLLABORATION AGREEMENT

This Collaboration Agreement is entered into on [Date] between:

ARTIST 1:
Name: [Artist 1 Name]
Address: [Address]
Email: [Email]

ARTIST 2:
Name: [Artist 2 Name]
Address: [Address]
Email: [Email]

1. PROJECT DESCRIPTION
- Project Title: [Name of collaborative work]
- Project Description: [Detailed description]
- Project Goals: [Objectives and intended outcomes]
- Target Completion: [Date]

2. CONTRIBUTIONS
Artist 1 Responsibilities:
- [Specific tasks and contributions]
- [Skills/materials provided]
- [Time commitment]

Artist 2 Responsibilities:
- [Specific tasks and contributions]
- [Skills/materials provided]
- [Time commitment]

3. OWNERSHIP AND COPYRIGHT
- Joint ownership: [Percentage] Artist 1, [Percentage] Artist 2
- Credit line: "Collaborative work by [Artist 1] and [Artist 2]"
- Both artists must consent to any licensing or sale
- Individual elements: [How separately created elements are handled]

4. REVENUE SHARING
- Sales Revenue: [Percentage] to Artist 1, [Percentage] to Artist 2
- Licensing Fees: Split [equally/based on contribution]
- Exhibition Fees: [How appearance fees are divided]
- Future Derivatives: [Rights to create related works]

5. EXPENSES AND COSTS
- Material Costs: [How expenses are shared]
- Exhibition Costs: [Transportation, framing, insurance]
- Marketing Costs: [Promotional materials, advertising]
- Expense Approval: Expenses over $[Amount] require both artists' approval

6. DECISION MAKING
- Creative Decisions: [Consensus/majority/designated lead]
- Business Decisions: [How sales, exhibitions are decided]
- Dispute Resolution: [Mediation/arbitration process]
- Deadlock Resolution: [Process if artists disagree]

7. MARKETING AND PROMOTION
- Both artists may promote the work individually
- Consistent credit must be given to both artists
- Social media: [Guidelines for posting and tagging]
- Press materials: [Who handles media relations]

8. EXHIBITION AND DISPLAY
- Both artists must consent to exhibition venues
- Exhibition credits: Both names in equal prominence
- Artist statements: [Joint or individual]
- Physical presence: [Requirements for openings/events]

9. TERMINATION
- Project Completion: Agreement ends upon delivery
- Early Termination: [Process for ending collaboration]
- Incomplete Work: [How to handle unfinished projects]
- Assets Division: [How materials/work are divided]

10. CONFIDENTIALITY
- Project details confidential until public release
- Neither artist may share proprietary techniques without consent
- Client information remains confidential

SIGNATURES:
Artist 1: _________________ Date: _______
Artist 2: _________________ Date: _______
      `
    },
    {
      id: 'gallery-representation',
      title: 'Gallery Representation Agreement',
      description: 'Exclusive or non-exclusive gallery representation contract with commission structures and obligations',
      category: 'contracts',
      format: 'pdf',
      difficulty: 'advanced',
      icon: Award,
      tags: ['gallery', 'representation', 'exhibition', 'sales'],
      estimatedTime: '40 min',
      popularity: 82,
      lastUpdated: '2024-01-20',
      content: `
GALLERY REPRESENTATION AGREEMENT

This Representation Agreement is entered into on [Date] between:

GALLERY:
Name: [Gallery Name]
Address: [Gallery Address]
Contact Person: [Director Name]
Email: [Gallery Email]
Phone: [Gallery Phone]

ARTIST:
Name: [Artist Name]
Address: [Artist Address]
Email: [Artist Email]
Phone: [Artist Phone]

1. REPRESENTATION TYPE
- [Exclusive/Non-Exclusive] representation
- Geographic Territory: [Geographic limitations]
- Duration: [Start Date] to [End Date]
- Medium/Style: [Scope of represented work]

2. GALLERY OBLIGATIONS
- Promote and market artist's work professionally
- Maintain appropriate insurance on consigned works
- Provide secure storage and display conditions
- Handle all sale transactions and contracts
- Provide monthly sales reports and statements
- Pay artist within [Number] days of sale

3. ARTIST OBLIGATIONS
- Provide [Number] works annually for gallery inventory
- Maintain consistent quality and style
- Participate in openings and gallery events when possible
- Provide high-quality images and descriptions
- Not sell directly from studio at prices below gallery prices
- Give gallery first right of refusal on new work

4. COMMISSION STRUCTURE
- Gallery Commission: [Percentage]% of sale price
- Artist Receives: [Percentage]% of sale price
- Payment Schedule: [Terms for payment to artist]
- Price Setting: [How prices are determined]

5. EXHIBITION COMMITMENTS
- Solo Exhibition: Guaranteed every [Time Period]
- Group Exhibitions: [Frequency and terms]
- Exhibition Costs: [Who pays for what]
- Marketing Materials: [Catalog, advertising responsibilities]
- Opening Reception: [Who organizes and pays]

6. PRICING AND SALES
- Retail prices set jointly by gallery and artist
- Gallery has authority to offer standard trade discounts
- Discounts over [Percentage]% require artist approval
- Artist may not sell similar works at lower prices elsewhere

7. INVENTORY AND CONSIGNMENT
- Minimum inventory: [Number] pieces at all times
- Consignment receipt provided within [Number] days
- Works remain artist's property until sold
- Insurance: Gallery maintains adequate coverage
- Return of unsold work: [Notice period and conditions]

8. MARKETING AND PROMOTION
- Gallery maintains artist webpage and portfolio
- Professional photography of all works
- Inclusion in gallery publications and advertisements
- Social media promotion and announcements
- Art fair participation: [Terms and cost sharing]

9. EXCLUSIVITY TERMS (if applicable)
- Artist may not exhibit or sell through other galleries in [Territory]
- Studio sales prohibited during representation period
- Online sales: [Restrictions and revenue sharing]
- Art fair sales outside territory: [Permission requirements]

10. TERMINATION
- Either party may terminate with [Number] days written notice
- Upon termination: All works returned within [Number] days
- Outstanding payments: Due within [Number] days
- Non-compete period: [Duration after termination]

11. ADDITIONAL TERMS
- Gallery may not alter or restore works without written consent
- Artist guarantees authenticity and clear title to all works
- Disputes resolved through arbitration in [Jurisdiction]
- Agreement governed by laws of [State/Country]

SIGNATURES:
Gallery Representative: _________________ Date: _______
Artist: _________________ Date: _______
      `
    },
    {
      id: 'artist-model-release',
      title: 'Artist Model Release Form',
      description: 'Professional model release form for artists working with live models, ensuring legal protection',
      category: 'contracts',
      format: 'pdf',
      difficulty: 'beginner',
      icon: Eye,
      tags: ['model-release', 'portrait', 'figure-drawing', 'consent'],
      estimatedTime: '15 min',
      popularity: 67,
      lastUpdated: '2024-01-18',
      content: `
ARTIST MODEL RELEASE FORM

Date: [Date]
Location: [Studio/Location Address]

MODEL INFORMATION:
Name: [Model's Full Legal Name]
Address: [Model's Address]
Phone: [Phone Number]
Email: [Email Address]
Date of Birth: [DOB] (if under 18, parent/guardian must sign)

ARTIST INFORMATION:
Name: [Artist's Full Name]
Address: [Artist's Address]
Phone: [Phone Number]
Email: [Email Address]

SESSION DETAILS:
- Session Date(s): [Date(s)]
- Session Time: [Start] to [End]
- Type of Artwork: [Drawing, Painting, Sculpture, Photography, etc.]
- Pose Type: [Clothed, Partially Clothed, Nude, etc.]
- Compensation: $[Amount] per [hour/session]

CONSENT AND RELEASE:
I, [Model's Name], hereby grant permission to [Artist's Name] to:

1. CREATE ARTWORK
- Create artistic works including but not limited to drawings, paintings, sculptures, or photographs during the session(s)
- Use my likeness as a model for artistic purposes
- Work from life during sessions and from reference materials afterward

2. USAGE RIGHTS
I understand and agree that the artist may:
- Display the artwork in galleries, exhibitions, and shows
- Reproduce the artwork in catalogs, portfolios, and promotional materials
- Sell the original artwork and/or prints
- Use the artwork for educational purposes
- Post images of the artwork on websites and social media

3. RESTRICTIONS (if any):
☐ No restrictions - Full usage rights granted
☐ Limited usage - Restrictions as follows: [Specify restrictions]

4. COMPENSATION
- Payment Amount: $[Amount]
- Payment Method: [Cash, Check, PayPal, etc.]
- Payment Schedule: [When payment is due]

5. PROFESSIONALISM AND CONDUCT
- The artist agrees to maintain a professional environment
- The model may request breaks as needed
- Either party may end the session at any time
- Mutual respect and professional boundaries will be maintained

6. SAFETY AND COMFORT
- Studio temperature will be maintained at comfortable levels
- Adequate privacy and changing facilities provided
- Model may bring a chaperone if desired
- No alcohol or drugs permitted during sessions

7. COPYRIGHT AND OWNERSHIP
- Artist retains full copyright to all created works
- Model has no ownership rights to the artwork
- Model may request copies of artwork for personal portfolio use

8. LIABILITY WAIVER
I acknowledge that I am participating voluntarily and assume any risks associated with the modeling session.

9. PRIVACY
- Artist agrees to maintain professional discretion
- No unauthorized persons will be present during sessions
- Images will only be used as specified in this agreement

I HAVE READ AND UNDERSTAND THIS AGREEMENT:

Model Signature: _________________ Date: _______
Print Name: [Model's Name]

If model is under 18:
Parent/Guardian Signature: _________________ Date: _______
Print Name: [Parent/Guardian Name]

Artist Signature: _________________ Date: _______
Print Name: [Artist's Name]

Witness Signature: _________________ Date: _______
Print Name: [Witness Name]
      `
    },
    {
      id: 'art-installation-contract',
      title: 'Art Installation Contract',
      description: 'Contract for temporary or permanent art installations including maintenance and liability terms',
      category: 'contracts',
      format: 'pdf',
      difficulty: 'advanced',
      icon: Zap,
      tags: ['installation', 'public-art', 'maintenance', 'liability'],
      estimatedTime: '45 min',
      popularity: 58,
      lastUpdated: '2024-01-15',
      content: `
ART INSTALLATION CONTRACT

This Installation Contract is entered into on [Date] between:

CLIENT/VENUE:
Name: [Client/Venue Name]
Address: [Address]
Contact Person: [Contact Name]
Email: [Email]
Phone: [Phone]

ARTIST:
Name: [Artist Name]
Address: [Artist Address]
Email: [Artist Email]
Phone: [Artist Phone]

1. INSTALLATION DETAILS
- Installation Title: [Title of Work]
- Installation Type: [Temporary/Permanent]
- Location: [Specific location description]
- Dimensions: [Size specifications]
- Materials: [List of materials used]
- Installation Period: [Start Date] to [End Date]

2. SCOPE OF WORK
Artist Responsibilities:
- Design and create the installation
- Provide detailed installation plans and specifications
- Supervise installation process
- Provide maintenance instructions
- Attend installation opening/unveiling

Client Responsibilities:
- Provide safe and secure installation site
- Obtain necessary permits and approvals
- Provide utilities (power, water, etc.) as needed
- Provide security during installation period
- Handle public relations and marketing

3. COMPENSATION
- Installation Fee: $[Amount]
- Materials Budget: $[Amount]
- Installation Costs: $[Amount]
- Payment Schedule:
  * 25% upon contract signing
  * 50% upon delivery/completion
  * 25% upon successful installation

4. TIMELINE
- Design Approval: [Date]
- Production Start: [Date]
- Delivery to Site: [Date]
- Installation Begin: [Date]
- Installation Complete: [Date]
- Public Opening: [Date]

5. INSTALLATION PROCESS
- Site preparation: [Who is responsible]
- Equipment needed: [Cranes, scaffolding, etc.]
- Labor requirements: [Number of installers needed]
- Safety measures: [Safety protocols and insurance]
- Weather contingencies: [Plans for delays]

6. MAINTENANCE AND CARE
- Regular maintenance: [Who is responsible and frequency]
- Cleaning requirements: [Specific instructions]
- Repair costs: [Who pays for damage repairs]
- Artist consultation: [When artist input is required]
- Replacement parts: [Availability and cost]

7. COPYRIGHT AND OWNERSHIP
- Artist retains copyright to the design
- Client owns the physical installation
- Documentation rights: [Photo/video permissions]
- Reproduction rights: [Merchandising limitations]
- Artist attribution: [How artist must be credited]

8. INSURANCE AND LIABILITY
- General liability insurance: $[Amount] minimum
- Installation insurance: [During installation period]
- Property damage: [Who is liable for what]
- Public safety: [Safety measures and liability]
- Force majeure: [Natural disasters, etc.]

9. MODIFICATIONS AND CHANGES
- No modifications without artist's written consent
- Change order process: [How modifications are approved]
- Additional costs: [Who pays for requested changes]
- Artistic integrity: [Artist's right to refuse changes]

10. REMOVAL AND DEINSTALLATION
- Deinstallation date: [If temporary installation]
- Removal process: [Who handles and pays for removal]
- Disposal of materials: [Environmental considerations]
- Site restoration: [Returning site to original condition]

11. INTELLECTUAL PROPERTY
- Artist may use installation images for portfolio
- Client may use images for promotional purposes
- Commercial usage: [Restrictions on commercial use]
- Derivative works: [Rights to create related pieces]

12. TERMINATION
- Termination before installation: [Cancellation fees]
- Early removal: [Conditions and compensation]
- Breach of contract: [Remedies for both parties]
- Notice requirements: [How much notice is required]

13. SPECIAL CONDITIONS
- Public access: [Hours and restrictions]
- Vandalism protection: [Security measures]
- Weather protection: [Coverings or seasonal removal]
- Utility access: [Power, water, data connections]

SIGNATURES:
Client Representative: _________________ Date: _______
Artist: _________________ Date: _______
Project Manager: _________________ Date: _______
      `
    }
  ];

  const downloadTemplate = (template: LegalTemplate) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 6;
      let yPosition = margin;

      // Header
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(template.title.toUpperCase(), margin, yPosition);
      yPosition += 15;

      // Separator line
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Content
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const content = template.content.trim();
      const lines = pdf.splitTextToSize(content, pageWidth - (2 * margin));
      
      for (let i = 0; i < lines.length; i++) {
        if (yPosition + lineHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(lines[i], margin, yPosition);
        yPosition += lineHeight;
      }

      // Footer
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Generated by TSMO Legal Templates', margin, footerY);
      pdf.text(`Downloaded: ${new Date().toLocaleDateString()}`, pageWidth - margin - 30, footerY);

      // Save the PDF
      const fileName = `${template.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Template Downloaded",
        description: `${template.title} has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const categoryLabels = {
    dmca: 'DMCA & Takedowns',
    contracts: 'Contracts',
    policies: 'Privacy & Policies',
    notices: 'Legal Notices',
    compliance: 'Compliance',
    licensing: 'Licensing'
  };

  const categoryIcons = {
    dmca: Shield,
    contracts: FileText,
    policies: Eye,
    notices: AlertTriangle,
    compliance: CheckCircle,
    licensing: Award
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 border-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    advanced: 'bg-red-100 text-red-800 border-red-200'
  };

  // Filter and sort templates
  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.popularity - a.popularity;
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const featuredTemplates = templates.filter(t => t.featured);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium">
          <BookOpen className="h-4 w-4" />
          Legal Templates Library
        </div>
        <h1 className="text-4xl font-bold gradient-text">
          Professional Legal Templates
        </h1>
        <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
          Download expertly crafted legal templates to protect your creative work. 
          All templates are designed by legal professionals and updated regularly to ensure compliance.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-primary">{templates.length}</div>
          <div className="text-sm text-muted-foreground">Templates</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">Free</div>
          <div className="text-sm text-muted-foreground">Always</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">6</div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-purple-600">100%</div>
          <div className="text-sm text-muted-foreground">Legal Compliant</div>
        </Card>
      </div>

      {/* Featured Templates */}
      {featuredTemplates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-current" />
            <h2 className="text-2xl font-semibold">Featured Templates</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={`featured-${template.id}`} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-primary/20">
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  </div>
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center mb-3">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {template.estimatedTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {downloadCounts[template.id] || 0} downloads
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge className={difficultyColors[template.difficulty]}>
                          {template.difficulty}
                        </Badge>
                        <Button
                          onClick={() => handleDownloadTemplate(template)}
                          size="sm"
                          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Find Your Template</h3>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: 'popular' | 'recent' | 'alphabetical') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="recent">Recently Updated</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Templates Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {selectedCategory === 'all' ? 'All Templates' : categoryLabels[selectedCategory as keyof typeof categoryLabels]}
          </h2>
          <div className="text-sm text-muted-foreground">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or browse all categories.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const Icon = template.icon;
              
              return (
                <Card key={template.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge className={difficultyColors[template.difficulty]}>
                        {template.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {template.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {template.estimatedTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {template.format.toUpperCase()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {downloadCounts[template.id] || 0}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => setPreviewTemplate(template)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Icon className="h-5 w-5" />
                                {template.title}
                              </DialogTitle>
                              <DialogDescription>
                                {template.description}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex gap-2 flex-wrap">
                                {template.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <Separator />
                              <div className="bg-muted/50 p-4 rounded-lg">
                                <pre className="whitespace-pre-wrap text-sm font-mono">
                                  {template.content.trim().substring(0, 1000)}...
                                </pre>
                              </div>
                              <div className="flex justify-end">
                                <Button onClick={() => handleDownloadTemplate(template)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Full Template
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          onClick={() => handleDownloadTemplate(template)}
                          size="sm"
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Quick Links */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Browse by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(categoryLabels).map(([key, label]) => {
            const IconComponent = categoryIcons[key as keyof typeof categoryIcons];
            const categoryCount = templates.filter(t => t.category === key).length;
            
            return (
              <Button
                key={key}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5"
                onClick={() => setSelectedCategory(key)}
              >
                <IconComponent className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground">{categoryCount} templates</div>
                </div>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Legal Disclaimer */}
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Important Legal Disclaimer</h4>
              <p className="text-yellow-700 text-sm mb-3">
                These templates are provided for informational purposes only and do not constitute legal advice. 
                We strongly recommend consulting with a qualified attorney before using any legal document. 
                Laws vary by jurisdiction, and these templates may need modification to comply with local requirements.
              </p>
              <div className="flex items-center gap-4 text-sm text-yellow-700">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Regularly Updated
                </div>
                <div className="flex items-center gap-1">
                  <Gavel className="h-4 w-4" />
                  Legal Professional Reviewed
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Best Practice Guidelines
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalTemplates;