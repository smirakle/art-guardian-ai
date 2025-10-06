import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  Share, 
  BookOpen,
  Shield,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  Scale,
  FileText,
  Gavel,
  Heart,
  Clock,
  GraduationCap,
  Video,
  Download
} from "lucide-react";
import { useCommunity } from "@/hooks/useCommunity";
import { formatDistanceToNow } from "date-fns";
import { ComingSoon } from "@/components/ComingSoon";
import { useAuth } from "@/contexts/AuthContext";

const Community = () => {
  const { posts, expertAdvice, loading, createPost, toggleLike, getStats } = useCommunity();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "strategy" });
  const [activeTab, setActiveTab] = useState("community");

  const stats = getStats();

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createPost(newPost.title, newPost.content, newPost.category);
    if (success) {
      setNewPost({ title: "", content: "", category: "strategy" });
    }
  };

  const legalResources = [
    {
      category: "Copyright Registration",
      icon: FileText,
      resources: [
        {
          title: "U.S. Copyright Office",
          description: "Official copyright registration and information",
          url: "https://www.copyright.gov/"
        },
        {
          title: "Library of Congress Copyright Basics",
          description: "Comprehensive guide to copyright fundamentals",
          url: "https://www.copyright.gov/what-is-copyright/"
        },
        {
          title: "Creative Commons",
          description: "Flexible copyright licenses for creators",
          url: "https://creativecommons.org/"
        }
      ]
    },
    {
      category: "Legal Aid & Pro Bono",
      icon: Scale,
      resources: [
        {
          title: "Volunteer Lawyers for the Arts",
          description: "Free and low-cost legal services for artists",
          url: "https://www.vlany.org/"
        },
        {
          title: "Arts Law Centre",
          description: "Legal information and assistance for artists",
          url: "https://www.artslaw.com.au/"
        },
        {
          title: "California Lawyers for the Arts",
          description: "Legal assistance for creative professionals",
          url: "https://calawyersforthearts.org/"
        }
      ]
    },
    {
      category: "Templates & Forms",
      icon: BookOpen,
      resources: [
        {
          title: "Artist Commission Contract Template",
          description: "Comprehensive contract template for commissioned artwork",
          url: "https://www.lawdepot.com/contracts/commission-agreement/"
        },
        {
          title: "DMCA Takedown Notice Template",
          description: "Official DMCA takedown request template",
          url: "https://www.copyright.gov/legislation/dmca.pdf"
        },
        {
          title: "Cease and Desist Letter Generator",
          description: "Step-by-step tool to create professional letters",
          url: "https://www.lawdepot.com/contracts/cease-and-desist-letter/"
        }
      ]
    }
  ];

  const educationalResources = [
    {
      category: "Copyright Fundamentals",
      icon: GraduationCap,
      resources: [
        {
          title: "Copyright Law Basics for Artists",
          description: "Comprehensive guide covering what copyright protects, duration, and artist rights",
          type: "article",
          url: "https://www.copyright.gov/what-is-copyright/"
        },
         {
           title: "Understanding Fair Use",
           description: "Learn the four factors of fair use and how they apply to artistic works",
           type: "video",
           url: "https://www.copyright.gov/fair-use/"
         },
         {
           title: "Work for Hire vs. Independent Contractor",
           description: "Essential knowledge for artists working with clients and employers",
           type: "guide",
           url: "https://www.nolo.com/legal-encyclopedia/work-made-hire-rule.html"
         }
      ]
    },
    {
      category: "Digital Protection Strategies",
      icon: Shield,
      resources: [
         {
           title: "Digital Watermarking Best Practices",
           description: "How to effectively watermark your digital artwork without compromising aesthetics",
           type: "tutorial",
           url: "https://www.canva.com/learn/how-to-watermark-photos/"
         },
         {
           title: "Online Portfolio Security",
           description: "Protecting your work when sharing online - resolution, metadata, and licensing",
           type: "checklist",
           url: "https://blog.format.com/how-to-protect-your-photography-online/"
         },
        {
          title: "Social Media Copyright Protection",
          description: "Understanding platform policies and protecting your work on social media",
          type: "guide",
          url: "https://blog.hootsuite.com/social-media-copyright/"
        }
      ]
    },
    {
      category: "Legal Action & Enforcement",
      icon: Gavel,
      resources: [
        {
          title: "DMCA Takedown Process",
          description: "Step-by-step guide to filing effective DMCA takedown notices",
          type: "tutorial",
          url: "https://www.copyright.gov/legislation/dmca.pdf"
        },
        {
          title: "Cease & Desist Letters",
          description: "When and how to send cease and desist letters for copyright infringement",
          type: "template",
          url: "https://www.nolo.com/legal-encyclopedia/cease-desist-letter-stop-copyright-infringement-30063.html"
        },
        {
          title: "Working with IP Attorneys",
          description: "What to expect when hiring legal help for copyright issues",
          type: "guide",
          url: "https://www.americanbar.org/groups/intellectual_property_law/resources/consumer_guide/"
        }
      ]
    },
    {
      category: "Business & Licensing",
      icon: TrendingUp,
      resources: [
        {
          title: "Licensing Your Artwork: A Complete Guide",
          description: "Learn about exclusive vs non-exclusive licenses, royalty structures, territorial rights, and how to monetize your creative work through strategic licensing",
          type: "comprehensive-guide",
          content: `
# Licensing Your Artwork: A Complete Guide

## What is Art Licensing?

Art licensing is the process of granting permission to use your copyrighted artwork in exchange for compensation. When you license your art, you retain ownership and copyright while allowing others to use your work for specific purposes, time periods, and territories.

## Types of Licenses

### 1. Exclusive Licenses
- **Definition**: Only one licensee can use your work for the specified purpose
- **Benefits**: Higher licensing fees, more control over usage
- **Considerations**: Limits your ability to license to others in the same category
- **Best for**: Premium brands, major product lines, long-term partnerships

### 2. Non-Exclusive Licenses
- **Definition**: Multiple licensees can use your work simultaneously
- **Benefits**: Multiple revenue streams, broader market reach
- **Considerations**: Lower individual fees, less control over market saturation
- **Best for**: Stock art, digital products, mass-market items

### 3. Rights-Managed Licenses
- **Definition**: Specific usage rights with detailed restrictions
- **Includes**: Time period, geographic region, industry, print run
- **Benefits**: Higher fees, precise control over usage
- **Example**: "Greeting card rights for North America, 2-year term, up to 100,000 units"

### 4. Royalty-Free Licenses
- **Definition**: One-time fee for unlimited usage within agreed parameters
- **Benefits**: Simple pricing, attractive to buyers
- **Considerations**: No ongoing royalties, lower long-term revenue
- **Best for**: Digital downloads, stock imagery, simple products

## Licensing Categories

### Product Licensing
- Home décor (wall art, textiles, furniture)
- Stationery (cards, calendars, journals)
- Apparel and accessories
- Giftware and collectibles
- Packaging and labels

### Publishing Licensing
- Book covers and illustrations
- Magazine and editorial use
- Educational materials
- Digital publications
- Marketing materials

### Digital Licensing
- Website and app graphics
- Social media content
- Email marketing templates
- Digital wallpapers and themes
- NFTs and blockchain assets

## Setting Your Licensing Fees

### Factors to Consider
1. **Usage scope**: Broader usage = higher fees
2. **Market size**: Larger market = higher fees
3. **Exclusivity**: Exclusive = 2-3x non-exclusive rates
4. **Time period**: Longer term = higher fees
5. **Geographic territory**: Global > regional > local
6. **Print run/distribution**: Larger quantities = higher fees

### Pricing Models

#### Flat Fee Licensing
- **Range**: $200-$2,000+ per design
- **Best for**: Limited usage, small companies, one-time projects
- **Example**: $500 for greeting card design, 1-year term, 50,000 cards

#### Royalty-Based Licensing
- **Range**: 3-15% of wholesale price
- **Benefits**: Ongoing revenue, shared risk with licensee
- **Requirements**: Sales reporting, audit rights
- **Example**: 8% royalty on wholesale price of home décor items

#### Advance + Royalty
- **Structure**: Upfront payment + ongoing royalties
- **Benefits**: Immediate income + long-term revenue
- **Typical**: $1,000-$10,000 advance against 5-10% royalties

### Industry-Specific Rates

#### Greeting Cards
- **Flat fee**: $200-$800 per design
- **Royalty**: 3-5% of wholesale
- **Advance**: $300-$1,500

#### Home Décor
- **Flat fee**: $500-$3,000 per design
- **Royalty**: 5-12% of wholesale
- **Advance**: $1,000-$5,000

#### Apparel
- **Flat fee**: $300-$1,500 per design
- **Royalty**: 4-8% of wholesale
- **Advance**: $500-$2,500

#### Digital Products
- **Flat fee**: $150-$1,000 per design
- **Subscription**: $50-$200 monthly
- **Royalty**: 10-25% of net sales

## Key Contract Terms

### Grant of Rights
- Specific usage rights granted
- Exclusivity level
- Geographic territory
- Time period/duration
- Renewal options

### Compensation
- Payment amount and structure
- Royalty percentage (if applicable)
- Advance payments
- Payment schedule
- Late payment penalties

### Quality Control
- Approval rights for usage
- Brand standards compliance
- Color matching requirements
- Resolution/quality specifications

### Reporting and Auditing
- Sales report frequency
- Information required in reports
- Audit rights and procedures
- Record-keeping requirements

### Termination
- Termination conditions
- Notice requirements
- Post-termination obligations
- Return of materials

## Building Your Licensing Business

### 1. Develop a Strong Portfolio
- Create cohesive collections
- Focus on commercial viability
- Research market trends
- Maintain consistent quality

### 2. Understand Your Market
- Research potential licensees
- Study successful licensed products
- Attend trade shows and markets
- Network with industry professionals

### 3. Professional Presentation
- High-quality portfolio materials
- Professional website and portfolio
- Clear licensing information
- Mockups showing product applications

### 4. Legal Protection
- Register copyrights for valuable works
- Use proper contracts for all licensing
- Maintain detailed records
- Consider trademark protection

## Red Flags in Licensing Deals

### Contract Issues
- Work-for-hire clauses (avoid unless well-compensated)
- Overly broad usage rights
- No termination clauses
- Unclear payment terms
- No quality control provisions

### Partner Concerns
- No established distribution
- Poor financial standing
- History of copyright disputes
- Unrealistic sales projections
- Unwillingness to negotiate

## International Licensing Considerations

### Key Differences by Region
- **US**: Strong copyright protection, established licensing markets
- **Europe**: Moral rights considerations, varying national laws
- **Asia**: Growing markets, different cultural preferences
- **Developing markets**: Emerging opportunities, IP enforcement challenges

### Best Practices
- Research local copyright laws
- Use local legal representation
- Consider currency exchange risks
- Include force majeure clauses
- Plan for dispute resolution

## Technology and Licensing

### Digital Platforms
- Licensing marketplaces (Art of Where, PatternBank, etc.)
- Print-on-demand services
- Stock image platforms
- NFT marketplaces

### Rights Management Tools
- Licensing tracking software
- Blockchain-based rights management
- Automated royalty calculations
- Digital watermarking

## Success Stories and Case Studies

### Small Business Success
Many artists build sustainable businesses through strategic licensing:
- Focus on specific niches (botanical art, vintage designs, etc.)
- Build relationships with manufacturers
- Develop signature styles
- Maintain consistent output

### Common Mistakes to Avoid
1. Underpricing your work
2. Granting overly broad rights
3. Not maintaining quality control
4. Failing to register copyrights
5. Inadequate contract terms
6. Not tracking usage and payments

## Getting Started

### Step 1: Assess Your Portfolio
- Identify commercially viable pieces
- Create market-ready collections
- Develop various format options

### Step 2: Research Your Market
- Identify potential licensees
- Study competitor licensing
- Understand pricing standards

### Step 3: Legal Preparation
- Copyright your best works
- Develop standard licensing agreements
- Consider legal consultation

### Step 4: Create Marketing Materials
- Professional portfolio
- Licensing information sheet
- Contact and submission guidelines

### Step 5: Start Small
- Begin with smaller companies
- Build experience and reputation
- Develop case studies and testimonials

Art licensing can provide substantial, ongoing revenue while allowing you to retain ownership of your creative work. Success requires understanding both the creative and business aspects, developing professional relationships, and maintaining high standards in both art creation and business practices.
          `,
          url: "internal-guide"
        },
        {
          title: "Artist Contracts & Agreements: Essential Knowledge",
          description: "Master the key contracts every professional artist needs: commission agreements, gallery representation, collaboration contracts, and licensing deals",
          type: "contract-guide",
          content: `
# Artist Contracts & Agreements: Essential Knowledge

## Why Contracts Matter for Artists

Professional contracts protect your rights, clarify expectations, and ensure fair compensation. Whether you're a fine artist, illustrator, or designer, understanding contracts is crucial for building a sustainable creative career.

## Essential Contract Types for Artists

### 1. Commission Agreements

#### Purpose
Governs the creation of custom artwork for specific clients.

#### Key Elements
- **Detailed artwork description**: Medium, size, style, subject matter
- **Timeline**: Start date, completion date, milestone deadlines
- **Payment terms**: Total fee, deposit amount, payment schedule
- **Revision policy**: Number of included revisions, additional revision costs
- **Delivery method**: Physical delivery, digital files, installation
- **Usage rights**: What the client can do with the finished work
- **Cancellation terms**: Conditions and compensation for early termination

#### Sample Timeline Clause
\`\`\`
Artist will provide initial sketches within 10 business days of deposit receipt. 
Client has 5 business days to approve or request revisions. 
Final artwork will be completed within 30 days of sketch approval.
\`\`\`

#### Payment Structure Example
- 50% deposit upon contract signing
- 25% at sketch approval
- 25% upon completion and delivery

### 2. Gallery Representation Agreements

#### Types of Representation
- **Exclusive**: Gallery has sole right to represent your work in specific territory
- **Non-exclusive**: You can work with multiple galleries simultaneously
- **Selective exclusive**: Exclusive within specific medium or price range

#### Key Terms
- **Commission rates**: Typically 40-60% to gallery, 40-60% to artist
- **Territory**: Geographic area of representation
- **Duration**: Length of agreement (usually 1-3 years)
- **Exhibition commitments**: Solo show frequency, group show participation
- **Inventory requirements**: Minimum number of works to maintain
- **Pricing authority**: Who sets prices and discount limits
- **Payment terms**: When artist receives payment after sale

#### Gallery Obligations
- Professional presentation and marketing
- Adequate insurance coverage
- Timely payment after sales
- Regular reporting on sales and inventory
- Proper storage and handling of artwork

#### Artist Obligations
- Maintain consistent quality and output
- Participate in exhibitions and events
- Provide professional images and descriptions
- Honor exclusivity agreements
- Give gallery first option on new work

### 3. Artist Collaboration Agreements

#### Essential for Joint Projects
When multiple artists work together on a single project or series.

#### Ownership Structure Options
1. **Joint ownership**: Equal ownership regardless of contribution
2. **Proportional ownership**: Based on actual contribution percentage
3. **Lead artist model**: One artist owns work, others receive compensation
4. **Work-for-hire**: Collaborators are paid employees of lead artist

#### Key Provisions
- **Creative responsibilities**: Who does what aspects of the work
- **Financial contributions**: Who pays for materials, studio time, etc.
- **Revenue sharing**: How income is divided
- **Credit and attribution**: How all artists are recognized
- **Decision-making**: Process for creative and business decisions
- **Marketing rights**: Who can use work images for promotion
- **Termination**: How to end collaboration and divide assets

### 4. Licensing Agreements

#### Granting Usage Rights
Allow others to use your artwork while retaining copyright ownership.

#### Types of Rights to Consider
- **Reproduction rights**: Permission to copy or reproduce
- **Distribution rights**: Permission to sell or distribute copies
- **Display rights**: Permission to publicly display
- **Derivative rights**: Permission to create variations or adaptations
- **Digital rights**: Online usage, social media, websites
- **Commercial rights**: Use in advertising, marketing, products

#### Licensing Terms
- **Scope of use**: Specific permitted uses
- **Territory**: Geographic limitations
- **Duration**: Time period of license
- **Exclusivity**: Whether rights are exclusive or non-exclusive
- **Compensation**: Flat fee, royalties, or combination
- **Credit requirements**: How artist must be attributed

### 5. Model Release Forms

#### When You Need Them
- Portraits of identifiable people
- Figure studies and life drawing
- Photography including people
- Commercial use of any image with people

#### Key Elements
- **Identification**: Model's full legal name and contact info
- **Session details**: Date, time, location of work created
- **Permitted uses**: How images may be used
- **Compensation**: Payment to model
- **Rights granted**: Usually broad usage rights
- **Age verification**: Proof model is over 18 (or parental consent)

### 6. Artist-Agent Agreements

#### When You Need Representation
- Seeking gallery representation
- Licensing artwork commercially
- Managing complex business affairs
- Expanding into new markets

#### Agent Responsibilities
- Secure exhibition opportunities
- Negotiate contracts and prices
- Handle business communications
- Develop marketing strategies
- Maintain professional relationships

#### Compensation Models
- **Commission-based**: 10-25% of gross sales
- **Retainer + commission**: Monthly fee plus lower commission
- **Project-based**: Flat fees for specific services

## Contract Negotiation Strategies

### Before You Sign
1. **Read everything carefully**: Don't skip fine print
2. **Understand all terms**: Ask for clarification on unclear language
3. **Research standard practices**: Know industry norms for your situation
4. **Consider long-term implications**: How will this affect future opportunities?
5. **Get legal advice**: Consult attorney for complex or high-value agreements

### Common Negotiation Points

#### Payment Terms
- Increase deposit percentage
- Shorten payment timelines
- Add late payment penalties
- Include expense reimbursement

#### Rights and Usage
- Limit scope of usage rights
- Retain certain rights (portfolio use, promotional use)
- Add credit/attribution requirements
- Include moral rights protections

#### Termination Clauses
- Add reasonable notice periods
- Protect work in progress
- Ensure fair compensation for completed work
- Include return of materials

### Red Flags in Contracts

#### Avoid These Dangerous Clauses
- **Work-for-hire**: You lose all copyright ownership
- **Unlimited revisions**: No limit on client demands
- **Overly broad usage rights**: Client gets more than they need
- **No termination clause**: Difficult to exit bad relationships
- **Unfair payment terms**: All money due only on completion
- **No credit/attribution**: Your name won't appear with your work

#### Warning Signs
- Pressure to sign immediately
- Refusal to negotiate any terms
- Vague or missing key provisions
- Payment terms heavily favoring other party
- No clear dispute resolution process

## Contract Clauses Every Artist Should Include

### 1. Copyright Retention
\`\`\`
Artist retains all copyright in the Work. This Agreement grants only 
the specific rights expressly set forth herein, and no additional 
rights are granted by implication.
\`\`\`

### 2. Credit and Attribution
\`\`\`
Client agrees to provide appropriate credit to Artist in the form: 
"Artwork by [Artist Name]" in a size and location reasonably 
calculated to give notice of Artist's authorship.
\`\`\`

### 3. Moral Rights (where applicable)
\`\`\`
Client agrees not to intentionally distort, mutilate, or modify 
the Work in a manner that would be prejudicial to Artist's 
honor or reputation.
\`\`\`

### 4. Payment Protection
\`\`\`
Late payments will incur a service charge of 1.5% per month. 
Artist reserves the right to withhold delivery and suspend work 
until payments are current.
\`\`\`

### 5. Force Majeure
\`\`\`
Neither party shall be liable for delays or failures in performance 
resulting from acts beyond the reasonable control of such party, 
including natural disasters, war, terrorism, or pandemic.
\`\`\`

## Digital Age Considerations

### Online Contracts
- Electronic signatures are legally binding
- Ensure clear acceptance mechanisms
- Maintain records of agreement versions
- Consider jurisdiction for online clients

### Social Media and Digital Rights
- Specify social media usage rights
- Address tagging and sharing policies
- Include digital portfolio rights
- Consider NFT and blockchain implications

### International Contracts
- Research applicable laws
- Include choice of law provisions
- Consider currency and payment method
- Address tax implications
- Plan for dispute resolution across borders

## Building Your Contract Library

### Start with Templates
- Commission agreement template
- License agreement template
- Model release form
- Basic terms and conditions

### Customize for Your Practice
- Adapt language to your art form
- Include your standard business terms
- Reflect your pricing and policies
- Add specific clauses for your market

### Professional Development
- Join artist organizations with legal resources
- Attend workshops on artist business practices
- Consult with entertainment/IP attorneys
- Network with other professional artists

## When to Seek Legal Help

### Complex Situations
- High-value contracts (>$10,000)
- Exclusive representation agreements
- International licensing deals
- Disputes over existing contracts
- Copyright infringement issues

### Finding the Right Attorney
- Look for intellectual property specialists
- Seek entertainment/arts law experience
- Ask for artist referrals
- Consider legal aid organizations
- Explore volunteer lawyer programs

## Record Keeping and Contract Management

### Essential Documentation
- Signed copies of all agreements
- Payment records and invoices
- Correspondence about projects
- Delivery confirmations
- Amendment agreements

### Organization Systems
- Digital filing system with backups
- Physical files for important documents
- Calendar tracking for deadlines
- Contact database with contract details
- Regular review and renewal schedules

Remember: A good contract protects everyone involved and sets the foundation for successful professional relationships. Invest time in understanding and creating solid agreements – your artistic career depends on it.
          `,
          url: "internal-guide"
        },
        {
          title: "International Copyright Protection: Global Rights Management",
          description: "Navigate copyright protection across borders: understanding international treaties, country-specific laws, and protecting your work worldwide",
          type: "international-guide",
          content: `
# International Copyright Protection: Global Rights Management

## Understanding International Copyright

Copyright is territorial, meaning each country has its own copyright laws. However, international treaties create a framework for protecting creative works across borders. Understanding this system is crucial for artists working in the global marketplace.

## Key International Copyright Treaties

### 1. Berne Convention (1886)
The foundation of international copyright protection.

#### Key Principles
- **Automatic protection**: Copyright exists without registration
- **National treatment**: Foreign works get same protection as domestic works
- **Minimum standards**: All member countries must provide baseline protection
- **No formalities**: Cannot require registration, deposits, or copyright notices

#### Coverage
- 179 member countries (as of 2024)
- Includes virtually all major economies
- Provides life + 50 years minimum protection

#### Artist Benefits
- Your work is automatically protected in all member countries
- No need to register in each country individually
- Consistent basic protection standards worldwide

### 2. Universal Copyright Convention (UCC)
Alternative framework, less comprehensive than Berne.

#### Key Features
- Requires copyright notice for protection
- Shorter minimum protection periods
- Fewer member countries
- Generally superseded by Berne Convention

### 3. TRIPS Agreement (1995)
Trade-Related Aspects of Intellectual Property Rights.

#### Significance
- Part of World Trade Organization framework
- Enforces Berne Convention standards
- Adds enforcement mechanisms
- Covers digital rights issues

#### Enforcement
- Trade sanctions for non-compliance
- Dispute resolution through WTO
- Stronger penalties for infringement

### 4. WIPO Copyright Treaty (1996)
Addresses digital age copyright issues.

#### Digital Rights
- Right of communication to the public
- Right of distribution
- Protection for technological measures
- Rights management information protection

## Country-Specific Copyright Basics

### United States
#### Protection Period
- Life + 70 years for individual authors
- 95 years from publication for corporate works
- 120 years from creation for unpublished corporate works

#### Registration Benefits
- Required for US citizens to sue for infringement
- Allows statutory damages and attorney fees
- Provides legal presumption of ownership
- Costs $45-125 depending on application type

#### Fair Use Doctrine
- Four-factor test for permitted uses
- More flexible than many other countries
- Covers criticism, comment, parody, education

### European Union
#### Harmonized Duration
- Life + 70 years for most works
- 70 years for anonymous/pseudonymous works
- 25 years for photographs in some countries

#### Moral Rights
- Strong moral rights protections
- Right of attribution (paternity)
- Right of integrity (no harmful modifications)
- Cannot be waived in most EU countries

#### Database Rights
- Sui generis protection for databases
- 15-year protection from completion
- Unique to EU system

### United Kingdom (Post-Brexit)
#### Current Status
- Maintains EU-style copyright laws
- Life + 70 years protection
- Strong moral rights
- Continuing to recognize EU copyrights

#### Brexit Implications
- No longer bound by future EU changes
- May diverge from EU standards over time
- Existing rights remain protected

### Canada
#### Protection Period
- Life + 50 years (extending to life + 70 years by 2022)
- Similar to US fair dealing provisions
- Strong moral rights protection

#### Key Features
- Crown copyright for government works
- Neighboring rights for performers
- Levy system for private copying

### Australia
#### Duration
- Life + 70 years
- 70 years for corporate/anonymous works

#### Fair Dealing
- Specific enumerated exceptions
- Research, study, criticism, review
- Parody and satire (added 2006)

### Japan
#### Protection Period
- Life + 70 years (changed from life + 50 in 2018)
- Strong neighboring rights protection
- Extensive moral rights

#### Cultural Considerations
- Emphasis on creator's moral rights
- Collective management organizations
- Respect for artistic integrity

### China
#### Growing Protection
- Life + 50 years protection
- Increasing enforcement efforts
- Member of Berne Convention since 1992

#### Challenges
- Historically weak enforcement
- Cultural differences regarding copying
- Improving but still developing system

### India
#### Duration
- Life + 60 years
- Strong copyright framework
- Challenges with enforcement

### Brazil
#### Protection
- Life + 70 years
- Moral rights protection
- Growing creative economy

## Practical Steps for International Protection

### 1. Document Your Rights

#### Copyright Registration
While not required for protection, registration provides benefits:
- **US**: Register with US Copyright Office for enhanced protection
- **China**: Consider registration for stronger enforcement
- **EU**: Some countries offer optional registration systems

#### Timestamp Evidence
- Email yourself copies with creation dates
- Use blockchain timestamping services
- Maintain creation process documentation
- Save version history and drafts

### 2. Use Copyright Notices

#### Recommended Format
© [Year] [Your Name]. All rights reserved.

#### Benefits
- Puts infringers on notice
- Prevents "innocent infringement" defense
- Shows professional approach
- Required in some non-Berne countries

### 3. Monitor Your Work Globally

#### Online Monitoring
- Google reverse image search
- TinEye image search
- Specialized art monitoring services
- Social media monitoring tools

#### Professional Services
- Copyright monitoring companies
- Legal watch services
- Brand protection firms
- IP enforcement specialists

### 4. Understanding Local Laws

#### Moral Rights Variations
- **France**: Very strong moral rights, cannot be waived
- **US**: Limited moral rights for visual artists only
- **Germany**: Strong moral rights with some waiver possibilities
- **UK**: Moral rights can be waived in writing

#### Fair Use/Fair Dealing Differences
- **US**: Flexible four-factor fair use test
- **UK**: Specific fair dealing categories
- **Canada**: Similar to UK but with some US influence
- **Australia**: Limited fair dealing provisions

## Enforcement Strategies

### 1. Cease and Desist Letters

#### Advantages
- Cost-effective first step
- Often resolves disputes quickly
- Creates formal record
- Shows serious intent

#### International Considerations
- Translate into local language
- Reference local copyright laws
- Consider local legal customs
- Use local legal letterhead when possible

### 2. DMCA and Similar Takedown Procedures

#### US DMCA System
- Notice and takedown for online platforms
- Safe harbor for compliant platforms
- Counter-notice procedures
- Repeat infringer policies

#### International Equivalents
- **EU**: E-Commerce Directive notice procedures
- **Canada**: Notice and notice system
- **Australia**: Safe harbor provisions
- **UK**: E-Commerce Regulations

### 3. Legal Action

#### Choosing Jurisdiction
- Where infringement occurred
- Where infringer is located
- Where damage was suffered
- Convenience for legal proceedings

#### Cost Considerations
- Legal fees vary significantly by country
- Consider loser-pays systems
- Explore contingency fee arrangements
- Research legal aid options

### 4. Alternative Dispute Resolution

#### Benefits
- Lower costs than litigation
- Faster resolution
- Confidential proceedings
- Preserves business relationships

#### Options
- WIPO Arbitration and Mediation Center
- Local arbitration services
- Industry-specific resolution services
- Online dispute resolution platforms

## Digital Challenges and Opportunities

### 1. Online Infringement

#### Common Issues
- Social media unauthorized sharing
- Print-on-demand copyright theft
- NFT copying and minting
- Website image scraping

#### Protection Strategies
- Watermark images appropriately
- Use low-resolution preview images
- Implement right-click protection
- Monitor social media platforms

### 2. Blockchain and NFTs

#### Copyright Considerations
- Minting NFT doesn't transfer copyright
- Verify you own rights before minting
- Understand platform terms of service
- Consider smart contract provisions

#### International Variations
- Different countries developing NFT regulations
- Tax implications vary significantly
- Environmental concerns affecting legislation
- Consumer protection laws applying

### 3. Artificial Intelligence

#### Emerging Issues
- AI training on copyrighted works
- Copyright status of AI-generated art
- Attribution for AI-assisted creation
- International regulatory differences

## Building International Business

### 1. Licensing Across Borders

#### Key Considerations
- Currency and payment methods
- Tax implications and withholding
- Local market preferences
- Cultural sensitivities

#### Contract Provisions
- Choice of law clauses
- Jurisdiction for disputes
- Currency exchange risk allocation
- Force majeure provisions

### 2. Gallery Representation

#### International Galleries
- Research reputation and track record
- Understand commission structures
- Clarify exclusive territory arrangements
- Consider shipping and insurance costs

#### Art Fairs
- International exposure opportunities
- Different legal environments at each fair
- Contract provisions for fair participation
- Insurance and liability considerations

### 3. Digital Marketplaces

#### Platform Considerations
- Terms of service variations
- Payment processing capabilities
- Customer protection policies
- Dispute resolution procedures

#### Tax Compliance
- VAT obligations in EU
- Sales tax in various US states
- Income reporting requirements
- Professional tax advice recommended

## Practical Resources

### 1. Professional Organizations

#### International
- International Association of Art Critics (AICA)
- International Federation of Arts Councils (IFACCA)
- Creative Commons International
- WIPO Academy

#### Regional
- Copyright Society of the USA
- European Copyright Society
- Asia-Pacific Copyright Association
- International Publishers Association

### 2. Government Resources

#### Copyright Offices
- US Copyright Office (copyright.gov)
- UK Intellectual Property Office
- Canadian Intellectual Property Office
- European Union Intellectual Property Office

#### Trade Organizations
- World Trade Organization
- World Intellectual Property Organization
- International Chamber of Commerce

### 3. Legal Assistance

#### Finding International IP Lawyers
- International Association for the Protection of IP (AIPPI)
- Martindale-Hubbell international directory
- Local bar association referrals
- Embassy commercial sections

#### Legal Aid Organizations
- Volunteer Lawyers for the Arts (multiple countries)
- Arts Law Centre (Australia)
- Canadian Artists' Representation
- Various European arts law organizations

## Staying Current

### 1. Legal Developments

#### Sources to Monitor
- WIPO publications and updates
- National copyright office announcements
- IP law firm newsletters
- Artist organization updates

#### Key Trends
- Digital marketplace regulations
- AI and copyright intersection
- Climate change affecting international trade
- Post-pandemic remote work implications

### 2. Technology Changes

#### Emerging Tools
- Blockchain-based rights management
- AI-powered infringement detection
- Automated licensing platforms
- Digital watermarking advances

Remember: International copyright protection is complex and constantly evolving. While the basic framework provides good protection for artists, specific situations often require professional legal advice. Focus on understanding the basics, documenting your rights, and seeking help when dealing with significant international opportunities or disputes.

The global creative economy offers tremendous opportunities for artists willing to understand and navigate international copyright systems. With proper knowledge and preparation, you can protect and monetize your work across borders while building an international artistic career.
          `,
          url: "internal-guide"
        }
      ]
    }
  ];

  const displayStats = [
    { label: "Community Posts", value: stats.posts.toString(), icon: MessageSquare },
    { label: "Total Likes", value: stats.likes.toString(), icon: Heart },
    { label: "Comments", value: stats.comments.toString(), icon: MessageSquare },
    { label: "Expert Advisors", value: stats.experts.toString(), icon: Star }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[500px] mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-8 w-8 mx-auto mb-2" />
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Artist Protection Community
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow artists, share protection strategies, and learn from IP experts
          </p>
        </div>

        {/* Welcome Banner for Non-Authenticated Users */}
        {!user && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <MessageSquare className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Welcome to the Community!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Browse posts and expert advice from our community. Sign in to create posts, like content, and engage with other creators.
                  </p>
                  <Button onClick={() => navigate('/auth')} size="sm">
                    Sign In to Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="community">Community</TabsTrigger>
                <TabsTrigger value="share">Share</TabsTrigger>
                <TabsTrigger value="experts">Experts</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="legal">Legal</TabsTrigger>
              </TabsList>

              <TabsContent value="community" className="space-y-6">
                {posts.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Be the first to share your protection strategy with the community!
                      </p>
                      <Button onClick={() => setActiveTab("share")}>
                        Create First Post
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {post.profiles?.full_name?.[0] || post.profiles?.username?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{post.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                by {post.profiles?.full_name || post.profiles?.username || 'Anonymous'} • {' '}
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                </span>
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{post.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <button 
                            className={`flex items-center gap-1 hover:text-primary transition-colors ${
                              post.user_liked ? 'text-red-500' : ''
                            }`}
                            onClick={() => toggleLike(post.id)}
                          >
                            <ThumbsUp className={`w-4 h-4 ${post.user_liked ? 'fill-current' : ''}`} />
                            {post.likes_count}
                          </button>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {post.comments_count} comments
                          </span>
                          <button className="flex items-center gap-1 hover:text-primary">
                            <Share className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="share" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Share Your Protection Strategy
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {user ? 'Share your experiences, strategies, and questions with the community.' : 'Sign in to share your protection strategies with the community.'}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {user ? (
                      <form onSubmit={handleSubmitPost} className="space-y-4">
                        <Input
                          placeholder="Title of your strategy or experience"
                          value={newPost.title}
                          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                          required
                        />
                        <Textarea
                          placeholder="Share your protection strategy, success story, or ask for advice..."
                          value={newPost.content}
                          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                          rows={6}
                          required
                        />
                        <div className="flex gap-2">
                          <select
                            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                            value={newPost.category}
                            onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                          >
                            <option value="strategy">Protection Strategy</option>
                            <option value="success">Success Story</option>
                            <option value="question">Ask for Help</option>
                            <option value="resources">Resources</option>
                          </select>
                          <Button type="submit" className="ml-auto">
                            Share with Community
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Sign in to share</h3>
                        <p className="text-muted-foreground mb-4">
                          Create an account or sign in to share your protection strategies and engage with the community.
                        </p>
                        <Button onClick={() => navigate('/auth')}>
                          Sign In
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experts" className="space-y-6">
                <ComingSoon 
                  title="Expert Advice"
                  description="Connect with verified IP law experts and industry professionals who will provide personalized guidance for your creative protection needs."
                  icon={<Star className="w-12 h-12 text-muted-foreground" />}
                />
              </TabsContent>

              <TabsContent value="education" className="space-y-6">
                <ComingSoon 
                  title="Educational Resources"
                  description="Comprehensive learning materials covering copyright law, digital protection strategies, licensing, and legal action guidance will be available soon."
                  icon={<GraduationCap className="w-12 h-12 text-muted-foreground" />}
                />
              </TabsContent>

              <TabsContent value="legal" className="space-y-6">
                <ComingSoon 
                  title="Legal Resources"
                  description="Access to legal templates, pro bono services, and comprehensive guides for copyright registration and intellectual property protection."
                  icon={<Scale className="w-12 h-12 text-muted-foreground" />}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate('/contact')}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report IP Theft
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab("education")}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Learn & Grow
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab("legal")}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Legal Resources
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab("share")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Share Strategy
                </Button>
              </CardContent>
            </Card>

            {/* Featured Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Featured Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="border border-border rounded-lg p-3 hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => {
                        try {
                          const newWindow = window.open('https://www.copyright.gov/help/faq/faq-general.html', '_blank', 'noopener,noreferrer');
                          if (!newWindow) {
                            window.location.href = 'https://www.copyright.gov/help/faq/faq-general.html';
                          }
                        } catch (error) {
                          window.location.href = 'https://www.copyright.gov/help/faq/faq-general.html';
                        }
                      }}>
                   <h4 className="font-medium mb-1 flex items-center gap-2">
                     IP Protection Checklist
                     <ExternalLink className="w-3 h-3 text-muted-foreground" />
                   </h4>
                   <p className="text-sm text-muted-foreground">
                     Essential steps every artist should take
                   </p>
                 </div>
                 <div className="border border-border rounded-lg p-3 hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => {
                        try {
                          const newWindow = window.open('https://www.copyright.gov/registration/', '_blank', 'noopener,noreferrer');
                          if (!newWindow) {
                            window.location.href = 'https://www.copyright.gov/registration/';
                          }
                        } catch (error) {
                          window.location.href = 'https://www.copyright.gov/registration/';
                        }
                      }}>
                   <h4 className="font-medium mb-1 flex items-center gap-2">
                     Copyright Registration
                     <ExternalLink className="w-3 h-3 text-muted-foreground" />
                   </h4>
                   <p className="text-sm text-muted-foreground">
                     Step-by-step legal protection process
                   </p>
                 </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            {posts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Contributors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {posts
                    .slice(0, 3)
                    .map((post, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {post.profiles?.full_name?.[0] || post.profiles?.username?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {post.profiles?.full_name || post.profiles?.username || 'Anonymous'}
                        </span>
                        <Star className="w-4 h-4 text-yellow-500 ml-auto" />
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;