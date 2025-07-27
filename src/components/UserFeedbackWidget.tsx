import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Heart, 
  Bug, 
  Lightbulb, 
  Star,
  Send,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackType {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

const UserFeedbackWidget: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes: FeedbackType[] = [
    {
      id: 'bug',
      label: 'Bug Report',
      icon: Bug,
      color: 'bg-red-500',
      description: 'Something is broken or not working'
    },
    {
      id: 'feature',
      label: 'Feature Request',
      icon: Lightbulb,
      color: 'bg-blue-500',
      description: 'Suggest a new feature or improvement'
    },
    {
      id: 'compliment',
      label: 'Compliment',
      icon: Heart,
      color: 'bg-green-500',
      description: 'Share what you love about TSMO'
    },
    {
      id: 'general',
      label: 'General Feedback',
      icon: MessageSquare,
      color: 'bg-purple-500',
      description: 'Any other thoughts or suggestions'
    }
  ];

  const handleSubmit = async () => {
    if (!selectedType || !feedback.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a feedback type and enter your message.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: user?.email || 'Anonymous User',
          email: user?.email || 'anonymous@tsmo.app',
          subject: `User Feedback: ${feedbackTypes.find(t => t.id === selectedType)?.label}`,
          message: `
Feedback Type: ${feedbackTypes.find(t => t.id === selectedType)?.label}
Rating: ${rating > 0 ? `${rating}/5 stars` : 'Not provided'}
User ID: ${user?.id || 'Anonymous'}

Message:
${feedback}
          `,
          type: 'feedback'
        }
      });

      if (error) throw error;

      toast({
        title: "Feedback Sent!",
        description: "Thank you for your feedback. We appreciate your input!",
      });

      // Reset form
      setSelectedType('');
      setFeedback('');
      setRating(0);
      setIsOpen(false);

    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-6 left-6 z-40 shadow-lg bg-white/95 backdrop-blur-sm border-2"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Feedback
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Share Your Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve TSMO by sharing your thoughts, reporting bugs, or suggesting features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feedback Type Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              What type of feedback do you have?
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                
                return (
                  <Button
                    key={type.id}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => setSelectedType(type.id)}
                    className={`h-auto p-3 justify-start ${
                      isSelected ? type.color : ''
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <div className="text-sm font-medium">{type.label}</div>
                      <div className="text-xs opacity-80">{type.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Rating (Optional) */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Rate your overall experience (optional)
            </Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  onClick={() => setRating(star)}
                  className="p-1 h-auto"
                >
                  <Star 
                    className={`w-6 h-6 ${
                      star <= rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                </Button>
              ))}
            </div>
          </div>

          {/* Feedback Message */}
          <div>
            <Label htmlFor="feedback" className="text-sm font-medium mb-2 block">
              Your feedback *
            </Label>
            <Textarea
              id="feedback"
              placeholder="Tell us more about your experience, what you'd like to see improved, or any issues you've encountered..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Privacy Notice */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p>
              Your feedback helps us improve TSMO. We may contact you for follow-up questions if needed.
              {!user && " Consider signing in to help us track improvements to issues you've reported."}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedType || !feedback.trim()}
              className="gap-2"
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Feedback
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserFeedbackWidget;