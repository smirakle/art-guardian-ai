export const aiTrainingProtectionGuide = `
# AI Training Protection Guide

Welcome to AI Training Protection - your defense against unauthorized use of your content in AI training datasets.

## 🛡️ What This Feature Does

Protects your creative content from being used without permission in AI model training by:
- Generating unique fingerprints for your content
- Monitoring AI training datasets for unauthorized usage
- Detecting violations with confidence scoring
- Automating legal responses when violations are found

## 📋 Setup Requirements

### Required API Keys
To enable full protection capabilities, configure these API keys in your Supabase project:

**Essential (Required for core functionality):**
- OPENAI_API_KEY - Powers AI-based content analysis and fingerprint matching

**Recommended (Enhanced detection):**
- GOOGLE_CUSTOM_SEARCH_API_KEY + GOOGLE_SEARCH_ENGINE_ID - Web-wide detection
- RESEND_API_KEY - Email notifications for violations

**Optional (Additional coverage):**
- TINEYE_API_KEY + TINEYE_API_SECRET - Reverse image search
- BING_VISUAL_SEARCH_API_KEY - Microsoft Bing visual search
- SERPAPI_KEY - Multi-engine search coverage

### Without API Keys
Basic protection works without API keys but with limited capabilities:
- Local fingerprinting (hash-based)
- Manual monitoring only
- No automated detection
- No real-time alerts

## 🚀 How to Use

1. **Upload Content** - Upload files you want to protect
2. **Choose Protection Level** - Basic, Advanced, or Maximum
3. **Start Monitoring** - System begins scanning AI datasets
4. **Review Alerts** - Check violations detected
5. **Take Action** - Automated DMCA or manual enforcement

## 📊 Understanding Results

**Confidence Scores:**
- 85-100%: High confidence - automated legal action recommended
- 60-84%: Medium confidence - manual review suggested
- 0-59%: Low confidence - continue monitoring

**Protection Levels:**
- Basic: Hash-based fingerprinting
- Advanced: AI-powered analysis + periodic scans
- Maximum: Real-time monitoring + automated enforcement

## ⚙️ Checking System Status

Use the "Run readiness check" button in the admin panel to verify:
- API keys are configured
- Database tables are accessible
- Edge functions are deployed
- System is ready for production use

## 💡 Best Practices

1. Start with 1-2 test files to verify setup
2. Configure at least OPENAI_API_KEY for meaningful results
3. Review high-confidence violations manually before auto-filing
4. Keep monitoring active on valuable content
5. Update API keys if services change

## 🔧 Troubleshooting

**No violations detected?**
- Verify API keys are configured correctly
- Check that monitoring is enabled
- Ensure files are properly uploaded

**Too many false positives?**
- Adjust confidence threshold settings
- Review protection level (may be too sensitive)
- Check fingerprint quality

**System not ready?**
- Run the readiness check in admin panel
- Configure missing API keys
- Contact support if issues persist
`;

export const uploadGuide = {
  title: "Upload & Protect Guide",
  description: "Learn how to upload and protect your artwork with TSMO",
  sections: [
    {
      title: "Understanding the Upload Process",
      content: `
        <p><strong>Visual Progress Stepper:</strong></p>
        <p>At the top of the page, you'll see a progress indicator showing your current step:</p>
        <ol>
          <li><strong>Select Your Artwork</strong> - Choose files to protect (30 seconds)</li>
          <li><strong>Secure Upload</strong> - Files are encrypted during transfer (1-2 minutes)</li>
          <li><strong>AI Analysis</strong> - Protection fingerprints created (2-3 minutes)</li>
          <li><strong>Live Monitoring</strong> - 24/7 monitoring begins (Continuous)</li>
        </ol>
        <p><strong>Three Protection Tabs (with completion badges):</strong></p>
        <ol>
          <li><strong>📤 Step 1: Upload</strong> - Select files, add details, and start protection</li>
          <li><strong>🛡️ Step 2: Watermark</strong> - Apply sophisticated watermarking</li>
          <li><strong>🔍 Step 3: Analyze</strong> - Visual recognition and analysis</li>
        </ol>
        <p><strong>Free Access Available:</strong></p>
        <p>Upload and protect artwork without signing in. Sign in for full features like automatic monitoring and blockchain verification.</p>
        <p><strong>Supported formats:</strong></p>
        <ul>
          <li>Images: JPG, PNG, GIF, WebP and other image formats</li>
          <li>Videos: MP4, MOV, AVI and other video formats</li>
          <li>Audio: MP3, WAV and other audio formats</li>
          <li>Documents: PDF, DOC, DOCX, TXT</li>
        </ul>
      `,
      tips: [
        "Watch the progress stepper to know your current step",
        "Completed tabs show a green checkmark",
        "No sign-in required for basic protection"
      ]
    },
    {
      title: "Step 1: Upload Your Content",
      content: `
        <p><strong>Enhanced Upload Area (left side):</strong></p>
        <ol>
          <li><strong>Drag & Drop:</strong> Simply drag files onto the upload area - it will highlight when files are over it</li>
          <li><strong>Or Click "Select Files":</strong> Browse and choose files from your device</li>
          <li>Files appear with preview thumbnails immediately</li>
          <li>Watch for animated status indicators as files upload</li>
        </ol>
        <p><strong>Add URLs Section (below upload area):</strong></p>
        <ol>
          <li>Find the "Add URLs" card with Link icon</li>
          <li>Enter any article or content URL you want to protect</li>
          <li>Click the "+" button or press Enter to add</li>
          <li>URLs appear with truncation for long links</li>
          <li>Remove by clicking the X icon on any URL</li>
        </ol>
        <p><strong>Visual Feedback:</strong></p>
        <ul>
          <li>Upload area scales and changes color when dragging files</li>
          <li>File count badge appears on Upload tab when files are added</li>
          <li>Progress stepper updates to "Secure Upload" phase automatically</li>
        </ul>
      `,
      tips: [
        "Upload area provides visual feedback - watch for animations",
        "Mix files and URLs in one protection batch",
        "Multiple files can be uploaded simultaneously"
      ]
    },
    {
      title: "Step 2: Add Artwork Details (Progressive Form)",
      content: `
        <p><strong>Essential Information (always visible - highlighted section):</strong></p>
        <ul>
          <li><strong>Title *</strong> - Give your artwork a descriptive name (required)</li>
          <li><strong>Category *</strong> - Choose from Photography, Digital Art, Video, Audio/Music, Writing, Design, or Other (required)</li>
        </ul>
        <p><strong>Optional Details (collapsible section):</strong></p>
        <p>Click "Optional Details" to expand and see additional fields:</p>
        <ul>
          <li><strong>Description:</strong> Add context about your work</li>
          <li><strong>Tags:</strong> Add searchable keywords (type and press Enter or click "+")</li>
          <li><strong>License Type:</strong> Select copyright license (All Rights Reserved, Creative Commons, etc.)</li>
        </ul>
        <p><strong>Progressive Disclosure Design:</strong></p>
        <p>The form uses a "progressive disclosure" pattern - essential fields are always visible, while optional fields are hidden by default to reduce clutter. Click the dropdown arrow to expand optional fields when needed.</p>
      `,
      tips: [
        "Only Title and Category are required - everything else is optional",
        "Optional fields are collapsed to keep the interface clean",
        "Tags can be removed by clicking on them after adding"
      ]
    },
    {
      title: "Step 3: Choose Protection Options",
      content: `
        <p><strong>Protection Options Section (at bottom of form):</strong></p>
        <ul>
          <li><strong>Enable Watermarking:</strong> Adds visible watermark to your images (checked by default)</li>
          <li><strong>Blockchain Verification:</strong> Creates immutable proof of ownership (requires sign-in, shown only if logged in)</li>
        </ul>
        <p><strong>Additional Tabs for Advanced Protection:</strong></p>
        <ul>
          <li><strong>Step 2: Watermark Tab:</strong> Click this tab for sophisticated watermarking with custom positioning, transparency, and text options</li>
          <li><strong>Step 3: Analyze Tab:</strong> Visual recognition and content matching tools</li>
        </ul>
        <p><strong>AI Training Protection:</strong></p>
        <p>For advanced AI training protection (style cloaking, adversarial patterns), visit the <strong>Protection Hub</strong> after uploading. The AI Protection tab there offers comprehensive defense against unauthorized AI training.</p>
      `,
      tips: [
        "Watermarking is enabled by default for quick protection",
        "Blockchain option only appears when you're signed in",
        "Each tab shows a completion checkmark when finished"
      ]
    },
    {
      title: "Step 4: Review & Confirm Protection",
      content: `
        <p><strong>Two-Step Protection Process:</strong></p>
        <ol>
          <li><strong>First Click - "Review & Protect":</strong>
            <ul>
              <li>Button shows total items count (files + URLs)</li>
              <li>Click to see a summary of what will be protected</li>
              <li>Review card appears showing:
                <ul>
                  <li>Number of files</li>
                  <li>Number of URLs</li>
                  <li>Selected category</li>
                  <li>Watermark setting</li>
                  <li>Blockchain setting (if signed in)</li>
                </ul>
              </li>
              <li>You can click "Edit Details" to make changes</li>
            </ul>
          </li>
          <li><strong>Second Click - "Confirm & Protect":</strong>
            <ul>
              <li>Final confirmation starts the protection process</li>
              <li>Progress stepper updates to "Live Monitoring"</li>
              <li>Files show animated status indicators:
                <ul>
                  <li>Uploading (blue pulsing icon)</li>
                  <li>Processing & Securing (yellow pulsing shield)</li>
                  <li>Protected & Monitored (green checkmark)</li>
                </ul>
              </li>
            </ul>
          </li>
        </ol>
        <p><strong>What happens automatically:</strong></p>
        <ul>
          <li>✅ Files uploaded to secure encrypted storage</li>
          <li>✅ Protection methods applied as selected</li>
          <li>✅ Metadata recorded in database</li>
          <li>✅ Blockchain certificate created (if enabled and signed in)</li>
          <li>✅ Automatic monitoring scan started (if signed in)</li>
        </ul>
        <p>Toast notifications appear for each step completion.</p>
      `,
      tips: [
        "Always review the summary before final confirmation",
        "Don't close the browser during upload",
        "Monitoring starts automatically if you're signed in"
      ]
    },
    {
      title: "What Happens Next?",
      content: `
        <p><strong>After upload, your content is:</strong></p>
        <ul>
          <li>✅ Stored securely in encrypted storage</li>
          <li>✅ Protected with watermarks (if enabled)</li>
          <li>✅ Registered on blockchain (if enabled and signed in)</li>
          <li>✅ Being monitored automatically (if signed in)</li>
        </ul>
        <p><strong>Where to go next:</strong></p>
        <ul>
          <li><strong>Dashboard:</strong> View your protected content and monitoring status</li>
          <li><strong>Protection Hub:</strong> Apply advanced AI training protection (style cloaking, adversarial patterns)</li>
          <li><strong>Monitoring Hub:</strong> Check for threats and unauthorized uses</li>
          <li><strong>Blockchain Tab:</strong> View and download your blockchain certificates (if blockchain was enabled)</li>
        </ul>
        <p><strong>Recommended next steps:</strong></p>
        <ol>
          <li>Visit <strong>Protection Hub → AI Protection</strong> tab to enable style cloaking</li>
          <li>Check the <strong>Dashboard</strong> to confirm protection is active</li>
          <li>Enable monitoring alerts in your account settings</li>
          <li>Download blockchain certificates from the Blockchain tab (if applicable)</li>
        </ol>
      `,
      tips: [
        "AI training protection is separate - apply it in Protection Hub",
        "Monitoring scans run automatically if you're signed in",
        "Check Dashboard regularly for protection status updates"
      ]
    }
  ]
};

