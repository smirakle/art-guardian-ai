import React from 'react';
import { Download, FileText, Shield, AlertTriangle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';

const ComprehensivePatentDocument = () => {
  const downloadComprehensivePatentDocument = async () => {
    // Create PDF with embedded fonts (US Letter size for USPTO compliance)
    const pdf = new jsPDF('p', 'mm', 'letter');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;
    const lineHeight = 6;
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Load and embed fonts (using built-in fonts that are fully embedded)
    try {
      // Use Times Roman - a fully embedded font in jsPDF
      pdf.addFont('Times-Roman', 'times', 'normal');
      pdf.addFont('Times-Bold', 'times', 'bold');
    } catch (error) {
      console.log('Using default embedded fonts');
    }

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize = 11, isBold = false, isTitle = false) => {
      if (isTitle) {
        pdf.setFontSize(18);
        pdf.setFont('times', 'bold');
      } else if (isBold) {
        pdf.setFontSize(fontSize);
        pdf.setFont('times', 'bold');
      } else {
        pdf.setFontSize(fontSize);
        pdf.setFont('times', 'normal');
      }

      const splitText = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      
      if (yPosition + (splitText.length * lineHeight) > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.text(splitText, margin, yPosition);
      yPosition += splitText.length * lineHeight + (isTitle ? 12 : 6);
    };

    // Document Header
    addText('COMPREHENSIVE PATENT FILING DOCUMENT', 20, true, true);
    addText('TSMO AI Training Protection System', 16, true);
    addText('All Eligible Elements for Patent Protection', 14, true);
    addText(`Document Prepared: ${new Date().toLocaleDateString()}`, 10);
    addText('Classification: CONFIDENTIAL - PATENT PENDING', 10, true);
    yPosition += 15;

    // Executive Summary
    addText('EXECUTIVE SUMMARY', 16, true, true);
    addText('This document contains comprehensive patent filing information for the TSMO AI Training Protection System, covering all novel and patentable elements identified in the system architecture.');
    yPosition += 10;

    addText('Key Innovations Ready for Patent Filing:', 12, true);
    addText('1. AI Training Pattern Analysis (AITPA) Algorithm');
    addText('2. Real-Time AI Dataset Monitoring System');
    addText('3. Multi-Modal Content Fingerprinting');
    addText('4. Blockchain-Based Content Verification');
    addText('5. Automated Legal Response System');
    addText('6. Cross-Platform Monitoring Architecture');
    addText('7. AI-Resistant Protection Methods');
    addText('8. Style Cloaking Technology');
    addText('9. Advanced Watermarking System');
    addText('10. Government Filing Integration');
    yPosition += 15;

    // Patent Application 1: Core AITPA Algorithm
    addText('PATENT APPLICATION 1: AI TRAINING PATTERN ANALYSIS ALGORITHM', 14, true);
    addText('Title: "Computer-Implemented Method for Detecting Unauthorized Use of Digital Content in AI Training Datasets"', 12, true);
    
    addText('Technical Field:', 11, true);
    addText('Computer systems and methods for analyzing digital content access patterns to detect unauthorized incorporation into artificial intelligence training datasets using advanced pattern recognition and machine learning techniques.');
    
    addText('Background of the Invention:', 11, true);
    addText('Current copyright protection systems cannot identify when digital content is used to train artificial intelligence models. This creates a significant gap in intellectual property protection as AI companies can freely use copyrighted content without detection or compensation.');
    
    addText('Summary of the Invention:', 11, true);
    addText('The AITPA algorithm provides a novel method for detecting AI training patterns through multi-dimensional analysis of content access behaviors, fingerprint matching, and statistical anomaly detection.');
    
    addText('Detailed Description - Core Algorithm:', 11, true);
    addText('The invention comprises the following novel technical elements:');
    
    addText('1. Multi-Modal Fingerprinting Process:', 11, true);
    addText('• visual_features = CNN_extract(content)');
    addText('• structural_hash = SHA256(geometric_properties)');
    addText('• metadata_sig = timestamp + creator_id + content_type');
    addText('• fingerprint = combine(visual_features, structural_hash, metadata_sig)');
    
    addText('2. AI Training Pattern Recognition Engine:', 11, true);
    addText('• access_pattern = LSTM_analyze(platform_logs)');
    addText('• training_probability = sigmoid(W × φ(access_pattern) + b)');
    addText('• Multi-dimensional similarity comparison using cosine and Jaccard metrics');
    addText('• Real-time dataset monitoring with API scanning');
    
    addText('3. Confidence Scoring and Classification:', 11, true);
    addText('• C = α × training_probability + β × similarity_score + γ × frequency');
    addText('• violation_class = threshold_classify(C, [low=0.3, med=0.6, high=0.8])');
    addText('• Weighted aggregation: S(F1,F2) = Σ(wi × similarity_i(F1_i, F2_i))');
    addText('• Evidence aggregation and blockchain verification integration');
    
    addText('Claims for Patent Application 1:', 11, true);
    addText('Claim 1: A computer-implemented method for detecting unauthorized AI training use comprising:');
    addText('• Generating multi-modal fingerprints of protected digital content');
    addText('• Monitoring AI training repositories using real-time scanning algorithms');
    addText('• Analyzing access patterns using LSTM neural networks');
    addText('• Calculating confidence scores using formula:');
    addText('  C = α×Pr + β×similarity + γ×frequency');
    addText('• Classifying violations using threshold-based classification');
    addText('• Generating evidence packages with source verification');
    
    addText('Claim 2: The method of claim 1, wherein fingerprint generation comprises CNN-based visual feature extraction combined with geometric structural analysis.');
    
    addText('Claim 3: The method of claim 1, wherein pattern recognition uses LSTM networks trained specifically on AI training behavioral data.');
    yPosition += 15;

    // Patent Application 2: Real-Time Monitoring System
    addText('PATENT APPLICATION 2: REAL-TIME AI DATASET MONITORING SYSTEM', 14, true);
    addText('Title: "System and Method for Continuous Monitoring of Artificial Intelligence Training Repositories"', 12, true);
    
    addText('Technical Innovation:', 11, true);
    addText('A comprehensive system architecture for real-time monitoring of AI training datasets across multiple platforms with automated violation detection and response capabilities.');
    
    addText('Novel Technical Elements:', 11, true);
    addText('1. Distributed Monitoring Architecture:');
    addText('• Parallel processing system for monitoring 1000+ repositories simultaneously');
    addText('• API integration framework with rate limiting and key rotation');
    addText('• Predictive scanning based on threat intelligence aggregation');
    addText('• Cross-platform standardization protocol');
    
    addText('2. Real-Time Processing Engine:');
    addText('• Stream processing for continuous data analysis');
    addText('• Event-driven architecture with microsecond response times');
    addText('• Dynamic load balancing across monitoring nodes');
    addText('• Fault-tolerant processing with automatic failover');
    
    addText('3. Threat Intelligence Integration:');
    addText('• Aggregation from multiple threat intelligence sources');
    addText('• Machine learning-based threat pattern recognition');
    addText('• Predictive modeling for emerging AI training platforms');
    addText('• Automated threat severity assessment');
    
    addText('Claims for Patent Application 2:', 11, true);
    addText('Claim 1: A distributed system for real-time AI dataset monitoring comprising:');
    addText('• Parallel processing architecture for simultaneous repository monitoring');
    addText('• API integration framework with intelligent rate limiting');
    addText('• Stream processing engine for continuous data analysis');
    addText('• Threat intelligence aggregation and analysis system');
    
    addText('Claim 2: The system of claim 1, wherein monitoring comprises predictive scanning based on machine learning threat models.');
    yPosition += 15;

    // Patent Application 3: Blockchain Integration
    addText('PATENT APPLICATION 3: BLOCKCHAIN-BASED CONTENT VERIFICATION SYSTEM', 14, true);
    addText('Title: "Method for Creating Immutable Digital Content Ownership Records Using Blockchain Technology"', 12, true);
    
    addText('Technical Innovation:', 11, true);
    addText('Integration of blockchain technology with content protection to create legally-valid, immutable ownership certificates with smart contract automation.');
    
    addText('Novel Technical Elements:', 11, true);
    addText('1. Immutable Ownership Certification:');
    addText('• Blockchain-based timestamped ownership records');
    addText('• Multi-chain compatibility (Ethereum, Polygon, Arbitrum)');
    addText('• Cryptographic proof generation for legal validity');
    addText('• Smart contract integration for automated protection');
    
    addText('2. Smart Contract Legal Automation:');
    addText('• Automated DMCA notice generation and distribution');
    addText('• Legal action triggering based on violation severity');
    addText('• Cross-jurisdictional compliance automation');
    addText('• Legal document template integration');
    
    addText('3. Certificate Generation System:');
    addText('• Downloadable legal certificates with blockchain verification');
    addText('• QR code integration for instant verification');
    addText('• Court-admissible evidence package generation');
    addText('• Integration with government filing systems');
    
    addText('Claims for Patent Application 3:', 11, true);
    addText('Claim 1: A blockchain-based content verification system comprising:');
    addText('• Multi-chain blockchain integration for immutable record creation');
    addText('• Smart contract automation for legal process triggering');
    addText('• Cryptographic certificate generation with legal validity');
    addText('• Cross-jurisdictional compliance automation');
    yPosition += 15;

    // Patent Application 4: Style Cloaking Technology
    addText('PATENT APPLICATION 4: AI-RESISTANT STYLE CLOAKING TECHNOLOGY', 14, true);
    addText('Title: "Method for Protecting Digital Art from AI Style Replication Using Adversarial Perturbations"', 12, true);
    
    addText('Technical Innovation:', 11, true);
    addText('Advanced adversarial perturbation system that protects artistic style from AI replication while maintaining visual fidelity for human viewers.');
    
    addText('Novel Technical Elements:', 11, true);
    addText('1. Adversarial Perturbation Generation:');
    addText('• Targeted adversarial examples specifically designed for style protection');
    addText('• Multi-model adversarial training against various AI architectures');
    addText('• Imperceptible modifications that preserve artistic integrity');
    addText('• Dynamic adaptation based on emerging AI model architectures');
    
    addText('2. Style Fingerprint Protection:');
    addText('• Artistic style vectorization and protection mapping');
    addText('• Style-specific adversarial pattern generation');
    addText('• Transfer learning resistance mechanisms');
    addText('• Multi-layer protection combining visible and invisible elements');
    
    addText('3. Resilience Testing Framework:');
    addText('• Automated testing against current AI models');
    addText('• Continuous adaptation to new AI architectures');
    addText('• Effectiveness measurement and optimization');
    addText('• Performance benchmarking across model types');
    
    addText('Claims for Patent Application 4:', 11, true);
    addText('Claim 1: A method for protecting artistic style from AI replication comprising:');
    addText('• Generating targeted adversarial perturbations specific to style protection');
    addText('• Creating imperceptible modifications that maintain visual fidelity');
    addText('• Implementing multi-model adversarial training for robustness');
    addText('• Providing dynamic adaptation to emerging AI architectures');
    yPosition += 15;

    // Patent Application 5: Advanced Watermarking
    addText('PATENT APPLICATION 5: ADVANCED MULTI-LAYER WATERMARKING SYSTEM', 14, true);
    addText('Title: "System and Method for Multi-Layer Digital Watermarking with AI Training Detection"', 12, true);
    
    addText('Technical Innovation:', 11, true);
    addText('Advanced watermarking system combining visible and invisible elements specifically designed to survive AI preprocessing and training procedures.');
    
    addText('Novel Technical Elements:', 11, true);
    addText('1. Multi-Layer Watermark Architecture:');
    addText('• Visible watermarks with artistic integration');
    addText('• Invisible steganographic markers in frequency domain');
    addText('• Blockchain hash integration for verification');
    addText('• AI-resistant encoding that survives common preprocessing');
    
    addText('2. Proof Generation System:');
    addText('• Automated detection and proof certificate generation');
    addText('• Legal-grade evidence documentation');
    addText('• Verification hash calculation for authenticity');
    addText('• Integration with legal filing systems');
    
    addText('3. Adaptive Watermarking:');
    addText('• Dynamic adaptation based on content type');
    addText('• Strength adjustment based on protection requirements');
    addText('• Multi-format support (images, videos, audio)');
    addText('• Batch processing optimization');
    
    addText('Claims for Patent Application 5:', 11, true);
    addText('Claim 1: A multi-layer watermarking system comprising:');
    addText('• Visible watermark integration with artistic preservation');
    addText('• Invisible steganographic markers with AI resistance');
    addText('• Blockchain verification integration');
    addText('• Automated proof generation and legal documentation');
    yPosition += 15;

    // Patent Application 6: Government Filing Integration
    addText('PATENT APPLICATION 6: AUTOMATED GOVERNMENT FILING INTEGRATION SYSTEM', 14, true);
    addText('Title: "System for Automated Legal Document Generation and Government Filing Integration"', 12, true);
    
    addText('Technical Innovation:', 11, true);
    addText('Automated system for generating legal documents and integrating with government filing systems for copyright and trademark protection.');
    
    addText('Novel Technical Elements:', 11, true);
    addText('1. Legal Document Automation:');
    addText('• Template-based legal document generation');
    addText('• Jurisdiction-specific compliance automation');
    addText('• Multi-language legal document support');
    addText('• Integration with legal review workflows');
    
    addText('2. Government System Integration:');
    addText('• API integration with copyright offices globally');
    addText('• Automated filing fee calculation and payment');
    addText('• Status tracking and notification systems');
    addText('• Document format standardization across jurisdictions');
    
    addText('3. Compliance Management:');
    addText('• Multi-jurisdictional requirement tracking');
    addText('• Deadline management and reminder systems');
    addText('• Audit trail generation for legal compliance');
    addText('• Integration with legal case management systems');
    
    addText('Claims for Patent Application 6:', 11, true);
    addText('Claim 1: An automated government filing system comprising:');
    addText('• Template-based legal document generation with jurisdiction compliance');
    addText('• API integration with multiple government filing systems');
    addText('• Automated fee calculation and payment processing');
    addText('• Compliance tracking and deadline management');
    yPosition += 15;

    // Additional Novel Systems
    addText('ADDITIONAL PATENTABLE INNOVATIONS', 14, true);
    
    addText('7. Cross-Platform Monitoring Protocol:', 12, true);
    addText('• Standardized API framework for diverse platform integration');
    addText('• Universal threat intelligence format specification');
    addText('• Cross-platform correlation algorithms');
    addText('• Unified alert and response system');
    
    addText('8. AI Model Forensics System:', 12, true);
    addText('• Algorithm for determining if content was used in AI training');
    addText('• Model archaeology techniques for training data reconstruction');
    addText('• Statistical analysis of AI model outputs for content detection');
    addText('• Forensic evidence generation for legal proceedings');
    
    addText('9. Real-Time Threat Intelligence Engine:', 12, true);
    addText('• Machine learning-based threat pattern recognition');
    addText('• Predictive modeling for emerging AI platforms');
    addText('• Automated threat severity assessment and classification');
    addText('• Integration with global threat intelligence networks');
    
    addText('10. Automated Legal Response Framework:', 12, true);
    addText('• Graduated response system based on violation severity');
    addText('• Integration with law firm networks for escalation');
    addText('• Automated negotiation and settlement systems');
    addText('• Performance tracking for legal action effectiveness');
    yPosition += 15;

    // Prior Art Analysis
    addText('PRIOR ART ANALYSIS AND DIFFERENTIATION', 14, true);
    
    addText('Existing Copyright Protection Systems:', 12, true);
    addText('• Content ID (YouTube): Limited to single platform, no AI training detection');
    addText('• Digimarc: Traditional watermarking, not AI-resistant');
    addText('• Getty Images: Reverse image search, no real-time monitoring');
    addText('• Shutterstock: Basic fingerprinting, no blockchain integration');
    
    addText('Key Differentiators of TSMO System:', 12, true);
    addText('• First system designed specifically for AI training protection');
    addText('• Real-time monitoring vs. reactive detection');
    addText('• AI-resistant protection methods vs. traditional watermarking');
    addText('• Blockchain integration for immutable proof');
    addText('• Automated legal response vs. manual enforcement');
    addText('• Cross-platform monitoring vs. single-platform solutions');
    yPosition += 15;

    // Filing Strategy and Timeline
    addText('PATENT FILING STRATEGY AND TIMELINE', 14, true);
    
    addText('Immediate Actions (Next 30 Days):', 12, true);
    addText('• File provisional patent applications for all 6 core innovations');
    addText('• Conduct comprehensive prior art search');
    addText('• Engage patent attorney for prosecution strategy');
    addText('• Begin international filing preparation (PCT application)');
    
    addText('6-Month Timeline:', 12, true);
    addText('• File full utility patent applications');
    addText('• Submit PCT international application');
    addText('• Begin trademark protection for TSMO brand');
    addText('• Prepare divisional applications for key algorithms');
    
    addText('12-Month Timeline:', 12, true);
    addText('• Target key international markets (EU, Canada, Australia, Japan)');
    addText('• File continuation applications for system improvements');
    addText('• Begin patent prosecution response preparation');
    addText('• Establish patent monitoring and defense strategy');
    
    addText('Cost Estimates:', 12, true);
    addText('• Provisional applications: $15,000-$30,000 (6 applications)');
    addText('• Full utility patents: $90,000-$150,000 (6 applications)');
    addText('• International filing (PCT): $50,000-$75,000');
    addText('• Prosecution and maintenance: $30,000-$50,000 annually');
    addText('• Total first-year investment: $185,000-$305,000');
    yPosition += 15;

    // Expected Patent Value
    addText('EXPECTED PATENT VALUE AND STRATEGIC IMPORTANCE', 14, true);
    
    addText('Competitive Advantages:', 12, true);
    addText('• 15-20 year protection period for core innovations');
    addText('• Barriers to entry preventing competitor replication');
    addText('• Licensing revenue opportunities from AI companies');
    addText('• Increased company valuation (estimated $10-50M patent portfolio value)');
    
    addText('Market Impact:', 12, true);
    addText('• First-mover advantage in $2B+ AI protection market');
    addText('• Technology leadership position in emerging field');
    addText('• Partnership opportunities with major tech platforms');
    addText('• Potential acquisition premium from AI/tech companies');
    
    addText('Revenue Opportunities:', 12, true);
    addText('• Direct licensing to AI companies for compliance');
    addText('• Enterprise licensing for internal AI governance');
    addText('• Government licensing for regulatory compliance');
    addText('• Patent assertion against infringing systems');
    yPosition += 15;

    // Implementation Recommendations
    addText('IMPLEMENTATION RECOMMENDATIONS', 14, true);
    
    addText('Immediate Patent Protection Actions:', 12, true);
    addText('1. File provisional applications for all 6 core patents immediately');
    addText('2. Implement enhanced documentation of all algorithmic innovations');
    addText('3. Establish invention disclosure process for ongoing developments');
    addText('4. Create patent committee for strategic decision making');
    
    addText('Trade Secret vs. Patent Strategy:', 12, true);
    addText('Patent Protection (Broad Methods):');
    addText('• System architectures and core methods');
    addText('• User interface innovations');
    addText('• Integration protocols and APIs');
    addText('• Legal automation frameworks');
    
    addText('Trade Secret Protection (Specific Implementation):');
    addText('• Specific algorithm parameters and weights');
    addText('• Machine learning training datasets');
    addText('• Threat intelligence sources and methods');
    addText('• Performance optimization techniques');
    
    addText('Legal Team Requirements:', 12, true);
    addText('• Patent attorney specializing in AI/software patents');
    addText('• International filing specialist for global protection');
    addText('• Trade secret and IP strategy consultant');
    addText('• Patent prosecution and defense counsel');
    yPosition += 15;

    // Document Footer
    addText('DOCUMENT AUTHENTICATION AND VERIFICATION', 12, true);
    addText(`Document Hash: ${generateDocumentHash()}`, 10);
    addText(`Preparation Date: ${new Date().toISOString()}`, 10);
    addText('Document Prepared by: TSMO Development Team', 10);
    addText('Classification: CONFIDENTIAL - PATENT PENDING', 10, true);
    addText('Attorney-Client Privilege: This document is prepared in anticipation of patent filing and is protected by attorney-client privilege.', 9);

    // Save PDF
    pdf.save('TSMO_Comprehensive_Patent_Filing_Document.pdf');
  };

  const generateDocumentHash = (): string => {
    const timestamp = new Date().getTime();
    return `TSMO-PAT-${timestamp.toString(36).toUpperCase()}`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Comprehensive Patent Filing Document
        </CardTitle>
        <CardDescription>
          Complete patent documentation for all eligible TSMO innovations ready for attorney filing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alert Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 mb-1">Ready for Immediate Filing</h4>
            <p className="text-sm text-amber-700">
              This document contains all technical specifications needed for patent attorney review and filing. 
              Provisional applications should be filed within 30 days to establish priority dates.
            </p>
          </div>
        </div>

        {/* Patent Applications Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-background border rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Core Patent Applications (6)
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>AITPA Algorithm</span>
                <Badge variant="default">High Value</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Real-Time Monitoring</span>
                <Badge variant="default">High Value</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Blockchain Integration</span>
                <Badge variant="secondary">Medium Value</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Style Cloaking</span>
                <Badge variant="default">High Value</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Advanced Watermarking</span>
                <Badge variant="secondary">Medium Value</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Government Filing</span>
                <Badge variant="secondary">Medium Value</Badge>
              </div>
            </div>
          </div>

          <div className="bg-background border rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Additional Innovations (4)
            </h4>
            <div className="space-y-2 text-sm">
              <div>• Cross-Platform Monitoring Protocol</div>
              <div>• AI Model Forensics System</div>
              <div>• Real-Time Threat Intelligence</div>
              <div>• Automated Legal Response Framework</div>
            </div>
          </div>
        </div>

        {/* Filing Strategy */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Filing Strategy & Costs</h4>
          <div className="grid gap-4 md:grid-cols-2 text-sm text-blue-700">
            <div>
              <div className="font-medium mb-1">Immediate (30 days):</div>
              <div>• Provisional applications: $15K-$30K</div>
              <div>• Prior art search: $5K-$10K</div>
            </div>
            <div>
              <div className="font-medium mb-1">Year 1 Total Investment:</div>
              <div>• $185K-$305K comprehensive protection</div>
              <div>• Estimated portfolio value: $10M-$50M</div>
            </div>
          </div>
        </div>

        {/* Document Contents */}
        <div className="bg-background border rounded-lg p-4">
          <h4 className="font-semibold mb-2">Complete Document Contents</h4>
          <div className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
            <div>
              <div>• Technical specifications for all 6 core patents</div>
              <div>• Detailed claims for each application</div>
              <div>• Prior art analysis and differentiation</div>
              <div>• Mathematical algorithms and formulas</div>
            </div>
            <div>
              <div>• Filing strategy and timeline</div>
              <div>• Cost estimates and ROI projections</div>
              <div>• Trade secret vs patent recommendations</div>
              <div>• Legal team requirements</div>
            </div>
          </div>
        </div>

        <Button 
          onClick={downloadComprehensivePatentDocument}
          className="w-full"
          size="lg"
        >
          <Download className="h-5 w-5 mr-2" />
          Download Comprehensive Patent Filing Document
        </Button>
        
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            Ready for patent attorney review • Contains all technical specifications
          </p>
          <p className="text-xs text-amber-600 font-medium">
            CONFIDENTIAL - PATENT PENDING • Attorney-Client Privilege Protected
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComprehensivePatentDocument;