import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Info, Upload } from 'lucide-react';
import { SimpleStyleCloakModal } from './SimpleStyleCloakModal';
import { AIProtectionEducation } from './AIProtectionEducation';
import { useAIProtectionStats } from '@/hooks/useAIProtectionStats';

export function SimpleAIProtection() {
  const [showModal, setShowModal] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const { stats } = useAIProtectionStats();

  return (
    <>
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Protect Your Art from AI Training
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-muted-foreground leading-relaxed">
              AI companies scan the internet to train their models. We can make your art invisible 
              to them while keeping it beautiful for humans.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Invisible changes (humans can't tell)</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Confuses AI training models</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Works on all major AI platforms</span>
              </div>
            </div>

            {stats.totalProtected > 0 && (
              <div className="bg-primary/10 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium mb-2">Your Protection Stats:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Protected:</span>
                    <p className="font-bold text-lg">{stats.totalProtected}</p>
                  </div>
                  {stats.lightProtected > 0 && (
                    <div>
                      <span className="text-muted-foreground">Light:</span>
                      <p className="font-bold text-lg">{stats.lightProtected}</p>
                    </div>
                  )}
                  {stats.standardProtected > 0 && (
                    <div>
                      <span className="text-muted-foreground">Standard:</span>
                      <p className="font-bold text-lg">{stats.standardProtected}</p>
                    </div>
                  )}
                  {stats.maximumProtected > 0 && (
                    <div>
                      <span className="text-muted-foreground">Maximum:</span>
                      <p className="font-bold text-lg">{stats.maximumProtected}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              onClick={() => setShowModal(true)}
              className="gap-2"
            >
              <Upload className="h-5 w-5" />
              Upload Image to Protect
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowEducation(true)}
              className="gap-2"
            >
              <Info className="h-5 w-5" />
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>

      <SimpleStyleCloakModal open={showModal} onOpenChange={setShowModal} />
      <AIProtectionEducation open={showEducation} onOpenChange={setShowEducation} />
    </>
  );
}
