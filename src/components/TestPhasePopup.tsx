import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TestPhasePopupProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  autoShow?: boolean;
}

export const TestPhasePopup = ({ 
  isOpen: externalIsOpen, 
  onOpenChange, 
  autoShow = true 
}: TestPhasePopupProps = {}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;

  useEffect(() => {
    if (autoShow) {
      // Check if user has seen the popup before
      const hasSeenPopup = localStorage.getItem("tsmo-test-popup-seen");
      
      if (!hasSeenPopup) {
        setIsOpen(true);
      }
    }
  }, [autoShow, setIsOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (autoShow) {
      localStorage.setItem("tsmo-test-popup-seen", "true");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold text-primary">
                TSMO Test Phase
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                TSMO is currently in the TEST phase. Please review the site and complete this form to provide your feedback. On the bottom of the form, please state what kind of artist you are and how long you have been producing artwork.
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSeCWFjPu-wdbk67qjxokQaXmBqJ6UQjrTB97R1CXONe9-f6Ug/viewform?embedded=true"
            width="100%"
            height="600"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            className="rounded-lg"
          >
            Loading…
          </iframe>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button onClick={handleClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};