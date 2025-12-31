import React from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Scale, Shield, AlertTriangle, Gavel, CreditCard, Ban, RefreshCw } from "lucide-react";
import { CopyrightFooter } from "@/components/CopyrightFooter";

const TermsOfService = () => {
  const lastUpdated = "December 31, 2024";
  const effectiveDate = "December 31, 2024";

  const sections = [
    {
      icon: FileText,
      title: "1. Acceptance of Terms",
      content: `By accessing or using TSMO's AI training protection services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use our Services.

These Terms apply to all users, including visitors, registered users, and premium subscribers. Additional terms may apply to specific features or services.`
    },
    {
      icon: Shield,
      title: "2. Description of Services",
      content: `TSMO provides digital content protection services including:

• AI Training Protection: Metadata injection, watermarking, and fingerprinting to prevent unauthorized AI training
• Copyright Monitoring: Automated scanning for unauthorized use of your protected content
• Verification Services: Blockchain-backed proof of ownership and protection status
• DMCA Automation: Tools to streamline takedown notice generation and filing
• Adobe Creative Cloud Integration: Plugin for seamless workflow integration

Services are provided "as is" and we continuously work to improve protection effectiveness, though we cannot guarantee 100% prevention of unauthorized use.`
    },
    {
      icon: Scale,
      title: "3. User Responsibilities",
      content: `By using our Services, you agree to:

• Provide accurate registration information and keep it updated
• Maintain the security of your account credentials
• Only upload content you own or have rights to protect
• Not use our Services for any unlawful purpose
• Not attempt to reverse engineer, decompile, or circumvent our protection methods
• Not submit false DMCA notices or misrepresent ownership
• Comply with all applicable laws and regulations

You are solely responsible for the content you upload and any claims of ownership you make.`
    },
    {
      icon: CreditCard,
      title: "4. Subscription & Payment",
      content: `Free Tier: Limited protection features with basic functionality.

Paid Plans: Enhanced features including advanced monitoring, batch protection, and priority support. Subscription fees are billed monthly or annually as selected.

• Payments are processed securely through third-party payment processors
• Subscriptions auto-renew unless cancelled before the renewal date
• Refunds are available within 14 days of initial purchase if Services haven't been substantially used
• Price changes will be communicated 30 days in advance

Enterprise customers may have custom billing terms as specified in their service agreements.`
    },
    {
      icon: AlertTriangle,
      title: "5. Intellectual Property",
      content: `Your Content: You retain all ownership rights to content you upload. By using our Services, you grant TSMO a limited license to process your content solely for providing protection services.

TSMO Property: Our platform, technology, algorithms, trademarks, and documentation are owned by TSMO and protected by intellectual property laws. You may not copy, modify, or distribute our proprietary technology.

Protection Certificates: Digital certificates and blockchain registrations created through our Services are for evidentiary purposes and do not constitute legal proof of copyright ownership.`
    },
    {
      icon: Ban,
      title: "6. Prohibited Uses",
      content: `You may not use our Services to:

• Protect content that infringes on others' intellectual property rights
• Submit fraudulent DMCA notices or false ownership claims
• Harass, threaten, or defame others
• Distribute malware, viruses, or harmful code
• Circumvent security measures or access controls
• Resell or redistribute our Services without authorization
• Use automated systems to abuse our API or services
• Violate any applicable laws or regulations

Violation of these terms may result in immediate account termination.`
    },
    {
      icon: RefreshCw,
      title: "7. Service Modifications & Termination",
      content: `Service Changes: We reserve the right to modify, suspend, or discontinue any aspect of our Services at any time. We will provide reasonable notice for material changes.

Account Termination: We may terminate or suspend your account for:
• Violation of these Terms
• Suspected fraudulent activity
• Extended periods of inactivity
• Non-payment of subscription fees

Upon termination, you may request export of your protection records within 30 days. Blockchain registrations remain permanent and immutable.`
    },
    {
      icon: Gavel,
      title: "8. Limitation of Liability",
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW:

TSMO provides Services "as is" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, or non-infringement.

We do not guarantee that:
• Our protection methods will prevent all unauthorized use
• Services will be uninterrupted or error-free
• All infringements will be detected or resolved

Our total liability for any claims arising from your use of Services shall not exceed the amount you paid us in the 12 months preceding the claim.

We are not liable for indirect, incidental, special, consequential, or punitive damages, including lost profits or data.`
    },
    {
      icon: Scale,
      title: "9. Dispute Resolution",
      content: `Governing Law: These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict of law principles.

Arbitration: Any disputes arising from these Terms or Services shall be resolved through binding arbitration in accordance with the American Arbitration Association rules, except for claims eligible for small claims court.

Class Action Waiver: You agree to resolve disputes on an individual basis and waive any right to participate in class action lawsuits or class-wide arbitration.

Exceptions: Either party may seek injunctive relief in court for intellectual property violations or security breaches.`
    }
  ];

  return (
    <>
      <Helmet>
        <title>Terms of Service | TSMO - AI Training Protection</title>
        <meta name="description" content="TSMO Terms of Service - Read our terms and conditions for using AI training protection services." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
          <p className="text-sm text-muted-foreground">
            Effective date: {effectiveDate}
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-lg leading-relaxed">
              Welcome to TSMO. These Terms of Service govern your use of our AI training protection 
              platform, Adobe Creative Cloud plugin, and related services. By using our Services, 
              you agree to these Terms. Please read them carefully.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <section.icon className="h-5 w-5 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">10. General Provisions</h3>
            <div className="text-muted-foreground text-sm leading-relaxed space-y-3">
              <p>
                <strong>Entire Agreement:</strong> These Terms constitute the entire agreement between 
                you and TSMO regarding our Services and supersede all prior agreements.
              </p>
              <p>
                <strong>Severability:</strong> If any provision of these Terms is found unenforceable, 
                the remaining provisions will continue in full force and effect.
              </p>
              <p>
                <strong>Waiver:</strong> Our failure to enforce any right or provision shall not 
                constitute a waiver of such right or provision.
              </p>
              <p>
                <strong>Assignment:</strong> You may not assign these Terms without our prior written 
                consent. We may assign these Terms without restriction.
              </p>
              <p>
                <strong>Modifications:</strong> We reserve the right to modify these Terms at any time. 
                Continued use of Services after changes constitutes acceptance of the modified Terms.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By using TSMO services, you acknowledge that you have read, understood, and agree to be bound by these Terms.
          </p>
          <p className="mt-2">
            Questions about these Terms? Contact us at{" "}
            <a href="mailto:legal@tsmo.io" className="text-primary hover:underline">
              legal@tsmo.io
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
