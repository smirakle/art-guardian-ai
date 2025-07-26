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