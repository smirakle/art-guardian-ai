import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, Eye, Zap, FileText, Lock, Globe, CheckCircle, Clock, AlertTriangle, Settings } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface ProtectionStatus {
  method: string;
  name: string;
  icon: React.ReactNode;
  status: 'active' | 'pending' | 'disabled';
  protectedFiles: number;
  lastUpdate: string;
}

export const AIProtectionStatusWidget: React.FC = () => {
  const navigate = useNavigate();

  const protectionMethods: ProtectionStatus[] = [
    {
      method: 'invisibleWatermark',
      name: 'Invisible Watermarking',
      icon: <Eye className="w-4 h-4" />,
      status: 'active',
      protectedFiles: 24,
      lastUpdate: '2 hours ago'
    },
    {
      method: 'adversarialNoise',
      name: 'Adversarial Protection',
      icon: <Zap className="w-4 h-4" />,
      status: 'active',
      protectedFiles: 18,
      lastUpdate: '1 hour ago'
    },
    {
      method: 'metadataInjection',
      name: 'Rights Metadata',
      icon: <FileText className="w-4 h-4" />,
      status: 'active',
      protectedFiles: 31,
      lastUpdate: '30 minutes ago'
    },
    {
      method: 'blockchainRegistration',
      name: 'Blockchain Rights',
      icon: <Lock className="w-4 h-4" />,
      status: 'pending',
      protectedFiles: 5,
      lastUpdate: '1 day ago'
    },
    {
      method: 'robotsTxtEntry',
      name: 'Crawler Blocking',
      icon: <Globe className="w-4 h-4" />,
      status: 'active',
      protectedFiles: 31,
      lastUpdate: 'Real-time'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'disabled': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'disabled': return <Badge className="bg-red-100 text-red-800 border-red-300">Disabled</Badge>;
      default: return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
    }
  };

  const totalProtectedFiles = protectionMethods.reduce((total, method) => 
    method.status === 'active' ? Math.max(total, method.protectedFiles) : total, 0
  );
  
  const activeMethodsCount = protectionMethods.filter(method => method.status === 'active').length;
  const protectionScore = Math.round((activeMethodsCount / protectionMethods.length) * 100);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>AI Training Protection Status</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/ai-protection-settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
        <CardDescription>
          Real-time protection status for your uploaded content
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Protection Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-900">{totalProtectedFiles}</div>
            <div className="text-sm text-blue-700">Protected Files</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-900">{activeMethodsCount}/{protectionMethods.length}</div>
            <div className="text-sm text-green-700">Active Methods</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-900">{protectionScore}%</div>
            <div className="text-sm text-purple-700">Protection Score</div>
          </div>
        </div>

        {/* Protection Score Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Protection Level</span>
            <span className="text-sm text-muted-foreground">{protectionScore}%</span>
          </div>
          <Progress value={protectionScore} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {protectionScore >= 80 ? 'Excellent protection' : 
             protectionScore >= 60 ? 'Good protection' : 
             'Consider enabling more protection methods'}
          </p>
        </div>

        {/* Protection Methods Status */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Protection Methods</h4>
          <div className="space-y-2">
            {protectionMethods.map((method) => (
              <div key={method.method} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    {method.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{method.name}</span>
                      {getStatusIcon(method.status)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {method.protectedFiles} files • {method.lastUpdate}
                      </span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(method.status)}
              </div>
            ))}
          </div>
        </div>

        {/* Legal Proof Certificate */}
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-amber-900 mb-1">Protection Certificate</h5>
              <p className="text-sm text-amber-800 mb-3">
                Your content is legally protected with timestamped proof of AI training restrictions.
              </p>
              <Button variant="outline" size="sm" className="border-amber-300 text-amber-800 hover:bg-amber-100">
                Download Certificate
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Recent Protection Activity</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Adversarial protection applied to 3 new files</span>
              <span className="text-muted-foreground ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Invisible watermarks embedded in 5 images</span>
              <span className="text-muted-foreground ml-auto">1 hour ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span>Blockchain registration pending for portfolio.jpg</span>
              <span className="text-muted-foreground ml-auto">30 minutes ago</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};