export const dashboardGuide = {
  title: "Dashboard Guide",
  description: "Navigate and manage your protected content",
  sections: [
    {
      title: "Understanding Your Dashboard",
      content: `
        <p>Your Unified Dashboard displays key protection metrics in real-time.</p>
        <p><strong>Six key metrics displayed:</strong></p>
        <ul>
          <li><strong>Protected Assets:</strong> Total number of artworks you've uploaded and protected</li>
          <li><strong>Active Scans:</strong> Number of ongoing AI monitoring scans</li>
          <li><strong>Threats:</strong> Detected violations requiring your attention</li>
          <li><strong>Blockchain Records:</strong> Number of blockchain certificates created</li>
          <li><strong>Legal Actions:</strong> DMCA notices filed and tracked</li>
          <li><strong>Success Rate:</strong> Percentage of threats successfully resolved</li>
        </ul>
        <p><strong>Quick Actions sidebar includes:</strong></p>
        <ul>
          <li>Upload & Protect - Go to upload page</li>
          <li>Start Monitoring - Configure monitoring</li>
          <li>Configure AI Protection - Set up AI training protection</li>
          <li>Legal Templates - Access legal documents</li>
        </ul>
      `,
      tips: [
        "Check your dashboard daily for new threats",
        "Higher success rate means effective violation resolution",
        "Use Quick Actions for common tasks"
      ]
    },
    {
      title: "Dashboard Tabs",
      content: `
        <p>The dashboard has multiple specialized tabs:</p>
        <ul>
          <li><strong>Overview:</strong> Main metrics and recent activity (default view)</li>
          <li><strong>Production:</strong> Production environment performance metrics</li>
          <li><strong>AI Detection:</strong> AI-powered threat detection analytics</li>
          <li><strong>Protection:</strong> One-click protection tools and settings</li>
          <li><strong>Blockchain:</strong> Blockchain registry and certificate management</li>
          <li><strong>Legal:</strong> Legal network, case management, and templates</li>
          <li><strong>Creator:</strong> Creator economy features and licensing</li>
          <li><strong>Recognition:</strong> Visual recognition tools and analysis</li>
        </ul>
        <p>Click any tab to access specialized features and detailed views.</p>
      `,
      tips: [
        "Overview tab is your daily starting point",
        "Use Blockchain tab to view and download certificates",
        "Legal tab helps manage DMCA notices and cases"
      ]
    },
    {
      title: "Recent Activity Feed",
      content: `
        <p>The Recent Activity section shows your latest actions:</p>
        <ul>
          <li>Newly protected artworks</li>
          <li>AI protection activations</li>
          <li>Blockchain registrations</li>
          <li>Violation detections</li>
          <li>DMCA filings</li>
          <li>Monitoring activations</li>
        </ul>
        <p>Each activity shows an icon, message, and timestamp for easy tracking.</p>
      `,
      tips: [
        "Review recent activity to stay updated",
        "Timestamps help track when actions occurred",
        "Activity feed updates automatically"
      ]
    },
    {
      title: "Taking Action on Threats",
      content: `
        <p>When threats are detected in your dashboard:</p>
        <ol>
          <li>Check the "Threats" metric for the count</li>
          <li>Click on threats to see detailed information</li>
          <li>Review evidence and match details</li>
          <li>Verify if it's truly unauthorized use</li>
          <li>Take action:
            <ul>
              <li>File DMCA takedown notice via DMCA Center</li>
              <li>Mark as false positive</li>
              <li>Monitor without action</li>
            </ul>
          </li>
          <li>Track resolution in Legal tab</li>
        </ol>
        <p><strong>Professional Plan:</strong> Automated DMCA filing when violations detected.</p>
      `,
      tips: [
        "Act quickly on high-priority threats",
        "Use DMCA Center (/dmca-center) for filing notices",
        "Keep records of all actions taken"
      ]
    },
    {
      title: "Blockchain Certificates",
      content: `
        <p>Access blockchain certificates from your dashboard:</p>
        <ol>
          <li>Click the "Blockchain" tab</li>
          <li>View all your blockchain-registered artworks</li>
          <li>Click any certificate to view full details</li>
          <li>Download certificate as JSON file</li>
          <li>Share certificate URL for verification</li>
        </ol>
        <p><strong>Certificate contains:</strong></p>
        <ul>
          <li>Unique Certificate ID</li>
          <li>Blockchain Hash (immutable proof)</li>
          <li>Artwork Fingerprint</li>
          <li>Ownership Proof</li>
          <li>Registration Timestamp</li>
          <li>Verification Status</li>
        </ul>
      `,
      tips: [
        "Store certificate files securely offline",
        "Certificates are legally admissible evidence",
        "Use in copyright disputes and legal proceedings"
      ]
    }
  ]
};

export const protectionHubGuide = {
  title: "How to Use Protection Hub",
  description: "Step-by-step guide to protect your content with advanced AI defense tools",
  sections: [
    {
      title: "Getting Started with Protection Hub",
      content: `
        <p><strong>Access Protection Hub:</strong></p>
        <ol>
          <li>Click "Protection Hub" in the main navigation menu</li>
          <li>Or go to /protection-hub</li>
        </ol>
        <p><strong>What You'll See:</strong></p>
        <ul>
          <li><strong>Quick Stats at the top:</strong> Protected Files, Active Scans, Threats Detected, Detection Rate</li>
          <li><strong>Six tabs</strong> for different protection tools</li>
          <li>Real-time protection status indicators</li>
        </ul>
        <p><strong>Six Protection Tabs (in order from left to right):</strong></p>
        <ol>
          <li><strong>Upload & Protect:</strong> Quick file upload and bulk protection</li>
          <li><strong>AI Protection:</strong> Configure AI training defense and style cloaking</li>
          <li><strong>Detection:</strong> View threat analytics and AI detection dashboard</li>
          <li><strong>Multi-Modal:</strong> Visual recognition and content matching tools</li>
          <li><strong>Advanced:</strong> Metadata protection, crawler blocking, likeness protection</li>
          <li><strong>Overview:</strong> Status summary, recent activity, and quick actions</li>
        </ol>
        <p><strong>Note:</strong> The quick stats at the top show demo numbers for illustration purposes until your actual protection data populates.</p>
      `,
      tips: [
        "Start with Upload & Protect tab to quickly secure files",
        "Enable AI Protection before sharing content publicly",
        "Check Overview tab to see your complete protection status"
      ]
    },
    {
      title: "Quick File Upload & Protection",
      content: `
        <p><strong>How to Quickly Protect Files:</strong></p>
        <ol>
          <li>Click the "Upload & Protect" tab</li>
          <li>Look for "Quick Upload & Protection" card on the left</li>
          <li>Drag and drop files OR click to browse</li>
          <li>Files will be protected automatically with basic settings</li>
          <li>View protection confirmation</li>
        </ol>
        <p><strong>Supported File Types:</strong></p>
        <ul>
          <li>Images: JPG, PNG, GIF</li>
          <li>Videos: MP4, AVI, MOV</li>
          <li>Documents: PDF, DOC</li>
          <li>3D Models: OBJ, FBX</li>
        </ul>
        <p><strong>For More Options:</strong></p>
        <ol>
          <li>Click "Start Upload" button in the right card</li>
          <li>This takes you to the full Upload page</li>
          <li>There you can add blockchain, detailed metadata, and more</li>
        </ol>
      `,
      tips: [
        "Quick upload is perfect when you need fast protection",
        "For blockchain certificates, use the main Upload page",
        "Multiple files can be uploaded at once"
      ]
    },
    {
      title: "Enabling AI Training Protection",
      content: `
        <p><strong>Step 1: Basic AI Training Protection</strong></p>
        <ol>
          <li>Click the "AI Protection" tab</li>
          <li>Find "Basic AI Training Protection" card on the left</li>
          <li>Review the AI Training Settings options</li>
          <li>Toggle protection ON for your content</li>
          <li>Select protection level (if available)</li>
          <li>Click "Save" or "Apply"</li>
        </ol>
        <p><strong>Step 2: Enhanced Style Cloaking (Recommended)</strong></p>
        <ol>
          <li>In the same AI Protection tab, look at right card</li>
          <li>Find "Enhanced Style Cloaking" section</li>
          <li>Click "Enable Style Cloak"</li>
          <li>Choose intensity level (Basic, Standard, Maximum)</li>
          <li>Apply to selected artworks or entire portfolio</li>
          <li>Wait for processing (invisible to viewers)</li>
        </ol>
        <p><strong>What This Does:</strong></p>
        <ul>
          <li>Prevents AI models from training on your work</li>
          <li>Adds invisible adversarial patterns</li>
          <li>Protects your artistic style from AI replication</li>
          <li>No visible changes to your images</li>
        </ul>
      `,
      tips: [
        "Enable BOTH Basic and Enhanced for maximum protection",
        "Style Cloaking is invisible - viewers won't notice it",
        "Apply before sharing work on social media or portfolios"
      ]
    },
    {
      title: "Monitoring Threats and Detections",
      content: `
        <p><strong>How to Check for Threats:</strong></p>
        <ol>
          <li>Click the "Detection" tab</li>
          <li>View the AI Detection Dashboard</li>
          <li>Look at "Threats Detected" count in quick stats</li>
          <li>Scroll to see list of detected violations</li>
        </ol>
        <p><strong>Reviewing a Detected Threat:</strong></p>
        <ol>
          <li>Click on any threat in the list</li>
          <li>Review match details and evidence</li>
          <li>Check confidence score (higher = more certain)</li>
          <li>View source URL or platform</li>
          <li>Decide if it's a real violation or false positive</li>
        </ol>
        <p><strong>Taking Action on Threats:</strong></p>
        <ol>
          <li>If it's a real violation:
            <ul>
              <li>Click "File DMCA" or go to DMCA Center</li>
              <li>Generate takedown notice</li>
              <li>Track resolution status</li>
            </ul>
          </li>
          <li>If it's a false positive:
            <ul>
              <li>Click "Mark as False Positive"</li>
              <li>This improves future detection accuracy</li>
            </ul>
          </li>
        </ol>
      `,
      tips: [
        "Check Detection tab daily for new threats",
        "Act quickly on high-confidence matches",
        "Marking false positives helps train the AI"
      ]
    },
    {
      title: "Using Visual Recognition Tools",
      content: `
        <p><strong>How to Use Multi-Modal Recognition:</strong></p>
        <ol>
          <li>Click the "Multi-Modal" tab</li>
          <li>Visual Recognition tools will load</li>
          <li>Upload an image to search for similar content</li>
          <li>Or select from your protected artworks</li>
          <li>Click "Start Recognition Scan"</li>
          <li>Wait 5-30 seconds for results</li>
          <li>Review matches found across platforms</li>
        </ol>
        <p><strong>What It Finds:</strong></p>
        <ul>
          <li>Exact copies of your work</li>
          <li>Modified versions (cropped, filtered, altered)</li>
          <li>Similar content across different formats</li>
          <li>Cross-platform matches (Instagram, Pinterest, etc.)</li>
        </ul>
        <p><strong>Use Cases:</strong></p>
        <ul>
          <li>Finding unauthorized uses you didn't know about</li>
          <li>Tracking where your work has spread</li>
          <li>Discovering derivative works</li>
          <li>Building evidence for legal action</li>
        </ul>
      `,
      tips: [
        "Run recognition scans monthly on your top works",
        "Works on cropped and filtered versions too",
        "Results can be used as legal evidence"
      ]
    },
    {
      title: "Advanced Protection Settings",
      content: `
        <p><strong>1. Setting Up Metadata Protection:</strong></p>
        <ol>
          <li>Click the "Advanced" tab</li>
          <li>Find "Metadata Protection" card (left side)</li>
          <li>Choose: Strip All, Preserve Copyright, or Custom</li>
          <li>Toggle options for EXIF, GPS, Camera info</li>
          <li>Click "Apply to New Uploads" or "Apply to Existing"</li>
        </ol>
        <p><strong>2. Configuring Crawler Blocking:</strong></p>
        <ol>
          <li>In Advanced tab, find "Crawler Blocking" card (right side)</li>
          <li>Toggle "Block AI Training Crawlers" ON</li>
          <li>Review list of blocked bots (GPTBot, CCBot, etc.)</li>
          <li>Add custom crawlers to block (optional)</li>
          <li>Whitelist legitimate crawlers (Google, Bing if needed)</li>
          <li>Click "Save Crawler Rules"</li>
        </ol>
        <p><strong>3. Enabling Likeness Recognition Protection:</strong></p>
        <ol>
          <li>In Advanced tab, scroll to "Likeness Recognition Protection" card</li>
          <li>Upload a photo of yourself (if protecting your identity)</li>
          <li>Click "Enable Likeness Monitoring"</li>
          <li>Set sensitivity level (Low, Medium, High)</li>
          <li>Configure alert preferences</li>
          <li>System will now scan for unauthorized use of your face</li>
        </ol>
      `,
      tips: [
        "Strip metadata before sharing publicly to protect privacy",
        "Enable crawler blocking to prevent AI training scraping",
        "Likeness protection is crucial for influencers and public figures"
      ]
    },
    {
      title: "Using the Overview Dashboard",
      content: `
        <p><strong>How to Check Your Protection Status:</strong></p>
        <ol>
          <li>Click the "Overview" tab</li>
          <li>View "Protection Status" card (left)</li>
          <li>Check for green "Active" badges (good)</li>
          <li>Orange "Configured" means set up but not active</li>
          <li>Red or missing badges mean not enabled</li>
        </ol>
        <p><strong>Status Indicators:</strong></p>
        <ul>
          <li><strong>AI Training Protection:</strong> Should show "Active"</li>
          <li><strong>Style Cloaking:</strong> Should show "Active"</li>
          <li><strong>Metadata Protection:</strong> Should show "Configured"</li>
        </ul>
        <p><strong>Viewing Recent Activity:</strong></p>
        <ol>
          <li>Check "Recent Activity" card (middle)</li>
          <li>See latest protection actions taken</li>
          <li>Review new files protected</li>
          <li>Check for new violations detected</li>
        </ol>
        <p><strong>Quick Actions:</strong></p>
        <ol>
          <li>Find "Quick Actions" card (right)</li>
          <li>Click "Upload New Content" for fast upload</li>
          <li>Click "Start New Scan" to scan for violations</li>
          <li>Click "Configure Protection" to adjust settings</li>
        </ol>
      `,
      tips: [
        "Check Overview tab daily - it's your protection dashboard",
        "All green badges = fully protected",
        "Use Quick Actions for fast access to common tasks"
      ]
    }
  ]
};

export const checkoutGuide = {
  title: "Subscription Guide",
  description: "Choose the right plan and manage your subscription",
  sections: [
    {
      title: "Choosing Your Plan",
      content: `
        <p><strong>Four main subscription tiers available:</strong></p>
        <p><strong>Student Plan ($19/month - 24% OFF):</strong></p>
        <ul>
          <li>Up to 1,000 artworks protected</li>
          <li>Basic AI monitoring</li>
          <li>Portfolio monitoring (up to 5)</li>
          <li>Email alerts</li>
          <li>Community support</li>
        </ul>
        <p><strong>Starter Plan ($29/month - 25% OFF, Most Popular):</strong></p>
        <ul>
          <li>Up to 3,500 artworks protected</li>
          <li>Advanced AI monitoring</li>
          <li>Portfolio monitoring (up to 10)</li>
          <li>Real-time alerts</li>
          <li>Watermark protection</li>
          <li>API access</li>
          <li>Priority support</li>
        </ul>
        <p><strong>Professional Plan ($199/month - 20% OFF):</strong></p>
        <ul>
          <li>Up to 250,000 artworks protected</li>
          <li>Premium AI monitoring</li>
          <li>Portfolio monitoring (up to 50)</li>
          <li>Blockchain verification included</li>
          <li>Deepfake detection included</li>
          <li>Advanced watermarking</li>
          <li>White-label options</li>
          <li>Dedicated account manager</li>
        </ul>
        <p><strong>Enterprise Plan (Custom Pricing):</strong></p>
        <ul>
          <li>Unlimited artworks and portfolios</li>
          <li>Custom deployment options</li>
          <li>Dedicated infrastructure</li>
          <li>24/7 priority support</li>
          <li>Custom legal workflows</li>
          <li>Advanced API access</li>
        </ul>
        <p><strong>Add-ons (available for all plans):</strong></p>
        <ul>
          <li><strong>AI Training Protection:</strong> $49/month</li>
          <li><strong>Social Media Monitoring:</strong> $100/month + $199 startup fee (Coming Soon)</li>
        </ul>
        <p><strong>Note:</strong> Professional plan includes AI Training Protection at no extra cost.</p>
      `,
      tips: [
        "All plans include 5-day free trial with no credit card required",
        "Starter plan is most popular for freelancers",
        "Professional plan best value for established artists"
      ]
    },
    {
      title: "Payment & Billing",
      content: `
        <p><strong>Accepted payment methods:</strong></p>
        <ul>
          <li>Credit/Debit cards (Visa, Mastercard, Amex)</li>
          <li>Apple Pay / Google Pay</li>
        </ul>
        <p><strong>Billing cycles:</strong></p>
        <ul>
          <li>Monthly: Charged on same day each month</li>
          <li>Annual: Charged once per year (20% discount)</li>
        </ul>
        <p>All plans include:</p>
        <ul>
          <li>7-day money-back guarantee</li>
          <li>Cancel anytime</li>
          <li>No hidden fees</li>
        </ul>
      `,
      tips: [
        "Annual plans offer best value",
        "Receipts sent automatically to email",
        "Update payment method in Account Settings"
      ]
    },
    {
      title: "Managing Your Subscription",
      content: `
        <p><strong>Upgrade your plan:</strong></p>
        <ol>
          <li>Go to Account Settings</li>
          <li>Click "Upgrade Plan"</li>
          <li>Select new plan</li>
          <li>Confirm payment</li>
        </ol>
        <p><strong>Cancel subscription:</strong></p>
        <ol>
          <li>Go to Account Settings</li>
          <li>Click "Manage Subscription"</li>
          <li>Select "Cancel Subscription"</li>
          <li>Access continues until period ends</li>
        </ol>
        <p>Your data is preserved for 30 days after cancellation.</p>
      `,
      tips: [
        "Downgrade available without data loss",
        "Reactivate within 30 days to keep all data",
        "Export your data before final cancellation"
      ]
    }
  ]
};

