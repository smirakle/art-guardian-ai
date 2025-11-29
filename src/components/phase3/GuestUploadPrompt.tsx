import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GuestUploadPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploadCount: number;
}

export const GuestUploadPrompt = ({ open, onOpenChange, uploadCount }: GuestUploadPromptProps) => {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    onOpenChange(false);
    navigate("/auth");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            Document Protected Successfully!
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-foreground mb-1">Your document is now protected</p>
                <p className="text-sm text-muted-foreground">
                  {uploadCount === 1 
                    ? "1 document has been"
                    : `${uploadCount} documents have been`} secured with AI protection.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-foreground font-medium">Create an account to:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Save and manage your protected documents</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Track unauthorized usage across the web</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Access advanced protection features</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button onClick={handleCreateAccount} className="flex-1">
                Create Free Account
              </Button>
              <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
                Continue as Guest
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Guest uploads are stored for 7 days. Create an account to keep them permanently.
            </p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
