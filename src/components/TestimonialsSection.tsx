import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  rating: number;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Found 47 copies of my art being sold on Etsy without permission. TSMO helped me take them all down within a week.",
    name: "Sarah M.",
    role: "Digital Artist",
    rating: 5,
    initials: "SM"
  },
  {
    quote: "Finally peace of mind knowing my portfolio is being watched 24/7. The alerts are instant and the DMCA templates save hours.",
    name: "James L.",
    role: "Photographer",
    rating: 5,
    initials: "JL"
  },
  {
    quote: "As a freelance illustrator, I don't have time to hunt for theft. TSMO does it for me and the takedown process is seamless.",
    name: "Maria K.",
    role: "Illustrator",
    rating: 5,
    initials: "MK"
  },
  {
    quote: "The AI protection feature is exactly what I needed. My style is mine, and now it stays that way.",
    name: "David R.",
    role: "Concept Artist",
    rating: 5,
    initials: "DR"
  }
];

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
    />
  ));
};

export const TestimonialsSection = () => {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Quote className="h-6 w-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">What Artists Are Saying</h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real creators protecting their work with TSMO
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
            >
              <CardContent className="pt-6">
                <div className="flex gap-0.5 mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                <blockquote className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-primary/10">
                    <AvatarFallback className="text-primary text-sm font-medium">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm">{testimonial.name}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">{testimonial.role}</span>
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

export default TestimonialsSection;
