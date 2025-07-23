import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Scale, Shield, Eye, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LegalTemplate {
  id: string;
  title: string;
  description: string;
  category: 'dmca' | 'contracts' | 'policies' | 'notices';
  format: 'pdf' | 'docx' | 'txt';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: React.ComponentType<any>;
  content: string;
}

const LegalTemplates = () => {
  const { toast } = useToast();

  const templates: LegalTemplate[] = [
    {
      id: 'dmca-takedown',
      title: 'DMCA Takedown Notice',
      description: 'Complete DMCA takedown notice template for copyright infringement',
      category: 'dmca',
      format: 'pdf',
      difficulty: 'beginner',
      icon: Shield,
      content: `
DMCA TAKEDOWN NOTICE

To: [Service Provider/Website Owner]
Date: [Date]

RE: Notice of Infringement under Digital Millennium Copyright Act (DMCA)

Dear Sir/Madam,

I am writing to notify you of copyright infringement occurring on your platform.

COPYRIGHT OWNER INFORMATION:
Name: [Your Full Name]
Title: [Your Title]
Company: [Company Name (if applicable)]
Address: [Your Full Address]
Phone: [Your Phone Number]
Email: [Your Email Address]

COPYRIGHTED WORK:
I am the owner of the following copyrighted work:
- Title: [Title of Your Work]
- Description: [Detailed description of your copyrighted work]
- Date of Creation: [Date]
- Registration Number: [Copyright registration number if applicable]

INFRINGING MATERIAL:
The following material on your website infringes my copyright:
- URL: [Full URL of infringing content]
- Description of Infringement: [How your work is being used without permission]

GOOD FAITH STATEMENT:
I have a good faith belief that use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law.

ACCURACY STATEMENT:
I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.

ELECTRONIC SIGNATURE:
[Your Full Legal Name]
[Date]

Please remove or disable access to the infringing material immediately.

Thank you for your prompt attention to this matter.

Sincerely,
[Your Signature]
[Your Printed Name]
      `
    },
    {
      id: 'cease-desist',
      title: 'Cease and Desist Letter',
      description: 'Professional cease and desist letter for copyright infringement',
      category: 'notices',
      format: 'pdf',
      difficulty: 'intermediate',
      icon: AlertTriangle,
      content: `
CEASE AND DESIST LETTER

[Date]

[Infringer's Name]
[Infringer's Address]

RE: CEASE AND DESIST - COPYRIGHT INFRINGEMENT

Dear [Infringer's Name],

I am writing to demand that you immediately cease and desist from the unauthorized use of my copyrighted material.

BACKGROUND:
I am the owner of the copyright in the following work(s):
[Description of copyrighted work]

INFRINGEMENT:
You are currently using my copyrighted material without authorization at:
[URL or location of infringement]

This unauthorized use constitutes copyright infringement under federal law.

DEMAND:
I hereby demand that you:
1. Immediately cease all use of my copyrighted material
2. Remove all infringing content from your website/platform
3. Provide written confirmation of compliance within 10 days
4. Refrain from any future use of my copyrighted works

CONSEQUENCES:
Failure to comply with this demand may result in:
- Federal court action for copyright infringement
- Monetary damages and attorney's fees
- Injunctive relief

This letter serves as formal notice of your infringement and my intent to pursue all available legal remedies.

Please confirm your compliance in writing within 10 days.

Sincerely,
[Your Name]
[Your Title]
[Your Contact Information]
      `
    },
    {
      id: 'licensing-agreement',
      title: 'Art Licensing Agreement',
      description: 'Standard licensing agreement template for artwork usage',
      category: 'contracts',
      format: 'pdf',
      difficulty: 'advanced',
      icon: FileText,
      content: `
ARTWORK LICENSING AGREEMENT

This Licensing Agreement ("Agreement") is entered into on [Date] between:

LICENSOR:
[Your Name/Company]
[Address]
[Contact Information]

LICENSEE:
[Licensee Name/Company]
[Address]
[Contact Information]

1. LICENSED ARTWORK
The artwork being licensed includes:
- Title: [Artwork Title]
- Description: [Detailed description]
- Medium: [Digital/Physical/etc.]

2. GRANT OF LICENSE
Licensor grants Licensee a [exclusive/non-exclusive] license to use the artwork for:
[Specific uses allowed]

3. TERM
This license is effective from [Start Date] to [End Date].

4. TERRITORY
This license applies to: [Geographic limitations]

5. ROYALTIES AND PAYMENT
Licensee agrees to pay:
- License Fee: $[Amount]
- Royalty Rate: [Percentage]% of net sales
- Payment Schedule: [Payment terms]

6. QUALITY CONTROL
Licensee must maintain quality standards and submit samples for approval.

7. COPYRIGHT NOTICE
All uses must include: "© [Year] [Your Name]. All rights reserved."

8. TERMINATION
This agreement may be terminated by either party with [Notice Period] written notice.

9. GOVERNING LAW
This agreement is governed by the laws of [State/Country].

SIGNATURES:
Licensor: _________________ Date: _______
Licensee: _________________ Date: _______
      `
    },
    {
      id: 'copyright-registration',
      title: 'Copyright Registration Guide',
      description: 'Step-by-step guide for registering your artwork with the US Copyright Office',
      category: 'policies',
      format: 'pdf',
      difficulty: 'beginner',
      icon: Scale,
      content: `
COPYRIGHT REGISTRATION GUIDE

WHY REGISTER YOUR COPYRIGHT?
- Legal presumption of ownership
- Ability to sue for infringement
- Eligibility for statutory damages
- Public record of your claim

WHAT CAN BE REGISTERED?
- Original artistic works
- Digital artwork
- Photographs
- Graphic designs
- Sculptures and installations

REGISTRATION PROCESS:

STEP 1: GATHER MATERIALS
- Completed application (Form CO or Form VA)
- Non-refundable filing fee ($45-$125)
- Copy of your work (deposit copy)

STEP 2: COMPLETE APPLICATION
Online at www.copyright.gov:
- Title of work
- Author information
- Creation date
- Publication date (if applicable)
- Rights and permissions

STEP 3: SUBMIT DEPOSIT
For artwork, submit:
- High-resolution digital files
- Physical copies (if required)
- Identifying material

STEP 4: PAY FEES
- Standard application: $125
- Online filing: $45-$65
- Group registration: varies

STEP 5: WAIT FOR PROCESSING
- Processing time: 3-12 months
- Certificate mailed upon approval
- Registration effective from submission date

TIPS FOR SUCCESS:
- Use consistent naming
- Keep detailed records
- Register promptly after creation
- Consider group registrations for multiple works

INTERNATIONAL PROTECTION:
- File in target countries
- Use Madrid Protocol for trademarks
- Consider international copyright treaties

For questions, contact:
U.S. Copyright Office
Library of Congress
Washington, DC 20559
(877) 476-0778
      `
    },
    {
      id: 'privacy-policy',
      title: 'Privacy Policy Template',
      description: 'GDPR-compliant privacy policy template for art platforms',
      category: 'policies',
      format: 'pdf',
      difficulty: 'intermediate',
      icon: Eye,
      content: `
PRIVACY POLICY

Last Updated: [Date]

INTRODUCTION
This Privacy Policy describes how [Your Company] collects, uses, and protects your personal information.

INFORMATION WE COLLECT
We may collect:
- Personal identification information
- Artwork and creative content
- Usage data and analytics
- Communication records

HOW WE USE INFORMATION
Your information is used to:
- Provide copyright protection services
- Monitor for infringement
- Communicate with you
- Improve our services

DATA SHARING
We do not sell personal information. We may share data with:
- Legal authorities (when required)
- Service providers (under strict agreements)
- Law enforcement (for legitimate requests)

YOUR RIGHTS (GDPR)
You have the right to:
- Access your personal data
- Correct inaccurate information
- Delete your data
- Restrict processing
- Data portability

SECURITY MEASURES
We implement:
- Encryption in transit and at rest
- Access controls and authentication
- Regular security audits
- Incident response procedures

COOKIES AND TRACKING
We use cookies for:
- Essential site functionality
- Analytics and improvements
- User preferences

RETENTION POLICY
We retain data only as long as necessary for:
- Service provision
- Legal compliance
- Legitimate business interests

CHILDREN'S PRIVACY
We do not knowingly collect information from children under 13.

INTERNATIONAL TRANSFERS
Data may be transferred to countries with adequate protection levels.

CONTACT INFORMATION
For privacy questions, contact:
Privacy Officer
[Your Company]
[Address]
[Email]
[Phone]

UPDATES TO POLICY
We will notify you of material changes to this policy.
      `
    },
    {
      id: 'terms-of-service',
      title: 'Terms of Service Template',
      description: 'Comprehensive terms of service for creative platforms',
      category: 'policies',
      format: 'pdf',
      difficulty: 'advanced',
      icon: FileText,
      content: `
TERMS OF SERVICE

ACCEPTANCE OF TERMS
By using our service, you agree to these terms.

SERVICE DESCRIPTION
We provide copyright monitoring and protection services for digital artwork.

USER ACCOUNTS
- You must provide accurate information
- You are responsible for account security
- One account per user

INTELLECTUAL PROPERTY
- You retain ownership of your uploaded content
- You grant us license to provide services
- We respect copyright and intellectual property rights

PROHIBITED USES
You may not:
- Upload content you don't own
- Violate others' intellectual property
- Use the service for illegal purposes
- Attempt to circumvent security measures

CONTENT STANDARDS
Uploaded content must:
- Be your original work
- Not infringe on others' rights
- Comply with applicable laws
- Meet our quality guidelines

SERVICE AVAILABILITY
- We strive for 99.9% uptime
- Scheduled maintenance will be announced
- No guarantee of uninterrupted service

PAYMENT TERMS
- Subscription fees are non-refundable
- Prices may change with notice
- Automatic renewal unless cancelled

LIMITATION OF LIABILITY
Our liability is limited to the amount paid for services.

INDEMNIFICATION
You agree to indemnify us against claims arising from your use.

TERMINATION
We may terminate accounts for:
- Terms of service violations
- Non-payment
- Abuse of service

GOVERNING LAW
These terms are governed by [State/Country] law.

DISPUTE RESOLUTION
Disputes will be resolved through binding arbitration.

MODIFICATIONS
We may update these terms with reasonable notice.

CONTACT INFORMATION
Questions about terms should be directed to:
Legal Department
[Your Company]
[Contact Information]
      `
    }
  ];

  const downloadTemplate = (template: LegalTemplate) => {
    const blob = new Blob([template.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: `${template.title} has been downloaded successfully.`,
    });
  };

  const categoryLabels = {
    dmca: 'DMCA & Takedowns',
    contracts: 'Contracts & Licensing',
    policies: 'Policies & Terms',
    notices: 'Legal Notices'
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, LegalTemplate[]>);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Legal Templates Library</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Download professional legal templates to protect your creative work. 
          All templates are designed to be easy to customize and legally compliant.
        </p>
      </div>

      {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-2xl font-semibold">{categoryLabels[category as keyof typeof categoryLabels]}</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryTemplates.map((template) => {
              const Icon = template.icon;
              
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge className={difficultyColors[template.difficulty]}>
                        {template.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        {template.format.toUpperCase()}
                      </div>
                      
                      <Button
                        onClick={() => downloadTemplate(template)}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">Legal Disclaimer</h4>
            <p className="text-yellow-700 text-sm">
              These templates are provided for informational purposes only and do not constitute legal advice. 
              We recommend consulting with a qualified attorney before using any legal document. 
              Laws vary by jurisdiction, and these templates may need modification to comply with local requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalTemplates;