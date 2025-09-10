import { Shield, Lock, FileCheck, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

export default function MilitaryThermoelectric() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-primary/10 to-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="destructive" className="mb-4">
              <Shield className="h-4 w-4 mr-2" />
              Export Controlled
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              Military Thermoelectric Materials Protection
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Comprehensive IP protection for defense thermoelectric systems with full export control 
              compliance, security clearance support, and ITAR/EAR attestation capabilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Security Clearance Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Schedule Compliance Review
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Export Control Notice */}
      <section className="py-12 bg-destructive/5">
        <div className="container px-4 mx-auto">
          <Alert className="max-w-4xl mx-auto border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>EXPORT CONTROL NOTICE:</strong> This technology is subject to the Export Administration Regulations (EAR) 
              and International Traffic in Arms Regulations (ITAR). Access requires proper security clearance and export control attestation.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Defense-Grade IP Protection
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Purpose-built for military thermoelectric applications with comprehensive security controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2">
              <CardHeader>
                <div className="p-3 bg-destructive/10 rounded-lg w-fit">
                  <Lock className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Export Control Compliance</CardTitle>
                <CardDescription>
                  Full ITAR and EAR compliance with automated export control classifications and reporting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> ITAR Category XIII compliance</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> EAR ECCN classification</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Automated compliance reporting</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Security Clearance Integration</CardTitle>
                <CardDescription>
                  Seamless integration with security clearance verification and personnel security protocols.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Clearance level verification</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Need-to-know enforcement</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Personnel security monitoring</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="p-3 bg-secondary/10 rounded-lg w-fit">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Thermoelectric Specific</CardTitle>
                <CardDescription>
                  Specialized protection for thermoelectric materials, devices, and manufacturing processes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Material composition protection</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Manufacturing process security</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Performance data protection</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Military Applications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Power Generation Systems</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Waste heat recovery in military vehicles</li>
                <li>• Portable power generation for remote operations</li>
                <li>• Naval propulsion system energy harvesting</li>
                <li>• Aircraft auxiliary power unit efficiency</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Cooling & Thermal Management</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Electronics cooling in harsh environments</li>
                <li>• Soldier cooling systems and clothing</li>
                <li>• Munitions thermal management</li>
                <li>• Sensor and radar cooling applications</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Framework */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Compliance Framework
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built to meet the most stringent defense security requirements.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-destructive" />
                  ITAR Compliance (Category XIII)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Covered Technologies:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Thermoelectric materials and alloys</li>
                    <li>• Manufacturing equipment and processes</li>
                    <li>• Performance testing and evaluation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Protection Measures:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Access control and user verification</li>
                    <li>• Export licensing coordination</li>
                    <li>• Technology transfer restrictions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileCheck className="h-5 w-5 mr-2 text-primary" />
                  Export Administration Regulations (EAR)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Comprehensive coverage for dual-use thermoelectric technologies under Commerce Control List classifications.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="font-medium">ECCN 3A001</div>
                    <div className="text-sm text-muted-foreground">Electronic equipment</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="font-medium">ECCN 1C001</div>
                    <div className="text-sm text-muted-foreground">Special materials</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="font-medium">ECCN 9E003</div>
                    <div className="text-sm text-muted-foreground">Technology transfer</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/10">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to Secure Your Military Thermoelectric IP?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get started with export control compliant IP protection for your defense applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg">
                Request Security Clearance Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Download Compliance Guide
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}