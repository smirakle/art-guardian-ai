import { Shield, Zap, Atom, Microscope, Building, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const industries = [
  {
    icon: Palette,
    title: "Creative & Media",
    description: "Digital art, photography, video content, and creative works protection",
    slug: "creative-media",
    features: ["AI Detection", "Portfolio Monitoring", "DMCA Protection"],
    classification: "standard"
  },
  {
    icon: Shield,
    title: "Military Thermoelectric Materials",
    description: "Defense applications for thermoelectric materials and energy conversion systems",
    slug: "military-thermoelectric",
    features: ["Export Control Compliance", "Security Clearance Support", "ITAR/EAR Attestation"],
    classification: "export-controlled"
  },
  {
    icon: Zap,
    title: "Global Thermoelectric Modules", 
    description: "Commercial and industrial thermoelectric module development and deployment",
    slug: "global-thermoelectric",
    features: ["International IP Protection", "Manufacturing Security", "Supply Chain Monitoring"],
    classification: "commercial"
  },
  {
    icon: Atom,
    title: "RTGs & SiGe Applications",
    description: "Radioisotope Thermoelectric Generators and Silicon Germanium applications",
    slug: "rtgs-sige",
    features: ["Nuclear Security Compliance", "DOE Coordination", "Critical Infrastructure Protection"],
    classification: "export-controlled"
  },
  {
    icon: Microscope,
    title: "Scientific Research",
    description: "Academic and research institution IP protection and collaboration",
    slug: "scientific-research", 
    features: ["Research Publication Security", "Grant Compliance", "Collaborative Protection"],
    classification: "academic"
  },
  {
    icon: Building,
    title: "Government Defense",
    description: "Government and defense contractor intellectual property protection",
    slug: "government-defense",
    features: ["FedRAMP Compliance", "NIST Framework", "Contractor Protection"],
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