export const bugReportGuide = {
  title: "Bug Report Guide",
  description: "Help us improve by reporting issues",
  sections: [
    {
      title: "How to Report a Bug",
      content: `
        <p>To submit an effective bug report:</p>
        <ol>
          <li>Click the "Report Bug" button</li>
          <li>Provide a clear, descriptive subject</li>
          <li>Describe what happened vs. what should happen</li>
          <li>List steps to reproduce (if possible)</li>
          <li>Submit the report</li>
        </ol>
        <p><strong>What happens next:</strong></p>
        <ul>
          <li>You'll receive email confirmation</li>
          <li>Our team reviews within 24 hours</li>
          <li>Critical bugs fixed within 48 hours</li>
          <li>Updates sent via email</li>
        </ul>
      `,
      tips: [
        "Include specific error messages",
        "Mention your browser and device",
        "Screenshots help tremendously"
      ]
    },
    {
      title: "What Information to Include",
      content: `
        <p><strong>Essential information:</strong></p>
        <ul>
          <li>What you were trying to do</li>
          <li>What actually happened</li>
          <li>Any error messages displayed</li>
          <li>Browser and operating system</li>
        </ul>
        <p><strong>Helpful additional details:</strong></p>
        <ul>
          <li>Screenshots or screen recordings</li>
          <li>Exact steps to reproduce</li>
          <li>When the issue started</li>
          <li>How often it occurs</li>
        </ul>
      `,
      tips: [
        "More detail = faster resolution",
        "Check console for error messages (F12)",
        "Note exact time of occurrence"
      ]
    },
    {
      title: "Bug Priority Levels",
      content: `
        <p>We prioritize bugs based on severity:</p>
        <p><strong>🔴 Critical (Fixed in 4-8 hours):</strong></p>
        <ul>
          <li>App completely broken</li>
          <li>Data loss possible</li>
          <li>Security vulnerability</li>
        </ul>
        <p><strong>🟡 High (Fixed in 24-48 hours):</strong></p>
        <ul>
          <li>Major feature not working</li>
          <li>Affects many users</li>
          <li>Workaround available</li>
        </ul>
        <p><strong>🟢 Normal (Fixed in 1-2 weeks):</strong></p>
        <ul>
          <li>Minor feature issue</li>
          <li>Cosmetic problems</li>
          <li>Enhancement requests</li>
        </ul>
      `,
      tips: [
        "Critical issues get immediate attention",
        "Check Known Issues page first",
        "Feature requests go to roadmap voting"
      ]
    }
  ]
};

export const advancedImageAnalysisGuide = {
  title: "How to Use Advanced Image Analysis",
  description: "Step-by-step guide for detecting AI-generated images and image forgery",
  sections: [
    {
      title: "Getting Started",
      content: `
        <p><strong>Access Advanced Image Analysis:</strong></p>
        <ol>
          <li>Navigate to the Forgery Detection page from the main menu</li>
          <li>Or go directly to /forgery-detection</li>
        </ol>
        <p><strong>Two Analysis Tools Available:</strong></p>
        <ul>
          <li><strong>AI Generation Detection:</strong> Detect if an image was created by AI (default tab)</li>
          <li><strong>Forgery & Tampering:</strong> Detect if an image has been manipulated or edited</li>
        </ul>
        <p>Both tools work on uploaded images and provide detailed analysis results with confidence scores.</p>
      `,
      tips: [
        "Works with JPG, PNG, GIF, and most image formats",
        "Both tools analyze locally uploaded files or image URLs",
        "Results include technical indicators and visual evidence"
      ]
    },
    {
      title: "AI Generation Detection - How to Use",
      content: `
        <p><strong>Step 1: Select Your Image</strong></p>
        <p>You have two options for providing an image:</p>
        <ul>
          <li><strong>Upload Image:</strong> Click "Choose File" and select an image from your device</li>
          <li><strong>Image URL:</strong> Paste a direct link to an online image</li>
        </ul>
        <p><strong>Step 2: Start Analysis</strong></p>
        <ol>
          <li>After selecting your file or entering a URL, click "Analyze for AI Generation"</li>
          <li>Watch the progress bar as the AI detector analyzes your image</li>
          <li>Analysis typically takes 5-15 seconds</li>
        </ol>
        <p><strong>Step 3: Review Results</strong></p>
        <p>The analysis will show:</p>
        <ul>
          <li><strong>Main Result:</strong> "AI Generated" or "Likely Human Created" with confidence percentage</li>
          <li><strong>Detection Method:</strong> The specific technique used for detection</li>
          <li><strong>Suspected AI Model:</strong> If AI-generated, which model may have created it (e.g., Stable Diffusion, DALL-E, Midjourney)</li>
        </ul>
      `,
      tips: [
        "Higher confidence (80%+) indicates stronger certainty in the result",
        "Check multiple indicators for comprehensive understanding",
        "Some AI-generated images may be harder to detect if post-processed"
      ]
    },
    {
      title: "Understanding Detection Indicators",
      content: `
        <p><strong>Five Key Detection Indicators:</strong></p>
        <ol>
          <li><strong>Frequency Anomalies:</strong> Unusual patterns in image frequency domain that AI models create</li>
          <li><strong>Pixel Patterns:</strong> Telltale pixel-level signatures left by neural networks</li>
          <li><strong>Metadata Signatures:</strong> Missing or suspicious metadata that real cameras would include</li>
          <li><strong>Style Analysis:</strong> Stylometric analysis comparing to known AI generation patterns</li>
          <li><strong>Neural Artifacts:</strong> Specific visual artifacts common in AI-generated images</li>
        </ol>
        <p><strong>Indicator Levels:</strong></p>
        <ul>
          <li><strong>High (Red):</strong> 70%+ score - Strong indication of AI generation or manipulation</li>
          <li><strong>Medium (Orange):</strong> 40-70% score - Moderate indicators present</li>
          <li><strong>Low (Gray):</strong> Below 40% - Minimal or no indicators detected</li>
        </ul>
        <p>Each indicator has a progress bar showing its score and a badge showing its level.</p>
      `,
      tips: [
        "Multiple high indicators = stronger AI generation evidence",
        "One low indicator doesn't override other high ones",
        "Look at the overall pattern across all five indicators"
      ]
    },
    {
      title: "Detected Artifacts Explained",
      content: `
        <p><strong>Common AI Artifacts Found:</strong></p>
        <ul>
          <li><strong>Unrealistic lighting:</strong> Shadows or highlights that don't match light sources</li>
          <li><strong>Symmetry anomalies:</strong> Unnatural perfect or imperfect symmetry</li>
          <li><strong>Text rendering issues:</strong> Garbled or nonsensical text in the image</li>
          <li><strong>Hand/finger problems:</strong> Wrong number of fingers or distorted hands</li>
          <li><strong>Background inconsistencies:</strong> Objects that blend unnaturally</li>
          <li><strong>Texture uniformity:</strong> Too-perfect or too-uniform textures</li>
          <li><strong>Edge artifacts:</strong> Blurred or sharp edges where they shouldn't be</li>
        </ul>
        <p>If artifacts are detected, they'll appear as labeled badges in the results section.</p>
      `,
      tips: [
        "Artifacts are specific visual clues that AI created the image",
        "More artifacts = higher likelihood of AI generation",
        "Some advanced AI models hide artifacts better"
      ]
    },
    {
      title: "Technical Analysis Section",
      content: `
        <p><strong>Low-Level Technical Characteristics:</strong></p>
        <ul>
          <li><strong>Compression Artifacts:</strong>
            <ul>
              <li>Present (Red) = Unusual compression patterns typical of AI generators</li>
              <li>Normal (Default) = Standard JPEG compression</li>
            </ul>
          </li>
          <li><strong>Noise Patterns:</strong> Description of pixel noise (e.g., "Uniform", "Gaussian", "Non-standard")</li>
          <li><strong>Color Space:</strong> The color encoding used (e.g., RGB, sRGB, AdobeRGB)</li>
          <li><strong>Frequency Domain:</strong> Analysis of high/low frequency components in the image</li>
        </ul>
        <p>This technical data provides additional forensic evidence for experts and legal proceedings.</p>
      `,
      tips: [
        "Technical analysis is most useful for expert review",
        "Save these results for documentation or legal purposes",
        "Non-standard patterns are red flags for AI generation"
      ]
    },
    {
      title: "Forgery & Tampering Detection - How to Use",
      content: `
        <p><strong>Step 1: Upload Image</strong></p>
        <ol>
          <li>Click the "Forgery & Tampering" tab at the top</li>
          <li>Click "Choose File" and select an image from your device</li>
          <li>File name and size will display once selected</li>
        </ol>
        <p><strong>Step 2: Run Analysis Tools</strong></p>
        <p>Four detection methods available:</p>
        <ol>
          <li><strong>Run ELA (Error Level Analysis):</strong>
            <ul>
              <li>Generates a heatmap showing compression inconsistencies</li>
              <li>Bright areas = recent edits or manipulations</li>
              <li>Adjust "Scale" slider (1-64) to increase/decrease sensitivity</li>
              <li>Compare original vs. ELA heatmap side-by-side</li>
            </ul>
          </li>
          <li><strong>Read Metadata:</strong>
            <ul>
              <li>Extracts EXIF/XMP data from the image</li>
              <li>Shows camera model, software, timestamps, GPS, etc.</li>
              <li>Missing metadata can indicate tampering</li>
            </ul>
          </li>
          <li><strong>Check Watermark:</strong>
            <ul>
              <li>Detects invisible digital watermarks</li>
              <li>Shows confidence score and watermark ID if found</li>
              <li>Helps verify original source and ownership</li>
            </ul>
          </li>
          <li><strong>AI Forgery Analysis:</strong>
            <ul>
              <li>Uses OpenAI Vision API for narrative assessment</li>
              <li>Provides forgery likelihood percentage</li>
              <li>Gives detailed summary of potential tampering</li>
            </ul>
          </li>
        </ol>
      `,
      tips: [
        "Run all four tools for comprehensive forgery detection",
        "ELA is most effective for detecting local edits and splicing",
        "Metadata absence is suspicious for photos from cameras"
      ]
    },
    {
      title: "Interpreting ELA (Error Level Analysis)",
      content: `
        <p><strong>How to Read ELA Heatmaps:</strong></p>
        <ul>
          <li><strong>Uniform brightness:</strong> Image is consistent - likely not edited</li>
          <li><strong>Bright spots/regions:</strong> Areas that may have been recently edited or added</li>
          <li><strong>Dark areas:</strong> Older compression or unchanged regions</li>
          <li><strong>Sharp boundaries:</strong> Possible splicing or object insertion</li>
        </ul>
        <p><strong>Using the Scale Slider:</strong></p>
        <ul>
          <li><strong>Low scale (1-10):</strong> Subtle differences visible, good for slight edits</li>
          <li><strong>Medium scale (11-30):</strong> Balanced view, recommended starting point (default: 20)</li>
          <li><strong>High scale (31-64):</strong> Amplifies small differences, may show false positives</li>
        </ul>
        <p><strong>What ELA Cannot Detect:</strong></p>
        <ul>
          <li>Edits made before the last JPEG save</li>
          <li>Images that haven't been saved as JPEG</li>
          <li>Very old images with multiple recompressions</li>
        </ul>
      `,
      tips: [
        "Start with default scale (20), then adjust if needed",
        "Compare ELA with visual inspection of original",
        "Bright areas in ELA need context - not always tampering"
      ]
    },
    {
      title: "Metadata Analysis",
      content: `
        <p><strong>What to Look for in Metadata:</strong></p>
        <ul>
          <li><strong>Camera/Device Info:</strong> Real photos have camera make/model</li>
          <li><strong>Software:</strong> Editing software listed indicates modifications</li>
          <li><strong>Timestamps:</strong> Creation date should match claimed time</li>
          <li><strong>GPS Location:</strong> Coordinates should match claimed location</li>
          <li><strong>Image Dimensions:</strong> Unusual sizes may indicate cropping</li>
        </ul>
        <p><strong>Red Flags:</strong></p>
        <ul>
          <li>No metadata at all (stripped intentionally?)</li>
          <li>Software like Photoshop, GIMP listed in metadata</li>
          <li>Mismatched dates (modified after creation)</li>
          <li>GPS coordinates don't match story</li>
        </ul>
        <p>The metadata section shows the first 20 key-value pairs. If more exist, "…and more" appears.</p>
      `,
      tips: [
        "Metadata can be faked, so use with other detection methods",
        "Missing metadata isn't always suspicious (some apps strip it)",
        "Social media platforms often remove metadata"
      ]
    },
    {
      title: "Best Practices for Image Analysis",
      content: `
        <p><strong>For AI Detection:</strong></p>
        <ol>
          <li>Upload high-quality images for better accuracy</li>
          <li>Check all five detection indicators, not just overall result</li>
          <li>Look for patterns across multiple images from same source</li>
          <li>Save results and screenshots for documentation</li>
        </ol>
        <p><strong>For Forgery Detection:</strong></p>
        <ol>
          <li>Run all four analysis tools (ELA, Metadata, Watermark, AI)</li>
          <li>Use original, uncompressed files when possible</li>
          <li>Document your findings with screenshots and notes</li>
          <li>Compare suspicious images with known authentic versions</li>
        </ol>
        <p><strong>For Legal/Professional Use:</strong></p>
        <ul>
          <li>Save all analysis results as evidence</li>
          <li>Run analysis on original files, not screenshots</li>
          <li>Document the analysis date and settings used</li>
          <li>Consider consulting forensic experts for high-stakes cases</li>
        </ul>
      `,
      tips: [
        "No single tool is 100% accurate - use multiple methods",
        "Higher quality source images = more reliable results",
        "Keep records of all analysis for legal purposes"
      ]
    },
    {
      title: "Common Use Cases",
      content: `
        <p><strong>Verify Social Media Content:</strong></p>
        <ul>
          <li>Check if viral images are AI-generated fakes</li>
          <li>Detect manipulated photos spreading misinformation</li>
          <li>Verify authenticity of news imagery</li>
        </ul>
        <p><strong>Protect Your Artwork:</strong></p>
        <ul>
          <li>Detect if others are using AI to copy your style</li>
          <li>Verify if submitted work is human-created</li>
          <li>Check for unauthorized edits to your images</li>
        </ul>
        <p><strong>Professional Verification:</strong></p>
        <ul>
          <li>Journalism: Verify photo submissions</li>
          <li>Legal: Analyze evidence images</li>
          <li>Education: Detect AI-generated student work</li>
          <li>E-commerce: Verify product photo authenticity</li>
        </ul>
      `,
      tips: [
        "Different use cases may prioritize different analysis tools",
        "For quick checks, AI detection is fastest",
        "For forensic proof, use all available tools"
      ]
    }
  ]
};

export const monitoringHubGuide = {
  title: "How to Use Monitoring & Detection Hub",
  description: "Beginner-friendly guide to monitor portfolios, detect deepfakes, and identify forgery",
  sections: [
    {
      title: "Getting Started with Monitoring Hub",
      content: `
        <p><strong>How to Access:</strong></p>
        <ol>
          <li>Click "Monitoring Hub" in the main navigation menu</li>
          <li>Or navigate directly to /monitoring-hub</li>
        </ol>
        <p><strong>What You'll See at the Top:</strong></p>
        <ul>
          <li><strong>Active Monitoring:</strong> Shows 24/7 protection is running</li>
          <li><strong>Scans Completed:</strong> How many times we've checked for violations</li>
          <li><strong>Violations Found:</strong> Unauthorized uses detected</li>
          <li><strong>Protection Rate:</strong> How successful we are at stopping violations</li>
          <li><strong>Platforms Monitored:</strong> How many websites we're watching</li>
        </ul>
        <p><strong>Six Tabs Available:</strong></p>
        <ol>
          <li><strong>Portfolio:</strong> Monitor your collection - <span class="text-green-600 font-semibold">FULLY WORKING</span></li>
          <li><strong>Profile:</strong> Track identity misuse - <span class="text-orange-600 font-semibold">COMING SOON</span></li>
          <li><strong>Trademark:</strong> Detect trademark violations - <span class="text-orange-600 font-semibold">COMING SOON</span></li>
          <li><strong>Deepfake:</strong> Find AI fakes - <span class="text-green-600 font-semibold">FULLY WORKING</span></li>
          <li><strong>Forgery:</strong> Detect edited images - <span class="text-green-600 font-semibold">FULLY WORKING</span></li>
          <li><strong>Diagnostics:</strong> Admin tools - For administrators only</li>
        </ol>
      `,
      tips: [
        "Start with the Portfolio tab to see your protected works",
        "Numbers shown are examples - your real data will appear after first scan",
        "Click any tab to switch between different monitoring tools"
      ]
    },
    {
      title: "Using Portfolio Monitoring",
      content: `
        <p><strong>Step-by-Step:</strong></p>
        <ol>
          <li>Click the "Portfolio" tab</li>
          <li>See all your protected artworks listed</li>
          <li>Check protection status for each item</li>
          <li>View any violations that were found</li>
          <li>Click on violations to see more details</li>
        </ol>
        <p><strong>What We Monitor:</strong></p>
        <ul>
          <li>Every artwork you've uploaded and protected</li>
          <li>Social media platforms (Instagram, Facebook, Twitter, etc.)</li>
          <li>E-commerce sites (Etsy, Redbubble, etc.)</li>
          <li>Image search engines</li>
          <li>Art-sharing websites</li>
        </ul>
        <p><strong>When a Violation is Found:</strong></p>
        <ol>
          <li>You'll see it listed with a confidence score (how sure we are it's a violation)</li>
          <li>Click to view evidence (screenshots, URLs)</li>
          <li>Use the Quick Actions section to file a takedown notice</li>
          <li>We'll track the resolution for you</li>
        </ol>
      `,
      tips: [
        "Check Portfolio tab daily for new violations",
        "Confidence above 80% usually means it's a real violation",
        "Use Quick Actions at the bottom to take fast action"
      ]
    },
    {
      title: "Deepfake Detection & Scanning",
      content: `
        <p><strong>How to Start a Deepfake Scan:</strong></p>
        <ol>
          <li>Click the "Deepfake" tab</li>
          <li>See detection statistics and recent findings</li>
          <li>Click "Start Deepfake Scan" button</li>
          <li>You'll be taken to the AI Image Detector tool</li>
          <li>Upload an image or paste a URL to check</li>
          <li>Click "Analyze for AI Generation" to start</li>
        </ol>
        <p><strong>Understanding Deepfake Results:</strong></p>
        <ul>
          <li><strong>Detection Accuracy:</strong> How good our AI detector is (shown as percentage)</li>
          <li><strong>Processing Speed:</strong> How fast scans complete (usually 2-3 seconds)</li>
          <li><strong>Platforms Monitored:</strong> How many sites we're actively scanning</li>
        </ul>
        <p><strong>Recent Detections Section:</strong></p>
        <ul>
          <li><strong>Critical (Red):</strong> High-quality deepfake detected - immediate action needed</li>
          <li><strong>Warning (Orange):</strong> Face swap or manipulation detected</li>
          <li><strong>Low Risk (Yellow):</strong> Minor indicators found</li>
        </ul>
      `,
      tips: [
        "Click 'Start Deepfake Scan' to analyze specific images",
        "Higher threat levels need faster response",
        "Save evidence screenshots for later reference"
      ]
    },
    {
      title: "Image Forgery Detection",
      content: `
        <p><strong>How to Analyze an Image for Forgery:</strong></p>
        <ol>
          <li>Click the "Forgery" tab</li>
          <li>Review the detection capabilities displayed</li>
          <li>Click "Analyze Image" button</li>
          <li>You'll go to the Forgery Detection tool</li>
          <li>Upload an image from your computer</li>
          <li>Use the analysis buttons to check the image</li>
        </ol>
        <p><strong>Four Analysis Tools Available:</strong></p>
        <ul>
          <li><strong>ELA (Error Level Analysis):</strong> Shows edited regions in the image</li>
          <li><strong>Metadata Check:</strong> Reads camera and editing information</li>
          <li><strong>Watermark Detection:</strong> Finds invisible watermarks</li>
          <li><strong>AI Analysis:</strong> Uses AI to detect deepfakes and manipulation</li>
        </ul>
        <p><strong>Detection Techniques Explained:</strong></p>
        <ul>
          <li><strong>Copy-move detection:</strong> Finds copied and pasted areas</li>
          <li><strong>Splice detection:</strong> Identifies images combined together</li>
          <li><strong>EXIF forensics:</strong> Checks camera data for inconsistencies</li>
          <li><strong>AI fingerprinting:</strong> Detects AI-generated content</li>
        </ul>
      `,
      tips: [
        "Run all four analysis tools for best results",
        "Bright areas in ELA may indicate editing",
        "Missing metadata can be a red flag"
      ]
    },
    {
      title: "Quick Actions - Take Fast Action",
      content: `
        <p>At the bottom of the Monitoring Hub, you'll find Quick Actions for common tasks:</p>
        <p><strong>1. Start Comprehensive Scan:</strong></p>
        <ul>
          <li>Click to begin full portfolio monitoring</li>
          <li>Takes you to Portfolio Monitoring page</li>
          <li>Scans all your protected works across platforms</li>
        </ul>
        <p><strong>2. View All Alerts:</strong></p>
        <ul>
          <li>See all detected violations in one place</li>
          <li>Takes you to AI Protection page</li>
          <li>Shows threats requiring your attention</li>
        </ul>
        <p><strong>3. Analytics Dashboard:</strong></p>
        <ul>
          <li>View detailed statistics and trends</li>
          <li>Opens the Analytics page</li>
          <li>See charts and graphs of your protection data</li>
        </ul>
        <p><strong>How to Use Quick Actions:</strong></p>
        <ol>
          <li>Scroll to the bottom of Monitoring Hub</li>
          <li>Click any Quick Action button</li>
          <li>You'll navigate to the relevant page automatically</li>
        </ol>
      `,
      tips: [
        "Quick Actions save time - use them instead of navigating menus",
        "Start Comprehensive Scan regularly to catch new violations",
        "Check Analytics weekly to track protection trends"
      ]
    },
    {
      title: "Beginner Tips & Best Practices",
      content: `
        <p><strong>Daily Routine (5 minutes):</strong></p>
        <ol>
          <li>Open Monitoring Hub</li>
          <li>Check the stats at the top for new violations</li>
          <li>Click Portfolio tab to review your works</li>
          <li>Address any high-priority violations found</li>
        </ol>
        <p><strong>When You Find a Violation:</strong></p>
        <ol>
          <li>Don't panic - we've got tools to help</li>
          <li>Click on the violation to see evidence</li>
          <li>Check the confidence score (higher = more certain)</li>
          <li>Use Quick Actions to file a takedown notice</li>
          <li>Monitor the resolution in your Dashboard</li>
        </ol>
        <p><strong>Common Questions:</strong></p>
        <ul>
          <li><strong>How often should I check?</strong> Daily is best, weekly minimum</li>
          <li><strong>What confidence score is reliable?</strong> 80% or higher</li>
          <li><strong>Can I automate responses?</strong> Yes, with Pro plan</li>
          <li><strong>How long does scanning take?</strong> Initial scan: 10-15 min, ongoing: continuous</li>
        </ul>
      `,
      tips: [
        "Set a daily reminder to check Monitoring Hub",
        "Don't ignore low-confidence matches - review them anyway",
        "Keep records of all violations and actions taken"
      ]
    }
  ]
};


