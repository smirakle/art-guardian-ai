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
          <li>Complete your profile (name, bio, website)</li>
        </ol>
        <p><strong>Step 2: Choose Your Plan</strong></p>
        <ul>
          <li><strong>Free:</strong> 10 protected works, basic monitoring</li>
          <li><strong>Starter ($19/mo):</strong> 100 works, AI protection, blockchain</li>
          <li><strong>Professional ($49/mo):</strong> Unlimited works, automated takedowns</li>
        </ul>
        <p>Start with the free plan and upgrade when needed.</p>
      `,
      tips: [
        "Use a strong password and enable 2FA",
        "Complete your profile for better legal documentation",
        "Free tier is perfect for testing the platform"
      ]
    },
    {
      title: "Uploading & Protecting Your First Artwork",
      content: `
        <p><strong>How to Upload:</strong></p>
        <ol>
          <li>Click "Upload" in the navigation menu</li>
          <li>Drag and drop your file or click to browse</li>
          <li>Add title and description (required for copyright)</li>
          <li>Select category (Art, Photography, Design, etc.)</li>
          <li>Add tags for easier organization</li>
        </ol>
        <p><strong>Applying Protection:</strong></p>
        <ol>
          <li>Check "AI Training Protection" - prevents AI from learning your style</li>
          <li>Check "Blockchain Registration" - creates immutable ownership proof</li>
          <li>Check "Enable Monitoring" - tracks unauthorized use 24/7</li>
          <li>Click "Upload & Protect"</li>
        </ol>
        <p>Processing takes 5-30 seconds. You'll see a success message when complete.</p>
      `,
      tips: [
        "Higher resolution files get better protection",
        "Use descriptive titles for legal purposes",
        "Enable all protections for maximum security"
      ]
    },
    {
      title: "Using the Dashboard",
      content: `
        <p><strong>Daily Dashboard Check:</strong></p>
        <ol>
          <li>Open your Unified Dashboard (main page after login)</li>
          <li>Review "Active Threats" card - red badges need attention</li>
          <li>Check "Protection Status" - ensure all works show green</li>
          <li>Review "Recent Activity" for latest scans</li>
        </ol>
        <p><strong>Understanding Status Indicators:</strong></p>
        <ul>
          <li>🟢 Green: Fully protected, no issues</li>
          <li>🟡 Yellow: Processing or minor issues</li>
          <li>🔴 Red: Violation detected or protection failed</li>
        </ul>
        <p><strong>Quick Actions:</strong></p>
        <ul>
          <li>Click any artwork to view details</li>
          <li>Click threats to see violation evidence</li>
          <li>Use "Take Action" to send takedown notices</li>
        </ul>
      `,
      tips: [
        "Check dashboard daily for new threats",
        "Address red alerts within 24 hours",
        "Download certificates for important works"
      ]
    },
    {
      title: "Setting Up Monitoring",
      content: `
        <p><strong>Activate 24/7 Monitoring:</strong></p>
        <ol>
          <li>Go to "Monitoring Hub" in the main menu</li>
          <li>Click "Enable Portfolio Monitoring"</li>
          <li>Select which artworks to monitor (or select all)</li>
          <li>Set alert preferences (instant, daily digest, weekly)</li>
          <li>Click "Start Monitoring"</li>
        </ol>
        <p><strong>Configure Alert Settings:</strong></p>
        <ol>
          <li>Go to Settings > Notifications</li>
          <li>Choose email or SMS alerts</li>
          <li>Set threshold: High threats only OR All detections</li>
          <li>Enable/disable specific monitoring types</li>
        </ol>
        <p>Monitoring scans the internet every 6 hours for unauthorized use.</p>
      `,
      tips: [
        "Start with 'High threats only' to avoid alert fatigue",
        "Enable SMS alerts for critical violations",
        "Review weekly digests on Mondays"
      ]
    },
    {
      title: "Responding to Violations",
      content: `
        <p><strong>When You Get a Violation Alert:</strong></p>
        <ol>
          <li>Open the alert notification</li>
          <li>Review the detected match and evidence</li>
          <li>Click "View Details" to see full analysis</li>
          <li>Verify it's actually unauthorized (not your own post)</li>
          <li>Click "Take Action"</li>
        </ol>
        <p><strong>Taking Action Options:</strong></p>
        <ul>
          <li><strong>Send DMCA Takedown:</strong> Automated legal notice (Pro plan)</li>
          <li><strong>Generate Takedown Letter:</strong> Download for manual sending</li>
          <li><strong>Mark as False Positive:</strong> Improve future detections</li>
          <li><strong>Monitor Only:</strong> Track without action</li>
        </ul>
        <p><strong>Manual Takedown Process (Free/Starter):</strong></p>
        <ol>
          <li>Click "Generate Takedown Letter"</li>
          <li>Download the PDF with evidence</li>
          <li>Send to the platform's DMCA contact email</li>
          <li>Mark as "Takedown Sent" in TSMO</li>
          <li>Track resolution in your dashboard</li>
        </ol>
      `,
      tips: [
        "Act within 24 hours of detection",
        "Keep copies of all takedown notices",
        "Professional plan handles this automatically"
      ]
    },
    {
      title: "Advanced Features",
      content: `
        <p><strong>Blockchain Certificates:</strong></p>
        <ol>
          <li>Go to your artwork details page</li>
          <li>Click "Download Certificate"</li>
          <li>Save the PDF with blockchain proof</li>
          <li>Use in copyright disputes or legal claims</li>
        </ol>
        <p><strong>Forgery Detection:</strong></p>
        <ol>
          <li>Go to "Forgery Detection" page</li>
          <li>Upload a suspicious image</li>
          <li>Wait 5-10 seconds for AI analysis</li>
          <li>View results: AI-generated probability & manipulation detection</li>
        </ol>
        <p><strong>Batch Operations:</strong></p>
        <ol>
          <li>In Dashboard, select multiple artworks (checkboxes)</li>
          <li>Click "Bulk Actions" at the top</li>
          <li>Choose: Enable monitoring, Download certificates, Update tags</li>
          <li>Confirm action</li>
        </ol>
      `,
      tips: [
        "Store certificates in cloud backup",
        "Use forgery detection before purchasing art",
        "Batch operations save time with large collections"
      ]
    },
    {
      title: "Getting Help",
      content: `
        <p><strong>When You Need Help:</strong></p>
        <ol>
          <li>Click the "?" icon (Help Center) in any page</li>
          <li>Search for your issue or browse guides</li>
          <li>If not found, click "Report Bug" button</li>
          <li>Fill in: What you tried, what happened, what should happen</li>
          <li>Submit - we respond within 24-48 hours</li>
        </ol>
        <p><strong>Common Issues & Solutions:</strong></p>
        <ul>
          <li><strong>Upload failed:</strong> Check file size (max 500MB) and format</li>
          <li><strong>Protection pending:</strong> Large files take up to 10 minutes</li>
          <li><strong>No detections:</strong> Monitoring takes 6-24 hours to start</li>
          <li><strong>False positives:</strong> Mark them to improve accuracy</li>
        </ul>
        <p><strong>Contact Support:</strong></p>
        <ul>
          <li>Email: support@tsmo.app</li>
          <li>Response time: 24-72 hours (free), 4-24 hours (paid)</li>
          <li>Include: Your username, affected artwork, screenshots</li>
        </ul>
      `,
      tips: [
        "Check Help Center first for instant answers",
        "Use bug reports for technical issues",
        "Include screenshots when contacting support"
      ]
    }
  ]
};
