import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Sparkles, Scale, Info } from 'lucide-react';

interface AIProtectionEducationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIProtectionEducation({ open, onOpenChange }: AIProtectionEducationProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            AI Training Protection Explained
          </DialogTitle>
          <DialogDescription>
            Learn how we protect your art from being used to train AI models
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="what" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="what">
              <Info className="h-4 w-4 mr-1" />
              What
            </TabsTrigger>
            <TabsTrigger value="how">
              <Sparkles className="h-4 w-4 mr-1" />
              How
            </TabsTrigger>
            <TabsTrigger value="why">
              <Shield className="h-4 w-4 mr-1" />
              Why
            </TabsTrigger>
            <TabsTrigger value="legal">
              <Scale className="h-4 w-4 mr-1" />
              Legal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="what" className="space-y-4 mt-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">What is AI Training Protection?</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI Training Protection makes subtle, invisible changes to your artwork that confuse AI models 
                during their training process. These changes are completely unnoticeable to humans but 
                effectively prevent AI systems from learning your unique artistic style.
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Key Benefits:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Invisible changes - humans can't tell the difference</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Confuses AI training algorithms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Works on all major AI platforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Preserves image quality and colors</span>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="how" className="space-y-4 mt-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">How Does It Work?</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our protection adds microscopic patterns to your image that are invisible to the human eye 
                but disrupt the way AI models process and learn from images.
              </p>
            </div>

            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">🟢 Light Protection</h4>
                <p className="text-sm text-muted-foreground">
                  Fast processing with subtle changes. Good for most users who want basic protection 
                  without waiting long.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">🟡 Standard Protection (Recommended)</h4>
                <p className="text-sm text-muted-foreground">
                  Balanced approach with stronger protection. Uses smart detection to focus protection 
                  on important parts of your artwork.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">🔴 Maximum Protection</h4>
                <p className="text-sm text-muted-foreground">
                  Strongest protection available. Takes longer to process but provides the highest level 
                  of resistance against AI training.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="why" className="space-y-4 mt-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Why Does This Matter?</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                AI companies regularly scan the internet to collect images for training their models. 
                Without protection, your unique artistic style could be copied and replicated by AI tools.
              </p>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="font-medium text-sm mb-2">Real-world examples:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Your art used without permission to train Midjourney or DALL-E</li>
                <li>• AI generating images "in your style" without credit or compensation</li>
                <li>• Loss of your unique artistic identity to automated systems</li>
              </ul>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="font-medium text-sm mb-2">How protection helps:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Prevents AI from accurately learning your style</li>
                <li>• Makes AI-generated copies look wrong or distorted</li>
                <li>• Protects your creative work and livelihood</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="legal" className="space-y-4 mt-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Your Legal Rights</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                As an artist, you have legal rights to control how your work is used, including 
                protecting it from unauthorized AI training.
              </p>
            </div>

            <div className="space-y-3">
              <div className="border-l-4 border-primary pl-4 py-2">
                <p className="font-medium text-sm mb-1">You own your art's style</p>
                <p className="text-sm text-muted-foreground">
                  Your unique artistic style is protected by copyright law in many jurisdictions.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4 py-2">
                <p className="font-medium text-sm mb-1">AI training without consent may violate copyright</p>
                <p className="text-sm text-muted-foreground">
                  Using copyrighted works to train AI models without permission is legally questionable 
                  and being challenged in courts worldwide.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4 py-2">
                <p className="font-medium text-sm mb-1">Protection is your right</p>
                <p className="text-sm text-muted-foreground">
                  Taking technical measures to protect your work from unauthorized use is legal 
                  and recommended.
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg mt-4">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> This information is educational and not legal advice. 
                Copyright laws vary by country. Consult a lawyer for specific legal questions 
                about protecting your artwork.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
