import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Upload, Search, Eye, TrendingUp, Brain, Zap } from 'lucide-react';
import { AIDetectionDashboard } from '@/components/phase1/AIDetectionDashboard';

export default function Phase1Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Phase 1: Core Protection</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Essential IP protection tools including image monitoring, deepfake detection, and forgery identification
        </p>
        <Badge className="mt-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-background">
          Coming Soon
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-semibold mb-2">Image Monitoring</h3>
            <p className="text-sm text-muted-foreground">
              Upload and monitor your images across the web for unauthorized use
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <Eye className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold mb-2">Deepfake Detection</h3>
            <p className="text-sm text-muted-foreground">
              Advanced AI detection of manipulated images and deepfake content
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            <h3 className="text-xl font-semibold mb-2">Forgery Detection</h3>
            <p className="text-sm text-muted-foreground">
              Detect forged documents and manipulated digital content
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ai-detection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai-detection" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Detection
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Image Monitoring
          </TabsTrigger>
          <TabsTrigger value="deepfake" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Deepfake Detection
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-detection">
          <AIDetectionDashboard />
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Image Monitoring System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Our core image monitoring system allows you to upload your intellectual property and monitor its usage across the internet.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => window.location.href = '/upload'}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg"
                >
                  Go to Upload
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deepfake">
          <Card>
            <CardHeader>
              <CardTitle>Deepfake Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Advanced AI-powered detection of deepfakes and manipulated content to protect your digital identity.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => window.location.href = '/deepfake-detection'}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg"
                >
                  Go to Deepfake Detection
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forgery">
          <Card>
            <CardHeader>
              <CardTitle>Forgery Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Detect forged documents, manipulated images, and other fraudulent digital content.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => window.location.href = '/forgery-detection'}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg"
                >
                  Go to Forgery Detection
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Phase 1 Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">✓</p>
              <p className="text-sm text-muted-foreground">Image Monitoring</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">✓</p>
              <p className="text-sm text-muted-foreground">Deepfake Detection</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">✓</p>
              <p className="text-sm text-muted-foreground">Forgery Detection</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">100%</p>
              <p className="text-sm text-muted-foreground">Phase 1 Complete</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}