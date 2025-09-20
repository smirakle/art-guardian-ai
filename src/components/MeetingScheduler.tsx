import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  User, 
  Building, 
  MessageSquare,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface MeetingFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  meetingType: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  message: string;
  investmentInterest: string;
}

const MeetingScheduler = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MeetingFormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    meetingType: '',
    preferredDate: '',
    preferredTime: '',
    timezone: '',
    message: '',
    investmentInterest: ''
  });

  const meetingTypes = [
    { value: 'product-demo', label: 'Product Demo' },
    { value: 'investor-meeting', label: 'Investor Meeting' },
    { value: 'partnership', label: 'Partnership Discussion' },
    { value: 'enterprise-consultation', label: 'Enterprise Consultation' },
    { value: 'technical-deep-dive', label: 'Technical Deep Dive' }
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const timezones = [
    { value: 'PST', label: 'Pacific Standard Time (PST)' },
    { value: 'MST', label: 'Mountain Standard Time (MST)' },
    { value: 'CST', label: 'Central Standard Time (CST)' },
    { value: 'EST', label: 'Eastern Standard Time (EST)' },
    { value: 'GMT', label: 'Greenwich Mean Time (GMT)' },
    { value: 'CET', label: 'Central European Time (CET)' }
  ];

  const investmentRanges = [
    { value: 'under-100k', label: 'Under $100K' },
    { value: '100k-500k', label: '$100K - $500K' },
    { value: '500k-1m', label: '$500K - $1M' },
    { value: '1m-5m', label: '$1M - $5M' },
    { value: 'over-5m', label: 'Over $5M' },
    { value: 'not-investor', label: 'Not an investor' }
  ];

  const handleInputChange = (field: keyof MeetingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('schedule-meeting', {
        body: formData
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Meeting Request Sent!",
        description: "Thank you for your interest. We'll contact you within 24 hours to confirm your meeting.",
      });

      setIsOpen(false);
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        meetingType: '',
        preferredDate: '',
        preferredTime: '',
        timezone: '',
        message: '',
        investmentInterest: ''
      });
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.meetingType && 
                      formData.preferredDate && formData.preferredTime && formData.timezone;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="px-8">
          <Calendar className="mr-2 h-5 w-5" />
          Schedule Meeting
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Schedule a Meeting with TSMO
          </DialogTitle>
          <DialogDescription>
            Book a meeting to discuss investment opportunities, product demos, partnerships, or technical deep dives.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your full name"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@company.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company/Organization</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Your company name"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Meeting Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="meetingType">Meeting Type *</Label>
              <Select value={formData.meetingType} onValueChange={(value) => handleInputChange('meetingType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meeting type" />
                </SelectTrigger>
                <SelectContent>
                  {meetingTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Preferred Date *</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredTime">Preferred Time *</Label>
                <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange('preferredTime', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone *</Label>
                <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Investment Interest (conditional) */}
          {formData.meetingType === 'investor-meeting' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Investment Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="investmentInterest">Investment Range</Label>
                <Select value={formData.investmentInterest} onValueChange={(value) => handleInputChange('investmentInterest', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select investment range" />
                  </SelectTrigger>
                  <SelectContent>
                    {investmentRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Tell us more about your interest in TSMO, specific topics you'd like to discuss, or any questions you have..."
                rows={4}
              />
            </div>
          </div>

          {/* Meeting Types Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Meeting Types:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div><strong>Product Demo:</strong> 30-45 min live demonstration of TSMO Technology</div>
                <div><strong>Investor Meeting:</strong> 60 min comprehensive presentation with Q&A</div>
                <div><strong>Partnership:</strong> 45 min discussion about potential collaborations</div>
                <div><strong>Enterprise Consultation:</strong> 60 min tailored enterprise solution review</div>
                <div><strong>Technical Deep Dive:</strong> 60 min detailed technical architecture review</div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Schedule Meeting
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingScheduler;