import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Users, Lock, AlertTriangle, Zap, Gauge, Globe, CheckCircle, ArrowRight } from "lucide-react";

export default function DefenseTechnology() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Badge variant="destructive" className="text-lg px-4 py-2 bg-red-600 text-white">
              <AlertTriangle className="w-5 h-5 mr-2" />
              ITAR/EAR Controlled
            </Badge>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Defense Technology IP Protection
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Comprehensive intellectual property protection for defense contractors and military technology developers. 
            Ensure ITAR/EAR compliance while safeguarding critical defense innovations.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80">
              <Shield className="w-5 h-5 mr-2" />
              Request Security Clearance Access
            </Button>
            <Button variant="outline" size="lg">
              <FileText className="w-5 h-5 mr-2" />
              Download Compliance Guide
            </Button>
          </div>
        </div>
      </section>

      {/* Critical Notice */}
      <section className="py-8 px-4 bg-red-50 border-y border-red-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-4 p-6 bg-red-100 border border-red-300 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-800 mb-2">Export Control Notice</h3>
              <p className="text-red-700">
                This technology may be subject to International Traffic in Arms Regulations (ITAR) 
                and Export Administration Regulations (EAR). Access requires appropriate security clearance 
                and compliance verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Defense IP Protection Suite</h2>
            <p className="text-lg text-muted-foreground">
              Specialized protection for defense technologies and military applications
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-primary/20 hover:border-primary/40 transition-all">
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>ITAR/EAR Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Automated compliance checking and documentation for export control regulations
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    USML Category Classification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    ECCN Determination
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Export License Tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-all">
              <CardHeader>
                <Users className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Security Clearance Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Automated verification and access control based on security clearance levels
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Clearance Level Verification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Need-to-Know Basis Access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Personnel Security Monitoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-all">
              <CardHeader>
                <Lock className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Defense Contract IP</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Specialized protection for government contracts and classified projects
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    DFARS Compliance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Classified Information Protection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Government Rights Analysis
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Categories */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Protected Technology Categories</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive coverage across defense technology sectors
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-primary" />
                  <CardTitle>Advanced Systems & Electronics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-2 gap-2 text-sm">
                  <li>• Radar Systems</li>
                  <li>• Electronic Warfare</li>
                  <li>• Communication Systems</li>
                  <li>• Navigation Technology</li>
                  <li>• Signal Processing</li>
                  <li>• Cybersecurity Systems</li>
                  <li>• Quantum Technologies</li>
                  <li>• AI/ML Applications</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Gauge className="w-8 h-8 text-primary" />
                  <CardTitle>Platform & Vehicle Systems</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-2 gap-2 text-sm">
                  <li>• Aircraft Systems</li>
                  <li>• Naval Technologies</li>
                  <li>• Ground Vehicles</li>
                  <li>• Missile Systems</li>
                  <li>• Space Technologies</li>
                  <li>• Unmanned Systems</li>
                  <li>• Propulsion Systems</li>
                  <li>• Armor & Protection</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Compliance Framework */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Regulatory Compliance Framework</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive coverage of defense industry regulations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-red-600" />
                  ITAR Compliance (Category XI-XXI)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Covered Technologies:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Military Electronics (Category XI)</li>
                      <li>• Fire Control Systems (Category XII)</li>
                      <li>• Aircraft & Related Articles (Category VIII)</li>
                      <li>• Spacecraft & Related Articles (Category XV)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Protection Measures:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Registration Compliance</li>
                      <li>• Export License Management</li>
                      <li>• Technical Data Control</li>
                      <li>• Personnel Screening</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Export Administration Regulations (EAR)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Relevant ECCN Categories:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• 3A001-3A292 (Electronics)</li>
                      <li>• 4A001-4A994 (Computers)</li>
                      <li>• 5A001-5A992 (Telecommunications)</li>
                      <li>• 6A001-6A998 (Sensors & Lasers)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Compliance Services:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• ECCN Classification</li>
                      <li>• License Determination</li>
                      <li>• End-User Screening</li>
                      <li>• Recordkeeping Systems</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Defense Contractor Pricing</h2>
            <p className="text-lg text-muted-foreground">
              Flexible plans designed for defense industry requirements
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Prime Contractor</CardTitle>
                <div className="text-3xl font-bold">$2,500<span className="text-lg font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Up to 100 projects
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    ITAR/EAR compliance suite
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Security clearance integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    24/7 compliance support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Government audit assistance
                  </li>
                </ul>
                <Button className="w-full mt-6">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <Badge className="w-fit mb-2">Most Popular</Badge>
                <CardTitle>Defense Enterprise</CardTitle>
                <div className="text-3xl font-bold">$5,000<span className="text-lg font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Unlimited projects
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Advanced compliance automation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Multi-level security integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Dedicated compliance team
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Custom integration support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Priority government liaison
                  </li>
                </ul>
                <Button className="w-full mt-6">
                  Start Enterprise Trial
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Government Agency</CardTitle>
                <div className="text-3xl font-bold">Custom</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Custom deployment options
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    On-premise installations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Government-specific features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    FedRAMP compliance ready
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Dedicated program management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Training & certification
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  Request Quote
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-primary/80">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Secure Your Defense Technology IP Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Join leading defense contractors in protecting critical military technologies with comprehensive ITAR/EAR compliance.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" variant="secondary">
              <Shield className="w-5 h-5 mr-2" />
              Request Security Clearance Access
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              <FileText className="w-5 h-5 mr-2" />
              Download Compliance Guide
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}