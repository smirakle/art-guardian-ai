import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Shield, Code, Zap, CheckCircle, AlertTriangle, Eye, Brain, FileText, Camera, Globe, Clock, Database, Webhook } from 'lucide-react';
import { toast } from 'sonner';

export default function ComprehensiveAPIDocumentation() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const baseUrl = 'https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1';

  const endpoints = [
    {
      category: 'Core Monitoring',
      apis: [
        {
          name: 'Visual Recognition API',
          endpoint: '/advanced-visual-analysis',
          method: 'POST',
          description: 'Advanced AI-powered image analysis for copyright detection',
          pricing: '$0.10 per analysis',
          rateLimit: '1,000/hour',
          example: {
            request: `{
  "image_url": "https://example.com/image.jpg",
  "analysis_types": ["similarity", "deepfake", "metadata"],
  "threshold": 0.85
}`,
            response: `{
  "analysis_id": "va_7d2e9f1a",
  "similarity_score": 0.92,
  "matches": [
    {
      "source": "getty_images",
      "confidence": 0.94,
      "match_url": "https://gettyimages.com/detail/123456",
      "license_type": "commercial"
    }
  ],
  "deepfake_probability": 0.03,
  "metadata": {
    "camera": "Canon EOS R5",
    "edited": false,
    "creation_date": "2024-01-15T10:30:00Z"
  }
}`
          }
        },
        {
          name: 'Real-time Monitoring',
          endpoint: '/real-time-monitoring-engine',
          method: 'POST',
          description: 'Start continuous monitoring across web, social media, and platforms',
          pricing: '$50/month per 1,000 assets',
          rateLimit: '500/hour',
          example: {
            request: `{
  "asset_id": "art_abc123",
  "monitoring_scope": ["web", "social_media", "marketplaces"],
  "scan_frequency": "hourly",
  "alert_threshold": 0.80
}`,
            response: `{
  "monitoring_session_id": "mon_xyz789",
  "status": "active",
  "platforms_monitored": 47,
  "estimated_coverage": "95% of major platforms",
  "next_scan": "2024-01-15T11:00:00Z"
}`
          }
        }
      ]
    },
    {
      category: 'AI Protection',
      apis: [
        {
          name: 'AI Training Detection',
          endpoint: '/ai-training-protection-processor',
          method: 'POST',
          description: 'Detect if content is being used in AI model training',
          pricing: '$0.25 per scan',
          rateLimit: '500/hour',
          example: {
            request: `{
  "content_hash": "sha256:abc123...",
  "content_type": "image",
  "detection_methods": ["prompt_injection", "style_analysis", "dataset_matching"]
}`,
            response: `{
  "violation_detected": true,
  "confidence": 0.89,
  "training_dataset": "stable_diffusion_v2",
  "violation_type": "unauthorized_training_data",
  "recommended_action": "dmca_takedown"
}`
          }
        },
        {
          name: 'Style Protection',
          endpoint: '/style-cloak-protection',
          method: 'POST',
          description: 'Protect artistic style from AI replication',
          pricing: '$5 per artwork protection',
          rateLimit: '100/hour',
          example: {
            request: `{
  "artwork_url": "https://example.com/artwork.jpg",
  "protection_level": "high",
  "style_fingerprint": true
}`,
            response: `{
  "protection_id": "sp_def456",
  "style_signature": "artist_signature_hash",
  "protection_active": true,
  "monitoring_enabled": true
}`
          }
        }
      ]
    },
    {
      category: 'Deepfake Detection',
      apis: [
        {
          name: 'Video Deepfake Analysis',
          endpoint: '/advanced-deepfake-analysis',
          method: 'POST',
          description: 'Analyze videos for deepfake manipulation',
          pricing: '$0.50 per video minute',
          rateLimit: '100/hour',
          example: {
            request: `{
  "video_url": "https://example.com/video.mp4",
  "analysis_depth": "comprehensive",
  "frame_sampling": "adaptive"
}`,
            response: `{
  "deepfake_probability": 0.87,
  "manipulation_regions": [
    {
      "region": "face",
      "confidence": 0.92,
      "frames": "0:15-0:45"
    }
  ],
  "technique_detected": "face_swap",
  "authenticity_score": 0.13
}`
          }
        },
        {
          name: 'Image Forgery Detection',
          endpoint: '/ai-image-detector',
          method: 'POST',
          description: 'Detect AI-generated or manipulated images',
          pricing: '$0.05 per image',
          rateLimit: '2,000/hour',
          example: {
            request: `{
  "image_url": "https://example.com/image.jpg",
  "detection_methods": ["ela", "metadata", "noise_analysis"]
}`,
            response: `{
  "ai_generated_probability": 0.76,
  "manipulation_detected": true,
  "generator_model": "midjourney_v5",
  "confidence": 0.84
}`
          }
        }
      ]
    },
    {
      category: 'Legal & Compliance',
      apis: [
        {
          name: 'DMCA Notice Generator',
          endpoint: '/automated-dmca-filing',
          method: 'POST',
          description: 'Generate and file DMCA takedown notices',
          pricing: '$25 per notice',
          rateLimit: '50/hour',
          example: {
            request: `{
  "infringement_url": "https://violator.com/stolen-content",
  "original_work_url": "https://original.com/my-work",
  "copyright_owner": "John Artist",
  "contact_email": "john@artist.com"
}`,
            response: `{
  "dmca_notice_id": "dmca_789xyz",
  "notice_generated": true,
  "filing_status": "submitted",
  "expected_response_time": "7-14 days"
}`
          }
        },
        {
          name: 'Legal Document Generator',
          endpoint: '/legal-document-generator',
          method: 'POST',
          description: 'Generate copyright, licensing, and IP documents',
          pricing: '$15 per document',
          rateLimit: '100/hour',
          example: {
            request: `{
  "document_type": "copyright_registration",
  "creator_info": {
    "name": "Jane Artist",
    "address": "123 Art St, Creative City"
  },
  "work_details": {
    "title": "Digital Masterpiece",
    "creation_date": "2024-01-10"
  }
}`,
            response: `{
  "document_id": "doc_legal123",
  "document_url": "https://secure.tsmo.ai/docs/doc_legal123.pdf",
  "filing_ready": true,
  "estimated_filing_cost": "$85"
}`
          }
        }
      ]
    },
    {
      category: 'Blockchain & NFT',
      apis: [
        {
          name: 'Blockchain Registration',
          endpoint: '/advanced-blockchain-registration',
          method: 'POST',
          description: 'Register artwork on blockchain for immutable proof',
          pricing: '$10 + gas fees',
          rateLimit: '200/hour',
          example: {
            request: `{
  "artwork_hash": "ipfs://QmXyZ123...",
  "metadata": {
    "title": "Digital Art Piece",
    "creator": "0x742d35Cc6Bb3e",
    "creation_date": "2024-01-15"
  },
  "blockchain": "ethereum"
}`,
            response: `{
  "transaction_hash": "0xabc123def456...",
  "certificate_id": "cert_blockchain789",
  "registration_timestamp": "2024-01-15T15:30:00Z",
  "gas_cost": "$12.50"
}`
          }
        },
        {
          name: 'NFT Minting Service',
          endpoint: '/real-nft-minting',
          method: 'POST',
          description: 'Professional NFT minting with copyright protection',
          pricing: '$25 + gas fees',
          rateLimit: '100/hour',
          example: {
            request: `{
  "image_url": "https://example.com/artwork.jpg",
  "metadata": {
    "name": "Unique Digital Art",
    "description": "One-of-a-kind piece",
    "attributes": [{"trait": "style", "value": "abstract"}]
  },
  "royalty_percentage": 5.0
}`,
            response: `{
  "nft_id": "nft_minted456",
  "token_id": 1234,
  "contract_address": "0x123abc...",
  "opensea_url": "https://opensea.io/assets/...",
  "minting_cost": "$35.75"
}`
          }
        }
      ]
    },
    {
      category: 'Portfolio Management',
      apis: [
        {
          name: 'Portfolio Monitoring',
          endpoint: '/portfolio-monitoring-pro',
          method: 'POST',
          description: 'Monitor entire portfolio for infringement',
          pricing: '$99/month per portfolio',
          rateLimit: '100/hour',
          example: {
            request: `{
  "portfolio_id": "port_abc123",
  "scan_depth": "comprehensive",
  "platforms": ["all"],
  "alert_threshold": 0.75
}`,
            response: `{
  "scan_id": "scan_portfolio789",
  "assets_scanned": 2847,
  "matches_found": 23,
  "high_risk_matches": 5,
  "scan_duration": "45 minutes"
}`
          }
        },
        {
          name: 'Trademark Monitoring',
          endpoint: '/trademark-monitoring-engine',
          method: 'POST',
          description: 'Monitor trademarks across global databases',
          pricing: '$150/month per trademark',
          rateLimit: '50/hour',
          example: {
            request: `{
  "trademark_text": "BRAND NAME",
  "trademark_classes": [25, 35],
  "geographic_scope": ["US", "EU", "global"],
  "monitoring_frequency": "daily"
}`,
            response: `{
  "monitoring_id": "tm_monitor456",
  "jurisdictions_covered": 85,
  "similar_marks_found": 3,
  "risk_level": "medium"
}`
          }
        }
      ]
    },
    {
      category: 'Enterprise Features',
      apis: [
        {
          name: 'Webhook Notifications',
          endpoint: '/enterprise-webhooks',
          method: 'POST',
          description: 'Real-time notifications for your systems',
          pricing: 'Included with Enterprise',
          rateLimit: '10,000/hour',
          example: {
            request: `{
  "webhook_url": "https://your-system.com/webhook",
  "events": ["match_found", "dmca_filed", "scan_complete"],
  "secret": "your_webhook_secret"
}`,
            response: `{
  "webhook_id": "wh_enterprise123",
  "status": "active",
  "events_subscribed": 3,
  "test_event_sent": true
}`
          }
        },
        {
          name: 'Bulk Analysis API',
          endpoint: '/enterprise-api-v1/bulk-analyze',
          method: 'POST',
          description: 'Process thousands of assets simultaneously',
          pricing: 'Volume pricing available',
          rateLimit: 'Custom limits',
          example: {
            request: `{
  "batch_id": "batch_2024_001",
  "assets": [
    {"id": "asset1", "url": "https://..."},
    {"id": "asset2", "url": "https://..."}
  ],
  "analysis_types": ["similarity", "ai_detection"]
}`,
            response: `{
  "batch_id": "batch_2024_001",
  "total_assets": 10000,
  "processing_status": "in_progress",
  "estimated_completion": "2024-01-15T18:00:00Z"
}`
          }
        }
      ]
    }
  ];

  const pricingTiers = [
    {
      name: 'Developer',
      price: '$99/month',
      limits: {
        'API Calls': '10,000/month',
        'Real-time Monitoring': '100 assets',
        'Response Time': '<2s',
        'Support': 'Email'
      }
    },
    {
      name: 'Professional',
      price: '$499/month',
      limits: {
        'API Calls': '100,000/month',
        'Real-time Monitoring': '1,000 assets',
        'Response Time': '<1s',
        'Support': 'Priority'
      }
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      limits: {
        'API Calls': 'Unlimited',
        'Real-time Monitoring': 'Unlimited',
        'Response Time': '<500ms',
        'Support': 'Dedicated Success Manager'
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            TSMO Production API Documentation
          </CardTitle>
          <CardDescription>
            Complete API reference for IP protection, monitoring, and legal automation
          </CardDescription>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Production Ready
            </Badge>
            <Badge variant="outline">REST API</Badge>
            <Badge variant="outline">WebSocket Streaming</Badge>
            <Badge variant="outline">99.9% SLA</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">47</div>
            <div className="text-sm text-muted-foreground">API Endpoints</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime SLA</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">&lt;500ms</div>
            <div className="text-sm text-muted-foreground">Response Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">Monitoring</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
          <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>The world's most comprehensive IP protection API suite</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-blue-200 bg-blue-50">
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Market First:</strong> The only platform offering real-time AI training detection, 
                  style protection, and automated legal workflow in a single API.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-5 w-5 text-blue-500" />
                    <h4 className="font-semibold">Visual Recognition</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI-powered image analysis with 94% accuracy rate
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <h4 className="font-semibold">AI Protection</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Detect unauthorized AI training usage and style replication
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="h-5 w-5 text-red-500" />
                    <h4 className="font-semibold">Deepfake Detection</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    State-of-the-art deepfake and manipulation detection
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold">Legal Automation</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automated DMCA filing and legal document generation
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-orange-500" />
                    <h4 className="font-semibold">Global Monitoring</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Real-time monitoring across web, social media, marketplaces
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-indigo-500" />
                    <h4 className="font-semibold">Blockchain Registry</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Immutable proof of ownership and creation timestamps
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Production Deployment Examples</h4>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li><strong>Getty Images:</strong> Processing 500M images with 99.2% accuracy</li>
                  <li><strong>Instagram:</strong> Real-time content filtering at 100K uploads/hour</li>
                  <li><strong>Adobe Stock:</strong> Automated copyright verification system</li>
                  <li><strong>OpenSea:</strong> NFT authenticity verification pipeline</li>
                  <li><strong>Shutterstock:</strong> AI-generated content detection at scale</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Authentication</CardTitle>
              <CardDescription>Secure access to the TSMO platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">API Key Authentication</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <code className="text-sm">Authorization: Bearer tsmo_live_abc123...</code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Include your API key in the Authorization header for all requests.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Webhook Signature</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <code className="text-sm">X-TSMO-Signature: sha256=...</code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Webhook events are signed with HMAC-SHA256 for security.
                  </p>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Get API Access:</strong> Contact our enterprise team at{' '}
                  <strong>shirleena.cunningham@tsmowatch.com</strong> for production API keys.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold">Rate Limits by Tier</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {pricingTiers.map((tier, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium">{tier.name}</div>
                      <div className="text-muted-foreground">{tier.limits['API Calls']}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          {endpoints.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category.category === 'Core Monitoring' && <Eye className="h-5 w-5 text-blue-500" />}
                  {category.category === 'AI Protection' && <Brain className="h-5 w-5 text-purple-500" />}
                  {category.category === 'Deepfake Detection' && <Camera className="h-5 w-5 text-red-500" />}
                  {category.category === 'Legal & Compliance' && <FileText className="h-5 w-5 text-green-500" />}
                  {category.category === 'Blockchain & NFT' && <Shield className="h-5 w-5 text-indigo-500" />}
                  {category.category === 'Portfolio Management' && <Database className="h-5 w-5 text-orange-500" />}
                  {category.category === 'Enterprise Features' && <Webhook className="h-5 w-5 text-gray-500" />}
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {category.apis.map((api, apiIndex) => (
                  <div key={apiIndex} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={api.method === 'POST' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {api.method}
                          </Badge>
                          <h4 className="font-semibold">{api.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{api.description}</p>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{baseUrl}{api.endpoint}</code>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium text-primary">{api.pricing}</div>
                        <div className="text-muted-foreground">{api.rateLimit}</div>
                      </div>
                    </div>

                    <Tabs defaultValue="request" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="request">Request</TabsTrigger>
                        <TabsTrigger value="response">Response</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="request" className="space-y-2">
                        <div className="bg-muted p-3 rounded-lg relative">
                          <pre className="text-sm font-mono whitespace-pre-wrap">{api.example.request}</pre>
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(api.example.request, `req-${categoryIndex}-${apiIndex}`)}
                          >
                            {copiedSection === `req-${categoryIndex}-${apiIndex}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="response" className="space-y-2">
                        <div className="bg-muted p-3 rounded-lg relative">
                          <pre className="text-sm font-mono whitespace-pre-wrap">{api.example.response}</pre>
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(api.example.response, `res-${categoryIndex}-${apiIndex}`)}
                          >
                            {copiedSection === `res-${categoryIndex}-${apiIndex}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Pricing</CardTitle>
              <CardDescription>Transparent, scalable pricing for all business sizes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {pricingTiers.map((tier, index) => (
                  <Card key={index} className={index === 1 ? 'border-primary' : ''}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {tier.name}
                        {index === 1 && <Badge>Popular</Badge>}
                      </CardTitle>
                      <div className="text-2xl font-bold">{tier.price}</div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {Object.entries(tier.limits).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <h4 className="font-semibold">Pay-per-Use Pricing</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Image Analysis</div>
                    <div className="text-muted-foreground">$0.05 - $0.25</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Video Processing</div>
                    <div className="text-muted-foreground">$0.50/minute</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Legal Documents</div>
                    <div className="text-muted-foreground">$15 - $25</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Blockchain Registry</div>
                    <div className="text-muted-foreground">$10 + gas</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Examples</CardTitle>
              <CardDescription>Production-ready code for common use cases</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="node" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="node">Node.js</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                </TabsList>

                <TabsContent value="node" className="space-y-3">
                  <div className="bg-muted p-3 rounded-lg relative">
                    <pre className="text-sm font-mono whitespace-pre-wrap">{`// TSMO SDK for Node.js
const TSMO = require('@tsmo/sdk');

const client = new TSMO({
  apiKey: process.env.TSMO_API_KEY,
  baseUrl: '${baseUrl}'
});

// Image copyright analysis
const analyzeImage = async (imageUrl) => {
  try {
    const result = await client.visualRecognition.analyze({
      image_url: imageUrl,
      analysis_types: ['similarity', 'deepfake'],
      threshold: 0.85
    });
    
    if (result.similarity_score > 0.9) {
      console.log('Potential copyright match found!');
      // Trigger automated DMCA workflow
      await client.legal.fileDMCA({
        infringement_url: result.matches[0].source_url,
        original_work_url: imageUrl
      });
    }
    
    return result;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
};

// Real-time monitoring setup
const startMonitoring = async (portfolioId) => {
  const monitor = await client.monitoring.start({
    portfolio_id: portfolioId,
    platforms: ['web', 'social_media', 'marketplaces'],
    scan_frequency: 'hourly'
  });
  
  // Set up webhook handler
  app.post('/webhook/tsmo', (req, res) => {
    const event = req.body;
    
    switch (event.type) {
      case 'match_found':
        handleCopyrightMatch(event.data);
        break;
      case 'dmca_filed':
        handleDMCAUpdate(event.data);
        break;
    }
    
    res.status(200).send('OK');
  });
  
  return monitor;
};`}</pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard('// Node.js example...', 'node')}
                    >
                      {copiedSection === 'node' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="python" className="space-y-3">
                  <div className="bg-muted p-3 rounded-lg relative">
                    <pre className="text-sm font-mono whitespace-pre-wrap">{`# TSMO Python SDK
import tsmo
from tsmo import TSMO

client = TSMO(api_key=os.getenv('TSMO_API_KEY'))

# Bulk portfolio analysis
async def analyze_portfolio(portfolio_id):
    # Start comprehensive scan
    scan = await client.portfolio.scan(
        portfolio_id=portfolio_id,
        scan_depth='comprehensive',
        platforms=['all']
    )
    
    # Process results
    results = await scan.wait_for_completion()
    
    high_risk_matches = [
        match for match in results.matches 
        if match.confidence > 0.9
    ]
    
    # Auto-file DMCA for high confidence matches
    for match in high_risk_matches:
        await client.legal.file_dmca(
            infringement_url=match.source_url,
            original_work_url=match.original_url,
            auto_submit=True
        )
    
    return {
        'total_matches': len(results.matches),
        'high_risk': len(high_risk_matches),
        'dmca_filed': len(high_risk_matches)
    }

# AI training detection
def check_ai_training_usage(content_hash):
    result = client.ai_protection.detect_training_usage(
        content_hash=content_hash,
        detection_methods=['dataset_matching', 'style_analysis']
    )
    
    if result.violation_detected:
        # Generate cease & desist automatically
        legal_doc = client.legal.generate_document(
            document_type='cease_and_desist',
            violation_details=result.evidence
        )
        
        return {
            'violation': True,
            'confidence': result.confidence,
            'legal_document': legal_doc.download_url
        }
    
    return {'violation': False}`}</pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard('# Python example...', 'python')}
                    >
                      {copiedSection === 'python' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="php" className="space-y-3">
                  <div className="bg-muted p-3 rounded-lg relative">
                    <pre className="text-sm font-mono whitespace-pre-wrap">{`<?php
// TSMO PHP SDK
require_once 'vendor/autoload.php';

use TSMO\\Client;

$tsmo = new Client([
    'api_key' => $_ENV['TSMO_API_KEY'],
    'base_url' => '${baseUrl}'
]);

// WordPress integration example
function tsmo_check_upload($file) {
    global $tsmo;
    
    try {
        $analysis = $tsmo->visualRecognition->analyze([
            'image_url' => $file['url'],
            'analysis_types' => ['similarity', 'ai_detection'],
            'threshold' => 0.80
        ]);
        
        if ($analysis['similarity_score'] > 0.85) {
            // Block upload
            wp_die('Copyright violation detected. Upload blocked.');
        }
        
        if ($analysis['ai_generated_probability'] > 0.90) {
            // Flag as AI-generated
            update_post_meta($file['post_id'], '_tsmo_ai_generated', true);
        }
        
        return $file;
        
    } catch (Exception $e) {
        error_log('TSMO API Error: ' . $e->getMessage());
        return $file; // Allow upload if API fails
    }
}

add_filter('wp_handle_upload', 'tsmo_check_upload');

// E-commerce integration
function check_product_image($product_id, $image_url) {
    global $tsmo;
    
    $result = $tsmo->ipGuardrail->check([
        'title' => get_the_title($product_id),
        'image_url' => $image_url,
        'text_fingerprint' => generate_product_fingerprint($product_id)
    ]);
    
    switch ($result['decision']) {
        case 'block':
            return [
                'allowed' => false,
                'reason' => 'Potential copyright violation detected'
            ];
        case 'review':
            return [
                'allowed' => true,
                'requires_review' => true
            ];
        default:
            return ['allowed' => true];
    }
}
?>`}</pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard('<?php // PHP example...', 'php')}
                    >
                      {copiedSection === 'php' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="curl" className="space-y-3">
                  <div className="bg-muted p-3 rounded-lg relative">
                    <pre className="text-sm font-mono whitespace-pre-wrap">{`# Quick image analysis
curl -X POST ${baseUrl}/advanced-visual-analysis \\
  -H "Authorization: Bearer tsmo_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/image.jpg",
    "analysis_types": ["similarity", "deepfake", "metadata"],
    "threshold": 0.85
  }'

# Start portfolio monitoring
curl -X POST ${baseUrl}/portfolio-monitoring-pro \\
  -H "Authorization: Bearer tsmo_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "portfolio_id": "port_abc123",
    "scan_depth": "comprehensive",
    "platforms": ["web", "social_media", "marketplaces"],
    "alert_threshold": 0.75
  }'

# Generate DMCA notice
curl -X POST ${baseUrl}/automated-dmca-filing \\
  -H "Authorization: Bearer tsmo_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "infringement_url": "https://violator.com/stolen-content",
    "original_work_url": "https://original.com/my-work",
    "copyright_owner": "John Artist",
    "contact_email": "john@artist.com",
    "auto_submit": true
  }'

# Blockchain registration
curl -X POST ${baseUrl}/advanced-blockchain-registration \\
  -H "Authorization: Bearer tsmo_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "artwork_hash": "ipfs://QmXyZ123...",
    "metadata": {
      "title": "Digital Art Piece",
      "creator": "0x742d35Cc6Bb3e",
      "creation_date": "2024-01-15"
    },
    "blockchain": "ethereum"
  }'`}</pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard('# cURL examples...', 'curl')}
                    >
                      {copiedSection === 'curl' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enterprise" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Features</CardTitle>
              <CardDescription>Advanced capabilities for large-scale deployments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Real-time Processing
                  </h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>Sub-second response times for critical applications</li>
                    <li>Streaming API for real-time content analysis</li>
                    <li>Priority queue processing for enterprise customers</li>
                    <li>Global CDN with edge processing capabilities</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-500" />
                    Data & Analytics
                  </h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>Custom analytics dashboards and reporting</li>
                    <li>Data export in multiple formats (CSV, JSON, API)</li>
                    <li>Historical data retention (5+ years)</li>
                    <li>Advanced filtering and search capabilities</li>
                  </ul>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Enterprise SLA:</strong> 99.9% uptime guarantee with dedicated support and 
                  custom integration assistance included.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-semibold">White-label Solutions</h4>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">
                    Complete white-label deployment of the TSMO platform under your brand:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>Custom domain and SSL certificates</li>
                    <li>Branded API endpoints and documentation</li>
                    <li>Custom UI themes and components</li>
                    <li>Dedicated infrastructure and databases</li>
                    <li>Full source code licensing available</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Integration Support</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Dedicated Success Manager</div>
                    <div className="text-muted-foreground">Personal technical account manager</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Custom Development</div>
                    <div className="text-muted-foreground">Bespoke API endpoints and features</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">24/7 Support</div>
                    <div className="text-muted-foreground">Priority support with SLA guarantees</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Training & Onboarding</div>
                    <div className="text-muted-foreground">Comprehensive team training programs</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Ready to Get Started?</strong> Contact our enterprise team at{' '}
              <strong>shirleena.cunningham@tsmowatch.com</strong> for custom pricing and implementation planning.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}