import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  HelpCircle, 
  X, 
  ChevronRight,
  Lightbulb,
  Play,
  Book,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface HelpContent {
  title: string;
  description: string;
  quickTips: string[];
  commonIssues: { question: string; answer: string }[];
  tutorials: { title: string; url: string; duration?: string }[];
  relatedLinks: { title: string; path: string }[];
}

const helpContentMap: Record<string, HelpContent> = {
  '/upload': {
    title: 'Upload & Protect Your Artwork',
    description: 'Learn how to upload your artwork and apply protection layers',
    quickTips: [
      'Upload high-quality images for better protection',
      'Add descriptive titles and tags for better organization',
      'Enable AI protection for style theft prevention',
      'Use batch upload for multiple files'
    ],
    commonIssues: [
      {
        question: 'Why is my upload taking so long?',
        answer: 'Large files and AI processing can take time. The protection layers are being applied to ensure maximum security.'
      },
      {
        question: 'What file formats are supported?',
        answer: 'We support JPG, PNG, GIF, WebP, and SVG formats up to 50MB per file.'
      }
    ],
    tutorials: [
      { title: 'First Upload Walkthrough', url: '/tutorials/first-upload', duration: '3 min' },
      { title: 'AI Protection Setup', url: '/tutorials/ai-protection', duration: '5 min' }
    ],
    relatedLinks: [
      { title: 'AI Protection Settings', path: '/ai-protection-settings' },
      { title: 'Monitoring Dashboard', path: '/monitoring' }
    ]
  },
  '/monitoring': {
    title: 'Real-time Art Monitoring',
    description: 'Monitor your artwork across the internet for unauthorized usage',
    quickTips: [
      'Check your dashboard daily for new alerts',
      'Set up email notifications for immediate threats',
      'Review and approve automated takedown notices',
      'Use the search feature to find specific violations'
    ],
    commonIssues: [
      {
        question: 'Why am I not seeing any violations?',
        answer: 'This could mean your art is well-protected! Our AI continuously scans and may not find violations immediately.'
      },
      {
        question: 'How often does the monitoring run?',
        answer: 'Monitoring runs 24/7 with real-time alerts. New scans are performed every hour.'
      }
    ],
    tutorials: [
      { title: 'Understanding Your Dashboard', url: '/tutorials/dashboard', duration: '4 min' },
      { title: 'Setting Up Alerts', url: '/tutorials/alerts', duration: '2 min' }
    ],
    relatedLinks: [
      { title: 'Upload More Artwork', path: '/upload' },
      { title: 'Legal Actions', path: '/legal' }
    ]
  },
  '/ai-protection-settings': {
    title: 'AI Protection Configuration',
    description: 'Configure advanced AI protection settings for your artwork',
    quickTips: [
      'Enable StyleCloak for invisible protection',
      'Adjust protection strength based on art style',
      'Use advanced settings for commercial work',
      'Preview changes before applying'
    ],
    commonIssues: [
      {
        question: 'Will protection affect image quality?',
        answer: 'Our protection is invisible to human eyes but prevents AI from learning your style.'
      },
      {
        question: 'How strong should I set the protection?',
        answer: 'Higher protection is better for valuable artwork. Start with medium and adjust as needed.'
      }
    ],
    tutorials: [
      { title: 'StyleCloak Protection Guide', url: '/tutorials/stylecloak', duration: '6 min' },
      { title: 'Advanced Settings Explained', url: '/tutorials/advanced-ai', duration: '8 min' }
    ],
    relatedLinks: [
      { title: 'Upload Artwork', path: '/upload' },
      { title: 'View Protection Status', path: '/monitoring' }
    ]
  },
  '/dashboard': {
    title: 'Dashboard Overview',
    description: 'Your central hub for all protection activities and insights',
    quickTips: [
      'Check key metrics at the top for quick status',
      'Review recent activity for important updates',
      'Use tabs to navigate between different features',
      'Set up widgets for your most important data'
    ],
    commonIssues: [
      {
        question: 'Why are some metrics showing zero?',
        answer: 'New accounts start with zero metrics. Upload artwork and enable monitoring to see data.'
      },
      {
        question: 'How do I customize my dashboard?',
        answer: 'Click the settings icon to choose which widgets and metrics to display.'
      }
    ],
    tutorials: [
      { title: 'Dashboard Tour', url: '/tutorials/dashboard-tour', duration: '5 min' },
      { title: 'Customizing Your View', url: '/tutorials/customize', duration: '3 min' }
    ],
    relatedLinks: [
      { title: 'Upload First Artwork', path: '/upload' },
      { title: 'Start Monitoring', path: '/monitoring' }
    ]
  }
};

interface ContextualHelpProps {
  className?: string;
}

const ContextualHelp: React.FC<ContextualHelpProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const currentPath = location.pathname;
  const helpContent = helpContentMap[currentPath] || {
    title: 'General Help',
    description: 'Get help with using TSMO Art Guardian',
    quickTips: [
      'Use the navigation menu to explore features',
      'Check out our getting started guide',
      'Contact support if you need assistance'
    ],
    commonIssues: [],
    tutorials: [],
    relatedLinks: [
      { title: 'Getting Started', path: '/getting-started' },
      { title: 'Help Center', path: '/help' }
    ]
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 shadow-lg bg-background/95 backdrop-blur-sm ${className}`}
      >
        <HelpCircle className="h-4 w-4 mr-2" />
        Help
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-40 w-96 max-h-[600px] overflow-y-auto shadow-xl border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              {helpContent.title}
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {helpContent.description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Tips */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <h4 className="font-semibold text-sm">Quick Tips</h4>
          </div>
          <ul className="space-y-2">
            {helpContent.quickTips.map((tip, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {helpContent.commonIssues.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <h4 className="font-semibold text-sm">Common Questions</h4>
              </div>
              <div className="space-y-3">
                {helpContent.commonIssues.map((issue, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <h5 className="font-medium text-sm mb-1">{issue.question}</h5>
                    <p className="text-xs text-muted-foreground">{issue.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {helpContent.tutorials.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Play className="h-4 w-4 text-green-500" />
                <h4 className="font-semibold text-sm">Video Tutorials</h4>
              </div>
              <div className="space-y-2">
                {helpContent.tutorials.map((tutorial, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between p-2 h-auto"
                    onClick={() => window.open(tutorial.url, '_blank')}
                  >
                    <span className="text-sm">{tutorial.title}</span>
                    <div className="flex items-center gap-2">
                      {tutorial.duration && (
                        <Badge variant="secondary" className="text-xs">
                          {tutorial.duration}
                        </Badge>
                      )}
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {helpContent.relatedLinks.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Book className="h-4 w-4 text-purple-500" />
                <h4 className="font-semibold text-sm">Related Features</h4>
              </div>
              <div className="space-y-1">
                {helpContent.relatedLinks.map((link, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between p-2 h-auto"
                    onClick={() => window.location.href = link.path}
                  >
                    <span className="text-sm">{link.title}</span>
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/help'}
            className="w-full"
          >
            <Book className="h-4 w-4 mr-2" />
            Visit Help Center
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContextualHelp;