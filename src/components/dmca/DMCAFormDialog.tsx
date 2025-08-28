import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Send } from "lucide-react";

interface DMCAFormDialogProps {
  matchId: string;
  sourceUrl: string;
  sourceTitle: string;
}

export function DMCAFormDialog({ matchId, sourceUrl, sourceTitle }: DMCAFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    copyrightOwnerName: "",
    copyrightOwnerEmail: "",
    copyrightOwnerAddress: "",
    copyrightWorkDescription: "",
    infringingUrl: sourceUrl,
    infringingDescription: "",
    goodFaithStatement: true,
    accuracyStatement: true,
    electronicSignature: ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.electronicSignature) {
      toast({
        title: "Signature Required",
        description: "Please provide your electronic signature to submit the DMCA notice.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check rate limit first
      const { data: rateLimitData, error: rateLimitError } = await supabase.functions.invoke('filing-rate-limiter', {
        body: {
          userId: formData.copyrightOwnerEmail,
          filingType: 'dmca_filing',
          action: 'check'
        }
      });

      if (rateLimitError) {
        console.warn('Rate limit check failed, proceeding anyway:', rateLimitError);
      } else if (rateLimitData && !rateLimitData.allowed) {
        toast({
          title: "Rate Limit Exceeded",
          description: rateLimitData.message,
          variant: "destructive"
        });
        return;
      }

      // Call edge function to process DMCA filing
      const { data, error } = await supabase.functions.invoke('file-dmca-notice', {
        body: {
          matchId,
          ...formData,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;

      toast({
        title: "DMCA Notice Filed & Sent",
        description: "Your DMCA takedown notice has been filed and sent via email to the platform's DMCA agent. You'll receive a confirmation email shortly.",
      });

      setOpen(false);
      setFormData({
        copyrightOwnerName: "",
        copyrightOwnerEmail: "",
        copyrightOwnerAddress: "",
        copyrightWorkDescription: "",
        infringingUrl: sourceUrl,
        infringingDescription: "",
        goodFaithStatement: true,
        accuracyStatement: true,
        electronicSignature: ""
      });
    } catch (error) {
      console.error('DMCA filing error:', error);
      toast({
        title: "Filing Failed",
        description: "There was an error filing your DMCA notice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          File DMCA Now
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            File DMCA Takedown Notice
          </DialogTitle>
          <DialogDescription>
            Submit a formal DMCA takedown notice to request removal of infringing content. This will send a real legal notice via email to the platform's copyright agent.
          </DialogDescription>
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            ✓ Live Filing: This will send a real DMCA notice via email to the platform's copyright agent
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="copyrightOwnerName">Copyright Owner Name *</Label>
              <Input
                id="copyrightOwnerName"
                value={formData.copyrightOwnerName}
                onChange={(e) => setFormData(prev => ({ ...prev, copyrightOwnerName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="copyrightOwnerEmail">Email Address *</Label>
              <Input
                id="copyrightOwnerEmail"
                type="email"
                value={formData.copyrightOwnerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, copyrightOwnerEmail: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="copyrightOwnerAddress">Address *</Label>
            <Textarea
              id="copyrightOwnerAddress"
              value={formData.copyrightOwnerAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, copyrightOwnerAddress: e.target.value }))}
              required
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="copyrightWorkDescription">Description of Copyrighted Work *</Label>
            <Textarea
              id="copyrightWorkDescription"
              value={formData.copyrightWorkDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, copyrightWorkDescription: e.target.value }))}
              placeholder="Describe your original copyrighted work that is being infringed..."
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="infringingUrl">Infringing URL</Label>
            <Input
              id="infringingUrl"
              value={formData.infringingUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, infringingUrl: e.target.value }))}
              readOnly
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="infringingDescription">Description of Infringement *</Label>
            <Textarea
              id="infringingDescription"
              value={formData.infringingDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, infringingDescription: e.target.value }))}
              placeholder="Describe how your work is being infringed on this website..."
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="goodFaithStatement"
                checked={formData.goodFaithStatement}
                onChange={(e) => setFormData(prev => ({ ...prev, goodFaithStatement: e.target.checked }))}
                required
                className="mt-1"
              />
              <Label htmlFor="goodFaithStatement" className="text-sm">
                I have a good faith belief that use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law.
              </Label>
            </div>
            
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="accuracyStatement"
                checked={formData.accuracyStatement}
                onChange={(e) => setFormData(prev => ({ ...prev, accuracyStatement: e.target.checked }))}
                required
                className="mt-1"
              />
              <Label htmlFor="accuracyStatement" className="text-sm">
                I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or authorized to act on behalf of the owner.
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="electronicSignature">Electronic Signature *</Label>
            <Input
              id="electronicSignature"
              value={formData.electronicSignature}
              onChange={(e) => setFormData(prev => ({ ...prev, electronicSignature: e.target.value }))}
              placeholder="Type your full legal name as your electronic signature"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              {isSubmitting ? "Sending Notice..." : "Send DMCA Notice Now"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}