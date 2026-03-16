import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Mail, MessageSquare, BookOpen, FileText, ExternalLink, Phone, Clock, Shield } from "lucide-react";
import { BugReportButton } from "@/components/BugReportButton";

const Support = () => {
  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Support Center</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get help with your account, learn how to use TSMO, or contact our support team.
        </p>
      </div>

      {/* Quick Help */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Link to="/faq">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-primary/20 hover:border-primary/40">
            <CardHeader className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="h-7 w-7 text-primary" />
              </div>
              <CardTitle>FAQ</CardTitle>
              <CardDescription>
                Find answers to common questions about TSMO and art protection
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">
                Browse FAQ
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link to="/contact">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-secondary/20 hover:border-secondary/40">
            <CardHeader className="text-center">
              <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-7 w-7 text-secondary" />
              </div>
              <CardTitle>Contact Us</CardTitle>
              <CardDescription>
                Send us a message and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">
                Send Message
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link to="/protection-guide">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-accent/20 hover:border-accent/40">
            <CardHeader className="text-center">
              <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-7 w-7 text-accent" />
              </div>
              <CardTitle>Protection Guide</CardTitle>
              <CardDescription>
                Learn how to protect your art step by step with our guides
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">
                Read Guide
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Support Options */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Email Support</h3>
                  <p className="text-muted-foreground mb-3">
                    For general inquiries and support questions
                  </p>
                  <a 
                    href="mailto:support@tsmowatch.com" 
                    className="text-primary hover:underline font-medium"
                  >
                    support@tsmowatch.com
                  </a>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Response within 24 hours</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Report a Bug</h3>
                  <p className="text-muted-foreground mb-3">
                    Found something that's not working? Let us know
                  </p>
                  <BugReportButton />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/about-tsmo">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 text-center">
                <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-medium">About TSMO</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/terms-and-privacy">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 text-center">
                <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-medium">Terms & Privacy</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/refund-policy">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 text-center">
                <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-medium">Refund Policy</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/status">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-medium">System Status</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Emergency Support */}
      <Card className="bg-gradient-to-r from-destructive/10 to-orange-500/10 border-destructive/20">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center shrink-0">
              <Phone className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <h3 className="text-xl font-bold">Urgent Copyright Issue?</h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">Coming Soon</span>
              </div>
              <p className="text-muted-foreground mb-4">
                If you've discovered active infringement that requires immediate attention, our priority support team can help.
              </p>
              <Button variant="destructive" disabled className="opacity-50 cursor-not-allowed">
                File Emergency DMCA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;