export const unifiedDashboardGuide = {
  title: "Unified Dashboard Guide",
  description: "Master your comprehensive protection dashboard",
  sections: [
    {
      title: "Dashboard Overview",
      content: `
        <p>The Unified Dashboard is your central control panel for all protection activities.</p>
        <p><strong>Six Key Metrics Displayed:</strong></p>
        <ul>
          <li><strong>Protected Assets:</strong> Total artworks you've uploaded and protected</li>
          <li><strong>Active Scans:</strong> Currently running monitoring scans</li>
          <li><strong>Threats:</strong> Detected violations requiring your attention</li>
          <li><strong>Blockchain Records:</strong> Blockchain certificates created</li>
          <li><strong>Legal Actions:</strong> DMCA notices filed and tracked</li>
          <li><strong>Success Rate:</strong> Percentage of threats successfully resolved</li>
        </ul>
        <p><strong>Quick Actions Sidebar:</strong></p>
        <ul>
          <li>Upload & Protect - Navigate to upload page</li>
          <li>Start Monitoring - Configure monitoring settings</li>
          <li>Configure AI Protection - Set up AI training protection</li>
          <li>Legal Templates - Access legal documents</li>
        </ul>
        <p><strong>Recent Activity Feed:</strong></p>
        <p>Shows your latest protection actions with icons, messages, and timestamps including uploads, AI protection activations, blockchain registrations, and threat detections.</p>
      `,
      tips: [
        "Check dashboard daily for new threats",
        "Higher success rate means effective violation resolution",
        "Review recent activity to stay updated"
      ]
    },
    {
      title: "Setting Monitoring Frequency",
      content: `
        <p>Control how often your content is scanned across the internet:</p>
        <p><strong>How to Set Frequency:</strong></p>
        <ol>
          <li>In the Overview tab, scroll to the "Monitoring Frequency" card</li>
          <li>Select your preferred scan frequency from the dropdown:
            <ul>
              <li><strong>Real-time (Continuous):</strong> Scans every 5 minutes - highest protection</li>
              <li><strong>Hourly:</strong> Scans once per hour - balanced protection</li>
              <li><strong>Daily:</strong> Scans once per day - standard protection</li>
              <li><strong>Weekly:</strong> Scans once per week - light monitoring</li>
              <li><strong>Monthly:</strong> Scans once per month - minimal monitoring</li>
            </ul>
          </li>
          <li>Click "Save Frequency Settings" to apply to all active portfolios</li>
        </ol>
        <p><strong>What This Affects:</strong></p>
        <ul>
          <li>How often the system searches for unauthorized uses</li>
          <li>How quickly new threats are detected</li>
          <li>System resource usage and scan credits</li>
        </ul>
        <p><strong>Recommended Settings:</strong></p>
        <ul>
          <li>High-value work or commercial content: Real-time or Hourly</li>
          <li>Regular portfolio monitoring: Daily</li>
          <li>Archive or older work: Weekly or Monthly</li>
        </ul>
      `,
      tips: [
        "Real-time monitoring uses more resources but provides fastest threat detection",
        "Your frequency setting applies to all active portfolios",
        "Change frequency anytime based on your needs"
      ]
    },
    {
      title: "Dashboard Tabs Explained",
      content: `
        <p>The Unified Dashboard has 8 specialized tabs:</p>
        <p><strong>1. Overview (Default):</strong></p>
        <ul>
          <li>Six key metrics at a glance</li>
          <li>Quick Actions sidebar</li>
          <li>Recent Activity feed</li>
          <li>Monitoring Frequency settings</li>
        </ul>
        <p><strong>2. Production:</strong></p>
        <ul>
          <li>Production environment performance metrics</li>
          <li>System health indicators</li>
          <li>Usage statistics</li>
        </ul>
        <p><strong>3. AI Detection:</strong></p>
        <ul>
          <li>AI-powered threat detection analytics</li>
          <li>Detection confidence scores</li>
          <li>Platform-specific threat breakdowns</li>
        </ul>
        <p><strong>4. Protection:</strong></p>
        <ul>
          <li>One-click protection tools</li>
          <li>Quick protection activation</li>
          <li>Protection status overview</li>
        </ul>
        <p><strong>5. Blockchain:</strong></p>
        <ul>
          <li>View all blockchain certificates</li>
          <li>Download certificate files</li>
          <li>Verify ownership proofs</li>
          <li>Share certificate URLs</li>
        </ul>
        <p><strong>6. Legal:</strong></p>
        <ul>
          <li>Real-time legal dashboard</li>
          <li>Global legal network access</li>
          <li>DMCA notice management</li>
          <li>Legal templates and tools</li>
        </ul>
        <p><strong>7. Creator:</strong></p>
        <ul>
          <li>Creator economy features</li>
          <li>Licensing management</li>
          <li>Revenue tracking</li>
        </ul>
        <p><strong>8. Recognition:</strong></p>
        <ul>
          <li>Visual recognition tools</li>
          <li>Image similarity analysis</li>
          <li>Content matching technology</li>
        </ul>
      `,
      tips: [
        "Start with Overview tab as your daily entry point",
        "Use Blockchain tab to download certificates for legal purposes",
        "Legal tab streamlines DMCA filing process"
      ]
    },
    {
      title: "Managing Protections",
      content: `
        <p>Control all your protections from one central location:</p>
        <p><strong>View Protection Status:</strong></p>
        <ul>
          <li>Protected Assets metric shows total count</li>
          <li>Active Scans shows ongoing monitoring</li>
          <li>Recent Activity shows latest protection actions</li>
        </ul>
        <p><strong>Update Protection Settings:</strong></p>
        <ul>
          <li>Navigate to specific tabs for detailed controls</li>
          <li>Use Quick Actions for common tasks</li>
          <li>Adjust monitoring frequency as needed</li>
        </ul>
        <p><strong>Taking Action on Threats:</strong></p>
        <ol>
          <li>Check "Threats" metric for violation count</li>
          <li>Navigate to AI Detection tab for details</li>
          <li>Review evidence and confidence scores</li>
          <li>Go to Legal tab to file DMCA notices</li>
          <li>Track resolution progress</li>
        </ol>
      `,
      tips: [
        "Act quickly on high-priority threats",
        "Keep certificates backed up offline",
        "Review protection status weekly"
      ]
    },
    {
      title: "Analytics & Insights",
      content: `
        <p>Understand your protection performance across all tabs:</p>
        <p><strong>Key Metrics to Track:</strong></p>
        <ul>
          <li><strong>Success Rate:</strong> Shows effectiveness of violation resolution</li>
          <li><strong>Detection Rate:</strong> Available in AI Detection tab</li>
          <li><strong>Active Scans:</strong> Monitor ongoing protection activity</li>
          <li><strong>Legal Actions:</strong> Track DMCA and legal progress</li>
        </ul>
        <p><strong>Using Production Tab:</strong></p>
        <ul>
          <li>View system performance metrics</li>
          <li>Monitor resource usage</li>
          <li>Track scan completion rates</li>
        </ul>
        <p><strong>AI Detection Analytics:</strong></p>
        <ul>
          <li>View threat detection trends</li>
          <li>Platform-specific violation breakdowns</li>
          <li>Confidence score distributions</li>
        </ul>
      `,
      tips: [
        "Higher success rate indicates effective protection strategy",
        "Use Production tab to optimize resource usage",
        "Review AI Detection analytics to identify threat patterns"
      ]
    }
  ]
};

