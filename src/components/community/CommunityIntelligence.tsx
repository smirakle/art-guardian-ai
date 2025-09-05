import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, Eye, ThumbsUp, MessageSquare, Award, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ThreatReport {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  verifiedBy: number;
  status: 'pending' | 'verified' | 'dismissed';
  createdAt: string;
  location: string;
  evidence: string[];
}

interface CommunityMember {
  id: string;
  username: string;
  reputation: number;
  reportsSubmitted: number;
  reportsVerified: number;
  level: string;
  badges: string[];
}

export const CommunityIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState('threats');
  const [threats, setThreats] = useState<ThreatReport[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [userStats, setUserStats] = useState<CommunityMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('community-intelligence', {
        body: { action: 'getCommunityData' }
      });

      if (error) throw error;

      // Mock data for demonstration
      const mockThreats: ThreatReport[] = [
        {
          id: '1',
          type: 'Deepfake Detection',
          description: 'Suspicious video content on social media platform',
          severity: 'high',
          reportedBy: 'CommunityWatcher#1234',
          verifiedBy: 12,
          status: 'verified',
          createdAt: '2024-01-15T10:30:00Z',
          location: 'Instagram',
          evidence: ['video_analysis.json', 'metadata_report.pdf']
        },
        {
          id: '2',
          type: 'AI-Generated Art',
          description: 'Unauthorized AI-generated artwork using protected style',
          severity: 'medium',
          reportedBy: 'ArtDefender#5678',
          verifiedBy: 8,
          status: 'pending',
          createdAt: '2024-01-14T15:45:00Z',
          location: 'DeviantArt',
          evidence: ['style_comparison.jpg', 'source_analysis.txt']
        },
        {
          id: '3',
          type: 'Voice Cloning',
          description: 'Unauthorized use of celebrity voice in commercial audio',
          severity: 'critical',
          reportedBy: 'VoiceGuard#9999',
          verifiedBy: 25,
          status: 'verified',
          createdAt: '2024-01-13T09:15:00Z',
          location: 'YouTube',
          evidence: ['audio_fingerprint.wav', 'spectral_analysis.png']
        }
      ];

      const mockMembers: CommunityMember[] = [
        {
          id: '1',
          username: 'CommunityWatcher#1234',
          reputation: 1250,
          reportsSubmitted: 45,
          reportsVerified: 38,
          level: 'Expert Sentinel',
          badges: ['Top Contributor', 'Accuracy Master', 'Speed Demon']
        },
        {
          id: '2',
          username: 'VoiceGuard#9999',
          reputation: 2100,
          reportsSubmitted: 67,
          reportsVerified: 59,
          level: 'Elite Guardian',
          badges: ['Voice Specialist', 'Community Leader', 'Threat Hunter']
        },
        {
          id: '3',
          username: 'ArtDefender#5678',
          reputation: 890,
          reportsSubmitted: 32,
          reportsVerified: 25,
          level: 'Guardian',
          badges: ['Art Expert', 'Quick Verifier']
        }
      ];

      const mockUserStats: CommunityMember = {
        id: 'current-user',
        username: 'You',
        reputation: 450,
        reportsSubmitted: 15,
        reportsVerified: 12,
        level: 'Guardian',
        badges: ['New Member', 'First Report']
      };

      setThreats(mockThreats);
      setMembers(mockMembers);
      setUserStats(mockUserStats);

    } catch (error) {
      console.error('Failed to load community data:', error);
      toast({
        title: "Error",
        description: "Failed to load community intelligence data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyThreat = async (threatId: string, isValid: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke('community-intelligence', {
        body: { 
          action: 'verifyThreat',
          threatId,
          isValid
        }
      });

      if (error) throw error;

      toast({
        title: "Verification Submitted",
        description: `Threat report ${isValid ? 'verified' : 'dismissed'}. You earned 10 reputation points!`,
      });

      // Update local state
      setThreats(prev => 
        prev.map(threat => 
          threat.id === threatId 
            ? { ...threat, verifiedBy: threat.verifiedBy + 1 }
            : threat
        )
      );

      if (userStats) {
        setUserStats(prev => prev ? { 
          ...prev, 
          reputation: prev.reputation + 10,
          reportsVerified: prev.reportsVerified + 1
        } : null);
      }

    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Unable to submit verification. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReportThreat = async () => {
    toast({
      title: "Report Threat",
      description: "Threat reporting form would open here. Stay tuned for this feature!",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'dismissed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading community intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Intelligence Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="threats">Active Threats</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="profile">My Profile</TabsTrigger>
              <TabsTrigger value="contribute">Contribute</TabsTrigger>
            </TabsList>

            <TabsContent value="threats" className="space-y-4">
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  Help verify threat reports from the community. Accurate verifications earn reputation points.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {threats.map((threat) => (
                  <Card key={threat.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{threat.type}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Reported by {threat.reportedBy} • {threat.location}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getSeverityColor(threat.severity)}>
                            {threat.severity}
                          </Badge>
                          <Badge className={getStatusColor(threat.status)}>
                            {threat.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700">{threat.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {threat.verifiedBy} verifications
                        </span>
                        <span>{new Date(threat.createdAt).toLocaleDateString()}</span>
                      </div>

                      {threat.evidence.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Evidence</h4>
                          <div className="flex gap-2">
                            {threat.evidence.map((evidence, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {evidence}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {threat.status === 'pending' && (
                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleVerifyThreat(threat.id, true)}
                            className="flex items-center gap-1"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            Verify as Valid
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleVerifyThreat(threat.id, false)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{threats.length}</p>
                    <p className="text-sm text-muted-foreground">Active Threats</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{members.length}</p>
                    <p className="text-sm text-muted-foreground">Active Members</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">98.5%</p>
                    <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {members.map((member, index) => (
                  <Card key={member.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold">{member.username}</h3>
                            <p className="text-sm text-muted-foreground">{member.level}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{member.reputation.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">reputation</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Reports Submitted</p>
                          <p className="font-semibold">{member.reportsSubmitted}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Reports Verified</p>
                          <p className="font-semibold">{member.reportsVerified}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex gap-1">
                          {member.badges.map((badge, badgeIndex) => (
                            <Badge key={badgeIndex} variant="secondary" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              {userStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Your Community Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{userStats.reputation}</p>
                        <p className="text-sm text-muted-foreground">Reputation</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{userStats.reportsSubmitted}</p>
                        <p className="text-sm text-muted-foreground">Reports Submitted</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{userStats.reportsVerified}</p>
                        <p className="text-sm text-muted-foreground">Reports Verified</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {Math.round((userStats.reportsVerified / userStats.reportsSubmitted) * 100)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Current Level</h4>
                      <Badge className="bg-gradient-to-r from-purple-500 to-blue-500">
                        {userStats.level}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Earned Badges</h4>
                      <div className="flex gap-2">
                        {userStats.badges.map((badge, index) => (
                          <Badge key={index} variant="outline">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Progress to Next Level</h4>
                      <Progress value={75} className="w-full" />
                      <p className="text-sm text-muted-foreground mt-1">
                        150 more reputation points to reach Expert Sentinel
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="contribute" className="space-y-4">
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  Join our community of threat hunters and help protect intellectual property worldwide.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Report a Threat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Found suspicious activity? Help the community by reporting potential IP theft or AI misuse.
                    </p>
                    <Button onClick={handleReportThreat} className="w-full">
                      Submit Threat Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Verify Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Help verify threat reports from other community members to earn reputation points.
                    </p>
                    <Button 
                      onClick={() => setActiveTab('threats')} 
                      variant="outline" 
                      className="w-full"
                    >
                      Review Pending Reports
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Reputation System</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Submit verified threat report</span>
                      <Badge>+50 points</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Correctly verify another's report</span>
                      <Badge>+10 points</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>First to report a major threat</span>
                      <Badge>+100 points</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Maintain 95%+ accuracy over 50 reports</span>
                      <Badge>+200 points</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};