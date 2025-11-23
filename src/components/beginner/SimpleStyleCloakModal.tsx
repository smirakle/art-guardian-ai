import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, Shield, Check, Sparkles } from 'lucide-react';
import { useSimpleStyleCloak, ProtectionPreset } from '@/hooks/useSimpleStyleCloak';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SimpleStyleCloakModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function SimpleStyleCloakModal({ open, onOpenChange }: SimpleStyleCloakModalProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ProtectionPreset>('standard');
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { processing, resultUrl, resultBlob, applyProtection, reset } = useSimpleStyleCloak();

  // Cleanup URLs on unmount or reset
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [previewUrl, resultUrl]);

  const handleFileSelect = (selectedFile?: File) => {
    const picked = selectedFile || inputRef.current?.files?.[0];
    if (!picked) return;

    if (!ALLOWED_TYPES.includes(picked.type)) {
      toast.error('Please use JPEG, PNG, or WebP images');
      return;
    }

    if (picked.size > MAX_FILE_SIZE) {
      toast.error('Image is too large. Maximum size is 15MB');
      return;
    }

    setFile(picked);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(picked);
    setPreviewUrl(url);
    setShowSuccess(false);
    reset();
  };

  const handleProtect = async () => {
    if (!file) return;
    await applyProtection(file, selectedPreset);
    setShowSuccess(true);
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    const baseName = file.name.replace(/\.[^.]+$/, '');
    a.download = `${baseName}_protected.png`;
    a.click();
    toast.success('Protected image downloaded!');
  };

  const handleSave = async () => {
    if (!resultBlob || !file || !user) {
      toast.error('Please sign in to save to your gallery');
      return;
    }

    try {
      const baseName = file.name.replace(/\.[^.]+$/, '');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const path = `${user.id}/ai-protected/${baseName}_${timestamp}.png`;

      const { error: uploadError } = await supabase.storage
        .from('ai-protected-files')
        .upload(path, resultBlob, { contentType: 'image/png', upsert: true });

      if (uploadError) throw uploadError;

      // Log the protection action
      try {
        await supabase.rpc('log_ai_protection_action', {
          user_id_param: user.id,
          action_param: 'beginner_protection_save',
          resource_type_param: 'image',
          resource_id_param: path,
          details_param: {
            original_filename: file.name,
            preset: selectedPreset,
            beginner_mode: true,
          },
        });
      } catch (e) {
        console.warn('Audit log failed', e);
      }

      toast.success('Saved to your protected gallery!');
      
      // Close modal after short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error: any) {
      console.error('Save failed:', error);
      toast.error(error?.message || 'Failed to save image');
    }
  };

  const handleClose = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setShowSuccess(false);
    reset();
    onOpenChange(false);
  };

  const presets = [
    {
      value: 'light' as ProtectionPreset,
      label: 'Light Protection',
      emoji: '🟢',
      description: 'Fast, subtle (good for most users)',
      color: 'border-blue-500 bg-blue-500/10',
    },
    {
      value: 'standard' as ProtectionPreset,
      label: 'Standard Protection',
      emoji: '🟡',
      description: 'Balanced (recommended)',
      color: 'border-green-500 bg-green-500/10',
    },
    {
      value: 'maximum' as ProtectionPreset,
      label: 'Maximum Protection',
      emoji: '🔴',
      description: 'Strongest, takes longer',
      color: 'border-purple-500 bg-purple-500/10',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            AI Training Protection
          </DialogTitle>
          <DialogDescription>
            Add invisible protection to make your art resistant to AI training
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          {!file ? (
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Click to upload your artwork</p>
              <p className="text-sm text-muted-foreground">
                JPEG, PNG, or WebP (max 15MB)
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={() => handleFileSelect()}
                className="hidden"
              />
            </div>
          ) : (
            <>
              {/* Preview Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Original</Label>
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Protected Version
                  </Label>
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    {resultUrl ? (
                      <img
                        src={resultUrl}
                        alt="Protected"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {processing ? 'Processing...' : 'Click "Protect My Art" below'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {showSuccess && resultUrl && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                  <p className="font-medium text-green-700 dark:text-green-400 mb-1">
                    Your art is now protected! 🛡️
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Can you spot the difference? Neither can we! 😊
                  </p>
                </div>
              )}

              {/* Protection Level Selection */}
              <div>
                <Label className="mb-3 block">Choose Protection Level</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {presets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setSelectedPreset(preset.value)}
                      disabled={processing}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPreset === preset.value
                          ? preset.color
                          : 'border-border hover:border-primary/50'
                      } ${processing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{preset.emoji}</span>
                        <span className="font-medium text-sm">{preset.label}</span>
                        {selectedPreset === preset.value && (
                          <Check className="h-4 w-4 ml-auto text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Processing Progress */}
              {processing && (
                <div className="space-y-2">
                  <Progress value={45} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    Adding invisible AI protection... this may take a moment
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {!resultUrl ? (
                  <>
                    <Button
                      onClick={handleProtect}
                      disabled={processing}
                      className="flex-1 gap-2"
                      size="lg"
                    >
                      <Shield className="h-5 w-5" />
                      {processing ? 'Protecting...' : 'Protect My Art'}
                    </Button>
                    <Button
                      onClick={() => inputRef.current?.click()}
                      variant="outline"
                      size="lg"
                    >
                      Choose Different Image
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleSave} className="flex-1 gap-2" size="lg">
                      <Shield className="h-5 w-5" />
                      Save to My Gallery
                    </Button>
                    <Button onClick={handleDownload} variant="outline" className="gap-2" size="lg">
                      <Download className="h-5 w-5" />
                      Download
                    </Button>
                  </>
                )}
              </div>

              {resultUrl && (
                <p className="text-xs text-center text-muted-foreground">
                  💡 Tip: Only share the protected version online to keep your art safe from AI training!
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
