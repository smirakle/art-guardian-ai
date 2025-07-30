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