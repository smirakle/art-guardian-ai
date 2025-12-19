import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Scale, Building, Users, ExternalLink, Gavel, Globe, BookOpen, Shield } from "lucide-react";

const LegalResources = () => {
  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Legal Resources & Support</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Access professional legal templates, connect with IP specialists, and find official resources to protect your creative work.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Link to="/legal-templates">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-primary/20 hover:border-primary/40">
            <CardHeader className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <CardTitle>Legal Templates</CardTitle>
              <CardDescription>
                Ready-to-use DMCA notices, cease & desist letters, and licensing agreements
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">
                Browse Templates
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link to="/lawyers">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-secondary/20 hover:border-secondary/40">
            <CardHeader className="text-center">
              <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Scale className="h-7 w-7 text-secondary" />
              </div>
              <CardTitle>IP Lawyers Directory</CardTitle>
              <CardDescription>
                Connect with vetted intellectual property attorneys who specialize in creator rights
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">
                Find a Lawyer
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dmca-center">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-accent/20 hover:border-accent/40">
            <CardHeader className="text-center">
              <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gavel className="h-7 w-7 text-accent" />
              </div>
              <CardTitle>DMCA Center</CardTitle>
              <CardDescription>
                File takedown notices and track the status of your copyright claims
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">
                Go to DMCA Center
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Official Authorities */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Building className="h-6 w-6 text-primary" />
          Official Authorities
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">US Copyright Office</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Official registration and federal protection
                  </p>
                  <a 
                    href="https://www.copyright.gov" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Visit copyright.gov
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">WIPO</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    World Intellectual Property Organization
                  </p>
                  <a 
                    href="https://www.wipo.int" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Visit wipo.int
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">EU Copyright Portal</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    European Union IP protection resources
                  </p>
                  <a 
                    href="https://euipo.europa.eu" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Visit euipo.europa.eu
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Support Networks */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Legal Support Networks
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Scale className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">Volunteer Lawyers for the Arts</h3>
                    <Badge variant="secondary" className="text-xs">Free</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Pro bono legal services for artists and creatives
                  </p>
                  <a 
                    href="https://vlaa.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Learn more
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Creative Commons</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Learn about licensing options for your creative work
                  </p>
                  <a 
                    href="https://creativecommons.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Visit creativecommons.org
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Need Help Protecting Your Work?</h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Our team can help you understand your options and connect you with the right resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact">
              <Button size="lg">Contact Support</Button>
            </Link>
            <Link to="/faq">
              <Button variant="outline" size="lg">View FAQ</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalResources;
