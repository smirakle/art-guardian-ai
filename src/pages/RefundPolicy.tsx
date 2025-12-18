import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyrightFooter } from "@/components/CopyrightFooter";
import { ArrowLeft, Mail, Clock, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RefundPolicy = () => {
  useEffect(() => {
    document.title = "Refund Policy | TSMO Watch";
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Badge variant="outline">Last Updated: December 2024</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
          <p className="text-muted-foreground text-lg">
            Clear and fair terms for our subscription services
          </p>
        </div>

        <div className="space-y-8">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Refund Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                TSMO Technology LLC ("TSMO Watch") is committed to customer satisfaction. 
                We offer refunds under the following conditions:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Eligible for Refund
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Within 7 days of first subscription</li>
                    <li>• Service significantly unavailable</li>
                    <li>• Billing errors or duplicate charges</li>
                    <li>• Technical issues preventing use</li>
                  </ul>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    Not Eligible
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• After 7-day window (new subscriptions)</li>
                    <li>• Change of mind after using services</li>
                    <li>• Partial month usage</li>
                    <li>• Third-party service failures</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Cancellation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Subscription Cancellation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You may cancel your subscription at any time through your account settings or by contacting support.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Cancellations take effect at the end of your current billing period</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>You retain access to paid features until the period ends</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>No partial refunds for unused time within a billing cycle</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Your data remains accessible for 30 days after cancellation</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* How to Request */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                How to Request a Refund
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                To request a refund, please contact our support team:
              </p>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-2">Contact Information:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Email: <a href="mailto:support@tsmowatch.com" className="text-primary hover:underline">support@tsmowatch.com</a></li>
                  <li>Subject: "Refund Request - [Your Account Email]"</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                Please include your account email, transaction ID (if available), and reason for the refund request. 
                We typically respond within 2-3 business days and process approved refunds within 5-10 business days.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Questions About Our Refund Policy?</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Our support team is here to help with any billing or refund questions.
              </p>
              <a href="mailto:support@tsmowatch.com">
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </main>

      <CopyrightFooter />
    </div>
  );
};

export default RefundPolicy;
