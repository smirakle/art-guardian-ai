import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, FileText, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BetaTestingAgreementProps {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
}

export const BetaTestingAgreement = ({ accepted, onAcceptedChange }: BetaTestingAgreementProps) => {
  const [showFullAgreement, setShowFullAgreement] = useState(false);

  const agreementContent = (
    <div className="space-y-6 text-sm">
      <div className="text-center pb-4 border-b">
        <h3 className="text-xl font-bold text-foreground">BETA TESTING PROGRAM</h3>
        <p className="text-lg font-semibold text-muted-foreground">Acknowledgement and Agreement</p>
        <p className="text-xs text-muted-foreground mt-2">Last Updated: November 2025</p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Critical Notice:</strong> By participating in the TSMO Beta Testing Program, you acknowledge and agree to all terms below. Please read carefully before proceeding.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <section>
          <h4 className="font-bold text-base mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">1</span>
            Beta Software Notice
          </h4>
          <ul className="list-disc ml-8 space-y-1 text-muted-foreground">
            <li>This platform is currently in <strong>BETA testing phase</strong></li>
            <li>Features may be incomplete, unstable, or subject to change without notice</li>
            <li>The service may experience downtime, data loss, or unexpected behavior</li>
            <li>No warranties are provided regarding accuracy, reliability, or availability</li>
          </ul>
        </section>

        <section>
          <h4 className="font-bold text-base mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">2</span>
            AI Technology Limitations
          </h4>
          <ul className="list-disc ml-8 space-y-1 text-muted-foreground">
            <li>AI deepfake detection is <strong>not 100% accurate</strong> and should not be solely relied upon for critical decisions</li>
            <li>Results must be verified by human experts for important use cases</li>
            <li>False positives and false negatives may occur</li>
            <li>The technology is continuously improving but not infallible</li>
          </ul>
        </section>

        <section>
          <h4 className="font-bold text-base mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">3</span>
            Data and Privacy
          </h4>
          <ul className="list-disc ml-8 space-y-1 text-muted-foreground">
            <li>Your usage data, feedback, and uploaded content may be analyzed to improve the platform</li>
            <li>All data is handled in accordance with our Privacy Policy</li>
            <li>We implement industry-standard security measures, but no system is completely secure</li>
            <li>You should not upload highly sensitive or confidential material during beta testing</li>
          </ul>
        </section>

        <section>
          <h4 className="font-bold text-base mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">4</span>
            Feedback and Communication
          </h4>
          <ul className="list-disc ml-8 space-y-1 text-muted-foreground">
            <li>Your feedback is valuable and helps us improve the platform</li>
            <li>By providing feedback, you grant us the right to use it for product development</li>
            <li>We may contact you regarding your beta testing experience</li>
          </ul>
        </section>

        <section>
          <h4 className="font-bold text-base mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">5</span>
            Service Availability
          </h4>
          <ul className="list-disc ml-8 space-y-1 text-muted-foreground">
            <li>Beta access may be modified, suspended, or terminated at any time</li>
            <li>Usage limits apply and may change during the beta period</li>
            <li>No guarantee of service continuity after beta period ends</li>
          </ul>
        </section>

        <section>
          <h4 className="font-bold text-base mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">6</span>
            Limitation of Liability
          </h4>
          <ul className="list-disc ml-8 space-y-1 text-muted-foreground">
            <li>Use of this beta software is <strong>at your own risk</strong></li>
            <li>We are not liable for any damages resulting from beta software use</li>
            <li>This service is provided "as is" without warranties of any kind</li>
          </ul>
        </section>

        <section>
          <h4 className="font-bold text-base mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">7</span>
            Promotional Access
          </h4>
          <ul className="list-disc ml-8 space-y-1 text-muted-foreground">
            <li>Beta testers receive complimentary access for testing purposes only</li>
            <li>This is not a guarantee of future free access</li>
            <li>Pricing and features may change at launch</li>
          </ul>
        </section>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Acceptance:</strong> By checking the agreement box and clicking "I Agree" or continuing to use the platform, you confirm that you have read, understood, and agree to these terms.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-sm">
          <strong>Beta Testing Agreement Required:</strong> You must read and accept our Beta Testing Agreement to proceed with checkout.
        </AlertDescription>
      </Alert>

      <div className="border rounded-lg p-4 bg-card space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox 
            id="beta-agreement" 
            checked={accepted}
            onCheckedChange={(checked) => onAcceptedChange(!!checked)}
            className="mt-1"
          />
          <div className="flex-1">
            <Label 
              htmlFor="beta-agreement" 
              className="cursor-pointer text-sm leading-relaxed"
            >
              I have read and agree to the{" "}
              <Dialog open={showFullAgreement} onOpenChange={setShowFullAgreement}>
                <DialogTrigger asChild>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-primary underline font-semibold"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowFullAgreement(true);
                    }}
                  >
                    Beta Testing Program Terms and Agreement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Beta Testing Agreement
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[60vh] pr-4">
                    {agreementContent}
                  </ScrollArea>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowFullAgreement(false)}
                    >
                      Close
                    </Button>
                    <Button 
                      onClick={() => {
                        onAcceptedChange(true);
                        setShowFullAgreement(false);
                      }}
                    >
                      I Agree
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              This includes acknowledgement of beta software limitations, AI accuracy disclaimers, and liability terms.
            </p>
          </div>
        </div>

        {!accepted && (
          <Alert variant="default" className="border-blue-500/50 bg-blue-500/10">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-xs">
              Click the link above to review the full Beta Testing Agreement. You must accept to continue.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