export const homeGuide = {
  title: "How to Use TSMO",
  description: "Step-by-step instructions to protect your creative work",
  sections: [
    {
      title: "Getting Started: First Steps",
      content: `
        <p><strong>Step 1: Create Your Account</strong></p>
        <ol>
          <li>Look for the <strong>"Get Protected"</strong> button in the bottom-left sidebar</li>
          <li>Click it to go to the sign-up page</li>
          <li>Select the "Sign Up" tab if not already selected</li>
          <li>Enter your full name, username, email, and create a password</li>
          <li>Optionally enter a promo code if you have one</li>
          <li>Click "Create Account" to complete registration</li>
          <li>You'll be automatically signed in and redirected to the dashboard</li>
        </ol>
        <p><strong>Note:</strong> The "Get Protected" button is located at the bottom-left of the page in the sidebar. You can also click "Login" in the navigation menu if you already have an account.</p>
        <p><strong>Step 2: Choose Your Plan</strong></p>
        <ul>
          <li><strong>Student ($19/mo):</strong> Up to 1,000 artworks, basic AI monitoring, 5 portfolios</li>
          <li><strong>Starter ($29/mo):</strong> Up to 3,500 artworks, advanced AI monitoring, 10 portfolios, API access</li>
          <li><strong>Professional ($199/mo):</strong> Up to 250,000 artworks, 50 portfolios, blockchain verification, deepfake detection, white-label options</li>
          <li><strong>Enterprise (Custom):</strong> Unlimited artworks and portfolios, custom API, 24/7 priority support</li>
        </ul>
        <p><strong>Add-ons:</strong> AI Training Protection ($49/mo), Social Media Monitoring ($100/mo + $199 startup, Coming Soon)</p>
        <p>All plans include a 5-day free trial with no credit card required.</p>
      `,
      tips: [
        "You can upload without signing in for basic protection",
        "Sign in to access monitoring and blockchain features",
        "Student plan offers 24% discount for students"
      ]
    },
    {
      title: "Uploading Your First Artwork",
      content: `
        <p><strong>Navigate to Upload Page:</strong></p>
        <ol>
          <li>Click "Upload" in the main navigation menu</li>
          <li>Or go directly to /upload</li>
        </ol>
        <p><strong>Upload Files:</strong></p>
        <ol>
          <li>Drag and drop files into the upload area, or click "Select Files"</li>
          <li>Supported formats: Images, videos, audio, PDFs, documents</li>
          <li>You can also add URLs by pasting them in the URL input field</li>
        </ol>
        <p><strong>Fill in Required Information:</strong></p>
        <ul>
          <li><strong>Title:</strong> Required - Give your artwork a name</li>
          <li><strong>Description:</strong> Optional but recommended</li>
          <li><strong>Category:</strong> Required - Photography, Digital Art, Video, Audio/Music, Writing, Design, or Other</li>
          <li><strong>Tags:</strong> Optional - Add keywords for organization</li>
          <li><strong>License Type:</strong> Optional - All Rights Reserved, Creative Commons, or Public Domain</li>
        </ul>
        <p><strong>Protection Options (checkboxes):</strong></p>
        <ul>
          <li><strong>Enable Watermarking:</strong> Adds visible watermark to your image</li>
          <li><strong>Blockchain Verification:</strong> Creates blockchain certificate (requires sign-in)</li>
        </ul>
        <p><strong>Click "Start Protection"</strong> - Processing takes 5-30 seconds depending on file size.</p>
      `,
      tips: [
        "Higher resolution files provide better protection",
        "Fill in all details for stronger copyright documentation",
        "Blockchain verification is only available for signed-in users"
      ]
    },
    {
      title: "Using the Unified Dashboard",
      content: `
        <p><strong>Access Your Dashboard:</strong></p>
        <ol>
          <li>Click "Dashboard" in the navigation menu after signing in</li>
          <li>Or go to /dashboard or /unified-dashboard</li>
        </ol>
        <p><strong>Overview Tab Shows:</strong></p>
        <ul>
          <li><strong>Protected Assets:</strong> Total number of your protected artworks</li>
          <li><strong>Active Scans:</strong> Number of ongoing monitoring scans</li>
          <li><strong>Threats:</strong> Detected violations requiring attention</li>
          <li><strong>Blockchain Records:</strong> Number of blockchain certificates created</li>
          <li><strong>Legal Actions:</strong> DMCA notices and legal filings</li>
          <li><strong>Success Rate:</strong> Percentage of resolved violations</li>
        </ul>
        <p><strong>Quick Actions Available:</strong></p>
        <ul>
          <li>Upload & Protect - Go to upload page</li>
          <li>Start Monitoring - Go to Monitoring Hub</li>
          <li>Configure AI Protection - Go to AI Protection Settings</li>
          <li>Legal Templates - Access legal documents</li>
        </ul>
        <p><strong>Additional Tabs:</strong></p>
        <ul>
          <li>Production - Production environment metrics</li>
          <li>AI Detection - AI-powered threat detection</li>
          <li>Protection - One-click protection tools</li>
          <li>Blockchain - Blockchain registry and certificates</li>
          <li>Legal - Legal network and case management</li>
          <li>Creator - Creator economy and licensing</li>
          <li>Recognition - Visual recognition tools</li>
        </ul>
      `,
      tips: [
        "Check the Overview tab daily for new threats",
        "Use Quick Actions for common tasks",
        "Red badges indicate items needing attention"
      ]
    },
    {
      title: "Setting Up Monitoring",
      content: `
        <p><strong>Access Monitoring Hub:</strong></p>
        <ol>
          <li>Click "Monitoring Hub" in the navigation menu</li>
          <li>Or go to /monitoring-hub</li>
        </ol>
        <p><strong>Five Monitoring Types Available:</strong></p>
        <ul>
          <li><strong>Portfolio:</strong> Monitor all your uploaded artworks for unauthorized use</li>
          <li><strong>Profile:</strong> Detect unauthorized use of your identity and personal information</li>
          <li><strong>Trademark:</strong> Monitor for trademark violations and brand infringement</li>
          <li><strong>Deepfake:</strong> Detect manipulated media using your likeness</li>
          <li><strong>Forgery:</strong> Identify AI-generated copies and image manipulation</li>
        </ul>
        <p><strong>How to Enable Monitoring:</strong></p>
        <ol>
          <li>Select the tab for the type of monitoring you want</li>
          <li>Click "Start Monitoring" or "Enable" button</li>
          <li>Configure alert preferences (email/SMS, frequency)</li>
          <li>Monitor will scan every 6 hours automatically</li>
        </ol>
      `,
      tips: [
        "Enable Portfolio monitoring first - it covers your uploaded works",
        "Configure alert frequency in your account settings",
        "Real-time scanning is available on Professional plan"
      ]
    },
    {
      title: "Using Forgery Detection",
      content: `
        <p><strong>Access Forgery Detection:</strong></p>
        <ol>
          <li>Click "Forgery Detection" in the navigation menu</li>
          <li>Or go to /forgery-detection</li>
        </ol>
        <p><strong>Two Analysis Tools:</strong></p>
        <ul>
          <li><strong>AI Generation Detection:</strong> Detects if an image was generated by AI (Midjourney, DALL-E, Stable Diffusion, etc.)</li>
          <li><strong>Forgery & Tampering:</strong> Identifies image manipulation, editing, and digital forensics analysis</li>
        </ul>
        <p><strong>How to Analyze an Image:</strong></p>
        <ol>
          <li>Select the tab (AI Generation or Forgery & Tampering)</li>
          <li>Upload the suspicious image</li>
          <li>Click "Analyze" or "Detect"</li>
          <li>Wait 5-15 seconds for results</li>
          <li>Review the analysis report with confidence scores</li>
        </ol>
        <p><strong>Analysis Includes:</strong></p>
        <ul>
          <li>Probability score (0-100%)</li>
          <li>ELA (Error Level Analysis) visualization</li>
          <li>Metadata verification</li>
          <li>Tamper detection areas</li>
          <li>Detailed forensics report</li>
        </ul>
      `,
      tips: [
        "Use this before purchasing artwork to verify authenticity",
        "94% accuracy on deepfakes, 97% on digital manipulations",
        "Analysis is free for all users"
      ]
    },
    {
      title: "Filing DMCA Takedown Notices",
      content: `
        <p><strong>Access DMCA Center:</strong></p>
        <ol>
          <li>Click "DMCA Center" in the navigation menu</li>
          <li>Or go to /dmca-center</li>
        </ol>
        <p><strong>File a DMCA Notice:</strong></p>
        <ol>
          <li>Click "File DMCA Notice" button</li>
          <li>Fill in required information:
            <ul>
              <li>Your contact information</li>
              <li>Description of your copyrighted work</li>
              <li>URL of the infringing content</li>
              <li>Statement of good faith belief</li>
            </ul>
          </li>
          <li>Review the generated notice</li>
          <li>Click "Submit" to file</li>
        </ol>
        <p><strong>Track Your Notices:</strong></p>
        <ul>
          <li>View all filed notices in "My DMCA Notices" tab</li>
          <li>Check status: Pending, Acknowledged, or Resolved</li>
          <li>Download notice as PDF for your records</li>
          <li>View response time and resolution details</li>
        </ul>
        <p><strong>Rate Limits:</strong></p>
        <ul>
          <li>Maximum 5 notices per hour</li>
          <li>Maximum 20 notices per day</li>
        </ul>
        <p><strong>Automated DMCA (Professional Plan):</strong> Automatic filing when violations are detected.</p>
      `,
      tips: [
        "Be accurate with infringing URLs - incorrect info delays processing",
        "Download notice PDFs for your legal records",
        "Professional plan includes automated filing and faster response"
      ]
    },
    {
      title: "Blockchain Certificates",
      content: `
        <p><strong>Creating Certificates:</strong></p>
        <ol>
          <li>When uploading artwork, check "Blockchain Verification" (must be signed in)</li>
          <li>After upload completes, blockchain registration starts automatically</li>
          <li>Certificate is created within 1-2 minutes</li>
          <li>You'll receive notification when complete</li>
        </ol>
        <p><strong>Viewing Certificates:</strong></p>
        <ol>
          <li>Go to Dashboard → Blockchain tab</li>
          <li>Click on any artwork to view its certificate</li>
          <li>Or access directly via /certificate/[certificate-id]</li>
        </ol>
        <p><strong>Certificate Contains:</strong></p>
        <ul>
          <li>Unique Certificate ID</li>
          <li>Registration Timestamp</li>
          <li>Artwork Fingerprint (hash)</li>
          <li>Blockchain Hash (immutable proof)</li>
          <li>Ownership Proof</li>
          <li>Verification Status</li>
        </ul>
        <p><strong>Download & Share:</strong></p>
        <ul>
          <li>Click "Download Certificate" to get JSON file</li>
          <li>Click "Share Certificate" to copy URL</li>
          <li>Use in copyright disputes and legal proceedings</li>
        </ul>
      `,
      tips: [
        "Store certificate files in secure cloud backup",
        "Blockchain certificates are legally admissible evidence",
        "Share certificate URLs with buyers for proof of authenticity"
      ]
    },
    {
      title: "AI Training Protection",
      content: `
        <p><strong>Access AI Protection Settings:</strong></p>
        <ol>
          <li>Click "AI Protection Settings" or "AI Training Protection" in menu</li>
          <li>Or go to /ai-protection-settings</li>
        </ol>
        <p><strong>What This Does:</strong></p>
        <p>Prevents AI models (Midjourney, DALL-E, Stable Diffusion, etc.) from using your artwork in their training datasets. This is separate from uploading files.</p>
        <p><strong>How to Enable:</strong></p>
        <ol>
          <li>Select artworks you want to protect from AI training</li>
          <li>Choose protection level (Basic, Standard, Maximum)</li>
          <li>Click "Enable Protection"</li>
          <li>System applies invisible adversarial perturbations</li>
        </ol>
        <p><strong>Protection Levels:</strong></p>
        <ul>
          <li><strong>Basic:</strong> Standard protection markers</li>
          <li><strong>Standard:</strong> Enhanced adversarial patterns</li>
          <li><strong>Maximum:</strong> Multi-layer protection with monitoring</li>
        </ul>
        <p><strong>Available as Add-on:</strong> $49/month for all plans</p>
      `,
      tips: [
        "This doesn't affect image quality - protection is invisible",
        "Enable for all digital artwork you share publicly",
        "Maximum protection recommended for high-value work"
      ]
    },
    {
      title: "How to Get the Most Out of TSMO",
      content: `
        <p><strong>Maximize Your Protection:</strong></p>
        <ul>
          <li><strong>Upload Everything:</strong> Protect all your work, not just final pieces - sketches, WIPs, and drafts prove your creative process</li>
          <li><strong>Use Blockchain for Important Work:</strong> Always enable blockchain verification for high-value or commercial artwork</li>
          <li><strong>Enable Multiple Monitoring Types:</strong> Combine Portfolio + Profile + Deepfake monitoring for comprehensive coverage</li>
          <li><strong>Tag Thoroughly:</strong> Detailed tags and descriptions make monitoring more accurate and help in legal proceedings</li>
        </ul>
        <p><strong>Best Practices for Monitoring:</strong></p>
        <ul>
          <li><strong>Check Dashboard Daily:</strong> Review the Overview tab each day for new threats and alerts</li>
          <li><strong>Act on Threats Immediately:</strong> File DMCA notices within 24-48 hours of detection for fastest results</li>
          <li><strong>Configure Alert Preferences:</strong> Set email/SMS alerts to match your workflow (instant, daily digest, or weekly)</li>
          <li><strong>Monitor Pre-emptively:</strong> Enable monitoring before publicly sharing work to catch violations early</li>
        </ul>
        <p><strong>Optimize Your Workflow:</strong></p>
        <ul>
          <li><strong>Batch Upload:</strong> Upload multiple files at once instead of one-by-one to save time</li>
          <li><strong>Use Legal Templates:</strong> Pre-fill DMCA notices using templates to file faster when violations occur</li>
          <li><strong>Export Monthly Reports:</strong> Download analytics reports for tax purposes and business records</li>
          <li><strong>Set Up Portfolios:</strong> Organize artworks into portfolios (e.g., "Client Work", "Personal", "NFTs") for easier management</li>
        </ul>
        <p><strong>Advanced Tips:</strong></p>
        <ul>
          <li><strong>Verify Suspicious Images:</strong> Use Forgery Detection before purchasing or licensing artwork from others</li>
          <li><strong>Share Certificates with Buyers:</strong> Include blockchain certificate URLs when selling work to prove authenticity</li>
          <li><strong>Enable AI Protection for Public Work:</strong> If you share work on social media or portfolios, enable AI Training Protection</li>
          <li><strong>Document Everything:</strong> Keep records of all DMCA notices, certificates, and violations for potential legal action</li>
        </ul>
        <p><strong>Professional/Enterprise Users:</strong></p>
        <ul>
          <li><strong>Use API Access:</strong> Integrate TSMO protection into your existing workflows (Starter plan and above)</li>
          <li><strong>White-Label Options:</strong> Customize interface for client-facing use (Professional plan)</li>
          <li><strong>Automated DMCA:</strong> Enable auto-filing for instant takedown requests (Professional plan)</li>
          <li><strong>Priority Support:</strong> Take advantage of faster response times for urgent issues</li>
        </ul>
        <p><strong>Cost Optimization:</strong></p>
        <ul>
          <li><strong>Start with Student/Starter:</strong> Test features before upgrading to Professional</li>
          <li><strong>Use Free Trial:</strong> 5-day trial with no credit card required on all plans</li>
          <li><strong>Add-ons Only When Needed:</strong> Social Media Monitoring and AI Training Protection are optional - add when you need them</li>
          <li><strong>Annual Billing:</strong> Contact sales for annual billing discounts (Enterprise plan)</li>
        </ul>
        <p><strong>Success Metrics to Track:</strong></p>
        <ul>
          <li><strong>Threat Detection Rate:</strong> Monitor how many violations are caught per month</li>
          <li><strong>Resolution Success Rate:</strong> Track percentage of DMCA notices successfully resolved</li>
          <li><strong>Response Time:</strong> Measure how quickly platforms respond to your takedown requests</li>
          <li><strong>Protected Assets Growth:</strong> Keep adding work consistently to maintain comprehensive protection</li>
        </ul>
      `,
      tips: [
        "Enable all monitoring types for complete coverage across platforms",
        "Document your creative process with WIP uploads - proves originality",
        "Review analytics monthly to identify patterns in violations",
        "Join the TSMO community to share experiences and learn best practices"
      ]
    },
    {
      title: "Getting Help",
      content: `
        <p><strong>Help Center:</strong></p>
        <ol>
          <li>Click "Help Center" in navigation menu</li>
          <li>Or go to /help-center</li>
          <li>Search for your issue or browse guides</li>
          <li>View FAQs and troubleshooting steps</li>
        </ol>
        <p><strong>Report a Bug:</strong></p>
        <ol>
          <li>Click the "Report Bug" button (floating button on most pages)</li>
          <li>Fill in: What you tried, what happened, what should happen</li>
          <li>Optionally attach screenshots</li>
          <li>Click Submit</li>
        </ol>
        <p><strong>User Guides:</strong></p>
        <p>Most pages have a "?" icon that opens context-specific guides. Look for it in the top-right area of pages.</p>
        <p><strong>Common Issues:</strong></p>
        <ul>
          <li><strong>Upload failed:</strong> Check file size (max 500MB) and format</li>
          <li><strong>Protection pending:</strong> Large files take up to 10 minutes</li>
          <li><strong>No detections:</strong> Monitoring takes 6-24 hours after enabling</li>
          <li><strong>Blockchain failed:</strong> Artwork is still protected; you can retry blockchain later</li>
        </ul>
        <p><strong>Contact Support:</strong></p>
        <ul>
          <li>Email: shirleena.cunningham@tsmowatch.com</li>
          <li>Response time: 48 hours (Student), 24 hours (Starter/Professional), 4 hours (Enterprise)</li>
          <li>Include: Username, affected artwork name, screenshots of error</li>
        </ul>
      `,
      tips: [
        "Check Help Center first - most questions answered there",
        "Use Bug Report for technical issues, not feature requests",
        "Include your browser and operating system when reporting bugs"
      ]
    }
  ]
};
