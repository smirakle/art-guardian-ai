import { Shield, Zap, Atom, Microscope, Building, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const industries = [
  {
    icon: Palette,
    title: "Creative & Media IP",
    description: "Intellectual property protection for digital artists, content creators, and media companies against unauthorized use and AI training",
    slug: "creative-media",
    features: ["Copyright Registration", "AI Training Prevention", "Content Licensing Management"],
    classification: "standard"
  },
  {
    icon: Shield,
    title: "Defense Technology IP",
    description: "Classified intellectual property protection for military contractors and defense technology with export control compliance",
    slug: "military-thermoelectric",
    features: ["ITAR/EAR Compliance", "Security Clearance Verification", "Export Control Documentation"],
    classification: "export-controlled"
  },
  {
    icon: Zap,
    title: "Industrial Innovation IP", 
    description: "Global intellectual property protection for manufacturing innovations, trade secrets, and industrial processes",
    slug: "global-thermoelectric",
    features: ["Patent Portfolio Management", "Trade Secret Protection", "International Filing Strategy"],
    classification: "commercial"
  },
  {
    icon: Atom,
    title: "Nuclear Technology IP",
    description: "Specialized IP protection for nuclear materials, radioisotope technologies, and critical energy infrastructure",
    slug: "rtgs-sige",
    features: ["Nuclear Regulatory Compliance", "Critical Infrastructure Security", "DOE Coordination"],
    classification: "export-controlled"
  },
  {
    icon: Microscope,
    title: "Research & Academic IP",
    description: "Intellectual property protection for universities, research institutions, and scientific publications",
    slug: "scientific-research", 
    features: ["Research Data Protection", "Publication IP Rights", "Grant Compliance Management"],
    classification: "academic"
  },
  {
    icon: Building,
    title: "Government Contractor IP",
    description: "Federal contractor intellectual property protection with government compliance and security requirements",
    slug: "government-defense",
    features: ["Government Rights Management", "Security Classification", "Contract IP Compliance"],
    classification: "government"
  }
];

const getClassificationColor = (classification: string) => {
  switch (classification) {
    case "export-controlled": return "destructive";
    case "government": return "secondary";
    case "commercial": return "default";
    case "academic": return "outline";
    default: return "default";
  }
};

const getClassificationLabel = (classification: string) => {
  switch (classification) {
    case "export-controlled": return "Export Controlled";
    case "government": return "Government";
    case "commercial": return "Commercial";
    case "academic": return "Academic";
    default: return "Standard";
  }
};

export function IndustriesSection() {
  console.log("🔥 IndustriesSection component is rendering!");
  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Industries & Government Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Specialized IP protection solutions for scientific research, defense applications, 
            and critical infrastructure across all security classifications.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {industries.map((industry) => {
            const IconComponent = industry.icon;
            return (
              <Card key={industry.slug} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant={getClassificationColor(industry.classification)}>
                      {getClassificationLabel(industry.classification)}
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">{industry.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {industry.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {industry.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Link
                    to={`/solutions/${industry.slug}`}
                    className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Learn More
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default IndustriesSection;