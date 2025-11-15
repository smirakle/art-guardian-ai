import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Video } from "lucide-react";
import jsPDF from "jspdf";

const PromoVideoScriptDownload = () => {
  const downloadScript = () => {
    const doc = new jsPDF();
    let yPos = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;

    const addText = (text: string, fontSize = 11, isBold = false) => {
      if (yPos > pageHeight - margin) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * lineHeight;
    };

    const addSection = (title: string, content: string) => {
      yPos += 5;
      addText(title, 13, true);
      yPos += 2;
      addText(content, 11, false);
      yPos += 3;
    };

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("TSMO Promotional Video Script", 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "italic");
    doc.text('"Your Creative Work Deserves a Bodyguard (Not a Mime)"', 20, yPos);
    yPos += 15;

    // Meta Info
    addText("Duration: 3 minutes", 10);
    addText("Tone: Fun, Engaging, Slightly Chaotic", 10);
    addText("Target: Creators, Artists, Writers, Anyone Who Makes Stuff", 10);
    yPos += 10;

    // BETA Disclaimer
    doc.setFillColor(255, 243, 205);
    doc.rect(15, yPos - 5, 180, 20, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("⚠️ BETA DISCLAIMER", 20, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const disclaimer = "TSMO is currently in BETA testing. Features are being actively developed and improved. Some features may not work perfectly (yet). We appreciate your patience as we make this the ultimate creative protection platform!";
    const disclaimerLines = doc.splitTextToSize(disclaimer, 170);
    doc.text(disclaimerLines, 20, yPos);
    yPos += 20;

    // Script Content
    addSection(
      "[0:00-0:15] COLD OPEN - THE NIGHTMARE",
      "VISUAL: Artist working late at night on their masterpiece.\n\nNARRATOR (dramatic whisper): \"You spent 847 hours on that digital painting. Perfected every pixel. Every shadow. Every glorious detail.\"\n\nVISUAL: Camera zooms dramatically into the artwork.\n\nNARRATOR: \"And then... THEY came.\"\n\nVISUAL: Screen glitches. AI training bot icons swarm the artwork like digital piranhas.\n\nNARRATOR (panicked): \"The AI training bots! They're FEASTING on your style! Your book is being plagiarized! Someone just deepfaked your face onto a cat doing yoga!\"\n\nVISUAL: Artist screams in slow motion.\n\nNARRATOR: \"But what if... there was a hero?\""
    );

    addSection(
      "[0:15-0:35] ENTER TSMO - THE HERO",
      "VISUAL: Superhero landing effect. TSMO logo appears with epic music.\n\nNARRATOR (confident): \"Meet TSMO. The AI-powered bodyguard for your creative genius.\"\n\nVISUAL: Split screen showing artists, writers, photographers all looking relieved.\n\nNARRATOR: \"Whether you're an artist, writer, photographer, or professional meme creator... TSMO has your back. And your front. And your sides. Basically we're a full creative security system.\"\n\nVISUAL: Quick montage of protection shields wrapping around artwork, documents, photos.\n\nNARRATOR: \"And yes, we're still in BETA. Which means we're basically a superhero in training. Still awesome, just... doing some practice rounds.\""
    );

    addSection(
      "[0:35-1:00] FEATURE 1: AI TRAINING PROTECTION",
      "VISUAL: AI bot approaching artwork, then bouncing off invisible shield.\n\nNARRATOR: \"First up: AI Training Protection. Upload your work, and BOOM - invisible protection that makes AI training bots go 'nope.'\"\n\nVISUAL: User easily uploading files with drag-and-drop.\n\nNARRATOR: \"Style cloaking? Check. Perceptual hashing? Obviously. Technical terms you don't need to understand but sound really cool at parties? You bet.\"\n\nVISUAL: Protection level selector showing Basic, Standard, Maximum.\n\nNARRATOR: \"Choose your protection level. Basic is like a polite 'please don't.' Maximum is like... well, imagine an angry gorilla protecting a banana. That level of serious.\""
    );

    addSection(
      "[1:00-1:25] FEATURE 2: DOCUMENT & PLAGIARISM MONITORING",
      "VISUAL: Document being uploaded, then scanning across the internet.\n\nNARRATOR: \"Wrote a book? Blog? Screenplay about a detective who's also a sandwich? We'll monitor the entire internet for plagiarism.\"\n\nVISUAL: Map showing global scanning across platforms.\n\nNARRATOR: \"We scan Google, academic databases, content farms, that weird website your cousin made... EVERYWHERE.\"\n\nVISUAL: Plagiarism match detected with confidence scores.\n\nNARRATOR: \"Find a match? We'll tell you the similarity score, show you the evidence, and even help you generate DMCA takedowns. Because ain't nobody got time for manual legal forms.\"\n\nVISUAL: Schedule interface showing daily/weekly/monthly options.\n\nNARRATOR: \"Set it to scan daily, weekly, or monthly. Like a gym membership, but one you'll actually use.\""
    );

    addSection(
      "[1:25-1:45] FEATURE 3: DEEPFAKE DETECTION",
      "VISUAL: Person's photo being analyzed for deepfakes.\n\nNARRATOR (serious): \"Now for the sci-fi stuff. Deepfake detection.\"\n\nVISUAL: Analysis showing facial artifacts, lighting inconsistencies.\n\nNARRATOR: \"Upload an image or video, and our AI checks for facial artifacts, lighting weirdness, temporal anomalies, and other things that sound made up but aren't.\"\n\nVISUAL: Confidence score and threat level displayed.\n\nNARRATOR: \"Is it real? Is it fake? Is it your evil twin from another dimension? We'll give you a confidence score and let you decide.\"\n\nVISUAL: Multi-modal protection combining multiple detection methods.\n\nNARRATOR: \"Plus multi-modal protection. That's fancy talk for 'we check EVERYTHING.'\""
    );

    addSection(
      "[1:45-2:10] FEATURE 4: 24/7 MONITORING & COPYRIGHT MATCHING",
      "VISUAL: Monitoring dashboard showing real-time activity.\n\nNARRATOR: \"But wait, there's more! 24/7 monitoring that actually works while you sleep.\"\n\nVISUAL: Artwork being scanned across web, finding matches.\n\nNARRATOR: \"We continuously scan the web for your work. Find unauthorized use? We'll categorize the threat, give you match confidence, and suggest actions.\"\n\nVISUAL: Alert notification popping up.\n\nNARRATOR (announcer voice): \"High threat detected! Someone used your art to sell... questionable products. Yikes.\"\n\nVISUAL: User clicking to generate DMCA notice.\n\nNARRATOR: \"One click. Auto-generated legal documents. Filed instantly. You just became a legal ninja.\""
    );

    addSection(
      "[2:10-2:30] FEATURE 5: BLOCKCHAIN & LICENSING",
      "VISUAL: Blockchain certificate being generated.\n\nNARRATOR: \"Want to go NEXT level? Blockchain certificates. Immutable proof of ownership that even time-traveling art thieves can't mess with.\"\n\nVISUAL: License configuration interface.\n\nNARRATOR: \"Set up automated licensing with custom terms, pricing, usage rights. Someone wants to use your work? They pay. Automatically. While you're eating tacos.\"\n\nVISUAL: Payment notification.\n\nNARRATOR: \"Stripe integration. Blockchain verification. Legal certificates. You're basically running a mini copyright empire.\""
    );

    addSection(
      "[2:30-2:45] ANALYTICS & SOCIAL MONITORING",
      "VISUAL: Analytics dashboard with charts and graphs.\n\nNARRATOR: \"Track everything. Threats over time. Revenue from licensing. Which platforms are the worst offenders.\"\n\nVISUAL: Social media monitoring detecting fake accounts.\n\nNARRATOR: \"We even monitor social media for fake accounts using your work or identity. Because impersonation is NOT the sincerest form of flattery.\"\n\nVISUAL: Alert channels configuration.\n\nNARRATOR: \"Get alerts via email, SMS, or carrier pigeon. Okay, not that last one. Yet.\""
    );

    addSection(
      "[2:45-3:00] CLOSING - THE CALL TO ACTION",
      "VISUAL: Happy creators using TSMO, working confidently.\n\nNARRATOR: \"So there you have it. TSMO. Your creative work's new best friend, bodyguard, and legal assistant rolled into one.\"\n\nVISUAL: Sign-up interface showing free plan.\n\nNARRATOR (friendly): \"Start for free. Protect what you create. And remember - we're in BETA, which means we're constantly improving based on YOUR feedback.\"\n\nVISUAL: Logo with tagline.\n\nNARRATOR (confident): \"TSMO. Because your art deserves better than hoping thieves have a conscience.\"\n\nVISUAL: URL appears: TSMO.AI\n\nNARRATOR (whispers dramatically): \"Sign up today. Before the AI bots come for YOUR work.\"\n\nVISUAL: Fade to black with demo website."
    );

    doc.addPage();
    yPos = 20;

    // Production Notes
    addText("PRODUCTION NOTES", 16, true);
    yPos += 5;

    addSection(
      "Visual Style",
      "• High energy, fast cuts for modern attention spans\n• Mix of screen recordings, motion graphics, and visual metaphors\n• Use of humor through exaggerated scenarios (AI bots as villains, etc.)\n• Color scheme matching TSMO branding\n• Meme-worthy moments that can be clipped for social media"
    );

    addSection(
      "Voiceover Direction",
      "• Energetic but not annoying\n• Conversational, like explaining to a friend\n• Dramatic moments played for comedy\n• Technical terms explained simply with humor\n• Pace should match visual energy"
    );

    addSection(
      "Music & Sound",
      "• Upbeat, modern electronic background track\n• Dramatic music stings for 'threat' moments\n• Satisfying 'success' sounds when showing protection features\n• Subtle humor through sound effects (whooshes, boings, etc.)"
    );

    addSection(
      "Key Messages to Emphasize",
      "1. TSMO protects ALL types of creative work\n2. It's AI-powered (fighting fire with fire)\n3. Automation saves time (set it and forget it)\n4. Legal features are built-in (DMCA, licensing)\n5. Currently in BETA (honest, transparent)\n6. Free plan available (low barrier to entry)\n7. Easy to use (no technical expertise needed)"
    );

    addSection(
      "Target Length Breakdown",
      "• Cold Open: 15 seconds\n• Introduction: 20 seconds\n• Features (5 sections): 125 seconds\n• Analytics/Social: 15 seconds\n• Closing/CTA: 15 seconds\n• Total: ~3 minutes\n\nNote: Actual timing may vary in production. Keep it punchy!"
    );

    addSection(
      "BETA Messaging Strategy",
      "• Frame BETA as 'exclusive early access' not 'incomplete product'\n• Emphasize continuous improvement and user feedback\n• Show it as authentic/transparent (we're not hiding anything)\n• Position users as 'pioneers' testing cutting-edge tech\n• Reassure that core features are stable and working"
    );

    addSection(
      "Call-to-Action Options",
      "Primary: 'Start Protecting Your Work - Free'\nSecondary: 'Join the BETA - Shape the Future'\nTertiary: 'See TSMO in Action - Watch Demo'\n\nAll CTAs should lead to TSMO.AI with clear next steps"
    );

    addText("\n— END OF SCRIPT —", 12, true);

    doc.save("TSMO_Promo_Video_Script_BETA.pdf");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Video className="w-6 h-6 text-primary" />
          <CardTitle>TSMO Promotional Video Script</CardTitle>
        </div>
        <CardDescription>
          Download the complete script for a 3-minute promotional video showcasing all TSMO features with humor and BETA transparency
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h3 className="font-semibold">Script Details:</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Duration: ~3 minutes</li>
            <li>• Tone: Humorous, energetic, engaging</li>
            <li>• Features: All TSMO capabilities covered</li>
            <li>• Includes: BETA disclaimer and production notes</li>
            <li>• Format: Ready for production teams</li>
          </ul>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
          <p className="text-sm font-medium">⚠️ BETA Version Included</p>
          <p className="text-xs text-muted-foreground mt-1">
            Script includes appropriate BETA messaging and positioning
          </p>
        </div>

        <Button 
          onClick={downloadScript}
          className="w-full"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Promo Video Script (PDF)
        </Button>
      </CardContent>
    </Card>
  );
};

export default PromoVideoScriptDownload;
