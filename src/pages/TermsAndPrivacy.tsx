import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const TermsAndPrivacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Service & Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">
            Your rights and responsibilities when using TSMO Technology
          </p>
          <Badge variant="secondary" className="mt-2">
            Last Updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        <div className="space-y-8">
          {/* Terms of Service */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Terms of Service</CardTitle>
              <CardDescription>
                Please read these terms carefully before using our services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h3>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using TSMO Technology, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">2. Use License</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Permission is granted to temporarily use TSMO Technology for personal and commercial use. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on TSMO Technology</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">3. AI Protection Services</h3>
                <p className="text-muted-foreground leading-relaxed">
                  TSMO provides AI training protection, deepfake detection, and copyright monitoring services. While we use advanced technology to protect your content, we cannot guarantee 100% protection against all forms of misuse. Users are responsible for understanding the limitations of our protection measures.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">4. User Content and Responsibilities</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  By uploading content to our platform, you confirm that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>You own the rights to the content or have permission to use it</li>
                  <li>The content does not violate any laws or third-party rights</li>
                  <li>The content is not obscene, defamatory, or inappropriate</li>
                  <li>You grant TSMO the right to process and analyze your content for protection purposes</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">5. Payment and Billing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Subscription fees are billed in advance on a monthly or yearly basis. All fees are non-refundable except as required by law. We reserve the right to change our pricing with 30 days' notice to existing subscribers.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">6. Disclaimer</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The materials on TSMO Technology are provided on an 'as is' basis. TSMO makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">7. Limitations</h3>
                <p className="text-muted-foreground leading-relaxed">
                  In no event shall TSMO or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TSMO Technology, even if TSMO or its authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </section>
            </CardContent>
          </Card>

          <Separator />

          {/* Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Privacy Policy</CardTitle>
              <CardDescription>
                How we collect, use, and protect your information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-3">1. Information We Collect</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">Personal Information:</h4>
                    <p className="text-muted-foreground">Name, email address, payment information, and account credentials.</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Content Data:</h4>
                    <p className="text-muted-foreground">Images, videos, and other content you upload for protection and monitoring.</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Usage Data:</h4>
                    <p className="text-muted-foreground">Information about how you use our platform, including access logs and feature usage.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">2. How We Use Your Information</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Provide and improve our AI protection services</li>
                  <li>Process payments and manage your subscription</li>
                  <li>Send important service updates and notifications</li>
                  <li>Analyze platform usage to enhance user experience</li>
                  <li>Comply with legal obligations and prevent fraud</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">3. Data Processing and AI Training</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your uploaded content is processed by our AI systems to provide protection services. We do not use your content to train AI models for third parties. All processing is done securely and in accordance with your protection preferences.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">4. Data Sharing and Disclosure</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We do not sell or rent your personal information. We may share information only in these limited circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations or court orders</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>With trusted service providers who assist in our operations</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">5. Data Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">6. Data Retention</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your personal information only as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account and data at any time, subject to legal requirements.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">7. Your Rights</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Access to your personal information</li>
                  <li>Correction of inaccurate data</li>
                  <li>Deletion of your data</li>
                  <li>Data portability</li>
                  <li>Objection to processing</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">8. Cookies and Tracking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar technologies to improve your experience, analyze usage, and provide personalized content. You can manage cookie preferences in your browser settings.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">9. International Data Transfers</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your information may be processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with applicable privacy laws.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">10. Changes to This Policy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of any material changes by email or through our platform. Your continued use of our services after such modifications constitutes acceptance of the updated policy.
                </p>
              </section>
            </CardContent>
          </Card>

          <Separator />

          {/* Copyright & DMCA Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Copyright & DMCA Policy</CardTitle>
              <CardDescription>
                Our intellectual property rights and DMCA compliance procedures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-3">1. Copyright Notice</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  All content, software, documentation, and materials on the TSMO Technology are protected by copyright law and are the exclusive property of TSMO Technology. This includes but is not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Source code, algorithms, and software architecture</li>
                  <li>User interface designs and graphics</li>
                  <li>Documentation, tutorials, and help materials</li>
                  <li>Logos, trademarks, and brand elements</li>
                  <li>Database structures and proprietary data</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">2. All Rights Reserved License</h3>
                <p className="text-muted-foreground leading-relaxed">
                  This software is proprietary and confidential. All rights are reserved by TSMO Technology. Any use, reproduction, distribution, or modification of this software without explicit written permission is strictly prohibited and may result in severe civil and criminal penalties.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">3. DMCA Compliance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  TSMO Technology respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA). If you believe your copyrighted work has been infringed upon, please file a DMCA notice through our <a href="/dmca-center" className="text-primary hover:underline">DMCA Center</a>.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">4. Registered DMCA Agent</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium">DMCA Agent: Coming Soon</p>
                  <p className="text-muted-foreground">Email: Coming Soon</p>
                  <p className="text-muted-foreground">
                    Address: Coming Soon
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">5. Enforcement Policy</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  TSMO Technology actively monitors for unauthorized use of our intellectual property and will pursue all available legal remedies against infringers, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Cease and desist notifications</li>
                  <li>DMCA takedown requests</li>
                  <li>Civil litigation for damages</li>
                  <li>Criminal prosecution where applicable</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">6. Licensing Inquiries</h3>
                <p className="text-muted-foreground leading-relaxed">
                  For authorized licensing of TSMO Technology or content, please contact our legal department at <a href="mailto:shirleenacunningham@tsmowatch.com" className="text-primary hover:underline">shirleenacunningham@tsmowatch.com</a> with detailed information about your intended use.
                </p>
              </section>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
              <CardDescription>
                Questions about these terms or your privacy? We're here to help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Legal Department</p>
                  <p className="text-muted-foreground">shirleenacunningham@tsmowatch.com</p>
                </div>
                <div>
                  <p className="font-medium">DMCA Agent</p>
                  <p className="text-muted-foreground">Coming Soon</p>
                </div>
                <div>
                  <p className="font-medium">Privacy Officer</p>
                  <p className="text-muted-foreground">shirleena.cunningham@tsmowatch.com</p>
                </div>
                <div>
                  <p className="font-medium">Mailing Address</p>
                  <p className="text-muted-foreground">
                     TSMO Technology Legal Department<br />
                    123 Innovation Drive<br />
                    Tech City, TC 12345<br />
                    United States
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsAndPrivacy;