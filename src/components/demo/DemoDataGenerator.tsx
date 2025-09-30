import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Sparkles, 
  Image, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Loader2
} from 'lucide-react';

interface DemoDataStats {
  artworks: number;
  protectionRecords: number;
  threats: number;
  blockchainCerts: number;
}

export const DemoDataGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<DemoDataStats | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const demoArtworks = [
    { title: 'Digital Portrait', category: 'Digital Art', tags: ['portrait', 'digital', 'art'] },
    { title: 'Abstract Landscape', category: 'Digital Art', tags: ['abstract', 'landscape', 'modern'] },
    { title: 'Character Design', category: 'Illustration', tags: ['character', 'design', 'concept'] },
    { title: 'Urban Photography', category: 'Photography', tags: ['urban', 'street', 'architecture'] },
    { title: 'Nature Scene', category: 'Photography', tags: ['nature', 'landscape', 'outdoor'] }
  ];

  const generateDemoData = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to generate demo data',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const newStats: DemoDataStats = {
        artworks: 0,
        protectionRecords: 0,
        threats: 0,
        blockchainCerts: 0
      };

      // Step 1: Create demo artworks (20%)
      setProgress(10);
      const artworkIds: string[] = [];
      
      for (const artwork of demoArtworks) {
        const { data: artworkData, error: artworkError } = await supabase
          .from('artwork')
          .insert({
            user_id: user.id,
            title: artwork.title,
            category: artwork.category,
            tags: artwork.tags,
            description: `Demo ${artwork.title} - showcasing AI protection capabilities`,
            status: 'active',
            file_paths: [`/demo/${artwork.title.toLowerCase().replace(/ /g, '-')}.jpg`],
            ai_protection_enabled: true,
            ai_protection_level: 'advanced',
            enable_watermark: true,
            enable_blockchain: true,
            processing_status: 'completed'
          })
          .select()
          .single();

        if (!artworkError && artworkData) {
          artworkIds.push(artworkData.id);
          newStats.artworks++;
        }
      }

      setProgress(20);

      // Step 2: Create AI protection records (40%)
      for (const artworkId of artworkIds) {
        const protectionId = `prot-${Math.random().toString(36).substr(2, 9)}`;
        const { data: protectionData } = await supabase
          .from('ai_protection_records')
          .insert([{
            user_id: user.id,
            artwork_id: artworkId,
            content_type: 'image',
            protection_level: 'advanced',
            protection_id: protectionId,
            original_filename: 'demo-artwork.jpg',
            file_fingerprint: `demo-fp-${Math.random().toString(36).substr(2, 9)}`,
            protection_methods: ["adversarial", "watermarking", "fingerprinting"],
            is_active: true
          }] as any)
          .select();

        if (protectionData && protectionData.length > 0) {
          newStats.protectionRecords++;
        }
      }

      setProgress(40);

      // Step 3: Create demo threats and copyright matches (60%)
      const threatTypes = [
        { type: 'unauthorized_use', level: 'medium', confidence: 0.85 },
        { type: 'ai_training', level: 'high', confidence: 0.92 },
        { type: 'style_theft', level: 'low', confidence: 0.75 },
        { type: 'commercial_misuse', level: 'high', confidence: 0.88 }
      ];

      for (let i = 0; i < artworkIds.length; i++) {
        const artworkId = artworkIds[i];
        const threat = threatTypes[i % threatTypes.length];

        // Create copyright match
        await supabase
          .from('copyright_matches')
          .insert({
            artwork_id: artworkId,
            scan_id: `demo-scan-${Math.random().toString(36).substr(2, 9)}`,
            match_type: threat.type,
            threat_level: threat.level,
            match_confidence: threat.confidence,
            source_url: `https://demo-platform.example.com/content/${Math.random().toString(36).substr(2, 9)}`,
            source_domain: 'demo-platform.example.com',
            source_title: `Demo Content ${i + 1}`,
            description: `Detected ${threat.type} with ${(threat.confidence * 100).toFixed(0)}% confidence`,
            is_reviewed: i % 2 === 0,
            dmca_filed: i % 3 === 0
          });

        newStats.threats++;

        // Create AI threat detection
        await supabase
          .from('ai_threat_detections')
          .insert({
            user_id: user.id,
            threat_type: threat.type,
            platform: 'demo_platform',
            threat_level: threat.level,
            confidence_score: threat.confidence,
            source_url: `https://demo-platform.example.com/content/${Math.random().toString(36).substr(2, 9)}`,
            status: i % 2 === 0 ? 'resolved' : 'new',
            threat_data: {
              detection_method: 'ai_analysis',
              similarity_score: threat.confidence,
              violation_details: `Demo threat detection for ${threat.type}`
            }
          });
      }

      setProgress(60);

      // Step 4: Create blockchain certificates (80%)
      for (const artworkId of artworkIds.slice(0, 3)) {
        await supabase
          .from('blockchain_certificates')
          .insert({
            user_id: user.id,
            artwork_id: artworkId,
            certificate_id: `DEMO-CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            blockchain_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            artwork_fingerprint: `demo-fp-${Math.random().toString(36).substr(2, 16)}`,
            ownership_proof: `Demo ownership proof for artwork ${artworkId}`,
            registration_timestamp: new Date().toISOString(),
            status: 'registered',
            certificate_data: {
              blockchain: 'ethereum',
              network: 'mainnet',
              gas_used: '21000',
              confirmation_blocks: 12
            }
          });

        newStats.blockchainCerts++;
      }

      setProgress(80);

      // Step 5: Create monitoring agents (100%)
      const platforms = ['Instagram', 'Pinterest', 'DeviantArt', 'ArtStation'];
      for (const platform of platforms) {
        await supabase
          .from('ai_monitoring_agents')
          .insert({
            user_id: user.id,
            platform_id: `demo_${platform.toLowerCase()}`,
            platform_name: platform,
            status: 'active',
            scan_frequency: 60,
            threats_detected: Math.floor(Math.random() * 10),
            success_rate: 0.95 + Math.random() * 0.05,
            last_scan: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            agent_config: {
              scan_depth: 'comprehensive',
              auto_takedown: true
            }
          });
      }

      setProgress(100);
      setStats(newStats);

      toast({
        title: 'Demo data generated successfully!',
        description: `Created ${newStats.artworks} artworks, ${newStats.threats} threats, and ${newStats.blockchainCerts} blockchain certificates`,
      });

    } catch (error) {
      console.error('Error generating demo data:', error);
      toast({
        title: 'Failed to generate demo data',
        description: 'Please try again or contact support',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Interactive Demo Mode</CardTitle>
        </div>
        <CardDescription>
          Generate realistic demo data to explore all features without uploading actual artwork
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!stats ? (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Image className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">5 Demo Artworks</p>
                  <p className="text-xs text-muted-foreground">Various categories and styles</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Shield className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">AI Protection Records</p>
                  <p className="text-xs text-muted-foreground">Advanced protection enabled</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Simulated Threats</p>
                  <p className="text-xs text-muted-foreground">Multiple threat types and levels</p>
                </div>
              </div>
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generating demo data...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button
              onClick={generateDemoData}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Demo Data...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Demo Data
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              This will create sample data to help you explore the platform. You can delete it anytime.
            </p>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-500">Demo Data Generated!</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.artworks}</div>
                <div className="text-sm text-muted-foreground">Artworks</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-500">{stats.protectionRecords}</div>
                <div className="text-sm text-muted-foreground">Protected</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-orange-500">{stats.threats}</div>
                <div className="text-sm text-muted-foreground">Threats</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-500">{stats.blockchainCerts}</div>
                <div className="text-sm text-muted-foreground">Certificates</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1"
              >
                View Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => setStats(null)}
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
