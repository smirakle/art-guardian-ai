import React from 'react';
import AdminOnly from '@/components/AdminOnly';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Handshake, 
  Building2, 
  Globe, 
  TrendingUp, 
  Mail, 
  ExternalLink,
  Users,
  DollarSign,
  Target,
  Briefcase,
  Shield,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

const partnershipCategories = [
  {
    category: "Technology Partners",
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    partners: [
      {
        name: "Adobe Creative Cloud",
        type: "Integration Partner",
        status: "prospecting",
        potential: "$750K-1.2M ARR",
        description: "Plugin integration for Photoshop/Illustrator with automatic AI protection on export. Adobe has 30M+ Creative Cloud subscribers; even 0.1% adoption = 30K users",
        contacts: "Adobe Exchange Partner Portal",
        contactUrl: "https://partners.adobe.com/exchangeprogram/creativecloud",
        nextStep: "Submit Technology Partner application"
      },
      {
        name: "Canva",
        type: "API Partner",
        status: "prospecting",
        potential: "$400K-600K ARR",
        description: "Embedded protection for 170M+ monthly active Canva users. Target Pro/Teams segment (~15M users)",
        contacts: "Canva Apps Marketplace",
        contactUrl: "https://www.canva.dev/docs/apps/",
        nextStep: "Apply via developer portal"
      },
      {
        name: "Figma",
        type: "Plugin Partner",
        status: "researching",
        potential: "$200K-350K ARR",
        description: "Design asset protection for 4M+ Figma users. Focus on enterprise teams with IP concerns",
        contacts: "Figma Community",
        contactUrl: "https://www.figma.com/community",
        nextStep: "Develop Figma plugin MVP, submit to community"
      },
      {
        name: "Midjourney / DALL-E / Stable Diffusion",
        type: "Verification Partner",
        status: "researching",
        potential: "$500K-800K ARR",
        description: "AI-generated content verification and provenance tracking. Growing market as AI art ownership becomes critical",
        contacts: "Direct outreach",
        contactUrl: "https://www.midjourney.com",
        nextStep: "Build proof-of-concept for AI art verification"
      },
      {
        name: "Hugging Face",
        type: "Verification Partner",
        status: "researching",
        potential: "$400K-700K ARR",
        description: "Leading AI model hub with 500K+ models. Growing need for training data provenance and opt-out compliance tools. Can help enforce artist opt-outs across hosted models.",
        contacts: "Hugging Face Business",
        contactUrl: "https://huggingface.co/contact",
        nextStep: "Build proof-of-concept for opt-out registry integration with model cards"
      }
    ]
  },
  {
    category: "Enterprise Clients",
    icon: Building2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    partners: [
      {
        name: "Getty Images",
        type: "Enterprise White-Label",
        status: "researching",
        potential: "$1.5M-2.5M ARR",
        description: "Getty has 500M+ images and paid $1.3B lawsuit to settle AI training disputes. Strong need for protection tech",
        contacts: "Getty Enterprise Solutions",
        contactUrl: "https://www.gettyimages.com/solutions/enterprise",
        nextStep: "Develop enterprise white-label demo"
      },
      {
        name: "Shutterstock",
        type: "Enterprise License",
        status: "researching",
        potential: "$1M-1.8M ARR",
        description: "Shutterstock has 400M+ assets, recently partnered with OpenAI. Need for contributor protection tools",
        contacts: "Shutterstock Contributors",
        contactUrl: "https://submit.shutterstock.com",
        nextStep: "Pitch contributor protection suite"
      },
      {
        name: "Smithsonian Institution",
        type: "Institutional License",
        status: "prospecting",
        potential: "$150K-250K ARR",
        description: "19 museums, 21 libraries, 9 research centers. 155M+ items in collections. Digital preservation priority",
        contacts: "Smithsonian Open Access",
        contactUrl: "https://www.si.edu/openaccess",
        nextStep: "Submit vendor proposal for digital collection protection"
      },
      {
        name: "Associated Press (AP)",
        type: "Enterprise License",
        status: "prospecting",
        potential: "$800K-1.2M ARR",
        description: "Wire services generate millions of images daily. AP alone distributes 4M+ photos yearly",
        contacts: "AP Licensing",
        contactUrl: "https://www.ap.org/solutions/artificial-intelligence",
        nextStep: "Develop news media workflow integration"
      },
      {
        name: "Penguin Random House",
        type: "Publishing License",
        status: "researching",
        potential: "$300K-500K ARR",
        description: "Major publishers need book cover, illustration, and author photo protection. Combined catalog of 100K+ titles",
        contacts: "PRH Digital Rights",
        contactUrl: "https://www.penguinrandomhouse.com/about-us/our-story",
        nextStep: "Create publishing-specific protection features"
      }
    ]
  },
  {
    category: "Strategic Alliances",
    icon: Handshake,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    partners: [
      {
        name: "Artists Rights Society (ARS)",
        type: "Industry Alliance",
        status: "prospecting",
        potential: "Access to 120K+ artists",
        description: "Largest visual artists rights organization in US. Represents estates of Picasso, Warhol, and 120K+ artists worldwide",
        contacts: "ARS Membership",
        contactUrl: "https://arsny.com/contact/",
        nextStep: "Schedule meeting with Executive Director"
      },
      {
        name: "Graphic Artists Guild",
        type: "Association Partner",
        status: "prospecting",
        potential: "2,000+ professional members",
        description: "Professional union for graphic artists. Members actively concerned about AI art theft",
        contacts: "GAG Partnership",
        contactUrl: "https://graphicartistsguild.org/contact/",
        nextStep: "Propose exclusive member discount (30% off)"
      },
      {
        name: "AIGA",
        type: "Association Partner",
        status: "researching",
        potential: "25,000+ members",
        description: "Oldest and largest professional design organization. Strong advocacy for designer rights",
        contacts: "AIGA Partnerships",
        contactUrl: "https://www.aiga.org/membership/corporate-partners",
        nextStep: "Sponsor AIGA Design Conference 2025"
      },
      {
        name: "Professional Photographers of America (PPA)",
        type: "Association Partner",
        status: "prospecting",
        potential: "30,000+ photographer members",
        description: "Largest photo association globally. Members extremely concerned about AI training on their work",
        contacts: "PPA Partnerships",
        contactUrl: "https://www.ppa.com/partners",
        nextStep: "Exhibit at Imaging USA 2025 conference"
      },
      {
        name: "Content Authenticity Initiative (CAI)",
        type: "Standards Body",
        status: "researching",
        potential: "Industry Standard Alignment",
        description: "Adobe-led coalition for content provenance (900+ members including BBC, Microsoft, Nikon). C2PA standard adoption",
        contacts: "CAI Membership",
        contactUrl: "https://contentauthenticity.org/how-to-get-involved",
        nextStep: "Apply for CAI membership, align with C2PA standards"
      }
    ]
  },
  {
    category: "Legal & IP Partners",
    icon: Shield,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    partners: [
      {
        name: "Morrison & Foerster (MoFo)",
        type: "IP Law Partner",
        status: "active",
        potential: "$75K-150K ARR",
        description: "Top 10 IP litigation firm. Handle major AI copyright cases. Can refer clients needing evidence collection",
        contacts: "MoFo IP Practice",
        contactUrl: "https://www.mofo.com/capabilities/intellectual-property",
        nextStep: "Formalize referral agreement with retainer"
      },
      {
        name: "Latham & Watkins",
        type: "IP Law Partner",
        status: "prospecting",
        potential: "$100K-175K ARR",
        description: "Global law firm with strong IP practice. Represented clients in AI training lawsuits",
        contacts: "LW IP Practice",
        contactUrl: "https://www.lw.com/en/practices/intellectual-property",
        nextStep: "Schedule pitch meeting with IP practice leads"
      },
      {
        name: "Copyright Alliance",
        type: "Advocacy Partner",
        status: "prospecting",
        potential: "Policy Influence",
        description: "Coalition of 40+ organizations advocating for copyright. Members include RIAA, MPAA, Authors Guild",
        contacts: "Copyright Alliance",
        contactUrl: "https://copyrightalliance.org/about/members/",
        nextStep: "Apply for associate membership ($2,500/year)"
      },
      {
        name: "US Copyright Office",
        type: "Regulatory Body",
        status: "active",
        potential: "Compliance & Policy",
        description: "Network of registered DMCA agents for takedown processing. 500+ platform contacts",
        contacts: "DMCA Agent Directory",
        contactUrl: "https://www.copyright.gov/dmca-directory/",
        nextStep: "Continue building agent relationship database"
      }
    ]
  },
  {
    category: "Distribution Partners",
    icon: Globe,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    partners: [
      {
        name: "Shopify App Store",
        type: "Marketplace",
        status: "researching",
        potential: "$200K-400K ARR",
        description: "4.4M+ Shopify stores. E-commerce sellers need product image protection from scraping and AI training",
        contacts: "Shopify Partners",
        contactUrl: "https://www.shopify.com/partners",
        nextStep: "Build Shopify app with watermarking for product photos"
      },
      {
        name: "WordPress/WooCommerce",
        type: "Plugin Marketplace",
        status: "researching",
        potential: "$100K-200K ARR",
        description: "810M+ websites run WordPress (43% of web). Plugin could protect media libraries globally",
        contacts: "WordPress Plugin Directory",
        contactUrl: "https://developer.wordpress.org/plugins/",
        nextStep: "Develop WordPress plugin for media protection"
      },
      {
        name: "Squarespace",
        type: "App Marketplace",
        status: "researching",
        potential: "$75K-150K ARR",
        description: "Combined 10M+ websites. Artists and photographers heavily use these platforms for portfolios",
        contacts: "Squarespace Developers",
        contactUrl: "https://developers.squarespace.com",
        nextStep: "Research Squarespace developer APIs"
      },
      {
        name: "DeviantArt",
        type: "Platform Partnership",
        status: "prospecting",
        potential: "$150K-250K ARR",
        description: "61M+ registered users, 500M+ artworks. Already launched DreamUp AI but facing creator backlash",
        contacts: "DeviantArt Business",
        contactUrl: "https://www.deviantart.com/developers/",
        nextStep: "Propose creator protection integration"
      },
      {
        name: "Cara",
        type: "Platform Partnership",
        status: "prospecting",
        potential: "$200K-350K ARR",
        description: "Anti-AI art platform with 1M+ artists who fled Instagram/ArtStation. Perfectly aligned audience actively seeking AI protection tools. High engagement, mission-aligned community.",
        contacts: "Cara Team / Jingna Zhang (founder)",
        contactUrl: "https://cara.app/about",
        nextStep: "Reach out to founder via platform or LinkedIn for integration discussion"
      },
      {
        name: "ArtStation",
        type: "Platform Partnership",
        status: "prospecting",
        potential: "$300K-500K ARR",
        description: "10M+ artists, owned by Epic Games. Already has 'NoAI' tag system but lacks enforcement tools. Perfect partnership for protection integration.",
        contacts: "ArtStation Business",
        contactUrl: "https://www.artstation.com/about",
        nextStep: "Propose protection enforcement tool integration via Epic Games partnership team"
      },
      {
        name: "Patreon",
        type: "Platform Partnership",
        status: "prospecting",
        potential: "$500K-800K ARR",
        description: "250K+ active creators, 8M+ paying patrons. Creators share exclusive art that needs protection from leaks and AI scraping. Premium creator segment highly receptive.",
        contacts: "Patreon for Developers",
        contactUrl: "https://www.patreon.com/portal",
        nextStep: "Apply to developer platform, propose creator protection toolkit integration"
      },
      {
        name: "Redbubble",
        type: "Platform Partnership",
        status: "prospecting",
        potential: "$250K-400K ARR",
        description: "700K+ independent artists, 100M+ product listings. Art theft is massive problem on POD platforms. Protection tools could be major differentiator.",
        contacts: "Redbubble Artist Relations",
        contactUrl: "https://www.redbubble.com/about",
        nextStep: "Pitch automated design protection and theft detection for artist uploads"
      }
    ]
  },
  {
    category: "Government & Defense",
    icon: Shield,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    partners: [
      {
        name: "US Copyright Office AI Initiative",
        type: "Government Partner",
        status: "researching",
        potential: "Regulatory Alignment",
        description: "Copyright Office seeking tech solutions for AI registration challenges. Congressional hearings ongoing",
        contacts: "AI Registration Study",
        contactUrl: "https://www.copyright.gov/ai/",
        nextStep: "Monitor AI copyright rulemaking, submit comments"
      },
      {
        name: "Department of Defense (SBIR/STTR)",
        type: "Government Contract",
        status: "researching",
        potential: "$250K-500K Phase II",
        description: "DoD concerned about deepfakes and disinformation. SBIR grants for verification tech",
        contacts: "SBIR Portal",
        contactUrl: "https://www.sbir.gov/topics",
        nextStep: "Research applicable SBIR topics for FY2025"
      },
      {
        name: "Library of Congress",
        type: "Institutional Partner",
        status: "prospecting",
        potential: "$100K-175K ARR",
        description: "170M+ items in collection. Active digitization efforts need protection",
        contacts: "LOC Digital Initiatives",
        contactUrl: "https://www.loc.gov/programs/digital-collections-management/",
        nextStep: "Submit vendor capability statement"
      }
    ]
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
    case 'prospecting':
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Target className="w-3 h-3 mr-1" />Prospecting</Badge>;
    case 'negotiating':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="w-3 h-3 mr-1" />Negotiating</Badge>;
    case 'researching':
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30"><AlertCircle className="w-3 h-3 mr-1" />Researching</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const PartnershipsOverview: React.FC = () => {
  const totalPotentialARR = "$10-18M";
  const activePartners = 2;
  const prospectingPartners = 15;
  const researchingPartners = 15;
  const totalPartners = partnershipCategories.reduce((acc, cat) => acc + cat.partners.length, 0);

  return (
    <AdminOnly 
      fallbackTitle="Partnership Overview - Admin Only"
      fallbackDescription="This partnership pipeline information is restricted to administrators."
    >
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Handshake className="h-8 w-8 text-primary" />
                Partnership Pipeline
              </h1>
              <p className="text-muted-foreground mt-1">
                Strategic partnerships and business development opportunities
              </p>
            </div>
            <Badge variant="outline" className="self-start md:self-auto px-4 py-2 text-sm">
              <Shield className="w-4 h-4 mr-2" />
              Admin View Only
            </Badge>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Opportunities</p>
                    <p className="text-3xl font-bold text-foreground">{totalPartners}</p>
                  </div>
                  <Briefcase className="h-10 w-10 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Potential ARR</p>
                    <p className="text-3xl font-bold text-emerald-500">{totalPotentialARR}</p>
                  </div>
                  <DollarSign className="h-10 w-10 text-emerald-500/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Partners</p>
                    <p className="text-3xl font-bold text-blue-500">{activePartners}</p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-blue-500/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Pipeline</p>
                    <p className="text-3xl font-bold text-amber-500">{prospectingPartners + researchingPartners}</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-amber-500/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pipeline Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pipeline Progress</CardTitle>
              <CardDescription>Distribution of partnership opportunities by stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm w-24 text-muted-foreground">Researching</span>
                  <Progress value={(researchingPartners / totalPartners) * 100} className="flex-1" />
                  <span className="text-sm w-8 text-right">{researchingPartners}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm w-24 text-muted-foreground">Prospecting</span>
                  <Progress value={(prospectingPartners / totalPartners) * 100} className="flex-1" />
                  <span className="text-sm w-8 text-right">{prospectingPartners}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm w-24 text-muted-foreground">Active</span>
                  <Progress value={(activePartners / totalPartners) * 100} className="flex-1" />
                  <span className="text-sm w-8 text-right">{activePartners}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partnership Categories */}
          {partnershipCategories.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.bgColor}`}>
                    <category.icon className={`h-5 w-5 ${category.color}`} />
                  </div>
                  {category.category}
                  <Badge variant="secondary" className="ml-auto">{category.partners.length} opportunities</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.partners.map((partner, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-foreground">{partner.name}</h3>
                            {getStatusBadge(partner.status)}
                            <Badge variant="outline">{partner.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{partner.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-1 text-emerald-500">
                              <DollarSign className="w-4 h-4" />
                              {partner.potential}
                            </span>
                            <a 
                              href={partner.contactUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {partner.contacts}
                            </a>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 min-w-[200px]">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Next Step</p>
                            <p className="text-sm font-medium text-primary">{partner.nextStep}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Action Items */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Priority Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Formalize Morrison & Foerster Referral Agreement</p>
                    <p className="text-sm text-muted-foreground">Active partner - establish formal retainer for IP litigation referrals ($75K-150K ARR)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Submit Adobe Exchange Partner Application</p>
                    <p className="text-sm text-muted-foreground">Highest ROI tech integration - 30M+ Creative Cloud users, $750K-1.2M ARR potential</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Contact PPA for Imaging USA 2025 Exhibit</p>
                    <p className="text-sm text-muted-foreground">30K+ photographer members concerned about AI theft - ideal target audience</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Build Enterprise White-Label Demo for Getty/Shutterstock</p>
                    <p className="text-sm text-muted-foreground">Required for stock agency pitches - combined potential $2.5M-4.3M ARR</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Apply for Content Authenticity Initiative (CAI) Membership</p>
                    <p className="text-sm text-muted-foreground">Align with C2PA industry standard - 900+ member coalition led by Adobe, Microsoft, BBC</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Research DoD SBIR Topics for FY2025</p>
                    <p className="text-sm text-muted-foreground">Government deepfake/disinformation grants - $250K-500K Phase II potential</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <div className="text-center text-sm text-muted-foreground py-4">
            <p>This partnership pipeline is confidential and for internal planning purposes only.</p>
            <p className="mt-1">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </AdminOnly>
  );
};

export default PartnershipsOverview;
