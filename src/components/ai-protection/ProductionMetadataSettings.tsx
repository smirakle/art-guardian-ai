import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Check, 
  AlertTriangle, 
  Settings, 
  Scale, 
  Globe, 
  FileCheck,
  Zap,
  Target
} from 'lucide-react';
import { ProductionMetadataOptions, productionMetadataInjection } from '@/lib/productionMetadataInjection';
import C2PAValidationBadge from './C2PAValidationBadge';

export const ProductionMetadataSettings: React.FC = () => {
  const { toast } = useToast();
  const [options, setOptions] = useState<ProductionMetadataOptions>({
    copyrightInfo: {
      owner: '',
      year: new Date().getFullYear(),
      rights: 'All Rights Reserved',
      contactEmail: '',
      licenseUrl: '',
      jurisdiction: 'International'
    },
    legalCompliance: {
      dmcaCompliant: true,
      gdprCompliant: true,
      ccpaCompliant: true,
      includeDisclaimer: true
    },
    technicalSettings: {
      useExifStandard: true,
      useXmpStandard: true,
      useLsbBackup: true,
      compressionResistant: true,
      batchProcessing: false
    },
    aiProtection: {
      prohibitTraining: true,
      prohibitDerivatives: true,
      prohibitCommercialUse: false,
      requireAttribution: true
    }
  });

  const [processingFile, setProcessingFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProcessingFile(file);
      setResults(null);
    }
  };

  const processFile = async () => {
    if (!processingFile) return;

    // Validate required fields
    if (!options.copyrightInfo.owner.trim()) {
      toast({
        title: "Missing Information",
        description: "Copyright owner is required for production-grade protection.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await productionMetadataInjection.injectProductionMetadata(processingFile, options);
      setResults(result);

      if (result.success) {
        toast({
          title: "Production Protection Applied",
          description: `Successfully applied ${result.methods.length} protection methods with legal compliance.`,
        });

        // Trigger download of protected file
        if (result.protectedBlob) {
          const url = URL.createObjectURL(result.protectedBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `protected_${processingFile.name}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      } else {
        toast({
          title: "Protection Failed",
          description: result.error || "Failed to apply production-grade protection.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Processing Error",
        description: "An unexpected error occurred during processing.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateCopyrightInfo = (field: string, value: string | number) => {
    setOptions(prev => ({
      ...prev,
      copyrightInfo: {
        ...prev.copyrightInfo,
        [field]: value
      }
    }));
  };

  const updateLegalCompliance = (field: string, value: boolean) => {
    setOptions(prev => ({
      ...prev,
      legalCompliance: {
        ...prev.legalCompliance,
        [field]: value
      }
    }));
  };

  const updateTechnicalSettings = (field: string, value: boolean) => {
    setOptions(prev => ({
      ...prev,
      technicalSettings: {
        ...prev.technicalSettings,
        [field]: value
      }
    }));
  };

  const updateAiProtection = (field: string, value: boolean) => {
    setOptions(prev => ({
      ...prev,
      aiProtection: {
        ...prev.aiProtection,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Production-Grade Rights Metadata Injection
          </CardTitle>
          <p className="text-muted-foreground">
            Industry-standard metadata injection with full legal compliance and verification
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload File for Protection</Label>
            <Input
              id="file-upload"
              type="file"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            {processingFile && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Selected: {processingFile.name} ({(processingFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
                <C2PAValidationBadge file={processingFile} autoValidate />
              </div>
            )}
          </div>

          <Separator />

          {/* Copyright Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Copyright Information</h3>
              <Badge variant="destructive">Required</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner">Copyright Owner *</Label>
                <Input
                  id="owner"
                  value={options.copyrightInfo.owner}
                  onChange={(e) => updateCopyrightInfo('owner', e.target.value)}
                  placeholder="Your Name or Company"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Copyright Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={options.copyrightInfo.year}
                  onChange={(e) => updateCopyrightInfo('year', parseInt(e.target.value))}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={options.copyrightInfo.contactEmail}
                  onChange={(e) => updateCopyrightInfo('contactEmail', e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="license-url">License URL</Label>
                <Input
                  id="license-url"
                  type="url"
                  value={options.copyrightInfo.licenseUrl}
                  onChange={(e) => updateCopyrightInfo('licenseUrl', e.target.value)}
                  placeholder="https://example.com/license"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="rights">Rights Statement</Label>
                <Textarea
                  id="rights"
                  value={options.copyrightInfo.rights}
                  onChange={(e) => updateCopyrightInfo('rights', e.target.value)}
                  placeholder="All Rights Reserved. Unauthorized use prohibited."
                  rows={2}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* AI Protection Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <h3 className="text-lg font-semibold">AI Protection Directives</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="prohibit-training">Prohibit AI Training</Label>
                  <p className="text-sm text-muted-foreground">
                    Explicitly prohibit use in machine learning training datasets
                  </p>
                </div>
                <Switch
                  id="prohibit-training"
                  checked={options.aiProtection.prohibitTraining}
                  onCheckedChange={(checked) => updateAiProtection('prohibitTraining', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="prohibit-derivatives">Prohibit Derivative Works</Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent creation of derivative works or modifications
                  </p>
                </div>
                <Switch
                  id="prohibit-derivatives"
                  checked={options.aiProtection.prohibitDerivatives}
                  onCheckedChange={(checked) => updateAiProtection('prohibitDerivatives', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="prohibit-commercial">Prohibit Commercial Use</Label>
                  <p className="text-sm text-muted-foreground">
                    Restrict commercial usage without permission
                  </p>
                </div>
                <Switch
                  id="prohibit-commercial"
                  checked={options.aiProtection.prohibitCommercialUse}
                  onCheckedChange={(checked) => updateAiProtection('prohibitCommercialUse', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require-attribution">Require Attribution</Label>
                  <p className="text-sm text-muted-foreground">
                    Mandate proper attribution for any permitted use
                  </p>
                </div>
                <Switch
                  id="require-attribution"
                  checked={options.aiProtection.requireAttribution}
                  onCheckedChange={(checked) => updateAiProtection('requireAttribution', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Technical Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Technical Protection Methods</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="exif-standard">EXIF Standard Metadata</Label>
                  <p className="text-sm text-muted-foreground">
                    Industry-standard EXIF 2.32 compliant metadata injection
                  </p>
                </div>
                <Switch
                  id="exif-standard"
                  checked={options.technicalSettings.useExifStandard}
                  onCheckedChange={(checked) => updateTechnicalSettings('useExifStandard', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="xmp-standard">XMP Standard Metadata</Label>
                  <p className="text-sm text-muted-foreground">
                    Adobe XMP standard for comprehensive metadata
                  </p>
                </div>
                <Switch
                  id="xmp-standard"
                  checked={options.technicalSettings.useXmpStandard}
                  onCheckedChange={(checked) => updateTechnicalSettings('useXmpStandard', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="lsb-backup">LSB Steganography Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Additional protection using steganographic techniques
                  </p>
                </div>
                <Switch
                  id="lsb-backup"
                  checked={options.technicalSettings.useLsbBackup}
                  onCheckedChange={(checked) => updateTechnicalSettings('useLsbBackup', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compression-resistant">Compression-Resistant Watermarking</Label>
                  <p className="text-sm text-muted-foreground">
                    DCT-domain watermarking that survives compression
                  </p>
                </div>
                <Switch
                  id="compression-resistant"
                  checked={options.technicalSettings.compressionResistant}
                  onCheckedChange={(checked) => updateTechnicalSettings('compressionResistant', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Legal Compliance */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Legal Compliance</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dmca-compliant">DMCA Compliant</Label>
                  <p className="text-sm text-muted-foreground">
                    Include DMCA takedown notice compliance metadata
                  </p>
                </div>
                <Switch
                  id="dmca-compliant"
                  checked={options.legalCompliance.dmcaCompliant}
                  onCheckedChange={(checked) => updateLegalCompliance('dmcaCompliant', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="gdpr-compliant">GDPR Compliant</Label>
                  <p className="text-sm text-muted-foreground">
                    European data protection regulation compliance
                  </p>
                </div>
                <Switch
                  id="gdpr-compliant"
                  checked={options.legalCompliance.gdprCompliant}
                  onCheckedChange={(checked) => updateLegalCompliance('gdprCompliant', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ccpa-compliant">CCPA Compliant</Label>
                  <p className="text-sm text-muted-foreground">
                    California Consumer Privacy Act compliance
                  </p>
                </div>
                <Switch
                  id="ccpa-compliant"
                  checked={options.legalCompliance.ccpaCompliant}
                  onCheckedChange={(checked) => updateLegalCompliance('ccpaCompliant', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Process Button */}
          <div className="flex flex-col gap-4">
            <Button
              onClick={processFile}
              disabled={!processingFile || isProcessing || !options.copyrightInfo.owner.trim()}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Apply Production Protection
                </>
              )}
            </Button>
            
            {!options.copyrightInfo.owner.trim() && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Copyright owner information is required for production-grade protection.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Results Display */}
          {results && (
            <Card className={`border ${results.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {results.success ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  Protection Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Protection ID</Label>
                    <p className="text-sm font-mono">{results.protectionId}</p>
                  </div>
                  <div>
                    <Label>Methods Applied</Label>
                    <p className="text-sm">{results.methods.join(', ')}</p>
                  </div>
                </div>
                
                {results.verification && (
                  <div className="space-y-2">
                    <Label>Verification Status</Label>
                    <div className="flex gap-2">
                      {results.verification.standards.exif && <Badge>EXIF ✓</Badge>}
                      {results.verification.standards.xmp && <Badge>XMP ✓</Badge>}
                      {results.verification.standards.lsb && <Badge>LSB ✓</Badge>}
                    </div>
                  </div>
                )}
                
                {results.legalNotices && results.legalNotices.length > 0 && (
                  <div className="space-y-2">
                    <Label>Legal Notices Generated</Label>
                    <div className="text-sm space-y-1">
                      {results.legalNotices.map((notice: string, index: number) => (
                        <p key={index} className="p-2 bg-background rounded border">{notice}</p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};