import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowRight,
  Eye, 
  Activity, 
  Link2, 
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const Contact = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string
    };

    try {
      console.log("Sending contact form data:", data);

      const { data: result, error } = await supabase.functions.invoke('send-contact-email', {
        body: data
      });

      if (error) {
        console.error("Error sending email:", error);
        throw error;
      }

      console.log("Email sent successfully:", result);

      toast({
        title: "Message Sent Successfully!",
        description: `Thank you ${data.firstName}! We'll get back to you within 24 hours.`,
      });

      (e.target as HTMLFormElement).reset();

    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error Sending Message",
        description: "Sorry, there was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Contact Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Protect Your Art?
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get started with a free consultation or reach out to our team for any questions.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Card className="border-0 shadow-lg max-w-md w-full">
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Send us an email directly
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center mb-6">
                  <Mail className="h-12 w-12 text-primary" />
                </div>
                <a 
                  href="mailto:shirleena.cunningham@tsmowatch.com"
                  className="text-lg font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  shirleena.cunningham@tsmowatch.com
                </a>
                <p className="text-muted-foreground mt-4">
                  Click to open your email client and send us a message
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Protect Your Creative Work
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of artists who trust TSMO to protect their creative work. 
            Start your free trial today and see the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="px-8 py-3 text-lg"
              onClick={() => window.open('/auth', '_blank')}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-primary"
              onClick={() => window.open('https://calendly.com/tsmo-legal/consultation', '_blank')}
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;