import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Digital Artist",
      content: "This AI bot saved my career. It found my stolen artwork on 15 different sites within hours of uploading. The automated takedown process was seamless.",
      avatar: "/placeholder.svg",
      initials: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Photographer",
      content: "As a professional photographer, IP theft was costing me thousands. Now I sleep peacefully knowing my work is protected 24/7 by advanced AI.",
      avatar: "/placeholder.svg", 
      initials: "MR"
    },
    {
      name: "Elena Vasquez",
      role: "Illustrator",
      content: "The blockchain verification feature gave me the legal proof I needed to win my copyright case. This platform is a game-changer for artists.",
      avatar: "/placeholder.svg",
      initials: "EV"
    },
    {
      name: "David Kim",
      role: "Graphic Designer",
      content: "The community aspect is incredible. I've learned so much about protecting my work and even helped other artists with their IP issues.",
      avatar: "/placeholder.svg",
      initials: "DK"
    },
    {
      name: "Maria Santos",
      role: "Fine Artist",
      content: "The legal support integration connected me directly with IP specialists. What used to take weeks now happens in days.",
      avatar: "/placeholder.svg",
      initials: "MS"
    },
    {
      name: "James Wilson",
      role: "Creative Director",
      content: "Managing IP protection for our entire studio used to be a nightmare. This AI solution scaled perfectly with our growing portfolio.",
      avatar: "/placeholder.svg",
      initials: "JW"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-secondary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Trusted by Artists Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of artists who have protected their work and secured their livelihood
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                      {testimonial.name}
                    </p>
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