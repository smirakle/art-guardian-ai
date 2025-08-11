import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CaptchaProtectionProps {
  onVerify: (verified: boolean) => void;
  required?: boolean;
}

export const CaptchaProtection: React.FC<CaptchaProtectionProps> = ({ 
  onVerify, 
  required = false 
}) => {
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setUserInput('');
    drawCaptcha(result);
  };

  const drawCaptcha = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `hsl(${Math.random() * 360}, 50%, 80%)`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Draw text
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < code.length; i++) {
      const x = 30 + i * 25 + Math.random() * 10 - 5;
      const y = 30 + Math.random() * 10 - 5;
      const rotation = (Math.random() - 0.5) * 0.4;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 40%)`;
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }

    // Add noise dots
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 60%)`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 3 + 1,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  };

  const verifyCaptcha = () => {
    if (userInput.toLowerCase() === captchaCode.toLowerCase()) {
      setIsVerified(true);
      onVerify(true);
      toast({
        title: "CAPTCHA Verified",
        description: "Security verification successful!",
      });
    } else {
      setAttempts(prev => prev + 1);
      generateCaptcha();
      toast({
        title: "Verification Failed",
        description: `Incorrect CAPTCHA. Attempts: ${attempts + 1}/3`,
        variant: "destructive",
      });
      
      if (attempts >= 2) {
        toast({
          title: "Too Many Attempts",
          description: "Please wait before trying again.",
          variant: "destructive",
        });
        setTimeout(() => setAttempts(0), 30000);
      }
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  if (isVerified && !required) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-600">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Security Verified</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          CAPTCHA Verification
        </CardTitle>
        <CardDescription>
          Complete the security challenge to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {attempts >= 3 ? (
          <div className="flex items-center gap-2 text-destructive p-4 bg-destructive/10 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
            <span>Too many failed attempts. Please wait 30 seconds.</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <canvas
                ref={canvasRef}
                width={200}
                height={60}
                className="border rounded-lg bg-white"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={generateCaptcha}
                disabled={attempts >= 3}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="captcha-input">
                Enter the characters shown above
              </Label>
              <div className="flex gap-2">
                <Input
                  id="captcha-input"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter CAPTCHA"
                  disabled={attempts >= 3}
                  onKeyPress={(e) => e.key === 'Enter' && verifyCaptcha()}
                />
                <Button 
                  onClick={verifyCaptcha}
                  disabled={!userInput.trim() || attempts >= 3}
                >
                  Verify
                </Button>
              </div>
            </div>

            {attempts > 0 && (
              <p className="text-sm text-muted-foreground">
                Attempts: {attempts}/3
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};