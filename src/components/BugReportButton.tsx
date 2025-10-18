import React, { useState } from 'react';
import { Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const BugReportButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both subject and description",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-bug-report', {
        body: {
          subject: subject.trim(),
          description: description.trim(),
          stepsToReproduce: stepsToReproduce.trim(),
          userEmail: user?.email || 'Anonymous',
          userId: user?.id || 'anonymous',
          currentPage: window.location.pathname,
          userAgent: navigator.userAgent,
          screenSize: `${window.screen.width}x${window.screen.height}`,
          timestamp: new Date().toISOString(),
        },
      });

      if (error) throw error;

      toast({
        title: "Bug report submitted!",
        description: "Thank you for helping us improve TSMO.",
      });

      // Reset form
      setSubject('');
      setDescription('');
      setStepsToReproduce('');
      setOpen(false);
    } catch (error) {
      console.error('Error submitting bug report:', error);
      toast({
        title: "Failed to submit report",
        description: "Please try again or contact support directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50 shadow-lg"
        >
          <Bug className="h-4 w-4 mr-2" />
          Report Bug
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report a Bug</DialogTitle>
          <DialogDescription>
            Help us improve TSMO by reporting any issues you encounter.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief description of the issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Detailed description of what went wrong"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="steps">Steps to Reproduce (Optional)</Label>
            <Textarea
              id="steps"
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
              value={stepsToReproduce}
              onChange={(e) => setStepsToReproduce(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Your report will include:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Current page: {window.location.pathname}</li>
              <li>User: {user?.email || 'Anonymous'}</li>
              <li>Browser information</li>
            </ul>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
