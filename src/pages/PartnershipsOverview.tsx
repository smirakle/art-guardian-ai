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
        potential: "$500K ARR",
        description: "Plugin integration for Photoshop/Illustrator with automatic protection on export",
        contacts: "Partnership team via partner portal",
        nextStep: "Submit partnership application"
      },
      {
        name: "Canva",
        type: "API Partner",
        status: "prospecting",
        potential: "$300K ARR",
        description: "Embedded protection for designs created in Canva",
        contacts: "developers@canva.com",
        nextStep: "Technical API review"
      },
      {
        name: "Figma",
        type: "Plugin Partner",
        status: "researching",
        potential: "$200K ARR",
        description: "Design asset protection plugin",
        contacts: "Via Figma Community",
        nextStep: "Build MVP plugin"
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
        name: "Major Stock Photo Agencies",
        type: "Enterprise License",
        status: "researching",
        potential: "$1M+ ARR",
        description: "White-label protection for stock photo libraries (Getty, Shutterstock, Adobe Stock)",
        contacts: "Enterprise sales teams",
        nextStep: "Develop white-label offering"
      },
      {
        name: "Art Galleries & Museums",
        type: "Institutional License",
        status: "prospecting",
        potential: "$250K ARR",
        description: "Digital collection protection for institutions",
        contacts: "Museum technology associations",
        nextStep: "Create institutional pricing tier"
      },
      {
        name: "Publishing Houses",
        type: "Enterprise License",
        status: "researching",
        potential: "$400K ARR",
        description: "Book cover and illustration protection",
        contacts: "Digital rights departments",
        nextStep: "Develop publishing-specific features"
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
        potential: "Market Access",
        description: "Partnership for artist advocacy and collective licensing",
        contacts: "membership@arsny.com",
        nextStep: "Schedule introductory call"
      },
      {
        name: "Graphic Artists Guild",
        type: "Association Partner",
        status: "researching",
        potential: "1,500+ members",
        description: "Member benefits program for guild artists",
        contacts: "Via guild website",
        nextStep: "Propose member discount program"
      },
      {
        name: "AIGA",
        type: "Association Partner",
        status: "researching",
        potential: "25,000+ members",
        description: "Design community partnership",
        contacts: "partnerships@aiga.org",
        nextStep: "Attend AIGA conference"
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
        name: "IP Law Firms Network",
        type: "Referral Partner",
        status: "active",
        potential: "$100K ARR",
        description: "Referral network for DMCA enforcement",
        contacts: "Various IP attorneys",
        nextStep: "Expand attorney network"
      },
      {
        name: "Copyright Alliance",
        type: "Advocacy Partner",
        status: "prospecting",
        potential: "Industry Visibility",
        description: "Copyright policy advocacy and education",
        contacts: "Via website contact form",
        nextStep: "Join as member organization"
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
        potential: "$150K ARR",
        description: "App for e-commerce sellers to protect product images",
        contacts: "Shopify Partner Program",
        nextStep: "Build Shopify app"
      },
      {
        name: "WordPress Plugin Directory",
        type: "Marketplace",
        status: "researching",
        potential: "$75K ARR",
        description: "Plugin for WordPress media protection",
        contacts: "wordpress.org",
        nextStep: "Develop WP plugin"
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
  const totalPotentialARR = "$3M+";
  const activePartners = 1;
  const prospectingPartners = 5;
  const researchingPartners = 7;
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
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              {partner.contacts}
                            </span>
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
                    <p className="font-medium">Expand IP Law Firm Network</p>
                    <p className="text-sm text-muted-foreground">Current active partnership - continue growing referral relationships</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Submit Adobe Partner Application</p>
                    <p className="text-sm text-muted-foreground">High potential integration opportunity - $500K ARR potential</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Contact Artists Rights Society</p>
                    <p className="text-sm text-muted-foreground">Industry alliance for artist advocacy - strategic market access</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Develop White-Label Offering</p>
                    <p className="text-sm text-muted-foreground">Required for stock agency partnerships - $1M+ ARR potential</p>
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
