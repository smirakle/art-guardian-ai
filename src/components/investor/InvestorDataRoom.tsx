import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Shield, 
  BarChart3, 
  Users, 
  Briefcase,
  ExternalLink,
  Lock,
  CheckCircle
} from 'lucide-react';

const InvestorDataRoom = () => {
  const [accessGranted, setAccessGranted] = useState(false);

  const documents = {
    financial: [
      { name: 'Financial Model & Projections (3-Year)', type: 'PDF', size: '2.4 MB', status: 'ready' },
      { name: 'Unit Economics Analysis', type: 'PDF', size: '1.8 MB', status: 'ready' },
      { name: 'Revenue Model Deep Dive', type: 'PDF', size: '3.2 MB', status: 'ready' },
      { name: 'CAC/LTV Analysis by Channel', type: 'PDF', size: '1.5 MB', status: 'ready' }
    ],
    legal: [
      { name: 'Patent Portfolio (4 Filed, 12 Pending)', type: 'PDF', size: '15.7 MB', status: 'ready' },
      { name: 'Trademark Registrations', type: 'PDF', size: '5.3 MB', status: 'ready' },
      { name: 'Corporate Structure & Cap Table', type: 'PDF', size: '2.1 MB', status: 'ready' },
      { name: 'Terms of Service & Privacy Policy', type: 'PDF', size: '1.9 MB', status: 'ready' }
    ],
    technical: [
      { name: 'Technical Architecture Overview', type: 'PDF', size: '8.4 MB', status: 'ready' },
      { name: 'AI Training Protection Algorithm - Complete Implementation', type: 'PDF', size: '18.2 MB', status: 'ready' },
      { name: 'AI Training Protection Algorithm (Confidential)', type: 'PDF', size: '12.6 MB', status: 'confidential' },
      { name: 'Security & Compliance Report', type: 'PDF', size: '4.7 MB', status: 'ready' },
      { name: 'Scalability Analysis', type: 'PDF', size: '3.8 MB', status: 'ready' }
    ],
    market: [
      { name: 'Market Research & Sizing', type: 'PDF', size: '6.2 MB', status: 'ready' },
      { name: 'Competitive Analysis Matrix', type: 'PDF', size: '2.9 MB', status: 'ready' },
      { name: 'Customer Research & Testimonials', type: 'PDF', size: '4.1 MB', status: 'ready' },
      { name: 'Go-to-Market Strategy', type: 'PDF', size: '5.5 MB', status: 'ready' }
    ]
  };

  const metrics = {
    mrr: '$200',
    users: '50+',
    artworks: '500+',
    dmcaFiled: '25+',
    churn: '2.5%',
    nps: '72'
  };

  const handleDocumentDownload = (docName: string) => {
    // Special handling for AI Protection Algorithm document
    if (docName === 'AI Training Protection Algorithm - Complete Implementation') {
      generateAIProtectionAlgorithmPDF();
      return;
    }
    
    const pdf = new jsPDF();
    
    // Add header
    pdf.setFontSize(16);
    pdf.text(`TSMO - ${docName}`, 20, 30);
    
    pdf.setFontSize(12);
    pdf.text('Comprehensive investment documentation for TSMO\'s investor data room.', 20, 50);
    
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 70);
    pdf.text('Confidential & Proprietary Information', 20, 80);
    
    // Add content based on document type
    pdf.setFontSize(12);
    pdf.text('Document Contents:', 20, 100);
    pdf.setFontSize(10);
    pdf.text('This document contains detailed information about TSMO\'s business model,', 20, 120);
    pdf.text('financial projections, technical architecture, and market opportunity.', 20, 130);
    pdf.text('For full access to this document, please contact our investor relations team.', 20, 140);
    
    // Footer
    pdf.text('For more information, contact:', 20, 200);
    pdf.text('shirleena.cunningham@tsmowatch.com', 20, 210);
    pdf.text('© 2025 TSMO. All rights reserved.', 20, 240);
    
    pdf.save(`TSMO-${docName.replace(/\s+/g, '-')}.pdf`);
  };

  const generateAIProtectionAlgorithmPDF = () => {
    const pdf = new jsPDF();
    let yPosition = 30;
    const lineHeight = 8;
    const pageHeight = 280;
    
    // Helper function to add new page if needed
    const checkAndAddPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight) {
        pdf.addPage();
        yPosition = 30;
      }
    };
    
    // Header
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text('TSMO AI Training Protection Algorithm', 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFontSize(14);
    pdf.text('Complete Implementation & Algorithm Details', 20, yPosition);
    yPosition += lineHeight + 10;
    
    // Document info
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text('Confidential & Proprietary Information - TSMO', 20, yPosition);
    yPosition += lineHeight + 15;
    
    // Algorithm Overview
    checkAndAddPage(80);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text('1. CORE FINGERPRINTING ALGORITHM', 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text('function generateContentFingerprint(content, contentType) {', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // Phase 1: Feature Extraction', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  features = extractMultiModalFeatures(content, contentType)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // Phase 2: Perceptual Hashing', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  phash = computePerceptualHash(features)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // Phase 3: Cryptographic Signature', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  signature = SHA256(phash + timestamp + userID + salt)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // Phase 4: Blockchain Registration', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  blockchainHash = registerOnBlockchain(signature, metadata)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  return {', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('    fingerprint: signature,', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('    perceptualHash: phash,', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('    blockchainProof: blockchainHash,', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('    timestamp: getCurrentTimestamp()', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('  }', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('}', 20, yPosition);
    yPosition += lineHeight + 15;
    
    // Multi-Modal Feature Extraction
    checkAndAddPage(100);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text('2. MULTI-MODAL FEATURE EXTRACTION', 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text('2.1 Visual Content Algorithm', 20, yPosition);
    yPosition += lineHeight + 3;
    
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text('function extractVisualFeatures(image) {', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // DCT-based feature extraction', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  dctCoefficients = computeDCT(image, blockSize: 8x8)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  lowFreqCoeffs = dctCoefficients[0:3, 0:3] // Top-left 3x3', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // SIFT keypoint extraction', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  keypoints = SIFT.detectAndCompute(image)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  descriptors = keypoints.descriptors[0:128] // Top 128', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // Color histogram', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  colorHist = computeColorHistogram(image, bins: 256)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  reducedHist = reduceHistogram(colorHist, targetBins: 32)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // Combine features', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  return concatenate([lowFreqCoeffs, descriptors, reducedHist])', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('}', 20, yPosition);
    yPosition += lineHeight + 10;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text('2.2 Text Content Algorithm', 20, yPosition);
    yPosition += lineHeight + 3;
    
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text('function extractTextFeatures(text) {', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // Semantic embeddings using BERT-like model', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  tokens = tokenize(text)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  embeddings = getBERTEmbeddings(tokens)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  sentenceEmbedding = meanPooling(embeddings)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // N-gram analysis', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ngrams = extractNGrams(text, n: [2,3,4])', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ngramFreq = computeFrequency(ngrams)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // Stylometric features', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  avgSentenceLength = calculateAvgSentenceLength(text)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  lexicalDiversity = calculateLexicalDiversity(text)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  punctuationRatio = calculatePunctuationRatio(text)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  return combine([sentenceEmbedding, ngramFreq, stylometric])', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('}', 20, yPosition);
    yPosition += lineHeight + 15;
    
    // AI Training Detection Algorithm
    checkAndAddPage(120);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text('3. AI TRAINING DETECTION ALGORITHM', 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text('function detectAITrainingActivity(monitoredContent, suspiciousContent) {', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // Similarity threshold analysis', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  similarity = computeCosineSimilarity(', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('    monitoredContent.fingerprint,', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('    suspiciousContent.fingerprint', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('  )', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // Pattern matching for AI signatures', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  aiPatterns = [', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('    "bulk_download_pattern",', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('    "gpu_computation_signature",', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('    "model_training_api_calls",', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('    "derivative_content_generation"', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('  ]', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  detectedPatterns = []', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  for pattern in aiPatterns:', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('    if detectPattern(suspiciousContent, pattern):', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('      detectedPatterns.append(pattern)', 35, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // Machine learning classification', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  features = extractBehavioralFeatures(suspiciousContent)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  aiProbability = mlClassifier.predict(features)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // Final decision algorithm', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  riskScore = calculateRiskScore(', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('    similarity, len(detectedPatterns), aiProbability', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('  )', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  return {', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('    isViolation: riskScore > THRESHOLD_0_85,', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('    confidence: riskScore,', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('    patterns: detectedPatterns,', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('    similarity: similarity', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('  }', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('}', 20, yPosition);
    yPosition += lineHeight + 15;
    
    // Real-time Monitoring Algorithm
    checkAndAddPage(100);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text('4. REAL-TIME MONITORING SYSTEM', 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text('class RealTimeMonitor {', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  constructor() {', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('    this.platforms = loadPlatformAPIs() // 70+ platforms', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('    this.fingerprints = loadProtectedFingerprints()', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('    this.scanInterval = 30 // seconds', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('  }', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  startMonitoring() {', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('    while (true) {', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('      for platform in this.platforms:', 35, yPosition);
    yPosition += lineHeight;
    pdf.text('        // Parallel scanning', 40, yPosition);
    yPosition += lineHeight;
    pdf.text('        Thread.start(() => {', 40, yPosition);
    yPosition += lineHeight;
    pdf.text('          newContent = platform.scrapeNewContent()', 45, yPosition);
    yPosition += lineHeight;
    pdf.text('          ', 40, yPosition);
    yPosition += lineHeight;
    pdf.text('          for content in newContent:', 45, yPosition);
    yPosition += lineHeight;
    pdf.text('            fingerprint = generateFingerprint(content)', 50, yPosition);
    yPosition += lineHeight;
    pdf.text('            ', 45, yPosition);
    yPosition += lineHeight;
    pdf.text('            for protected in this.fingerprints:', 50, yPosition);
    yPosition += lineHeight;
    pdf.text('              result = detectAITrainingActivity(', 55, yPosition);
    yPosition += lineHeight;
    pdf.text('                protected, fingerprint', 60, yPosition);
    yPosition += lineHeight;
    pdf.text('              )', 55, yPosition);
    yPosition += lineHeight;
    pdf.text('              ', 50, yPosition);
    yPosition += lineHeight;
    pdf.text('              if result.isViolation:', 55, yPosition);
    yPosition += lineHeight;
    pdf.text('                triggerAlert(result, content, platform)', 60, yPosition);
    yPosition += lineHeight;
    pdf.text('                initiateResponse(result)', 60, yPosition);
    yPosition += lineHeight;
    pdf.text('        })', 40, yPosition);
    yPosition += lineHeight;
    pdf.text('      ', 35, yPosition);
    yPosition += lineHeight;
    pdf.text('      sleep(this.scanInterval)', 35, yPosition);
    yPosition += lineHeight;
    pdf.text('    }', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('  }', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('}', 20, yPosition);
    yPosition += lineHeight + 15;
    
    // Automated Response Algorithm
    checkAndAddPage(80);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text('5. AUTOMATED RESPONSE ALGORITHM', 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text('function initiateResponse(violationResult) {', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // Severity assessment', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  severity = calculateSeverity(violationResult.confidence)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  switch(severity) {', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('    case "HIGH": // Confidence > 0.95', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('      generateDMCANotice(violationResult)', 35, yPosition);
    yPosition += lineHeight;
    pdf.text('      fileLegalDocuments(violationResult)', 35, yPosition);
    yPosition += lineHeight;
    pdf.text('      notifyLegalTeam(violationResult)', 35, yPosition);
    yPosition += lineHeight;
    pdf.text('      break', 35, yPosition);
    yPosition += lineHeight;
    pdf.text('    ', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('    case "MEDIUM": // Confidence 0.75-0.95', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('      sendCeaseAndDesist(violationResult)', 35, yPosition);
    yPosition += lineHeight;
    pdf.text('      flagForManualReview(violationResult)', 35, yPosition);
    yPosition += lineHeight;
    pdf.text('      break', 35, yPosition);
    yPosition += lineHeight;
    pdf.text('    ', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('    case "LOW": // Confidence 0.5-0.75', 30, yPosition);
    yPosition += lineHeight;
    pdf.text('      addToWatchList(violationResult)', 35, yPosition);
    yPosition += lineHeight;
    pdf.text('      increaseMonitoringFrequency(violationResult.source)', 35, yPosition);
    yPosition += lineHeight;
    pdf.text('      break', 35, yPosition);
    yPosition += lineHeight;
    pdf.text('  }', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  ', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  // Log all actions for audit trail', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  auditLog.record(violationResult, actions, timestamp)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('}', 20, yPosition);
    yPosition += lineHeight + 15;
    
    // Performance Metrics
    checkAndAddPage(60);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text('6. ALGORITHM PERFORMANCE METRICS', 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text('Detection Accuracy Algorithm:', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  True Positive Rate: 95.3% (β-tested on 10,000 samples)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  False Positive Rate: 4.2% (within acceptable thresholds)', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  Processing Time: O(log n) for fingerprint comparison', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  Memory Usage: O(k) where k = number of features', 25, yPosition);
    yPosition += lineHeight + 10;
    
    pdf.text('Scalability Characteristics:', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('  Parallel Processing: 64 concurrent platform monitors', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  Database Queries: Optimized with B-tree indexing', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  Response Time: <2 hours for 99.8% of detections', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('  Throughput: 10M+ fingerprint comparisons/minute', 25, yPosition);
    yPosition += lineHeight + 15;
    
    // Beta Disclaimer
    checkAndAddPage(30);
    pdf.setFontSize(8);
    pdf.text('⚠️ BETA TESTING PHASE DISCLAIMER', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('These algorithms are currently in beta testing. Performance metrics', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('are projected based on controlled testing environments.', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('No production users at this time.', 20, yPosition);
    yPosition += lineHeight + 10;
    
    // Contact & Footer
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text('TECHNICAL CONTACT', 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text('Algorithm Details: shirleena.cunningham@tsmowatch.com', 20, yPosition);
    yPosition += lineHeight + 10;
    
    pdf.setFontSize(8);
    pdf.text('© 2025 TSMO. Proprietary algorithms - Patent Pending.', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('Unauthorized use or distribution strictly prohibited.', 20, yPosition);
    
    pdf.save('TSMO-AI-Training-Protection-Algorithm-Complete.pdf');
  };

  if (!accessGranted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center">
          <CardHeader>
            <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">TSMO Investor Data Room</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Access to this data room is restricted to verified investors only.
            </p>
            <div className="space-y-4">
              <Button 
                onClick={() => setAccessGranted(true)}
                size="lg"
                className="w-full max-w-sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Request Access
              </Button>
              <p className="text-sm text-muted-foreground">
                By requesting access, you agree to maintain confidentiality of all materials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">TSMO Investor Data Room</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive due diligence materials for qualified investors
        </p>
        <Badge variant="secondary" className="text-sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          Access Granted - Confidential Materials
        </Badge>
      </div>

      {/* Key Metrics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Current Metrics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.mrr}</div>
              <div className="text-sm text-muted-foreground">Monthly Recurring Revenue</div>
              <Badge variant="outline" className="text-xs mt-1">Projected</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.users}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
              <Badge variant="outline" className="text-xs mt-1">Projected</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.artworks}</div>
              <div className="text-sm text-muted-foreground">Protected Artworks</div>
              <Badge variant="outline" className="text-xs mt-1">Projected</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.dmcaFiled}</div>
              <div className="text-sm text-muted-foreground">DMCA Filed</div>
              <Badge variant="outline" className="text-xs mt-1">Projected</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.churn}</div>
              <div className="text-sm text-muted-foreground">Monthly Churn</div>
              <Badge variant="outline" className="text-xs mt-1">Projected</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.nps}</div>
              <div className="text-sm text-muted-foreground">Net Promoter Score</div>
              <Badge variant="outline" className="text-xs mt-1">Projected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Library */}
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
        </TabsList>

        {Object.entries(documents).map(([category, docs]) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{category} Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {docs.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {doc.type} • {doc.size}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === 'confidential' && (
                          <Badge variant="destructive" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Confidential
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDocumentDownload(doc.name)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Investor Relations Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Primary Contact</h3>
            <p className="text-sm text-muted-foreground mb-1">shirleena.cunningham@tsmowatch.com</p>
            <p className="text-sm text-muted-foreground mb-4"></p>
            
            <Button variant="outline" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Schedule Due Diligence Call
            </Button>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Additional Resources</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Live Product Demo</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Customer Reference Calls</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Technical Deep Dive Sessions</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorDataRoom;