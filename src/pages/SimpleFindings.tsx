import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PartyPopper, 
  AlertCircle, 
  ExternalLink, 
  Brain,
  Shield,
  Sparkles,
  ChevronRight,
  CheckCircle,
  Trash2,
  UserPlus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FindingExplanationPopover } from '@/components/beginner/FindingExplanationPopover';
import { GuestSignupCTA } from '@/components/beginner/GuestSignupCTA';
import { buildMatchUrl } from '@/utils/buildMatchUrl';

interface SimpleFinding {
  id: string;
  type: 'deepfake' | 'copyright' | 'ai_training';
  title: string;
  description: string;
  source: string;
  sourceUrl: string;
  sourceTitle: string;
  foundDate: string;
  isUrgent: boolean;
  isReviewed: boolean;
}

const SimpleFindings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [findings, setFindings] = useState<SimpleFinding[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter out internal Supabase URLs - these are not real external threats
  const isRealExternalSource = (url: string, domain: string) => {
    if (!url || !domain) return false;
    const internalDomains = ['supabase.co', 'supabase.com', 'localhost', '127.0.0.1'];
    return !internalDomains.some(d => domain.includes(d) || url.includes(d));
  };

  useEffect(() => {
    loadFindings();
  }, [user]);

  const loadFindings = async () => {
    try {
      setLoading(true);
      const allFindings: SimpleFinding[] = [];

      // Load deepfake matches - only external sources
      const { data: deepfakes } = await supabase
        .from('deepfake_matches')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(20);

      if (deepfakes) {
        deepfakes
          .filter(d => isRealExternalSource(d.source_url, d.source_domain))
          .forEach(d => {
          allFindings.push({
            id: d.id,
            type: 'deepfake',
            title: 'Someone edited your face into this',
            description: getDeepfakeDescription(d.manipulation_type),
            source: d.source_domain || 'Unknown website',
            sourceUrl: d.source_url,
            sourceTitle: d.source_title || '',
            foundDate: formatDate(d.detected_at),
            isUrgent: d.threat_level === 'high',
            isReviewed: d.is_reviewed || false
          });
        });
      }

      // Load copyright matches
      if (user) {
        const { data: copyrights } = await supabase
          .from('copyright_matches')
          .select('*')
          .order('detected_at', { ascending: false })
          .limit(20);

        if (copyrights) {
          copyrights
            .filter(c => isRealExternalSource(c.source_url, c.source_domain))
            .forEach(c => {
            allFindings.push({
              id: c.id,
              type: 'copyright',
              title: 'Someone is using your art',
              description: getCopyrightDescription(c.match_type),
              source: c.source_domain || 'Unknown website',
              sourceUrl: c.source_url,
              sourceTitle: c.source_title || '',
              foundDate: formatDate(c.detected_at),
              isUrgent: c.threat_level === 'high',
              isReviewed: c.is_reviewed || false
            });
          });
        }

        // Load AI training violations - only external sources
        const { data: violations } = await supabase
          .from('ai_training_violations')
          .select('*')
          .eq('user_id', user.id)
          .order('detected_at', { ascending: false })
          .limit(20);

        if (violations) {
          violations
            .filter(v => isRealExternalSource(v.source_url || '', v.source_domain || ''))
            .forEach(v => {
            allFindings.push({
              id: v.id,
              type: 'ai_training',
              title: 'An AI company may be using your work',
              description: getAIDescription(v.violation_type),
              source: v.source_domain || 'AI Training Dataset',
              sourceUrl: v.source_url || '',
              sourceTitle: '',
              foundDate: formatDate(v.detected_at),
              isUrgent: true,
              isReviewed: v.status === 'resolved'
            });
          });
        }
      }

      // Sort by urgency and date
      allFindings.sort((a, b) => {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        return 0;
      });

      setFindings(allFindings);
    } catch (error) {
      console.error('Error loading findings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeepfakeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      'face_swap': 'Your face was put onto someone else\'s body',
      'lip_sync': 'Someone made a fake video of you speaking',
      'full_body': 'A completely fake video of you was created',
      'voice_clone': 'Someone copied your voice'
    };
    return descriptions[type] || 'A manipulated image or video was detected';
  };

  const getCopyrightDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      'exact': 'This is an exact copy of your work',
      'modified': 'Your work was changed slightly and reused',
      'derivative': 'Someone created something based on your work',
      'partial': 'Part of your work was used without permission'
    };
    return descriptions[type] || 'Your work may have been copied';
  };

  const getAIDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      'training_data': 'Your work was found in AI training data',
      'model_output': 'An AI is generating work similar to yours',
      'dataset_inclusion': 'Your work was added to a public dataset'
    };
    return descriptions[type] || 'Your work may be used to train AI';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'deepfake': return Brain;
      case 'copyright': return Shield;
      case 'ai_training': return Sparkles;
      default: return AlertCircle;
    }
  };

  const handleGetHelp = (finding: SimpleFinding) => {
    if (finding.type === 'copyright') {
      navigate('/dmca-center');
    } else {
      toast.info("We'll help you handle this", {
        description: "Our team will guide you through the next steps."
      });
    }
  };

  const handleMarkSeen = async (finding: SimpleFinding) => {
    try {
      const table = finding.type === 'deepfake' ? 'deepfake_matches' : 
                    finding.type === 'copyright' ? 'copyright_matches' : 
                    'ai_training_violations';
      
      const field = finding.type === 'ai_training' ? 'status' : 'is_reviewed';
      const value = finding.type === 'ai_training' ? 'resolved' : true;

      await supabase
        .from(table)
        .update({ [field]: value })
        .eq('id', finding.id);

      setFindings(prev => prev.map(f => 
        f.id === finding.id ? { ...f, isReviewed: true } : f
      ));

      toast.success("Got it!", { description: "We've marked this as seen." });

      // Show sign-up prompt for guests after taking action
      if (!user) {
        setTimeout(() => {
          toast("Want to track future findings?", {
            description: "Create a free account to get email alerts",
            action: {
              label: "Sign Up",
              onClick: () => navigate('/auth')
            }
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Error marking as seen:', error);
    }
  };

  const handleDelete = async (finding: SimpleFinding) => {
    try {
      const table = finding.type === 'deepfake' ? 'deepfake_matches' : 
                    finding.type === 'copyright' ? 'copyright_matches' : 
                    'ai_training_violations';

      await supabase
        .from(table)
        .delete()
        .eq('id', finding.id);

      setFindings(prev => prev.filter(f => f.id !== finding.id));

      toast.success("Removed", { description: "This alert has been deleted." });
    } catch (error) {
      console.error('Error deleting finding:', error);
      toast.error("Couldn't delete", { description: "Please try again." });
    }
  };

  const unreviewedFindings = findings.filter(f => !f.isReviewed);
  const hasIssues = unreviewedFindings.length > 0;

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-muted rounded-2xl" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      {/* Status Banner */}
      <Card className={`border-2 ${hasIssues ? 'border-orange-500/50 bg-orange-50 dark:bg-orange-950/20' : 'border-green-500/50 bg-green-50 dark:bg-green-950/20'}`}>
        <CardContent className="p-8 text-center">
          {hasIssues ? (
            <>
              <AlertCircle className="h-16 w-16 mx-auto text-orange-500 mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                We Found Something
              </h1>
              <p className="text-muted-foreground text-lg">
                {unreviewedFindings.length} {unreviewedFindings.length === 1 ? 'issue needs' : 'issues need'} your attention
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Don't worry — we'll help you through each one
              </p>
            </>
          ) : (
            <>
              <PartyPopper className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Good News! Your Content is Safe
              </h1>
              <p className="text-muted-foreground text-lg">
                No unauthorized copies or fakes found
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                We're continuously monitoring to keep it that way
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Findings List */}
      {unreviewedFindings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Things that need attention</h2>
          
          {unreviewedFindings.map((finding) => {
            const Icon = getIcon(finding.type);
            
            return (
              <Card key={finding.id} className={`overflow-hidden ${finding.isUrgent ? 'border-l-4 border-l-destructive' : ''}`}>
                <CardContent className="p-0">
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        finding.isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-orange-100 dark:bg-orange-900/20 text-orange-600'
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-lg">
                          {finding.title}
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          {finding.description}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                          <span>Found on: <strong className="text-foreground">{finding.source}</strong></span>
                          <span>•</span>
                          <span>{finding.foundDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-5">
                      {finding.sourceUrl && (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.open(buildMatchUrl(finding.sourceUrl, finding.source, finding.sourceTitle || finding.title), '_blank', 'noopener,noreferrer')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          See Where
                        </Button>
                      )}
                      
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => handleGetHelp(finding)}
                      >
                        Get Help Removing This
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Bottom action */}
                  <div className="px-5 py-3 bg-muted/50 border-t flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleMarkSeen(finding)}
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                        I've seen this
                      </button>
                      
                      <button
                        onClick={() => handleDelete(finding)}
                        className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                    
                    <FindingExplanationPopover type={finding.type} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reviewed/Resolved Section */}
      {findings.filter(f => f.isReviewed).length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-semibold text-muted-foreground">Already reviewed</h2>
          
          {findings.filter(f => f.isReviewed).map((finding) => {
            const Icon = getIcon(finding.type);
            
            return (
              <Card key={finding.id} className="bg-muted/30 border-muted">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-muted-foreground">
                        {finding.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {finding.source} • {finding.foundDate}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(finding)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {findings.length === 0 && (
        user ? (
          <Card className="bg-muted/30">
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No findings yet</h3>
              <p className="text-muted-foreground">
                Upload your content to start monitoring for unauthorized use
              </p>
              <Button className="mt-4" onClick={() => navigate('/upload')}>
                Upload Content
              </Button>
            </CardContent>
          </Card>
        ) : (
          <GuestSignupCTA context="empty" />
        )
      )}

      {/* Sign-up CTA for guests with findings */}
      {!user && findings.length > 0 && (
        <GuestSignupCTA context="findings" />
      )}
    </div>
  );
};

export default SimpleFindings;
