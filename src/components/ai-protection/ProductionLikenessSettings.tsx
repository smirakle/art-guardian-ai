import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Eye, 
  Brain, 
  Users, 
  Lock, 
  FileImage,
  Mic,
  Video,
  Fingerprint,
  AlertTriangle,
  CheckCircle,
  Settings,
  Scale,
  Camera,
  Upload
} from 'lucide-react';
import { 
  LikenessProtectionOptions, 
  productionLikenessProtection 
} from '@/lib/productionLikenessProtection';

export const ProductionLikenessSettings: React.FC = () => {
  const { toast } = useToast();
  
  const [options, setOptions] = useState<LikenessProtectionOptions>({
    protectionLevel: 'advanced',
    biometricTypes: ['facial'],
    monitoringPlatforms: ['instagram', 'facebook', 'twitter', 'tiktok', 'youtube'],
    realTimeAlerts: true,
    legalEnforcement: true,
    privacyMode: 'private',
    retentionPeriod: 365,
    consentVerification: true,
    minConfidenceThreshold: 0.85,
    falsePositiveReduction: true
  });

  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);
  const [biometricFiles, setBiometricFiles] = useState<{
    images: File[];
    voiceRecordings: File[];
    videos: File[];
  }>({
    images: [],
    voiceRecordings: [],
    videos: []
  });

  const [protectionStatus, setProtectionStatus] = useState<{
    enrolled: boolean;
    monitoring: boolean;
    protectionId?: string;
    certificate?: string;
  }>({
    enrolled: false,
    monitoring: false
  });

  const updateOptions = (key: keyof LikenessProtectionOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = useCallback((type: 'images' | 'voiceRecordings' | 'videos', files: FileList) => {
    const fileArray = Array.from(files);
    setBiometricFiles(prev => ({
      ...prev,
      [type]: [...prev[type], ...fileArray]
    }));
  }, []);

  const removeFile = useCallback((type: 'images' | 'voiceRecordings' | 'videos', index: number) => {
    setBiometricFiles(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  }, []);

  const handleBiometricEnrollment = async () => {
    setIsEnrolling(true);
    setEnrollmentProgress(0);

    try {
      // Simulate enrollment progress
      const progressSteps = [
        { step: 10, message: "Analyzing facial features..." },
        { step: 25, message: "Processing voice patterns..." },
        { step: 40, message: "Extracting biometric templates..." },
        { step: 60, message: "Encrypting sensitive data..." },
        { step: 80, message: "Setting up monitoring..." },
        { step: 95, message: "Generating protection certificate..." },
        { step: 100, message: "Enrollment complete!" }
      ];

      for (const progressStep of progressSteps) {
        setEnrollmentProgress(progressStep.step);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const result = await productionLikenessProtection.enrollBiometricProfile(
        'user-123', // In production, get from auth
        biometricFiles,
        options
      );

      if (result.success) {
        setProtectionStatus({
          enrolled: true,
          monitoring: result.monitoringActive,
          protectionId: result.protectionId,
          certificate: result.certificate
        });

        toast({
          title: "Biometric Enrollment Successful",
          description: `Protection ID: ${result.protectionId}. Your likeness is now protected with ${result.encryptionLevel} encryption.`,
        });
      } else {
        throw new Error(result.error || 'Enrollment failed');
      }

    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description: error instanceof Error ? error.message : "Failed to enroll biometric profile",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
      setEnrollmentProgress(0);
    }
  };

  const handleStartMonitoring = async () => {
    setIsMonitoring(true);

    try {
      const monitoringSetup = await productionLikenessProtection.setupRealTimeMonitoring(
        'user-123', // In production, get from auth
        options
      );

      setProtectionStatus(prev => ({
        ...prev,
        monitoring: true
      }));

      toast({
        title: "Real-time Monitoring Active",
        description: `Monitoring ${monitoringSetup.platforms.length} platforms with ${monitoringSetup.scanFrequency} minute intervals.`,
      });

    } catch (error) {
      toast({
        title: "Monitoring Setup Failed",
        description: error instanceof Error ? error.message : "Failed to start monitoring",
        variant: "destructive",
      });
    } finally {
      setIsMonitoring(false);
    }
  };

  const BiometricTypeCard = ({ 
    type, 
    icon: Icon, 
    title, 
    description, 
    fileType,
    accept 
  }: {
    type: 'facial' | 'voice' | 'gait' | 'iris' | 'fingerprint';
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    fileType: 'images' | 'voiceRecordings' | 'videos';
    accept: string;
  }) => (
    <Card className={`cursor-pointer transition-all ${
      options.biometricTypes.includes(type) 
        ? 'border-primary bg-primary/5' 
        : 'border-border hover:border-primary/50'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${
            options.biometricTypes.includes(type) 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          }`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{title}</h4>
              <Switch
                checked={options.biometricTypes.includes(type)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateOptions('biometricTypes', [...options.biometricTypes, type]);
                  } else {
                    updateOptions('biometricTypes', options.biometricTypes.filter(t => t !== type));
                  }
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            
            {options.biometricTypes.includes(type) && (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept={accept}
                  multiple
                  onChange={(e) => e.target.files && handleFileUpload(fileType, e.target.files)}
                  className="text-xs"
                />
                {biometricFiles[fileType].length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {biometricFiles[fileType].length} file(s) uploaded
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Production Likeness Recognition Protection
          </CardTitle>
          <p className="text-muted-foreground">
            Enterprise-grade biometric protection against deepfakes, identity theft, and unauthorized likeness use
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Protection Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Protection Status</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={`border ${protectionStatus.enrolled ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-gray-200'}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-full ${protectionStatus.enrolled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Biometric Enrollment</p>
                    <p className="text-xs text-muted-foreground">
                      {protectionStatus.enrolled ? 'Enrolled & Protected' : 'Not Enrolled'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`border ${protectionStatus.monitoring ? 'border-blue-200 bg-blue-50 dark:bg-blue-950/20' : 'border-gray-200'}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-full ${protectionStatus.monitoring ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Eye className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Real-time Monitoring</p>
                    <p className="text-xs text-muted-foreground">
                      {protectionStatus.monitoring ? 'Active Monitoring' : 'Inactive'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`border ${protectionStatus.certificate ? 'border-purple-200 bg-purple-50 dark:bg-purple-950/20' : 'border-gray-200'}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-full ${protectionStatus.certificate ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Scale className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Legal Protection</p>
                    <p className="text-xs text-muted-foreground">
                      {protectionStatus.certificate ? 'Legally Protected' : 'Not Protected'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Protection Level */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Protection Configuration</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="protection-level">Protection Level</Label>
                <select
                  id="protection-level"
                  value={options.protectionLevel}
                  onChange={(e) => updateOptions('protectionLevel', e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="basic">Basic - Face matching only</option>
                  <option value="advanced">Advanced - Multi-modal biometrics</option>
                  <option value="maximum">Maximum - Full forensic analysis</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                  <Input
                    id="confidence-threshold"
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="1.0"
                    value={options.minConfidenceThreshold}
                    onChange={(e) => updateOptions('minConfidenceThreshold', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retention-period">Retention Period (days)</Label>
                  <Input
                    id="retention-period"
                    type="number"
                    min="30"
                    max="3650"
                    value={options.retentionPeriod}
                    onChange={(e) => updateOptions('retentionPeriod', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Biometric Types */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Biometric Enrollment</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BiometricTypeCard
                type="facial"
                icon={Camera}
                title="Facial Recognition"
                description="Face geometry, landmarks, and unique features"
                fileType="images"
                accept="image/*"
              />
              
              <BiometricTypeCard
                type="voice"
                icon={Mic}
                title="Voice Biometrics"
                description="Voice patterns, pitch, and speech characteristics"
                fileType="voiceRecordings"
                accept="audio/*"
              />
              
              <BiometricTypeCard
                type="gait"
                icon={Video}
                title="Gait Analysis"
                description="Walking patterns and body movement analysis"
                fileType="videos"
                accept="video/*"
              />
              
              <BiometricTypeCard
                type="iris"
                icon={Eye}
                title="Iris Recognition"
                description="Unique iris patterns and eye characteristics"
                fileType="images"
                accept="image/*"
              />
            </div>

            {isEnrolling && (
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">Processing Biometric Data</span>
                    </div>
                    <Progress value={enrollmentProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground">
                      Analyzing and encrypting biometric features...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* Monitoring Platforms */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Monitoring Platforms</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'instagram', 'facebook', 'twitter', 'tiktok', 'youtube', 
                'linkedin', 'snapchat', 'reddit', 'pinterest', 'telegram'
              ].map(platform => (
                <Card 
                  key={platform}
                  className={`cursor-pointer transition-all ${
                    options.monitoringPlatforms.includes(platform)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => {
                    if (options.monitoringPlatforms.includes(platform)) {
                      updateOptions('monitoringPlatforms', 
                        options.monitoringPlatforms.filter(p => p !== platform)
                      );
                    } else {
                      updateOptions('monitoringPlatforms', 
                        [...options.monitoringPlatforms, platform]
                      );
                    }
                  }}
                >
                  <CardContent className="p-3 text-center">
                    <p className="font-medium text-sm capitalize">{platform}</p>
                    {options.monitoringPlatforms.includes(platform) && (
                      <Badge variant="secondary" className="mt-1 text-xs">Active</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Privacy & Legal Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Privacy & Legal Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Real-time Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Instant notifications for violations
                    </p>
                  </div>
                  <Switch
                    checked={options.realTimeAlerts}
                    onCheckedChange={(checked) => updateOptions('realTimeAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Legal Enforcement</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatic DMCA and legal action
                    </p>
                  </div>
                  <Switch
                    checked={options.legalEnforcement}
                    onCheckedChange={(checked) => updateOptions('legalEnforcement', checked)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Consent Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Verify consent for biometric storage
                    </p>
                  </div>
                  <Switch
                    checked={options.consentVerification}
                    onCheckedChange={(checked) => updateOptions('consentVerification', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>False Positive Reduction</Label>
                    <p className="text-sm text-muted-foreground">
                      AI-powered accuracy enhancement
                    </p>
                  </div>
                  <Switch
                    checked={options.falsePositiveReduction}
                    onCheckedChange={(checked) => updateOptions('falsePositiveReduction', checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleBiometricEnrollment}
                disabled={isEnrolling || options.biometricTypes.length === 0}
                className="w-full"
              >
                {isEnrolling ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    Enrolling Biometrics...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enroll Biometric Profile
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleStartMonitoring}
                disabled={isMonitoring || !protectionStatus.enrolled}
                variant="outline"
                className="w-full"
              >
                {isMonitoring ? (
                  <>
                    <Eye className="h-4 w-4 mr-2 animate-pulse" />
                    Starting Monitoring...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Start Real-time Monitoring
                  </>
                )}
              </Button>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Notice:</strong> All biometric data is encrypted with AES-256-GCM encryption and stored in compliance with GDPR, CCPA, and international biometric data protection standards. Your biometric templates cannot be reverse-engineered to recreate your original biometric data.
            </AlertDescription>
          </Alert>

          {protectionStatus.enrolled && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Protection Active:</strong> Your likeness is protected with {options.protectionLevel} level security. 
                {protectionStatus.protectionId && ` Protection ID: ${protectionStatus.protectionId}`}
              </AlertDescription>
            </Alert>
          )}

        </CardContent>
      </Card>
    </div>
  );
};