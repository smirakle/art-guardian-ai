import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Video, Clock, FileText } from 'lucide-react';

const DemoScriptDownload = () => {
  const downloadScript = () => {
    const scriptContent = `# TSMO 5-Minute Demo Video Script
*Total Duration: 5 minutes*

## Introduction (0:00 - 0:30)
**[Scene: TSMO logo with dynamic background]**

**Narrator:** "Meet TSMO - the world's first AI-powered content protection platform. In 5 minutes, I'll show you how to protect your creative work from AI training theft, detect copyright infringement, and monetize your content automatically."

**[Scene: Quick dashboard overview]**

---

## Part 1: AI Training Protection (0:30 - 1:30)

**[Scene: Upload interface]**

**Narrator:** "Upload any content - documents, images, or artwork. TSMO's AI Training Protection Algorithm immediately applies invisible protection."

**[Action: Upload document and image simultaneously]**

**Narrator:** "For documents: We embed anti-training tracers and metadata. For artwork: Our Style Cloaking technology protects your artistic style while keeping the image visually identical."

**[Scene: Split screen showing protected vs original, processing indicators]**

**Narrator:** "Your content is now resistant to unauthorized AI training - a first-to-market protection that competitors don't offer."

---

## Part 2: Real-Time Monitoring (1:30 - 2:30)

**[Scene: Monitoring dashboard with live scan]**

**Narrator:** "TSMO continuously scans the web for your content using advanced AI recognition."

**[Action: Start comprehensive scan, show real-time progress]**

**Narrator:** "We scan surface web, deep web, social media, and even AI training datasets. Watch as we process millions of pages in seconds."

**[Scene: Detection results appearing]**

**Narrator:** "Threats are categorized by severity with confidence scores, screenshots, and recommended actions. High-threat commercial infringements are flagged immediately."

---

## Part 3: Automated Legal Response (2:30 - 3:30)

**[Scene: Click on detection, show DMCA filing]**

**Narrator:** "Found infringement? File DMCA takedowns instantly. TSMO auto-generates legal documents, includes evidence, and tracks responses."

**[Action: One-click DMCA filing process]**

**Narrator:** "Our legal automation includes licensing agreements, cease and desist letters, and copyright notices - all lawyer-reviewed and ready to use."

**[Scene: Show generated legal document]**

---

## Part 4: Automated Licensing & Revenue (3:30 - 4:15)

**[Scene: Licensing interface]**

**Narrator:** "Monetize your content with automated licensing. Set terms, pricing, and restrictions."

**[Action: Quick license creation]**

**Narrator:** "Stripe integration processes payments automatically. When someone buys a license, they instantly receive blockchain-verified certificates proving legal use."

**[Scene: Payment flow and certificate generation]**

**Narrator:** "Every transaction is recorded on blockchain for immutable proof of ownership and licensing."

---

## Part 5: Enterprise Features & Results (4:15 - 5:00)

**[Scene: Analytics dashboard]**

**Narrator:** "Track everything with comprehensive analytics - detection trends, revenue, platform coverage, and threat analysis."

**[Scene: Portfolio management view]**

**Narrator:** "Enterprise features include API access, white-label solutions, 24/7 monitoring, and team management."

**[Scene: Professional report generation]**

**Narrator:** "Generate professional reports for legal proceedings or client presentations."

**[Scene: Final dashboard overview with all features active]**

**Narrator:** "TSMO: Complete AI-powered content protection. Start free at tsmo.ai and scale as you grow. Protect your creativity today."

**[End: TSMO logo with website URL]**

---

## Quick Production Notes

### Timing Breakdown:
- **Intro**: 30 seconds
- **AI Protection**: 60 seconds  
- **Monitoring**: 60 seconds
- **Legal Response**: 60 seconds
- **Licensing**: 45 seconds
- **Enterprise/Outro**: 45 seconds

### Key Visual Elements:
- Fast-paced screen recordings
- Split-screen comparisons
- Real-time processing animations
- Professional UI highlights
- Clear call-to-action

### Audio:
- Energetic, professional voiceover
- Subtle tech background music
- Quick transitions
- Clear, concise narration

### Content Focus:
- Unique AI training protection
- Real-time monitoring capabilities
- One-click legal automation
- Revenue generation features
- Enterprise scalability

This condensed version hits all major value propositions while maintaining engagement through fast pacing and clear demonstrations.`;

    const blob = new Blob([scriptContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'TSMO-5Min-Demo-Script.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Video className="h-8 w-8 text-primary mr-2" />
          <CardTitle className="text-2xl">Demo Video Script</CardTitle>
        </div>
        <CardDescription>
          Professional 5-minute TSMO platform demonstration script
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
            <Clock className="h-5 w-5 text-primary mr-2" />
            <div className="text-center">
              <div className="font-semibold">Duration</div>
              <div className="text-sm text-muted-foreground">5 minutes</div>
            </div>
          </div>
          <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
            <FileText className="h-5 w-5 text-primary mr-2" />
            <div className="text-center">
              <div className="font-semibold">Format</div>
              <div className="text-sm text-muted-foreground">Markdown</div>
            </div>
          </div>
          <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
            <Video className="h-5 w-5 text-primary mr-2" />
            <div className="text-center">
              <div className="font-semibold">Features</div>
              <div className="text-sm text-muted-foreground">All Core Functions</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Script Includes:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
              AI Training Protection demonstration
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
              Real-time web monitoring showcase
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
              Automated DMCA and legal tools
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
              Licensing and revenue features
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
              Enterprise analytics and reporting
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
              Production notes and timing breakdown
            </li>
          </ul>
        </div>

        <Button 
          onClick={downloadScript} 
          className="w-full" 
          size="lg"
        >
          <Download className="h-5 w-5 mr-2" />
          Download Demo Script
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          Perfect for sales presentations, partner demos, and marketing videos. 
          Covers all major TSMO features in an engaging 5-minute format.
        </p>
      </CardContent>
    </Card>
  );
};

export default DemoScriptDownload;