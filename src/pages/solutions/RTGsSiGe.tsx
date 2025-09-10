import { Atom, Shield, Zap, FileCheck, CheckCircle, ArrowRight, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

export default function RTGsSiGe() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-primary/10 to-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="destructive" className="mb-4">
              <Atom className="h-4 w-4 mr-2" />
              Export Controlled
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              RTGs & SiGe Thermoelectric Applications
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Specialized IP protection for Radioisotope Thermoelectric Generators and Silicon Germanium 
              applications with nuclear security compliance, DOE coordination, and critical infrastructure protection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  Request Nuclear Security Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                DOE Coordination Portal
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Nuclear Security Notice */}
      <section className="py-12 bg-destructive/5">
        <div className="container px-4 mx-auto">
          <Alert className="max-w-4xl mx-auto border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>NUCLEAR SECURITY NOTICE:</strong> This technology involves nuclear materials and is subject to NRC licensing, 
              DOE oversight, and international nuclear security protocols. Access requires appropriate security clearances and nuclear technology permits.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Key Technologies */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Nuclear Thermoelectric Technologies
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive protection for nuclear-powered thermoelectric systems and materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card className="border-2 border-destructive/20">
              <CardHeader>
                <div className="p-3 bg-destructive/10 rounded-lg w-fit">
                  <Atom className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="flex items-center">
                  Radioisotope Thermoelectric Generators (RTGs)
                </CardTitle>
                <CardDescription>
                  Long-duration power systems for space missions and remote applications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Space mission power systems</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Deep sea exploration power</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Remote monitoring stations</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Emergency backup power</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="flex items-center">
                  Silicon Germanium (SiGe) Alloys
                </CardTitle>
                <CardDescription>
                  High-performance thermoelectric materials for extreme environments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> High-temperature applications</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Radiation-resistant materials</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Space-qualified components</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Long-term stability</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2">
              <CardHeader>
                <div className="p-3 bg-secondary/10 rounded-lg w-fit">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Nuclear Security Compliance</CardTitle>
                <CardDescription>
                  Full compliance with nuclear security regulations and international protocols.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> NRC licensing compliance</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> IAEA coordination</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Nuclear security protocols</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="p-3 bg-accent/10 rounded-lg w-fit">
                  <FileCheck className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>DOE Coordination</CardTitle>
                <CardDescription>
                  Seamless coordination with Department of Energy programs and initiatives.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> NASA RTG program</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> National laboratory collaboration</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Defense nuclear programs</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <Atom className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Critical Infrastructure</CardTitle>
                <CardDescription>
                  Protection for technologies vital to national security and space missions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Space mission critical systems</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> National defense applications</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Emergency response systems</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Space Applications */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Space Mission Applications
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powering humanity's most ambitious space exploration missions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deep Space Missions</CardTitle>
                <CardDescription>Voyager, New Horizons, and future interstellar probes</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 30+ year mission duration</li>
                  <li>• Extreme temperature variations</li>
                  <li>• High radiation environments</li>
                  <li>• No maintenance capability</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Planetary Exploration</CardTitle>
                <CardDescription>Mars rovers, lunar landers, and surface operations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Surface mobility power</li>
                  <li>• Scientific instrument operation</li>
                  <li>• Communication system power</li>
                  <li>• Environmental protection</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Outer Planet Missions</CardTitle>
                <CardDescription>Jupiter, Saturn, and beyond where solar power is insufficient</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Low solar flux environments</li>
                  <li>• Extended mission timelines</li>
                  <li>• Orbital mechanics complexity</li>
                  <li>• Gravitational assist maneuvers</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Technical Performance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>RTG Performance Characteristics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Power Output</span>
                  <span className="font-medium">100-300 Watts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Mission Duration</span>
                  <span className="font-medium">20-50 Years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Efficiency</span>
                  <span className="font-medium">6-8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Operating Temperature</span>
                  <span className="font-medium">200-1000°C</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SiGe Material Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Thermoelectric Figure of Merit (ZT)</span>
                  <span className="font-medium">1.0-1.3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Maximum Temperature</span>
                  <span className="font-medium">1000°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Radiation Resistance</span>
                  <span className="font-medium">High</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Mechanical Stability</span>
                  <span className="font-medium">Excellent</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Regulatory Framework */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Regulatory Compliance Framework
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-destructive" />
                  Nuclear Regulatory Commission (NRC)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Licensing Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Special nuclear material licenses</li>
                      <li>• Export/import licensing</li>
                      <li>• Transportation regulations</li>
                      <li>• Facility security clearances</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Compliance Areas:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Physical security requirements</li>
                      <li>• Personnel reliability programs</li>
                      <li>• Safeguards and security</li>
                      <li>• Emergency response planning</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileCheck className="h-5 w-5 mr-2 text-primary" />
                  Department of Energy (DOE)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">NASA Programs:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Planetary Science Division</li>
                      <li>• Mars Exploration Program</li>
                      <li>• Deep Space Network</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">National Labs:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Idaho National Laboratory</li>
                      <li>• Oak Ridge National Lab</li>
                      <li>• Jet Propulsion Laboratory</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Defense Programs:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• National Nuclear Security</li>
                      <li>• Defense Nuclear Programs</li>
                      <li>• Strategic Systems</li>
                    </ul>
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
            Secure Your Nuclear Thermoelectric Technology
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get comprehensive IP protection for your RTG and SiGe innovations with full nuclear compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg">
                Request Nuclear Security Clearance
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              DOE Coordination Portal
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}