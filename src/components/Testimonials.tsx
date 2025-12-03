import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Quote, Star, BadgeCheck } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Digital Artist",
      content: "This AI bot saved my career. It found my stolen artwork on 15 different sites within hours of uploading. The automated takedown process was seamless.",
      avatar: "/placeholder.svg",
      initials: "SC",
      rating: 5,
      verified: true,
      badge: "Pro User"
    },
    {
      name: "Marcus Rodriguez",
      role: "Photographer",
      content: "As a professional photographer, IP theft was costing me thousands. Now I sleep peacefully knowing my work is protected 24/7 by advanced AI.",
      avatar: "/placeholder.svg", 
      initials: "MR",
      rating: 5,
      verified: true,
      badge: "Since 2023"
    },
    {
      name: "Elena Vasquez",
      role: "Illustrator",
      content: "The blockchain verification feature gave me the legal proof I needed to win my copyright case. This platform is a game-changer for artists.",
      avatar: "/placeholder.svg",
      initials: "EV",
      rating: 5,
      verified: true,
      badge: "Verified Artist"
    },
    {
      name: "David Kim",
      role: "Graphic Designer",
      content: "The community aspect is incredible. I've learned so much about protecting my work and even helped other artists with their IP issues.",
      avatar: "/placeholder.svg",
      initials: "DK",
      rating: 4,
      verified: true,
      badge: "Community Star"
    },
    {
      name: "Maria Santos",
      role: "Fine Artist",
      content: "The legal support integration connected me directly with IP specialists. What used to take weeks now happens in days.",
      avatar: "/placeholder.svg",
      initials: "MS",
      rating: 5,
      verified: true,
      badge: "Enterprise"
    },
    {
      name: "James Wilson",
      role: "Creative Director",
      content: "Managing IP protection for our entire studio used to be a nightmare. This AI solution scaled perfectly with our growing portfolio.",
      avatar: "/placeholder.svg",
      initials: "JW",
      rating: 5,
      verified: true,
      badge: "Team Plan"
    }
  ];

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
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <BadgeCheck className="w-3 h-3 mr-1" />
            Trusted Platform
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-display">
            Trusted by Artists Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of artists who have protected their work and secured their livelihood
          </p>
          
          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">4.9/5</span>
              <span>average rating</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <div className="hidden sm:flex items-center gap-1">
              <span className="font-semibold">15,000+</span>
              <span>verified reviews</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-border/50 relative overflow-hidden"
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardContent className="p-6 relative">
                {/* Header with badge */}
                <div className="flex items-start justify-between mb-4">
                  <Quote className="w-8 h-8 text-primary/20" />
                  <Badge variant="outline" className="text-xs bg-background/80">
                    {testimonial.badge}
                  </Badge>
                </div>
                
                {/* Star rating */}
                <div className="flex items-center gap-0.5 mb-3">
                  {renderStars(testimonial.rating)}
                </div>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 ring-2 ring-primary/10 ring-offset-2 ring-offset-background">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
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
      </div>
    </section>
  );
};

export default Testimonials;