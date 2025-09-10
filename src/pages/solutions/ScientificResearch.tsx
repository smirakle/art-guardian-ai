import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Microscope, Shield, FileText, Users, Database, Gavel, CheckCircle, AlertTriangle, TrendingUp, BookOpen, Award, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function ScientificResearch() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Microscope className="h-8 w-8 text-primary" />
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">Academic Classification</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Research & Academic IP Protection
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Comprehensive intellectual property protection for universities, research institutions, 
              and academic publications. Safeguard research data, manage publication rights, 
              and ensure grant compliance across all your scientific endeavors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6">
                Protect Research Data
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Schedule Academic Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Protection Notice */}
      <section className="py-8 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Academic Research Protection</h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  Research intellectual property requires specialized protection strategies that balance open science principles 
                  with competitive advantage. Our platform ensures compliance with funding agency requirements while 
                  protecting your institution's valuable discoveries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Academic IP Protection Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Specialized solutions designed for the unique challenges of academic research and institutional collaboration.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mb-4">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Research Data Protection</CardTitle>
                <CardDescription>
                  Comprehensive protection for research datasets, experimental results, and proprietary methodologies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Dataset Version Control
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Experimental Design Protection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Algorithm & Method Security
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Data Lineage Tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg w-fit mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Publication IP Rights</CardTitle>
                <CardDescription>
                  Manage intellectual property rights across journal publications, conference papers, and preprints.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Pre-publication Protection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Author Rights Management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Open Access Compliance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Citation Tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-fit mb-4">
                  <Gavel className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Grant Compliance Management</CardTitle>
                <CardDescription>
                  Ensure compliance with funding agency requirements while protecting institutional interests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    NSF/NIH Compliance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    International Funding Rules
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Data Sharing Requirements
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Conflict of Interest Management
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Research Applications */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Research Domains & Applications</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Protecting intellectual property across diverse academic disciplines and research methodologies.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Life Sciences</h3>
              <p className="text-sm text-muted-foreground">
                Biotechnology research, clinical trials, pharmaceutical discoveries
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
              <Award className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Engineering</h3>
              <p className="text-sm text-muted-foreground">
                Materials science, mechanical innovations, civil engineering solutions
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
              <Database className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Computer Science</h3>
              <p className="text-sm text-muted-foreground">
                Algorithm development, AI/ML models, software innovations
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Social Sciences</h3>
              <p className="text-sm text-muted-foreground">
                Survey methodologies, behavioral research, policy frameworks
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Institutional Benefits */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Institutional IP Management</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Streamline intellectual property processes across your entire institution with centralized 
                management tools designed for academic environments.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Multi-Department Coordination</h3>
                    <p className="text-muted-foreground text-sm">
                      Manage IP across departments with role-based access and collaborative workflows.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Technology Transfer Support</h3>
                    <p className="text-muted-foreground text-sm">
                      Facilitate technology transfer with comprehensive IP documentation and valuation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Student Research Protection</h3>
                    <p className="text-muted-foreground text-sm">
                      Protect student theses, dissertations, and collaborative research projects.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Research Portfolio Value</h3>
                  <span className="text-2xl font-bold text-green-600">$2.3M+</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Average IP portfolio value increase for institutions using our platform
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Compliance Rate</h3>
                  <span className="text-2xl font-bold text-blue-600">99.7%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Grant compliance success rate across all funding agencies
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Protected Publications</h3>
                  <span className="text-2xl font-bold text-purple-600">15,000+</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Academic papers protected before publication
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Academic Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Flexible pricing designed for educational institutions and research organizations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">Individual Researcher</CardTitle>
                <div className="text-4xl font-bold mb-2">$49<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <CardDescription>Perfect for individual faculty and researchers</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Up to 50 protected documents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Basic compliance tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Publication protection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Email support</span>
                  </li>
                </ul>
                <Button className="w-full mt-8" variant="outline">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            <Card className="p-8 relative border-primary shadow-lg">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">Department License</CardTitle>
                <div className="text-4xl font-bold mb-2">$299<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <CardDescription>Ideal for academic departments and labs</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Up to 500 protected documents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Multi-user collaboration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Advanced compliance tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Technology transfer tools</span>
                  </li>
                </ul>
                <Button className="w-full mt-8">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="p-8 relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">Enterprise</CardTitle>
                <div className="text-4xl font-bold mb-2">Custom</div>
                <CardDescription>For universities and large institutions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Unlimited documents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Institution-wide deployment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Custom integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Dedicated support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">SLA guarantees</span>
                  </li>
                </ul>
                <Button className="w-full mt-8" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/5">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Protect Your Research Legacy
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join leading universities and research institutions in securing their intellectual property 
            and advancing scientific discovery with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Academic Protection
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Download Research Guide
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}