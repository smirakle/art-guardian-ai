import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HelpCircle, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface FindingExplanationPopoverProps {
  type: 'deepfake' | 'copyright' | 'ai_training';
}

const explanations = {
  deepfake: {
    title: "What is a deepfake?",
    description: "A deepfake is when someone uses AI to put your face into a fake photo or video. This can be used to make it look like you said or did something you never did.",
    impact: "This can damage your reputation and spread misinformation.",
    action: "We can help you send a takedown request to have it removed."
  },
  copyright: {
    title: "What does this mean?",
    description: "Someone is using your artwork without your permission. They might be selling it, posting it as their own, or using it on their website.",
    impact: "This means someone is profiting from or taking credit for your work.",
    action: "You can send a DMCA notice to have the content removed."
  },
  ai_training: {
    title: "What is AI training?",
    description: "AI companies collect artwork to teach their AI systems how to create images. Your art may have been included in this training data without asking you.",
    impact: "AI can now create images that look like your unique style.",
    action: "You can opt-out and request removal from training datasets."
  }
};

export const FindingExplanationPopover = ({ type }: FindingExplanationPopoverProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const explanation = explanations[type];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          <HelpCircle className="h-4 w-4" />
          What does this mean?
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">{explanation.title}</h4>
          <p className="text-sm text-muted-foreground">{explanation.description}</p>
          <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              <strong>Why it matters:</strong> {explanation.impact}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>What you can do:</strong> {explanation.action}
          </p>
          
          {!user && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">
                Create a free account to track and manage all your findings
              </p>
              <Button 
                size="sm" 
                variant="outline"
                className="w-full"
                onClick={() => navigate('/auth')}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Free Account
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
