import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqSections = [
    {
      title: "General",
      items: [
        {
          question: "What is TSMO Watch?",
          answer: "TSMO Watch is a digital protection platform designed to help artists, creators, and studios safeguard their work online. Using AI-powered tracking, we monitor the web, social media, and marketplaces for stolen, copied, or deepfaked versions of your art and notify you when your intellectual property is at risk."
        },
        {
          question: "What does TSMO stand for?",
          answer: (
            <div>
              <p>TSMO is named in honor of the animals that inspired the founder's creativity and resilience growing up. The letters stand for:</p>
              <ul className="mt-2 space-y-1">
                <li><strong>T</strong> – Tippy, a beloved cat</li>
                <li><strong>S</strong> – Sammy, a loyal Saint Bernard</li>
                <li><strong>M</strong> – Mirakle, a cherished horse</li>
                <li><strong>O</strong> – Oscar, a rescue cat</li>
              </ul>
              <p className="mt-2">These companions symbolized trust, loyalty, and protection — the same principles TSMO Watch upholds by protecting artists' original work.</p>
            </div>
          )
        },
        {
          question: "Who is TSMO for?",
          answer: "TSMO is built for all creators: writers, filmmakers, social media influencers, photographers, painters, animators, independent artists, illustrators, designers, creative agencies, content studios, and anyone who has created and published online content. We protect your work, reputation, and income from online theft or misuse."
        },
        {
          question: "How does TSMO work?",
          answer: "Our AI scanning system tracks unauthorized uses of your content across websites, social media, AI datasets, and NFT marketplaces. We send real-time alerts and offer takedown assistance so you can act quickly."
        }
      ]
    },
    {
      title: "Protection & Tracking",
      items: [
        {
          question: "What types of content does TSMO protect?",
          answer: "TSMO can track illustrations, animations, logos, photography, video, and other visual media. We also detect when your work is used in AI training sets, deepfake tools, or as NFTs without your permission."
        },
        {
          question: "How often does TSMO scan the internet?",
          answer: "We run continuous scans and update your report daily. You'll receive instant alerts when new matches are detected."
        },
        {
          question: "Can TSMO remove stolen content for me?",
          answer: "Yes. Our takedown team can help you send DMCA notices, file copyright claims, and contact hosting platforms to remove stolen or unauthorized content."
        }
      ]
    },
    {
      title: "Getting Started",
      items: [
        {
          question: "How do I sign up?",
          answer: "Visit tsmowatch.com and create an account. You can upload samples of your work, set monitoring preferences, and start tracking within minutes."
        },
        {
          question: "How soon will I see results?",
          answer: "Most users receive their first scan results within 24 hours, with ongoing reports delivered daily or weekly, depending on your plan."
        }
      ]
    },
    {
      title: "Pricing & Plans",
      items: [
        {
          question: "Is TSMO free?",
          answer: "We offer a free trial with limited scans so you can see how much of your work is being used without your permission. Paid plans start with affordable monthly rates for individuals and scale up for studios and agencies."
        },
        {
          question: "What's included in the paid plans?",
          answer: "Paid plans include unlimited scans, detailed reports, priority alerts, DMCA takedown support, and custom monitoring for agencies or larger portfolios."
        }
      ]
    },
    {
      title: "AI & Deepfake Protection",
      items: [
        {
          question: "How does TSMO protect against AI misuse?",
          answer: "TSMO flags when your art appears in AI-generated datasets, deepfake applications, or derivative content created by generative tools. We help you track where your work is being used and advise on legal and removal options."
        },
        {
          question: "Can I stop AI models from training on my work?",
          answer: "While complete prevention is complex, TSMO identifies AI training use so you can file removal requests, add protective metadata, or pursue legal action if your rights are violated."
        },
        {
          question: "What is AI Training Protection and how does it work?",
          answer: (
            <div>
              <p className="mb-3"><strong>AI Training Protection</strong> is a comprehensive system that prevents unauthorized use of your creative work in AI model training and provides real-time monitoring for violations.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">How it works:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• Technical Protection:</strong> Applies adversarial noise patterns, metadata injection, and fingerprinting to make your content resistant to AI training</li>
                  <li><strong>• Rights Metadata:</strong> Embeds copyright information and usage restrictions directly into your files</li>
                  <li><strong>• Crawler Blocking:</strong> Prevents automated bots from accessing and downloading your content</li>
                  <li><strong>• Real-time Monitoring:</strong> Continuously scans AI datasets and training repositories for your protected content</li>
                  <li><strong>• Violation Alerts:</strong> Instant notifications when your work is detected in unauthorized AI training</li>
                  <li><strong>• Legal Documentation:</strong> Generates violation reports for DMCA takedowns and legal action</li>
                </ul>
              </div>
              
              <p className="text-sm"><strong>Who it's for:</strong> Digital artists, photographers, illustrators, content creators, and anyone who wants to protect their work from being used to train AI models without permission.</p>
            </div>
          )
        },
        {
          question: "What is Profile Monitoring and how does it protect me?",
          answer: (
            <div>
              <p className="mb-3"><strong>Profile Monitoring</strong> is an advanced system that protects your personal and professional identity across social media platforms by detecting impersonation and fake accounts.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">How it works:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• Multi-Platform Scanning:</strong> Monitors 15+ social media platforms including Instagram, Twitter, TikTok, LinkedIn, and more</li>
                  <li><strong>• AI-Powered Detection:</strong> Uses advanced algorithms to identify fake profiles using your name, photos, or bio information</li>
                  <li><strong>• Risk Assessment:</strong> Analyzes detected profiles and assigns risk scores based on similarity and potential harm</li>
                  <li><strong>• Real-time Alerts:</strong> Instant notifications when suspicious profiles are detected</li>
                  <li><strong>• Automated Reporting:</strong> Generates detailed reports for platform takedown requests</li>
                  <li><strong>• Brand Protection:</strong> Monitors for unauthorized use of your brand, logo, or professional identity</li>
                </ul>
              </div>
              
              <p className="text-sm"><strong>Who it's for:</strong> Public figures, influencers, business owners, professionals, and anyone concerned about identity theft or brand impersonation on social media.</p>
            </div>
          )
        },
        {
          question: "What is Portfolio Monitoring and how does it protect my artwork?",
          answer: (
            <div>
              <p className="mb-3"><strong>Portfolio Monitoring</strong> is a comprehensive system that tracks and protects collections of your artwork across the internet, detecting unauthorized use and copyright violations.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">How it works:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• Collection Management:</strong> Organize your artwork into portfolios for efficient monitoring and protection</li>
                  <li><strong>• Multi-Platform Scanning:</strong> Searches across websites, social media, marketplaces, and NFT platforms</li>
                  <li><strong>• Visual Recognition:</strong> Uses AI to detect your artwork even when modified, cropped, or filtered</li>
                  <li><strong>• Scheduled Scans:</strong> Automated daily, weekly, or monthly scans of your entire portfolio</li>
                  <li><strong>• Threat Assessment:</strong> Categorizes matches by risk level (high, medium, low) based on usage context</li>
                  <li><strong>• Analytics Dashboard:</strong> Detailed insights into where your work appears and usage trends</li>
                  <li><strong>• Automated Alerts:</strong> Real-time notifications for new matches and copyright violations</li>
                  <li><strong>• Legal Support:</strong> Integration with DMCA takedown tools and legal documentation</li>
                </ul>
              </div>
              
              <p className="text-sm"><strong>Who it's for:</strong> Artists, photographers, designers, creative agencies, studios, and anyone with a collection of creative work that needs comprehensive protection.</p>
            </div>
          )
        },
        {
          question: "What is Advanced Blockchain Technology and how is it different from regular blockchain verification?",
          answer: (
            <div>
              <p className="mb-3"><strong>Advanced Blockchain Technology</strong> in TSMO Watch provides enterprise-grade intellectual property protection through sophisticated multi-layer blockchain registration and verification systems.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Key differences from regular blockchain verification:</h4>
                <div className="space-y-3">
                  <div>
                    <strong>Regular Blockchain Verification:</strong>
                    <ul className="ml-4 mt-1 space-y-1 text-sm">
                      <li>• Simple hash registration on a single network</li>
                      <li>• Basic timestamp proof</li>
                      <li>• Limited metadata storage</li>
                      <li>• No smart contract automation</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong>Advanced Blockchain Technology:</strong>
                    <ul className="ml-4 mt-1 space-y-1 text-sm">
                      <li>• Multi-network deployment (Ethereum, Polygon, Arbitrum)</li>
                      <li>• Smart contract-based ownership proofs</li>
                      <li>• IPFS integration for decentralized metadata storage</li>
                      <li>• Cryptographic fingerprinting with multiple hash algorithms</li>
                      <li>• Gas optimization and transaction batching</li>
                      <li>• Automated royalty and licensing enforcement</li>
                      <li>• Cross-chain verification capabilities</li>
                      <li>• Immutable audit trails with legal compliance</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <p className="text-sm">This advanced system provides court-admissible proof of ownership, automated rights management, and enterprise-level security for high-value creative assets.</p>
            </div>
          )
        }
      ]
    },
    {
      title: "Trademark Monitoring",
      items: [
        {
          question: "What is Trademark Monitoring and how does it work?",
          answer: (
            <div>
              <p className="mb-3"><strong>Trademark Monitoring</strong> is an advanced intelligence system that helps protect your brand identity by monitoring trademark applications, domain registrations, and brand usage across multiple platforms.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Key features include:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• AI-Powered Search:</strong> Advanced similarity detection using machine learning algorithms</li>
                  <li><strong>• Real-Time Alerts:</strong> Instant notifications for new trademark applications that may conflict with yours</li>
                  <li><strong>• Multi-Jurisdiction Coverage:</strong> Monitors USPTO, EUIPO, WIPO, and other international trademark databases</li>
                  <li><strong>• Domain Monitoring:</strong> Tracks domain registrations that may infringe on your trademark</li>
                  <li><strong>• Social Media Scanning:</strong> Monitors brand usage across social platforms and marketplaces</li>
                  <li><strong>• Portfolio Management:</strong> Centralized dashboard to manage all your trademark assets</li>
                  <li><strong>• Risk Assessment:</strong> AI-powered threat analysis and similarity scoring</li>
                  <li><strong>• Legal Strategy Generation:</strong> Automated recommendations for trademark protection and enforcement</li>
                </ul>
              </div>
              
              <p className="text-sm"><strong>Who it's for:</strong> Business owners, brand managers, legal professionals, and anyone with trademark assets that need comprehensive monitoring and protection.</p>
            </div>
          )
        },
        {
          question: "How do I start monitoring my trademarks?",
          answer: (
            <div>
              <p className="mb-3">Getting started with Trademark Monitoring is simple and takes just a few minutes:</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Step-by-step process:</h4>
                <ol className="ml-4 space-y-2 text-sm list-decimal">
                  <li><strong>Navigate to Trademark Monitoring:</strong> Go to the Trademark Monitoring section from your dashboard</li>
                  <li><strong>Add Your Trademarks:</strong> Click "Add New Trademark" and enter your trademark details including name, registration number (if applicable), and jurisdiction</li>
                  <li><strong>Set Search Parameters:</strong> Configure monitoring preferences including similarity threshold, target jurisdictions, and alert frequency</li>
                  <li><strong>Choose Platforms:</strong> Select which platforms to monitor (USPTO, domain registries, social media, marketplaces)</li>
                  <li><strong>Start Monitoring:</strong> Click "Start Monitoring" to begin real-time surveillance of your trademark</li>
                  <li><strong>Review Alerts:</strong> Check your dashboard for alerts and take action on potential conflicts</li>
                </ol>
              </div>
              
              <p className="text-sm">You'll receive your first monitoring results within 24 hours, with ongoing alerts delivered in real-time as new potential conflicts are detected.</p>
            </div>
          )
        },
        {
          question: "What types of trademark conflicts can the system detect?",
          answer: (
            <div>
              <p className="mb-3">Our AI-powered system can detect various types of trademark conflicts and potential infringements:</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Detection capabilities:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• Identical Marks:</strong> Exact matches of your trademark in the same or related categories</li>
                  <li><strong>• Phonetically Similar:</strong> Trademarks that sound similar when spoken</li>
                  <li><strong>• Visually Similar:</strong> Marks with similar appearance, font, or design elements</li>
                  <li><strong>• Conceptually Similar:</strong> Trademarks with related meanings or concepts</li>
                  <li><strong>• Domain Squatting:</strong> Domain registrations that incorporate your trademark</li>
                  <li><strong>• Social Media Infringement:</strong> Unauthorized use of your brand on social platforms</li>
                  <li><strong>• Marketplace Violations:</strong> Products using your trademark on e-commerce platforms</li>
                  <li><strong>• International Conflicts:</strong> Similar marks filed in different jurisdictions</li>
                </ul>
              </div>
              
              <p className="text-sm">Each detection includes a risk assessment score and recommended actions, helping you prioritize which conflicts require immediate attention.</p>
            </div>
          )
        },
        {
          question: "How much does Trademark Monitoring cost?",
          answer: "Trademark Monitoring is included in our Professional and Enterprise plans. Basic monitoring starts at $49/month for up to 5 trademarks, with advanced features like AI strategy generation and bulk analysis available in higher tiers. We also offer pay-per-search options for occasional monitoring needs. Contact our sales team for custom enterprise pricing."
        },
        {
          question: "Can I monitor competitors' trademark activities?",
          answer: "Yes, our Competitive Intelligence feature allows you to monitor your competitors' trademark filings and brand activities. You can track when competitors file new applications, renew existing marks, or abandon trademarks. This helps you stay informed about market developments and identify potential opportunities or threats in your industry."
        }
      ]
    },
    {
      title: "Legal Templates & Documentation",
      items: [
        {
          question: "What are Legal Templates and how do they work?",
          answer: (
            <div>
              <p className="mb-3"><strong>Legal Templates</strong> provide professionally crafted legal documents to help protect your creative work and intellectual property rights.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Available templates include:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• DMCA Takedown Notice:</strong> Standard template for copyright infringement claims ($19.99/$4.99 member)</li>
                  <li><strong>• Copyright Cease & Desist:</strong> Professional cease and desist letter for copyright violations ($24.99/$7.99 member)</li>
                  <li><strong>• Artist Licensing Agreement:</strong> Comprehensive licensing template for artwork usage ($39.99/$14.99 member)</li>
                  <li><strong>• Social Media Usage Rights:</strong> Template for social media content licensing ($29.99/$9.99 member)</li>
                  <li><strong>• NFT Creator Rights:</strong> Legal framework for NFT creators and collectors ($49.99/$19.99 member)</li>
                  <li><strong>• International Copyright Notice:</strong> Multi-jurisdiction copyright protection document ($79.99/$24.99 member)</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Features:</h4>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>• Professionally reviewed by IP lawyers</li>
                  <li>• Customizable for your specific needs</li>
                  <li>• Instant download after purchase</li>
                  <li>• Member discounts available</li>
                  <li>• Regular updates to match current laws</li>
                </ul>
              </div>
              
              <p className="text-sm"><strong>Who it's for:</strong> Artists, content creators, photographers, designers, and anyone needing legal documentation to protect their intellectual property.</p>
            </div>
          )
        },
        {
          question: "How do I purchase and use Legal Templates?",
          answer: "Navigate to the Legal Templates section in your dashboard, browse available templates, and click 'Purchase' on the template you need. After payment, you'll receive an instant download link. Templates come with customization instructions and can be filled out with your specific information. Members receive significant discounts on all templates."
        },
        {
          question: "Are the Legal Templates legally valid?",
          answer: "Yes, all our legal templates are professionally reviewed and created by intellectual property lawyers. However, we recommend consulting with a local attorney for complex cases or jurisdiction-specific requirements. The templates provide a solid foundation for most common copyright protection needs."
        }
      ]
    },
    {
      title: "Advanced Features",
      items: [
        {
          question: "What is Advanced Watermarking and how does it protect my images?",
          answer: (
            <div>
              <p className="mb-3"><strong>Advanced Watermarking</strong> applies sophisticated protection layers to your images that go beyond simple visible watermarks.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Protection methods include:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• Invisible Digital Fingerprints:</strong> Embedded metadata that survives image editing and compression</li>
                  <li><strong>• Steganographic Watermarks:</strong> Hidden data embedded in image pixels, undetectable to the naked eye</li>
                  <li><strong>• Frequency Domain Watermarks:</strong> Protection that persists through image transformations</li>
                  <li><strong>• Blockchain Anchoring:</strong> Links watermarks to immutable blockchain records</li>
                  <li><strong>• Multi-layer Protection:</strong> Combines visible and invisible watermarks for maximum security</li>
                  <li><strong>• Tamper Detection:</strong> Alerts when watermarked images are modified</li>
                </ul>
              </div>
              
              <p className="text-sm">This technology makes your images trackable across the internet even when they're cropped, filtered, or edited, providing comprehensive protection against theft.</p>
            </div>
          )
        },
        {
          question: "What is NFT Minting and how does it protect my digital art?",
          answer: (
            <div>
              <p className="mb-3"><strong>NFT Minting</strong> creates unique blockchain-based certificates of authenticity for your digital artwork, providing verifiable proof of ownership and creation.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">How it works:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• Smart Contract Creation:</strong> Generates unique NFT smart contracts for your artwork</li>
                  <li><strong>• IPFS Storage:</strong> Stores your artwork on decentralized storage for permanence</li>
                  <li><strong>• Ownership Verification:</strong> Creates immutable proof of creation and ownership</li>
                  <li><strong>• Royalty Integration:</strong> Automatic royalty payments for secondary sales</li>
                  <li><strong>• Multi-chain Support:</strong> Deploys on Ethereum, Polygon, and other networks</li>
                  <li><strong>• Gas Optimization:</strong> Minimizes transaction costs through batch processing</li>
                </ul>
              </div>
              
              <p className="text-sm">NFT minting provides legal and technical proof of authenticity, helping establish your rights in disputes and enabling monetization of your digital creations.</p>
            </div>
          )
        },
        {
          question: "What is Real-time Monitoring and how does it work?",
          answer: (
            <div>
              <p className="mb-3"><strong>Real-time Monitoring</strong> provides instant detection and alerts when your protected content appears anywhere on the internet.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Monitoring capabilities:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• Live Web Scanning:</strong> Continuous monitoring of websites, forums, and marketplaces</li>
                  <li><strong>• Social Media Tracking:</strong> Real-time detection across Instagram, Twitter, TikTok, and more</li>
                  <li><strong>• AI Training Set Detection:</strong> Monitors for unauthorized use in AI model training</li>
                  <li><strong>• Deepfake Detection:</strong> Identifies when your likeness is used in deepfake content</li>
                  <li><strong>• NFT Marketplace Monitoring:</strong> Tracks unauthorized NFT listings of your work</li>
                  <li><strong>• Instant Alerts:</strong> Real-time notifications via email, SMS, and in-app alerts</li>
                  <li><strong>• Threat Assessment:</strong> Automatically categorizes matches by severity and risk level</li>
                </ul>
              </div>
              
              <p className="text-sm">This system enables immediate response to copyright violations, maximizing your ability to protect your work and minimize damage from theft.</p>
            </div>
          )
        },
        {
          question: "How accurate is the visual recognition technology?",
          answer: "Our AI-powered visual recognition technology achieves over 95% accuracy in detecting your artwork, even when it's been modified, cropped, filtered, or edited. The system uses advanced machine learning algorithms and continues to improve through continuous training on new data patterns."
        }
      ]
    },
    {
      title: "Technical & Integration",
      items: [
        {
          question: "Do you offer API integration for businesses?",
          answer: "Yes, we provide comprehensive API access for businesses and agencies. Our API allows you to integrate TSMO Watch's monitoring capabilities directly into your existing workflows, automate bulk uploads, and receive programmatic alerts. Contact our sales team for enterprise API documentation and pricing."
        },
        {
          question: "What file formats are supported?",
          answer: "TSMO Watch supports all major image formats (JPEG, PNG, GIF, WebP, SVG), video formats (MP4, AVI, MOV, WebM), and document formats (PDF). We also support RAW image files from major camera manufacturers and various design file formats."
        },
        {
          question: "How do you ensure my data privacy and security?",
          answer: "We use enterprise-grade encryption for all data transmission and storage. Your uploaded content is processed securely and we never share your work with third parties. We're GDPR compliant and follow strict data protection protocols. You maintain full ownership and control of your content at all times."
        },
        {
          question: "Can I integrate TSMO Watch with my existing creative tools?",
          answer: "Yes, we offer integrations with popular creative tools and platforms including Adobe Creative Suite, social media schedulers, and portfolio platforms. Our browser extension also allows one-click protection directly from your creative workflows."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about TSMO Watch and how we protect your creative work.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {faqSections.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">{section.title}</CardTitle>
                <CardDescription>
                  {section.title === "General" && "Learn about TSMO Watch and what we do"}
                  {section.title === "Protection & Tracking" && "Understanding our monitoring and protection features"}
                  {section.title === "Getting Started" && "Quick start guide for new users"}
                  {section.title === "Pricing & Plans" && "Information about our pricing and subscription options"}
                  {section.title === "AI & Deepfake Protection" && "How we protect against AI misuse and deepfakes"}
                  {section.title === "Trademark Monitoring" && "Advanced brand protection and trademark intelligence"}
                  {section.title === "Legal Templates & Documentation" && "Professional legal documents for intellectual property protection"}
                  {section.title === "Advanced Features" && "Cutting-edge protection technologies and monitoring capabilities"}
                  {section.title === "Technical & Integration" && "API access, file formats, security, and platform integrations"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {section.items.map((item, itemIndex) => (
                    <AccordionItem key={itemIndex} value={`${sectionIndex}-${itemIndex}`}>
                      <AccordionTrigger className="text-left font-medium">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {typeof item.answer === 'string' ? item.answer : item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="bg-card/30 backdrop-blur-sm border-border/50 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">Still have questions?</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Our support team is here to help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 font-medium transition-colors"
              >
                Contact Support
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQ;