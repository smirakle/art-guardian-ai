import React from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, Database, Mail, Globe, UserCheck, FileText } from "lucide-react";
import { CopyrightFooter } from "@/components/CopyrightFooter";

const PrivacyPolicy = () => {
  const lastUpdated = "December 31, 2024";

  const sections = [
    {
      icon: Database,
      title: "1. Information We Collect",
      content: [
        {
          subtitle: "Account Information",
          text: "When you create an account, we collect your email address, name, and password (encrypted). For professional accounts, we may also collect business name and contact information."
        },
        {
          subtitle: "Content Data",
          text: "We process images, documents, and other creative works you upload for protection. We generate cryptographic fingerprints and metadata but do not store the original files unless you explicitly enable storage features."
        },
        {
          subtitle: "Usage Data",
          text: "We collect information about how you use our services, including protection requests, verification queries, and feature usage patterns to improve our services."
        },
        {
          subtitle: "Technical Data",
          text: "We automatically collect IP addresses, browser type, device information, and cookies to ensure security and optimize performance."
        }
      ]
    },
    {
      icon: Lock,
      title: "2. How We Use Your Information",
      content: [
        {
          subtitle: "Service Delivery",
          text: "To provide AI training protection, copyright verification, and monitoring services as requested."
        },
        {
          subtitle: "Security",
          text: "To detect and prevent fraud, abuse, and unauthorized access to your protected content."
        },
        {
          subtitle: "Improvements",
          text: "To analyze usage patterns and improve our protection algorithms and user experience."
        },
        {
          subtitle: "Communications",
          text: "To send you service updates, security alerts, and marketing communications (with your consent)."
        }
      ]
    },
    {
      icon: Shield,
      title: "3. Data Protection & Security",
      content: [
        {
          subtitle: "Encryption",
          text: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Cryptographic operations use industry-standard algorithms."
        },
        {
          subtitle: "Access Controls",
          text: "We implement role-based access controls and audit logging for all data access. Employee access is limited to job requirements."
        },
        {
          subtitle: "Infrastructure",
          text: "Our infrastructure is hosted on SOC 2 Type II certified cloud providers with regular security audits and penetration testing."
        },
        {
          subtitle: "Incident Response",
          text: "We maintain incident response procedures and will notify affected users within 72 hours of any data breach."
        }
      ]
    },
    {
      icon: UserCheck,
      title: "4. Your Rights",
      content: [
        {
          subtitle: "Access",
          text: "You can request a copy of all personal data we hold about you at any time through your account settings."
        },
        {
          subtitle: "Correction",
          text: "You can update or correct your personal information through your profile settings or by contacting us."
        },
        {
          subtitle: "Deletion",
          text: "You can request deletion of your account and associated data. Some data may be retained for legal compliance."
        },
        {
          subtitle: "Portability",
          text: "You can export your protection records, certificates, and account data in standard formats."
        },
        {
          subtitle: "Opt-Out",
          text: "You can opt out of marketing communications at any time while continuing to receive essential service notifications."
        }
      ]
    },
    {
      icon: Globe,
      title: "5. Data Sharing & Third Parties",
      content: [
        {
          subtitle: "Service Providers",
          text: "We share data with trusted service providers (cloud hosting, email delivery) under strict data processing agreements."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose data when required by law, court order, or to protect our legal rights."
        },
        {
          subtitle: "Business Transfers",
          text: "In the event of a merger or acquisition, your data may be transferred to the successor entity with continued privacy protections."
        },
        {
          subtitle: "No Sale of Data",
          text: "We do not sell, rent, or trade your personal information to third parties for marketing purposes."
        }
      ]
    },
    {
      icon: Eye,
      title: "6. Cookies & Tracking",
      content: [
        {
          subtitle: "Essential Cookies",
          text: "Required for authentication, security, and basic functionality. Cannot be disabled."
        },
        {
          subtitle: "Analytics Cookies",
          text: "Help us understand usage patterns and improve our services. Can be disabled in settings."
        },
        {
          subtitle: "Marketing Cookies",
          text: "Used for targeted advertising (if enabled). Fully optional and can be disabled at any time."
        }
      ]
    },
    {
      icon: FileText,
      title: "7. Data Retention",
      content: [
        {
          subtitle: "Active Accounts",
          text: "We retain your data for as long as your account is active and you continue using our services."
        },
        {
          subtitle: "Deleted Accounts",
          text: "Upon account deletion, personal data is removed within 30 days. Anonymized analytics may be retained."
        },
        {
          subtitle: "Legal Holds",
          text: "Data subject to legal proceedings or regulatory requirements may be retained longer as required by law."
        },
        {
          subtitle: "Protection Records",
          text: "Protection certificates and blockchain registrations are permanent and immutable by design for evidentiary purposes."
        }
      ]
    },
    {
      icon: Mail,
      title: "8. Contact & Complaints",
      content: [
        {
          subtitle: "Data Protection Officer",
          text: "For privacy inquiries, contact our Data Protection Officer at privacy@tsmo.io"
        },
        {
          subtitle: "Support",
          text: "General inquiries can be directed to support@tsmo.io or through our in-app support chat."
        },
        {
          subtitle: "Regulatory Complaints",
          text: "You have the right to lodge a complaint with your local data protection authority if you believe your rights have been violated."
        }
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Privacy Policy | TSMO - AI Training Protection</title>
        <meta name="description" content="TSMO Privacy Policy - Learn how we collect, use, and protect your data when using our AI training protection services." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-lg leading-relaxed">
              TSMO ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              AI training protection platform and related services. Please read this policy carefully.
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
              <CardContent className="space-y-4">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <h4 className="font-semibold text-sm text-foreground mb-1">{item.subtitle}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                    {itemIndex < section.content.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">9. Changes to This Policy</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date. 
              For significant changes, we will provide additional notice via email or in-app notification.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By using TSMO services, you acknowledge that you have read and understood this Privacy Policy.
          </p>
          <p className="mt-2">
            Questions? Contact us at{" "}
            <a href="mailto:privacy@tsmo.io" className="text-primary hover:underline">
              privacy@tsmo.io
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
