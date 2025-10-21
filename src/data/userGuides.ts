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
        <p>Your dashboard shows all your protected artwork at a glance.</p>
        <p><strong>Key metrics displayed:</strong></p>
        <ul>
          <li>Total protected artworks</li>
          <li>Active monitoring scans</li>
          <li>Detected threats</li>
          <li>Protection score</li>
        </ul>
        <p>Click any metric to see detailed information.</p>
      `,
      tips: [
        "Check your dashboard daily for threat alerts",
        "Higher protection scores mean better security",
        "Green indicators mean everything is secure"
      ]
    },
    {
      title: "Managing Your Artwork",
      content: `
        <p>Each artwork card shows:</p>
        <ul>
          <li>Thumbnail preview</li>
          <li>Title and upload date</li>
          <li>Protection status</li>
          <li>Quick actions menu</li>
        </ul>
        <p><strong>Available actions:</strong></p>
        <ul>
          <li>View protection details</li>
          <li>Download certificate</li>
          <li>Update protection settings</li>
          <li>Delete artwork</li>
        </ul>
      `,
      tips: [
        "Click artwork to see full details",
        "Use filters to organize your collection",
        "Sort by newest, oldest, or threat level"
      ]
    },
    {
      title: "Threat Detection",
      content: `
        <p>When unauthorized use is detected:</p>
        <ul>
          <li>🔴 High threat: Exact or near-exact copies</li>
          <li>🟡 Medium threat: Similar content</li>
          <li>🟢 Low threat: Possible false positive</li>
        </ul>
        <p><strong>What to do:</strong></p>
        <ol>
          <li>Review the detected match</li>
          <li>Verify if it's unauthorized</li>
          <li>File DMCA takedown (automated with Pro plan)</li>
          <li>Track resolution status</li>
        </ol>
      `,
      tips: [
        "Act quickly on high-threat detections",
        "Keep records of all takedown notices",
        "Professional plan includes automated responses"
      ]
    },
    {
      title: "Certificates & Proof",
      content: `
        <p>Your protection certificate includes:</p>
        <ul>
          <li>Blockchain transaction hash</li>
          <li>Timestamp of registration</li>
          <li>File fingerprint/hash</li>
          <li>Your ownership details</li>
        </ul>
        <p>This serves as legal proof of:</p>
        <ul>
          <li>Ownership at specific date/time</li>
          <li>Original file authenticity</li>
          <li>Protection measures applied</li>
        </ul>
      `,
      tips: [
        "Download and save certificates offline",
        "Include certificates in copyright claims",
        "Certificates are legally admissible evidence"
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
  description: "Complete guide to protecting your digital artwork and intellectual property",
  sections: [
    {
      title: "Getting Started",
      content: `
        <p>TSMO (Trademark and Social Media Oversight) is your comprehensive protection platform for digital content.</p>
        <p><strong>What you can protect:</strong></p>
        <ul>
          <li>Digital artwork and illustrations</li>
          <li>Photography and visual content</li>
          <li>Videos and multimedia</li>
          <li>Brand identity and trademarks</li>
          <li>Personal likeness and identity</li>
        </ul>
        <p><strong>How it works:</strong></p>
        <ol>
          <li>Upload your content</li>
          <li>Choose protection methods</li>
          <li>Monitor for unauthorized use</li>
          <li>Take action against violations</li>
        </ol>
      `,
      tips: [
        "Start by uploading your most valuable content first",
        "Enable all protection methods for maximum security",
        "Set up monitoring alerts to stay informed"
      ]
    },
    {
      title: "Protection Features",
      content: `
        <p><strong>AI Training Protection:</strong></p>
        <p>Prevent AI models from using your work in their training datasets with invisible markers.</p>
        
        <p><strong>Blockchain Registration:</strong></p>
        <p>Create immutable proof of ownership with timestamped blockchain records.</p>
        
        <p><strong>Deepfake Detection:</strong></p>
        <p>Monitor for manipulated media using your likeness across the internet.</p>
        
        <p><strong>Trademark Monitoring:</strong></p>
        <p>Detect unauthorized use of your brand and trademarks in real-time.</p>
        
        <p><strong>Forgery Detection:</strong></p>
        <p>Identify image manipulation and AI-generated copies of your work.</p>
      `,
      tips: [
        "Combine multiple protection methods for best results",
        "Blockchain certificates are legally admissible evidence",
        "Enable real-time alerts for critical content"
      ]
    },
    {
      title: "Monitoring & Detection",
      content: `
        <p>24/7 automated monitoring across:</p>
        <ul>
          <li>Social media platforms</li>
          <li>Image search engines</li>
          <li>Stock photo websites</li>
          <li>AI training datasets</li>
          <li>E-commerce marketplaces</li>
        </ul>
        <p><strong>Alert types:</strong></p>
        <ul>
          <li>🔴 High priority: Exact matches and commercial use</li>
          <li>🟡 Medium priority: Similar content and potential violations</li>
          <li>🟢 Low priority: Possible matches requiring review</li>
        </ul>
        <p>Visit the Monitoring page to view all detections and take action.</p>
      `,
      tips: [
        "Review alerts daily to catch violations early",
        "Use automated DMCA takedowns with Pro plan",
        "Whitelist legitimate uses to reduce false positives"
      ]
    },
    {
      title: "Taking Action",
      content: `
        <p><strong>When violations are detected:</strong></p>
        <ol>
          <li>Review the detection details</li>
          <li>Verify it's unauthorized use</li>
          <li>File DMCA takedown notice</li>
          <li>Track resolution status</li>
        </ol>
        <p><strong>Legal support:</strong></p>
        <ul>
          <li>Download protection certificates</li>
          <li>Access copyright claim templates</li>
          <li>Connect with IP lawyers (Premium)</li>
          <li>Get expert legal consultation</li>
        </ul>
        <p>Professional plans include automated DMCA filing for faster resolution.</p>
      `,
      tips: [
        "Act quickly on high-priority violations",
        "Keep all certificates and evidence organized",
        "Document everything for potential legal action"
      ]
    },
    {
      title: "Community & Resources",
      content: `
        <p><strong>Join the TSMO Community:</strong></p>
        <ul>
          <li>Connect with other creators</li>
          <li>Share protection strategies</li>
          <li>Learn about licensing opportunities</li>
          <li>Stay updated on copyright law</li>
        </ul>
        <p><strong>Additional resources:</strong></p>
        <ul>
          <li>Educational guides and tutorials</li>
          <li>Legal resources and templates</li>
          <li>Industry news and updates</li>
          <li>Creator marketplace for licensing</li>
        </ul>
        <p>Visit the Community page to explore all available resources.</p>
      `,
      tips: [
        "Learn from other creators' experiences",
        "Stay informed about new threats",
        "Explore licensing opportunities to monetize your work"
      ]
    }
  ]
};
