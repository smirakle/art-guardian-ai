import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqSections = [
    {
      title: "General",
      items: [
        {
          question: "What is TSMO Watch?",
          answer: "TSMO Watch is a comprehensive digital protection platform designed to help artists, creators, and studios safeguard their work online. Using advanced AI-powered tracking, blockchain verification, and automated legal tools, we monitor the web, social media, AI training datasets, and marketplaces 24/7 for stolen, copied, or deepfaked versions of your art. Currently in beta with 50 free scans per day for early adopters."
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
          answer: (
            <div>
              <p className="mb-3">TSMO Watch uses a multi-layered protection system:</p>
              <ol className="ml-4 space-y-2 text-sm list-decimal">
                <li><strong>Upload & Protect:</strong> Upload your artwork and apply protection layers (watermarking, blockchain verification, AI fingerprinting)</li>
                <li><strong>24/7 AI Monitoring:</strong> Our AI continuously scans the internet, social media, AI training datasets, and marketplaces</li>
                <li><strong>Instant Detection:</strong> Visual recognition technology detects your work even when modified or cropped</li>
                <li><strong>Real-time Alerts:</strong> Get notified immediately when violations are found with detailed evidence</li>
                <li><strong>Automated Response:</strong> Auto-generate DMCA notices and legal documentation, or take manual action</li>
                <li><strong>Legal Support:</strong> Access to IP lawyers and automated legal workflows for enforcement</li>
              </ol>
            </div>
          )
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
          answer: "Look for the 'Get Protected' button in the bottom-left sidebar of the homepage, or click 'Login' in the main navigation menu. Select the 'Sign Up' tab, enter your details (full name, username, email, password), and optionally add a promo code. Click 'Create Account' to complete registration. You can also upload and protect artwork without signing in for basic protection."
        },
        {
          question: "How soon will I see results?",
          answer: "After uploading and protecting your artwork, monitoring begins immediately if you're signed in. Most users receive their first scan results within 24 hours. During beta, you have 50 scans per day that reset every 24 hours. Ongoing reports are delivered in real-time with instant alerts for new detections, plus comprehensive daily or weekly summaries depending on your plan."
        },
        {
          question: "What is the beta access and what are the limitations?",
          answer: (
            <div>
              <p className="mb-3">TSMO Watch is currently in beta, offering early access to our advanced protection platform:</p>
              <div className="mb-3">
                <h4 className="font-semibold mb-2">Beta Access Includes:</h4>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>• 50 scans per day for deepfake detection and image analysis</li>
                  <li>• Daily reset of scan limits (every 24 hours)</li>
                  <li>• Full access to upload and protection features</li>
                  <li>• Watermarking and blockchain verification</li>
                  <li>• Basic monitoring capabilities</li>
                </ul>
              </div>
              <p className="text-sm">Thank you for being an early adopter! Beta limitations help us scale our infrastructure while providing value to our community. Paid plans will offer unlimited scans and advanced features.</p>
            </div>
          )
        }
      ]
    },
    {
      title: "Pricing & Plans",
      items: [
        {
          question: "Is TSMO free?",
          answer: "TSMO offers a beta access period where you can upload and protect artwork with basic features. During beta, you get 50 scans per day (resets every 24 hours) for deepfake detection and image analysis. All plans include a 5-day free trial with no credit card required."
        },
        {
          question: "What are the current pricing plans?",
          answer: (
            <div>
              <p className="mb-3">TSMO Watch offers four flexible plans to match your protection needs:</p>
              <ul className="ml-4 space-y-3 text-sm">
                <li><strong>• Student Plan ($19/mo - 24% OFF):</strong> Up to 1,000 artworks, basic AI monitoring, 5 portfolios, email alerts, educational resources, community support, and mobile app access.</li>
                <li><strong>• Starter Plan ($29/mo - 25% OFF):</strong> Up to 3,500 artworks, advanced AI monitoring, 10 portfolios, scheduled scans, real-time alerts, watermark protection, API access, and priority support.</li>
                <li><strong>• Professional Plan ($199/mo):</strong> Up to 250,000 artworks, 50 portfolios, blockchain verification, deepfake detection, automated DMCA, white-label options, legal network access, and 24/7 priority support.</li>
                <li><strong>• Enterprise Plan (Custom):</strong> Unlimited artworks and portfolios, custom API integrations, on-premise deployment, dedicated infrastructure, legal team on retainer, and custom SLA agreements.</li>
              </ul>
              <p className="mt-3 text-sm"><strong>Add-ons Available:</strong> AI Training Protection ($49/mo), Social Media Monitoring ($100/mo + $199 startup fee, Coming Soon)</p>
              <p className="text-sm">All plans include a 5-day free trial • No credit card required • Cancel anytime</p>
            </div>
          )
        },
        {
          question: "What's included in the paid plans?",
          answer: "Paid plans include comprehensive protection features: AI-powered monitoring, visual recognition, threat detection, real-time alerts, blockchain verification (Professional+), DMCA takedown support, legal templates, portfolio management, detailed analytics, and priority support. Higher tiers add advanced features like automated legal actions, multi-modal protection, and enterprise-grade infrastructure."
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
                  <li><strong>• DMCA Takedown Notice:</strong> Standard template for copyright infringement claims - FREE</li>
                  <li><strong>• Copyright Cease & Desist:</strong> Professional cease and desist letter for copyright violations - FREE</li>
                  <li><strong>• Artist Licensing Agreement:</strong> Comprehensive licensing template for artwork usage - FREE</li>
                  <li><strong>• Social Media Usage Rights:</strong> Template for social media content licensing - FREE</li>
                  <li><strong>• NFT Creator Rights:</strong> Legal framework for NFT creators and collectors - FREE</li>
                  <li><strong>• International Copyright Notice:</strong> Multi-jurisdiction copyright protection document - FREE</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Features:</h4>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>• Professionally reviewed by IP lawyers</li>
                  <li>• Customizable for your specific needs</li>
                  <li>• Instant download - no payment required</li>
                  <li>• All templates completely free</li>
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
          question: "How does Forgery Detection work and what can it identify?",
          answer: (
            <div>
              <p className="mb-3"><strong>Forgery Detection</strong> uses advanced AI algorithms and digital forensics techniques to identify manipulated, edited, or artificially generated images that may infringe on your original work.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Detection capabilities include:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• Deepfake Detection:</strong> Identifies AI-generated faces, objects, and scenes using neural network analysis</li>
                  <li><strong>• Digital Manipulation:</strong> Detects photo editing, compositing, and digital alterations using pixel-level analysis</li>
                  <li><strong>• Copy-Move Forgery:</strong> Finds duplicated or moved elements within the same image</li>
                  <li><strong>• Splicing Detection:</strong> Identifies images composed from multiple source images</li>
                  <li><strong>• AI-Generated Content:</strong> Recognizes content created by AI tools like Midjourney, DALL-E, or Stable Diffusion</li>
                  <li><strong>• Metadata Analysis:</strong> Examines EXIF data inconsistencies and digital signatures</li>
                  <li><strong>• Compression Artifacts:</strong> Analyzes compression patterns to detect editing and re-saving</li>
                  <li><strong>• Noise Pattern Analysis:</strong> Examines camera sensor noise to verify authenticity</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">How the analysis works:</h4>
                <ol className="ml-4 space-y-2 text-sm list-decimal">
                  <li><strong>Upload Analysis:</strong> When you upload an image, our AI performs multiple forensic tests simultaneously</li>
                  <li><strong>Multi-Algorithm Processing:</strong> Uses 15+ different detection algorithms to analyze various aspects of the image</li>
                  <li><strong>Pattern Recognition:</strong> Compares against known forgery signatures and AI-generation patterns</li>
                  <li><strong>Confidence Scoring:</strong> Provides a forgery probability score from 0-100% for each detected anomaly</li>
                  <li><strong>Visual Highlighting:</strong> Shows exactly where modifications or suspicious areas are detected</li>
                  <li><strong>Detailed Report:</strong> Generates comprehensive forensic reports suitable for legal proceedings</li>
                </ol>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Use cases:</h4>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>• Verify authenticity of submitted artwork or photography</li>
                  <li>• Detect unauthorized AI-generated versions of your work</li>
                  <li>• Identify manipulated versions of your original content</li>
                  <li>• Provide evidence for copyright infringement cases</li>
                  <li>• Screen content before publication or licensing</li>
                </ul>
              </div>
              
              <p className="text-sm"><strong>Accuracy:</strong> Our forgery detection system achieves 94% accuracy on deepfakes and 97% accuracy on digital manipulations, with continuous improvement through machine learning updates.</p>
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
      title: "Multi-Modal AI Protection (Phase 3)",
      items: [
        {
          question: "What is Multi-Modal AI Protection and how is it different from regular AI protection?",
          answer: (
            <div>
              <p className="mb-3"><strong>Multi-Modal AI Protection</strong> represents the next generation of content protection, extending beyond simple image monitoring to protect voice, video, 3D content, and complex multimedia assets.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Multi-modal capabilities include:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• Voice Protection:</strong> Detects unauthorized use of voice clones, audio deepfakes, and speech synthesis</li>
                  <li><strong>• Video Analysis:</strong> Monitors video content for deepfakes, unauthorized edits, and content theft</li>
                  <li><strong>• 3D Content Protection:</strong> Protects 3D models, animations, and virtual assets from theft</li>
                  <li><strong>• Audio-Visual Synchronization:</strong> Detects manipulated videos with mismatched audio tracks</li>
                  <li><strong>• Biometric Protection:</strong> Protects facial features, gait patterns, and other identifying characteristics</li>
                  <li><strong>• Cross-Modal Detection:</strong> Identifies when content is transformed across different media types</li>
                  <li><strong>• Real-time Processing:</strong> Live analysis of streaming content and social media</li>
                </ul>
              </div>
              
              <p className="text-sm">This advanced system provides comprehensive protection for creators working with video, audio, 3D assets, and complex multimedia content that traditional image-only protection cannot address.</p>
            </div>
          )
        },
        {
          question: "How does voice and audio protection work?",
          answer: (
            <div>
              <p className="mb-3">Our voice protection system uses advanced audio analysis and machine learning to detect unauthorized use of your voice across multiple platforms.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Audio protection features:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• Voice Fingerprinting:</strong> Creates unique audio signatures for your voice patterns</li>
                  <li><strong>• Deepfake Audio Detection:</strong> Identifies AI-generated voice clones and synthetic speech</li>
                  <li><strong>• Music and Sound Protection:</strong> Monitors for unauthorized use of original music and sound effects</li>
                  <li><strong>• Cross-Platform Monitoring:</strong> Scans podcasts, YouTube, TikTok, and other audio platforms</li>
                  <li><strong>• Real-time Alerts:</strong> Instant notifications when your voice is detected</li>
                  <li><strong>• Quality Analysis:</strong> Determines if detected audio is original or synthetically generated</li>
                </ul>
              </div>
              
              <p className="text-sm">This protection is essential for voice actors, musicians, podcasters, and content creators whose voice is part of their brand identity.</p>
            </div>
          )
        },
        {
          question: "What is 3D content protection and who needs it?",
          answer: (
            <div>
              <p className="mb-3">3D content protection monitors and protects three-dimensional assets including models, animations, virtual environments, and NFT collectibles.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">3D protection covers:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• 3D Models:</strong> Characters, objects, architectural designs, and product models</li>
                  <li><strong>• Virtual Environments:</strong> Game worlds, VR spaces, and metaverse locations</li>
                  <li><strong>• Animation Sequences:</strong> Character animations, motion capture data, and rigged models</li>
                  <li><strong>• NFT Assets:</strong> 3D collectibles, avatar parts, and virtual goods</li>
                  <li><strong>• Technical Blueprints:</strong> CAD files, engineering designs, and architectural plans</li>
                  <li><strong>• Texture Maps:</strong> Surface materials, bump maps, and shader configurations</li>
                </ul>
              </div>
              
              <p className="text-sm"><strong>Who needs this:</strong> Game developers, 3D artists, architects, product designers, NFT creators, VR/AR developers, and anyone creating 3D digital assets.</p>
            </div>
          )
        }
      ]
    },
    {
      title: "Government API Gateway",
      items: [
        {
          question: "What is the Government API Gateway and who can access it?",
          answer: (
            <div>
              <p className="mb-3">The <strong>Government API Gateway</strong> provides secure, authenticated access to TSMO Watch's protection capabilities for government agencies, law enforcement, and regulatory bodies.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Access levels include:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• Federal Agencies:</strong> FBI, DHS, USPTO, Copyright Office</li>
                  <li><strong>• Law Enforcement:</strong> Local and state police departments for investigations</li>
                  <li><strong>• Regulatory Bodies:</strong> FTC, SEC, and industry-specific regulators</li>
                  <li><strong>• International Cooperation:</strong> Interpol, Europol, and allied agencies</li>
                  <li><strong>• Academic Research:</strong> Universities and research institutions (with approval)</li>
                  <li><strong>• Court Systems:</strong> Digital forensics support for legal proceedings</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Available services:</h4>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>• Bulk content analysis for investigations</li>
                  <li>• Real-time threat intelligence feeds</li>
                  <li>• Deepfake detection for evidence verification</li>
                  <li>• Copyright violation monitoring</li>
                  <li>• Cross-platform tracking capabilities</li>
                </ul>
              </div>
              
              <p className="text-sm"><strong>Security:</strong> All API access includes multi-factor authentication, IP allowlisting, rate limiting, and comprehensive audit logging.</p>
            </div>
          )
        },
        {
          question: "How do government agencies get API access?",
          answer: "Government agencies must complete a verification process including official request documentation, proof of authority, and security clearance verification. Contact our government relations team with your agency credentials and use case requirements. All requests undergo a thorough vetting process before API keys are issued."
        },
        {
          question: "What security measures protect government API access?",
          answer: (
            <div>
              <p className="mb-3">Government API access includes enterprise-grade security measures designed for sensitive operations:</p>
              
              <ul className="ml-4 space-y-2 text-sm">
                <li><strong>• Multi-Factor Authentication:</strong> Required for all API key generation and usage</li>
                <li><strong>• IP Allowlisting:</strong> Restrict access to pre-approved government IP ranges</li>
                <li><strong>• Rate Limiting:</strong> Prevent abuse while allowing legitimate high-volume usage</li>
                <li><strong>• Audit Logging:</strong> Comprehensive logs of all API calls for compliance</li>
                <li><strong>• Encryption:</strong> TLS 1.3 encryption for all data transmission</li>
                <li><strong>• Session Management:</strong> Automatic key rotation and session timeout</li>
                <li><strong>• Monitoring:</strong> Real-time security event detection and alerting</li>
              </ul>
            </div>
          )
        }
      ]
    },
    {
      title: "Global Legal Network",
      items: [
        {
          question: "What is the Global Legal Network and how does it help creators?",
          answer: (
            <div>
              <p className="mb-3">The <strong>Global Legal Network</strong> connects creators with verified legal professionals worldwide who specialize in intellectual property, copyright law, and digital rights enforcement.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Network includes:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• IP Specialists:</strong> Lawyers focused on copyright, trademark, and patent law</li>
                  <li><strong>• Digital Rights Experts:</strong> Attorneys experienced with online content protection</li>
                  <li><strong>• International Law Firms:</strong> Global coverage for cross-border enforcement</li>
                  <li><strong>• DMCA Specialists:</strong> Experts in takedown procedures and safe harbor law</li>
                  <li><strong>• Litigation Partners:</strong> Trial lawyers for complex infringement cases</li>
                  <li><strong>• Regulatory Advisors:</strong> Guidance on evolving AI and digital content laws</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Services available:</h4>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>• Immediate legal consultation for copyright violations</li>
                  <li>• Automated legal action initiation</li>
                  <li>• Cross-jurisdictional enforcement coordination</li>
                  <li>• Settlement negotiation and litigation support</li>
                  <li>• Preventive legal strategy development</li>
                </ul>
              </div>
              
              <p className="text-sm">All network attorneys are verified, rated by previous clients, and specialized in digital content protection.</p>
            </div>
          )
        },
        {
          question: "How do I access legal help through the network?",
          answer: (
            <div>
              <p className="mb-3">Accessing legal help through our Global Legal Network is streamlined and efficient:</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Process:</h4>
                <ol className="ml-4 space-y-2 text-sm list-decimal">
                  <li><strong>Case Assessment:</strong> Our AI analyzes your copyright violation and recommends legal action</li>
                  <li><strong>Jurisdiction Matching:</strong> System identifies the appropriate legal jurisdiction and specialties needed</li>
                  <li><strong>Attorney Matching:</strong> Algorithm matches you with qualified attorneys in your area or the relevant jurisdiction</li>
                  <li><strong>Instant Connection:</strong> Direct contact with pre-screened legal professionals</li>
                  <li><strong>Case Initiation:</strong> Attorney can immediately begin work using our violation documentation</li>
                  <li><strong>Progress Tracking:</strong> Monitor legal action progress through your dashboard</li>
                </ol>
              </div>
              
              <p className="text-sm">Most users connect with an attorney within 2-4 hours of initiating a legal action request.</p>
            </div>
          )
        },
        {
          question: "What are the costs for using the Global Legal Network?",
          answer: "Legal network access is included with Professional and Enterprise plans. Consultation fees and legal service costs vary by attorney and case complexity. Many attorneys offer contingency arrangements for strong copyright cases. Initial consultations are often discounted for TSMO Watch users, and we pre-negotiate favorable rates with network partners."
        }
      ]
    },
    {
      title: "Production Legal Processor",
      items: [
        {
          question: "What is the Production Legal Processor and how does it automate legal actions?",
          answer: (
            <div>
              <p className="mb-3">The <strong>Production Legal Processor</strong> is an AI-powered system that automatically generates, customizes, and files legal documents when copyright violations are detected.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Automated capabilities:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• Document Generation:</strong> Creates DMCA takedowns, cease & desist letters, and copyright claims</li>
                  <li><strong>• Legal Research:</strong> Analyzes relevant case law and precedents for your situation</li>
                  <li><strong>• Jurisdiction Compliance:</strong> Ensures documents meet local legal requirements</li>
                  <li><strong>• Evidence Compilation:</strong> Automatically gathers proof of violation and ownership</li>
                  <li><strong>• Multi-Platform Filing:</strong> Submits takedown requests to appropriate platforms</li>
                  <li><strong>• Follow-up Tracking:</strong> Monitors response times and escalates when necessary</li>
                  <li><strong>• Legal Strategy AI:</strong> Recommends optimal enforcement approaches</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Document types automated:</h4>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>• DMCA takedown notices (platforms, hosts, search engines)</li>
                  <li>• Cease and desist letters (direct to infringers)</li>
                  <li>• Copyright infringement claims</li>
                  <li>• Platform-specific violation reports</li>
                  <li>• International copyright enforcement requests</li>
                  <li>• Settlement demand letters</li>
                </ul>
              </div>
              
              <p className="text-sm">The system reduces legal response time from days to hours and ensures consistent, professional legal communication.</p>
            </div>
          )
        },
        {
          question: "How accurate is the AI-generated legal documentation?",
          answer: (
            <div>
              <p className="mb-3">Our legal AI achieves 97% accuracy in document generation and is continuously supervised by qualified attorneys:</p>
              
              <ul className="ml-4 space-y-2 text-sm">
                <li><strong>• Legal Review:</strong> All templates reviewed by IP law specialists</li>
                <li><strong>• Precedent Database:</strong> Trained on 50,000+ successful legal documents</li>
                <li><strong>• Jurisdiction Compliance:</strong> Automatically adapts to local legal requirements</li>
                <li><strong>• Success Rate:</strong> 94% takedown success rate with AI-generated documents</li>
                <li><strong>• Human Oversight:</strong> Complex cases automatically flagged for attorney review</li>
                <li><strong>• Continuous Learning:</strong> System improves based on response outcomes</li>
              </ul>
              
              <p className="mt-3 text-sm">For high-stakes cases, we recommend attorney review before filing, which is available through our Global Legal Network.</p>
            </div>
          )
        },
        {
          question: "Can the system handle international copyright enforcement?",
          answer: "Yes, the Production Legal Processor supports international enforcement across 150+ countries. It automatically adapts documents to comply with local copyright laws, treaties (Berne Convention, WIPO), and platform-specific requirements. The system includes templates for major international platforms and can coordinate with our Global Legal Network for complex cross-border cases."
        }
      ]
    },
    {
      title: "Blockchain Registry & Verification",
      items: [
        {
          question: "What is the Blockchain Registry and how does it work?",
          answer: (
            <div>
              <p className="mb-3">The <strong>Blockchain Registry</strong> provides immutable, cryptographically-secured proof of ownership and creation for your digital assets using distributed ledger technology.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">How it works:</h4>
                <ol className="ml-4 space-y-2 text-sm list-decimal">
                  <li><strong>Content Analysis:</strong> System generates cryptographic fingerprints of your content</li>
                  <li><strong>Blockchain Registration:</strong> Fingerprints and metadata recorded on multiple blockchains</li>
                  <li><strong>Smart Contract Deployment:</strong> Automated smart contracts establish ownership and rights</li>
                  <li><strong>Certificate Generation:</strong> Immutable ownership certificates with legal validity</li>
                  <li><strong>Verification Network:</strong> Distributed nodes validate and maintain ownership records</li>
                  <li><strong>Cross-Chain Sync:</strong> Ownership records synchronized across multiple blockchains</li>
                </ol>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Supported blockchains:</h4>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>• Ethereum (primary network for maximum compatibility)</li>
                  <li>• Polygon (low-cost, high-speed transactions)</li>
                  <li>• Arbitrum (Layer 2 scaling solution)</li>
                  <li>• IPFS (decentralized content storage)</li>
                </ul>
              </div>
              
              <p className="text-sm">Blockchain registration provides court-admissible proof of ownership and creation dates that cannot be forged or manipulated.</p>
            </div>
          )
        },
        {
          question: "How much does blockchain registration cost?",
          answer: (
            <div>
              <p className="mb-3">Blockchain registration costs vary based on network conditions and package options:</p>
              
              <ul className="ml-4 space-y-2 text-sm">
                <li><strong>• Basic Registration:</strong> $5-15 per asset (single blockchain)</li>
                <li><strong>• Multi-Chain Protection:</strong> $15-35 per asset (3+ blockchains)</li>
                <li><strong>• Batch Registration:</strong> 30% discount for 10+ assets</li>
                <li><strong>• Enterprise Packages:</strong> Custom pricing for large portfolios</li>
                <li><strong>• Gas Optimization:</strong> Automatic batching reduces transaction costs</li>
              </ul>
              
              <p className="mt-3 text-sm">Professional and Enterprise plan subscribers receive monthly blockchain registration credits and priority processing.</p>
            </div>
          )
        },
        {
          question: "Is blockchain registration legally recognized?",
          answer: "Yes, blockchain registration creates legally admissible evidence of ownership and creation dates. While laws vary by jurisdiction, blockchain records are increasingly recognized in courts worldwide as valid proof of intellectual property rights. Our blockchain certificates include proper legal documentation and comply with international digital evidence standards."
        }
      ]
    },
    {
      title: "Enterprise Features & Edge Functions",
      items: [
        {
          question: "What are Edge Functions and how do they enhance protection?",
          answer: (
            <div>
              <p className="mb-3"><strong>Edge Functions</strong> are distributed computing nodes that provide real-time, high-performance content protection processing across global locations.</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Current deployments:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• 15+ Active Edge Functions:</strong> Real-time algorithms deployed across global CDN</li>
                  <li><strong>• Multi-Modal Processing:</strong> Voice, video, image, and 3D content analysis</li>
                  <li><strong>• Blockchain Integration:</strong> Smart contract automation and verification</li>
                  <li><strong>• Legal Automation:</strong> Document generation and filing systems</li>
                  <li><strong>• API Gateway:</strong> Secure government and enterprise API access</li>
                  <li><strong>• Real-time Monitoring:</strong> Live scanning and threat detection</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Performance benefits:</h4>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>• 280-350ms average processing time for multi-modal analysis</li>
                  <li>• 99.9% uptime with automatic failover</li>
                  <li>• Global distribution for reduced latency</li>
                  <li>• Scalable architecture handling 10M+ requests daily</li>
                  <li>• Real-time response for critical threat detection</li>
                </ul>
              </div>
              
              <p className="text-sm">Edge Functions enable enterprise-grade performance and reliability for mission-critical content protection.</p>
            </div>
          )
        },
        {
          question: "What enterprise features are available for large organizations?",
          answer: (
            <div>
              <p className="mb-3">TSMO Watch provides comprehensive enterprise features designed for large organizations, creative agencies, and studios:</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Enterprise capabilities:</h4>
                <ul className="ml-4 space-y-2 text-sm">
                  <li><strong>• Unlimited Portfolio Monitoring:</strong> Protect thousands of assets simultaneously</li>
                  <li><strong>• Multi-User Management:</strong> Team accounts with role-based access control</li>
                  <li><strong>• Custom API Integration:</strong> White-label solutions and workflow integration</li>
                  <li><strong>• Dedicated Support:</strong> 24/7 priority support with dedicated account managers</li>
                  <li><strong>• Advanced Analytics:</strong> Comprehensive reporting and threat intelligence</li>
                  <li><strong>• Bulk Operations:</strong> Mass upload, batch processing, and automated workflows</li>
                  <li><strong>• Custom Legal Templates:</strong> Organization-specific legal document templates</li>
                  <li><strong>• Compliance Reporting:</strong> Automated compliance reports for audits and governance</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Integration options:</h4>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>• Adobe Creative Suite plugins</li>
                  <li>• Content management system integrations</li>
                  <li>• Social media management platform APIs</li>
                  <li>• Digital asset management (DAM) systems</li>
                  <li>• Custom webhook and notification systems</li>
                </ul>
              </div>
              
              <p className="text-sm">Enterprise features scale from 100 to 100,000+ protected assets with custom pricing and deployment options.</p>
            </div>
          )
        },
        {
          question: "How does TSMO Watch ensure 99.9% uptime for enterprise clients?",
          answer: (
            <div>
              <p className="mb-3">Our enterprise infrastructure includes multiple redundancy layers and monitoring systems:</p>
              
              <ul className="ml-4 space-y-2 text-sm">
                <li><strong>• Multi-Region Deployment:</strong> Services deployed across 5+ geographic regions</li>
                <li><strong>• Automatic Failover:</strong> Instant switching to backup systems during outages</li>
                <li><strong>• Load Balancing:</strong> Intelligent traffic distribution for optimal performance</li>
                <li><strong>• Real-time Monitoring:</strong> 24/7 system health monitoring with instant alerts</li>
                <li><strong>• Database Replication:</strong> Multi-region database backups with instant recovery</li>
                <li><strong>• Edge CDN:</strong> Global content delivery network for low-latency access</li>
                <li><strong>• SLA Guarantees:</strong> Service level agreements with uptime credits</li>
              </ul>
              
              <p className="mt-3 text-sm">Enterprise clients receive priority routing, dedicated resources, and guaranteed response times with financial SLA backing.</p>
            </div>
          )
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