import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Quote, Star, BadgeCheck, FileText, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah C.",
      role: "Digital Artist",
      content: "Found my stolen artwork on 12 different sites within the first week. The automated takedown process saved me hours of work.",
      initials: "SC",
      rating: 5,
      verified: true,
      badge: "Beta Tester"
    },
    {
      name: "Marcus R.",
      role: "Photographer",
      content: "As a professional photographer, IP theft was a constant worry. Now I get real-time alerts whenever my images appear online without permission.",
      initials: "MR",
      rating: 5,
      verified: true,
      badge: "Beta Tester"
    },
    {
      name: "Elena V.",
      role: "Illustrator",
      content: "The ownership verification feature gave me documented proof I needed for a copyright dispute. Really impressed with the speed and accuracy.",
      initials: "EV",
      rating: 5,
      verified: true,
      badge: "Beta Tester"
    }
  ];

  const caseStudy = {
    title: "Beta Case Study: Illustrator Recovers Stolen Work",
    description: "A beta tester discovered their character designs being sold on 8 print-on-demand sites without permission.",
    results: [
      "Detected unauthorized use within 48 hours of upload",
      "Generated ownership documentation automatically",
      "5 of 8 sites removed content within 2 weeks",
      "Ongoing monitoring prevented re-uploads"
    ],
    quote: "I had been trying to track down my stolen art for months manually. TSMO Watch found instances I never would have discovered on my own.",
    author: "Beta Tester, Character Designer"
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? "fill-amber-400 text-amber-400" 
            : "fill-muted text-muted"
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-b from-secondary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <BadgeCheck className="w-3 h-3 mr-1" />
            Early Feedback
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-display">
            What Our Beta Testers Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real feedback from artists who helped us build and test the platform
          </p>
        </div>

        {/* Beta Feedback Disclaimer */}
        <Alert className="max-w-2xl mx-auto mb-10 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
            These testimonials are from our beta testing phase (2024). Individual results may vary. 
            We're continuously improving based on user feedback.
          </AlertDescription>
        </Alert>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-border/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <Quote className="w-8 h-8 text-primary/20" />
                  <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700">
                    {testimonial.badge}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-0.5 mb-3">
                  {renderStars(testimonial.rating)}
                </div>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 ring-2 ring-primary/10 ring-offset-2 ring-offset-background">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                        {testimonial.name}
                      </p>
                      {testimonial.verified && (
                        <BadgeCheck className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Case Study Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <Badge variant="outline" className="text-xs">Case Study</Badge>
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                {caseStudy.title}
              </h3>
              
              <p className="text-muted-foreground mb-6">
                {caseStudy.description}
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-3 text-foreground">Results:</h4>
                  <ul className="space-y-2">
                    {caseStudy.results.map((result, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <Quote className="w-6 h-6 text-primary/40 mb-2" />
                  <p className="text-sm italic text-muted-foreground mb-3">
                    "{caseStudy.quote}"
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    — {caseStudy.author}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground border-t pt-4 mt-4">
                * This case study represents a real beta tester experience. Results may vary based on usage and circumstances.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;