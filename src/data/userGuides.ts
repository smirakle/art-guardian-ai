export const uploadGuide = {
  title: "Upload & Protect Guide",
  description: "Learn how to upload and protect your artwork with TSMO",
  sections: [
    {
      title: "Step 1: Select Your File",
      content: `
        <p>Click the upload area or drag and drop your file to get started.</p>
        <p><strong>Supported formats:</strong></p>
        <ul>
          <li>Images: JPG, PNG, GIF, WebP</li>
          <li>Videos: MP4, MOV, AVI</li>
          <li>Documents: PDF, DOCX (with Document Protection addon)</li>
        </ul>
        <p><strong>File size limits:</strong></p>
        <ul>
          <li>Free plan: Up to 50MB per file</li>
          <li>Paid plans: Up to 500MB per file</li>
        </ul>
      `,
      tips: [
        "Higher resolution files provide better protection",
        "Batch upload multiple files at once to save time",
        "Check file size before uploading to avoid errors"
      ]
    },
    {
      title: "Step 2: Add Artwork Details",
      content: `
        <p>Fill in the required information about your artwork:</p>
        <ul>
          <li><strong>Title:</strong> Give your artwork a descriptive name</li>
          <li><strong>Description:</strong> Add context about your work</li>
          <li><strong>Category:</strong> Choose the most appropriate category</li>
          <li><strong>Tags:</strong> Add searchable keywords (optional)</li>
        </ul>
        <p>This information helps with organization and copyright claims.</p>
      `,
      tips: [
        "Be descriptive - it helps with legal documentation",
        "Use consistent naming for series of works",
        "Add creation date in description for copyright purposes"
      ]
    },
    {
      title: "Step 3: Choose Protection Options",
      content: `
        <p>Select the protection methods you want to apply:</p>
        <ul>
          <li><strong>Watermark:</strong> Visible mark on your image</li>
          <li><strong>AI Protection:</strong> Invisible markers to prevent AI training</li>
          <li><strong>Blockchain:</strong> Immutable proof of ownership</li>
        </ul>
        <p><strong>Protection levels:</strong></p>
        <ul>
          <li><em>Basic:</em> Watermark only</li>
          <li><em>Standard:</em> Watermark + AI protection</li>
          <li><em>Maximum:</em> All protections + blockchain</li>
        </ul>
      `,
      tips: [
        "AI Protection is recommended for all digital art",
        "Blockchain provides legal proof of ownership",
        "Combine multiple protections for maximum security"
      ]
    },
    {
      title: "Step 4: Upload & Process",
      content: `
        <p>Once you click "Upload", your file will be processed:</p>
        <ol>
          <li>File is uploaded to secure storage</li>
          <li>Protection methods are applied</li>
          <li>Metadata is recorded</li>
          <li>Certificate is generated (if blockchain enabled)</li>
        </ol>
        <p><strong>Processing time:</strong></p>
        <ul>
          <li>Images: 5-30 seconds</li>
          <li>Videos: 1-5 minutes</li>
          <li>Large files: Up to 10 minutes</li>
        </ul>
        <p>You'll receive a notification when processing is complete.</p>
      `,
      tips: [
        "Don't close the browser during upload",
        "Check your dashboard for processing status",
        "Download your certificate once processing completes"
      ]
    },
    {
      title: "What Happens Next?",
      content: `
        <p>After upload, your artwork is:</p>
        <ul>
          <li>✅ Stored securely in encrypted storage</li>
          <li>✅ Protected against AI training (if enabled)</li>
          <li>✅ Registered on blockchain (if enabled)</li>
          <li>✅ Monitored for unauthorized use</li>
        </ul>
        <p>You can view your protected artwork in the Dashboard.</p>
        <p><strong>Next steps:</strong></p>
        <ul>
          <li>Download your protection certificate</li>
          <li>Share your artwork safely</li>
          <li>Monitor for copyright violations</li>
          <li>Enable automatic DMCA takedowns</li>
        </ul>
      `,
      tips: [
        "Save your certificate for legal purposes",
        "Enable monitoring to track usage",
        "Upgrade to Professional for automated protection"
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
  title: "Protection Hub Guide",
  description: "Advanced protection settings and monitoring",
  sections: [
    {
      title: "AI Training Protection",
      content: `
        <p>Protect your artwork from being used in AI training datasets.</p>
        <p><strong>How it works:</strong></p>
        <ol>
          <li>Invisible markers are embedded in your file</li>
          <li>AI models cannot use marked files for training</li>
          <li>Violations are automatically detected</li>
          <li>DMCA notices sent to violators</li>
        </ol>
        <p><strong>Protection methods:</strong></p>
        <ul>
          <li>Digital watermarking</li>
          <li>Adversarial perturbations</li>
          <li>Metadata poisoning</li>
        </ul>
      `,
      tips: [
        "Enable for all digital artwork",
        "Combine with blockchain for maximum protection",
        "Regularly check for new violations"
      ]
    },
    {
      title: "Blockchain Registration",
      content: `
        <p>Register your work on the blockchain for immutable proof.</p>
        <p><strong>Benefits:</strong></p>
        <ul>
          <li>Permanent timestamp of creation</li>
          <li>Tamper-proof ownership record</li>
          <li>Legally recognized worldwide</li>
          <li>Transferable ownership rights</li>
        </ul>
        <p><strong>Process:</strong></p>
        <ol>
          <li>File hash is calculated</li>
          <li>Transaction is created</li>
          <li>Recorded on blockchain</li>
          <li>Certificate generated</li>
        </ol>
        <p>Cost: Included in paid plans</p>
      `,
      tips: [
        "Register important works immediately",
        "Keep your certificate safe",
        "Blockchain proof strengthens legal claims"
      ]
    },
    {
      title: "Monitoring & Alerts",
      content: `
        <p>Continuous monitoring across platforms:</p>
        <ul>
          <li>Image search engines</li>
          <li>Social media platforms</li>
          <li>Stock photo sites</li>
          <li>AI training datasets</li>
        </ul>
        <p><strong>Alert types:</strong></p>
        <ul>
          <li>Exact match detected</li>
          <li>Similar content found</li>
          <li>AI training violation</li>
          <li>Unauthorized commercial use</li>
        </ul>
        <p>Configure alert frequency in settings.</p>
      `,
      tips: [
        "Enable real-time alerts for critical work",
        "Review weekly digest for less urgent items",
        "Whitelist legitimate uses to reduce false positives"
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
        <p><strong>Free Plan:</strong></p>
        <ul>
          <li>Basic watermark protection</li>
          <li>Up to 10 artworks</li>
          <li>Manual monitoring</li>
        </ul>
        <p><strong>Starter Plan ($19/month):</strong></p>
        <ul>
          <li>AI training protection</li>
          <li>Blockchain registration</li>
          <li>Up to 100 artworks</li>
          <li>Automated monitoring</li>
        </ul>
        <p><strong>Professional Plan ($49/month):</strong></p>
        <ul>
          <li>Everything in Starter</li>
          <li>Automated DMCA takedowns</li>
          <li>Unlimited artworks</li>
          <li>Priority support</li>
          <li>White-label options</li>
        </ul>
      `,
      tips: [
        "Annual billing saves 20%",
        "Use promo code BETA200 for 30% off",
        "Upgrade anytime without losing data"
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

export const monitoringHubGuide = {
  title: "Monitoring & Detection Hub Guide",
  description: "Comprehensive monitoring across all your digital assets",
  sections: [
    {
      title: "Understanding the Monitoring Hub",
      content: `
        <p>The Monitoring Hub provides 24/7 surveillance of your protected content across multiple platforms and detection methods.</p>
        <p><strong>Five monitoring types:</strong></p>
        <ul>
          <li><strong>Portfolio:</strong> Track your entire collection of protected works</li>
          <li><strong>Profile:</strong> Monitor unauthorized use of your identity</li>
          <li><strong>Trademark:</strong> Detect trademark violations</li>
          <li><strong>Deepfake:</strong> Identify manipulated media using your likeness</li>
          <li><strong>Forgery:</strong> Detect image manipulation and AI-generated copies</li>
        </ul>
      `,
      tips: [
        "Enable all monitoring types for complete protection",
        "Check the hub daily for new detections",
        "Configure alert preferences in Settings"
      ]
    },
    {
      title: "Portfolio Monitoring",
      content: `
        <p>Track all your protected artworks in one centralized dashboard.</p>
        <p><strong>Features:</strong></p>
        <ul>
          <li>View all protected assets at a glance</li>
          <li>Monitor protection status</li>
          <li>Track detection history</li>
          <li>Manage certificates</li>
        </ul>
      `,
      tips: [
        "Organize works by project or category",
        "Review protection status regularly",
        "Update metadata as needed"
      ]
    },
    {
      title: "Taking Action on Detections",
      content: `
        <p>When violations are detected:</p>
        <ol>
          <li>Review detection details and evidence</li>
          <li>Verify unauthorized use</li>
          <li>File DMCA takedown notice</li>
          <li>Track resolution progress</li>
        </ol>
        <p><strong>Automated actions (Pro plans):</strong></p>
        <ul>
          <li>Automatic DMCA filing</li>
          <li>Legal letter generation</li>
          <li>Platform reporting</li>
        </ul>
      `,
      tips: [
        "Act quickly on commercial use violations",
        "Document all evidence thoroughly",
        "Upgrade to Pro for automated enforcement"
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
        <p>The Unified Dashboard brings all your protection metrics together in one place.</p>
        <p><strong>Key sections:</strong></p>
        <ul>
          <li>Quick stats at a glance</li>
          <li>Recent activity feed</li>
          <li>Threat monitoring</li>
          <li>Protection portfolio</li>
          <li>Analytics and insights</li>
        </ul>
      `,
      tips: [
        "Review your dashboard daily",
        "Set up custom alerts for threats",
        "Use filters to focus on specific content"
      ]
    },
    {
      title: "Managing Protections",
      content: `
        <p>Control all your protections from one central location:</p>
        <ul>
          <li>View protection status for all assets</li>
          <li>Update protection settings</li>
          <li>Download certificates</li>
          <li>Monitor scan results</li>
        </ul>
      `,
      tips: [
        "Keep all protections up to date",
        "Review certificate expiration dates",
        "Enable automatic renewals"
      ]
    },
    {
      title: "Analytics & Insights",
      content: `
        <p>Understand your protection performance:</p>
        <ul>
          <li>View trend charts and graphs</li>
          <li>Track detection rates</li>
          <li>Monitor response times</li>
          <li>Export reports</li>
        </ul>
      `,
      tips: [
        "Use analytics to improve protection strategy",
        "Export monthly reports for records",
        "Share insights with your team"
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
          <li>Click "Sign Up" in the top right corner</li>
          <li>Enter your email and create a password</li>
          <li>Verify your email address</li>
          <li>Complete your profile</li>
        </ol>
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
