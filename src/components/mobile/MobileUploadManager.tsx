import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Image as ImageIcon, 
  Shield, 
  Scan,
  CheckCircle,
  AlertTriangle,
  Camera,
  FileText,
  MonitorSpeaker
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const MobileUploadManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileUpload = async (files: FileList) => {
    if (!user || !files.length) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast({
        title: "Upload Complete",
        description: `${file.name} has been uploaded and protected`,
      });
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  const uploadOptions = [
    {
      id: 'camera',
      title: 'Camera',
      description: 'Take a photo to protect instantly',
      icon: Camera,
      action: () => {
        // Mobile camera integration would go here
        toast({
          title: "Camera Feature",
          description: "Camera integration would be available in the native app",
        });
      }
    },
    {
      id: 'gallery',
      title: 'Photo Library',
      description: 'Upload from your device gallery',
      icon: ImageIcon,
      action: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files) handleFileUpload(files);
        };
        input.click();
      }
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Upload legal documents and contracts',
      icon: FileText,
      action: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx';
        input.multiple = true;
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files) handleFileUpload(files);
        };
        input.click();
      }
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Instant Protection',
      description: 'AI watermarking applied automatically'
    },
    {
      icon: Scan,
      title: 'Smart Analysis',
      description: 'Content analyzed for protection optimization'
    },
    {
      icon: MonitorSpeaker,
      title: 'Real-time Monitoring',
      description: 'Continuous scanning for unauthorized use'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Mobile Upload Center</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload and protect your content on-the-go
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isUploading && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Upload className="w-5 h-5 text-primary" />
                <span className="font-medium">Uploading & Protecting...</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {uploadProgress}% complete - Applying AI protection
              </p>
            </div>
          )}

          <div className="grid gap-4 mb-6">
            {uploadOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={option.action}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <option.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{option.title}</h4>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <Button variant="ghost" size="sm">
                  Select
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Protection Features
            </h4>
            <div className="grid gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <feature.icon className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h5 className="font-medium text-sm">{feature.title}</h5>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'artwork_01.jpg', status: 'protected', time: '2 minutes ago' },
              { name: 'portfolio_image.png', status: 'processing', time: '5 minutes ago' },
              { name: 'contract_draft.pdf', status: 'protected', time: '1 hour ago' }
            ].map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  {file.name.includes('pdf') ? (
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-sm">{file.name}</h5>
                  <p className="text-xs text-muted-foreground">{file.time}</p>
                </div>
                <Badge 
                  variant={file.status === 'protected' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {file.status === 'protected' ? (
                    <><CheckCircle className="w-3 h-3 mr-1" /> Protected</>
                  ) : (
                    <><AlertTriangle className="w-3 h-3 mr-1" /> Processing</>
                  )}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileUploadManager;