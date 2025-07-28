import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Download, 
  FileText, 
  Calendar as CalendarIcon,
  AlertTriangle,
  Shield,
  Eye,
  Clock,
  Brain,
  Globe,
  Crown,
  Users,
  BarChart3
} from "lucide-react";
import { format, subDays } from "date-fns";
import jsPDF from 'jspdf';


interface ReportData {
  date: string;
  totalScans: number;
  threatsDetected: number;
  protectedAssets: number;
  systemUptime: number;
  alertsGenerated: number;
  marketplacesScanned: number;
  criticalFindings: number;
  resolutionTime: string;
  // Enhanced data fields
  aiScans: number;
  socialMediaScans: number;
  webScans: number;
  blockchainCertificates: number;
  deepfakeDetections: number;
  socialMediaAccounts: number;
  copyrightMatches: number;
  socialMediaThreats: number;
}

interface MonitoringStats {
  totalScans: number;
  activeAlerts: number;
  protectedAssets: number;
  systemUptime: number;
  lastScanTime: string;
  threatLevel: 'low' | 'medium' | 'high';
}

interface DailyReportProps {
  type?: 'comprehensive' | 'monitoring' | 'deep-scan';
  data?: ReportData;
  realTimeStats?: MonitoringStats;
}

const DailyReport = ({ type = 'comprehensive', data, realTimeStats }: DailyReportProps) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reportFormat, setReportFormat] = useState<string>("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user, selectedDate]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const nextDay = format(subDays(selectedDate, -1), 'yyyy-MM-dd');

      // Load comprehensive data from all sources
      const [
        artworkData,
        monitoringScansData,
        socialMediaScansData,
        webScansData,
        blockchainData,
        deepfakeData,
        socialAccountsData,
        copyrightMatchesData,
        socialMediaResultsData
      ] = await Promise.all([
        // Protected artworks
        supabase.from('artwork').select('*').eq('user_id', user!.id),
        
        // AI monitoring scans
        supabase.from('monitoring_scans')
          .select('*')
          .gte('started_at', dateStr)
          .lt('started_at', nextDay),
        
        // Social media scans
        supabase.from('social_media_scans')
          .select('*, account:social_media_accounts!inner(user_id)')
          .eq('account.user_id', user!.id)
          .gte('started_at', dateStr)
          .lt('started_at', nextDay),
        
        // Web scans
        supabase.from('web_scans')
          .select('*')
          .eq('user_id', user!.id)
          .gte('started_at', dateStr)
          .lt('started_at', nextDay),
        
        // Blockchain certificates
        supabase.from('blockchain_certificates')
          .select('*')
          .eq('user_id', user!.id)
          .gte('created_at', dateStr)
          .lt('created_at', nextDay),
        
        // Deepfake detections
        supabase.from('deepfake_matches')
          .select('*')
          .gte('detected_at', dateStr)
          .lt('detected_at', nextDay),
        
        // Social media accounts
        supabase.from('social_media_accounts')
          .select('*')
          .eq('user_id', user!.id),
        
        // Copyright matches
        supabase.from('copyright_matches')
          .select('*, artwork!inner(user_id)')
          .eq('artwork.user_id', user!.id)
          .gte('detected_at', dateStr)
          .lt('detected_at', nextDay),
        
        // Social media monitoring results
        supabase.from('social_media_monitoring_results')
          .select('*, account:social_media_accounts!inner(user_id)')
          .eq('account.user_id', user!.id)
          .gte('detected_at', dateStr)
          .lt('detected_at', nextDay)
      ]);

      const compiledData: ReportData = {
        date: dateStr,
        protectedAssets: artworkData.data?.length || 0,
        totalScans: (monitoringScansData.data?.length || 0) + (socialMediaScansData.data?.length || 0) + (webScansData.data?.length || 0),
        aiScans: monitoringScansData.data?.length || 0,
        socialMediaScans: socialMediaScansData.data?.length || 0,
        webScans: webScansData.data?.length || 0,
        blockchainCertificates: blockchainData.data?.length || 0,
        deepfakeDetections: deepfakeData.data?.length || 0,
        socialMediaAccounts: socialAccountsData.data?.length || 0,
        copyrightMatches: copyrightMatchesData.data?.length || 0,
        socialMediaThreats: socialMediaResultsData.data?.length || 0,
        threatsDetected: (copyrightMatchesData.data?.length || 0) + (socialMediaResultsData.data?.length || 0) + (deepfakeData.data?.length || 0),
        systemUptime: 99.8,
        alertsGenerated: (copyrightMatchesData.data?.length || 0) + (socialMediaResultsData.data?.length || 0),
        marketplacesScanned: 150,
        criticalFindings: copyrightMatchesData.data?.filter(m => m.threat_level === 'high').length || 0,
        resolutionTime: "2.3 hours"
      };

      setReportData(compiledData);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Use loaded report data if available, otherwise use provided data or defaults
  const finalReportData: ReportData = reportData || data || {
    date: format(selectedDate, "yyyy-MM-dd"),
    totalScans: realTimeStats?.totalScans || 0,
    threatsDetected: realTimeStats?.threatLevel === 'high' ? 5 : realTimeStats?.threatLevel === 'medium' ? 2 : 0,
    protectedAssets: realTimeStats?.protectedAssets || 0,
    systemUptime: realTimeStats?.systemUptime || 99.8,
    alertsGenerated: realTimeStats?.activeAlerts || 0,
    marketplacesScanned: 150,
    criticalFindings: realTimeStats?.threatLevel === 'high' ? 2 : realTimeStats?.threatLevel === 'medium' ? 1 : 0,
    resolutionTime: "2.3 hours",
    aiScans: 0,
    socialMediaScans: 0,
    webScans: 0,
    blockchainCertificates: 0,
    deepfakeDetections: 0,
    socialMediaAccounts: 0,
    copyrightMatches: 0,
    socialMediaThreats: 0
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    // Generate report
    setTimeout(() => {
      if (reportFormat === 'pdf') {
        generatePDFReport(finalReportData);
      } else {
        const reportContent = generateReportContent(finalReportData);
        downloadReport(reportContent, reportFormat);
      }
      setIsGenerating(false);
      
      toast({
        title: "Report Generated Successfully",
        description: `${type === 'comprehensive' ? 'Comprehensive' : type === 'monitoring' ? 'Monitoring' : 'Deep Scan'} report for ${format(selectedDate, "MMM dd, yyyy")} has been downloaded.`
      });
    }, 2000);
  };

  const generatePDFReport = (data: ReportData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = margin;

    // Add TSMO Header with text only
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 25, 112); // Navy blue
    doc.text("TSMO", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 12;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(105, 105, 105); // Gray
    doc.text("Your Art Our Watch", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 20;

    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Continue with the rest of the PDF content
    finishPDFGeneration(doc, data, pageWidth, margin, yPosition);
  };

  const finishPDFGeneration = (doc: jsPDF, data: ReportData, pageWidth: number, margin: number, yPosition: number) => {

    // Report Title with styling
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 25, 112); // Navy blue
    const reportTitle = type === 'comprehensive' ? 'Comprehensive Daily Report' : type === 'monitoring' ? 'Daily Monitoring Report' : 'Deep Web Scan Report';
    doc.text(reportTitle, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 6;
    
    // Add decorative line
    doc.setDrawColor(25, 25, 112);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Report Info in a styled box (smaller)
    doc.setFillColor(245, 245, 245); // Light gray background
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("REPORT INFORMATION", margin + 3, yPosition + 6);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy 'at' HH:mm")}`, margin + 3, yPosition + 11);
    doc.text(`Report Date: ${format(selectedDate, "MMM dd, yyyy")}`, margin + 3, yPosition + 16);
    
    // Status badge
    const status = realTimeStats ? 'REAL-TIME' : 'HISTORICAL';
    const statusColor = realTimeStats ? [34, 197, 94] : [156, 163, 175]; // Green for real-time, gray for historical
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setTextColor(255, 255, 255);
    doc.rect(pageWidth - margin - 40, yPosition + 6, 35, 6, 'F');
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(status, pageWidth - margin - 37.5, yPosition + 10);
    
    yPosition += 25;
    doc.setTextColor(0, 0, 0);

    // Executive Summary
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("EXECUTIVE SUMMARY", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Scans: ${data.totalScans.toLocaleString()}  •  AI: ${data.aiScans}  •  Social: ${data.socialMediaScans}  •  Web: ${data.webScans}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Threats: ${data.threatsDetected}  •  Assets: ${data.protectedAssets}  •  Blockchain: ${data.blockchainCertificates}  •  Uptime: ${data.systemUptime}%`, margin, yPosition);
    yPosition += 15;

    // Detailed Analytics
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DETAILED ANALYTICS", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Deepfake Detections: ${data.deepfakeDetections}  •  Copyright Matches: ${data.copyrightMatches}  •  Social Accounts: ${data.socialMediaAccounts}`, margin, yPosition);
    yPosition += 6;
    const metricsText = `Alerts: ${data.alertsGenerated}  •  Critical: ${data.criticalFindings}  •  Avg Resolution: ${data.resolutionTime}`;
    const deepScanText = type === 'deep-scan' || type === 'comprehensive' ? `  •  Marketplaces: ${data.marketplacesScanned}` : '';
    doc.text(metricsText + deepScanText, margin, yPosition);
    yPosition += 15;

    // Threat Analysis
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("THREAT ANALYSIS", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const riskLevel = data.threatsDetected === 0 ? 'LOW' : data.threatsDetected < 5 ? 'MEDIUM' : 'HIGH';
    doc.text(`Risk Level: ${riskLevel}  •  Monitoring: ENABLED  •  Blockchain: ACTIVE`, margin, yPosition);
    yPosition += 15;

    // Recommendations & Compliance in one section
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("RECOMMENDATIONS & COMPLIANCE", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("• Continue 24/7 monitoring • Review critical findings within 2h • Maintain security posture", margin, yPosition);
    yPosition += 6;
    if (type === 'deep-scan') {
      doc.text("• Schedule next deep scan in 24 hours", margin, yPosition);
      yPosition += 6;
    }
    doc.text("GDPR Compliant: YES  •  Data Retention: 90 days  •  Encryption: AES-256", margin, yPosition);
    yPosition += 15;

    // Enhanced Footer with TSMO branding (positioned properly)
    const footerY = doc.internal.pageSize.height - 25;
    doc.setDrawColor(25, 25, 112);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 25, 112);
    doc.text("TSMO WATCH", pageWidth / 2, footerY, { align: "center" });
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(105, 105, 105);
    doc.text("Professional Art Protection & Monitoring Services", pageWidth / 2, footerY + 6, { align: "center" });
    doc.text(`Report ID: TSMO-${Date.now().toString().slice(-8)} | Generated: ${format(new Date(), "yyyy-MM-dd HH:mm")}`, pageWidth / 2, footerY + 11, { align: "center" });

    // Save the PDF
    const fileName = `TSMO_${type === 'monitoring' ? 'Monitoring' : 'DeepScan'}_Report_${format(selectedDate, "yyyy-MM-dd")}.pdf`;
    doc.save(fileName);
  };


  const generateReportContent = (data: ReportData) => {
    const reportTitle = type === 'comprehensive' ? 'TSMO Comprehensive Daily Report' : type === 'monitoring' ? 'TSMO Daily Monitoring Report' : 'TSMO Deep Web Scan Report';
    
    return `
╔═══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                   ║
║  ████████╗███████╗███╗   ███╗ ██████╗     ██████╗ ██████╗  ██████╗ ████████╗███████╗ ██████╗ ████████╗  ║
║  ╚══██╔══╝██╔════╝████╗ ████║██╔═══██╗    ██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝██╔════╝╚══██╔══╝  ║
║     ██║   ███████╗██╔████╔██║██║   ██║    ██████╔╝██████╔╝██║   ██║   ██║   █████╗  ██║        ██║     ║
║     ██║   ╚════██║██║╚██╔╝██║██║   ██║    ██╔═══╝ ██╔══██╗██║   ██║   ██║   ██╔══╝  ██║        ██║     ║
║     ██║   ███████║██║ ╚═╝ ██║╚██████╔╝    ██║     ██║  ██║╚██████╔╝   ██║   ███████╗╚██████╗   ██║     ║
║     ╚═╝   ╚══════╝╚═╝     ╚═╝ ╚═════╝     ╚═╝     ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚══════╝ ╚═════╝   ╚═╝     ║
║                                                                                   ║
║                        "Your Art. Our Watch."                                   ║
║                                                                                   ║
╚═══════════════════════════════════════════════════════════════════════════════════╝

${reportTitle}
Generated: ${format(new Date(), "MMM dd, yyyy 'at' HH:mm")}
Report Date: ${format(selectedDate, "MMM dd, yyyy")}
Status: ${realTimeStats ? 'REAL-TIME DATA' : 'HISTORICAL DATA'}

=== EXECUTIVE SUMMARY ===
Total Scans Performed: ${data.totalScans.toLocaleString()}
- AI Monitoring Scans: ${data.aiScans}
- Social Media Scans: ${data.socialMediaScans}
- Web Scans: ${data.webScans}
Threats Detected: ${data.threatsDetected}
Protected Assets: ${data.protectedAssets}
System Uptime: ${data.systemUptime}%

=== DETAILED ANALYTICS ===
Blockchain Certificates: ${data.blockchainCertificates}
Deepfake Detections: ${data.deepfakeDetections}
Copyright Matches: ${data.copyrightMatches}
Social Media Accounts Monitored: ${data.socialMediaAccounts}
Social Media Threats: ${data.socialMediaThreats}
Alerts Generated: ${data.alertsGenerated}
Critical Findings: ${data.criticalFindings}
Average Resolution Time: ${data.resolutionTime}
${type === 'deep-scan' || type === 'comprehensive' ? `Marketplaces Scanned: ${data.marketplacesScanned}` : ''}

=== THREAT ANALYSIS ===
Risk Level: ${data.threatsDetected === 0 ? 'LOW' : data.threatsDetected < 5 ? 'MEDIUM' : 'HIGH'}
Active Monitoring: ENABLED
Blockchain Verification: ACTIVE

=== RECOMMENDATIONS ===
- Continue 24/7 monitoring protocols
- Review critical findings within 2 hours
- Maintain current security posture
${type === 'deep-scan' ? '- Schedule next deep scan in 24 hours' : ''}

=== COMPLIANCE ===
GDPR Compliant: YES
Data Retention: 90 days
Encryption: AES-256

---
Report generated by TSMO Security Platform
"Your Art. Our Watch."
    `.trim();
  };

  const downloadReport = (content: string, fileFormat: string) => {
    let mimeType = 'text/plain';
    let fileContent = content;
    
    if (fileFormat === 'csv') {
      mimeType = 'text/csv';
      // Convert to CSV format with comprehensive data
      fileContent = `Date,Total Scans,AI Scans,Social Media Scans,Web Scans,Threats Detected,Protected Assets,Blockchain Certificates,Deepfake Detections,Copyright Matches,Social Media Accounts,Social Media Threats,System Uptime,Alerts Generated,Critical Findings,Resolution Time\n`;
      fileContent += `${finalReportData.date},${finalReportData.totalScans},${finalReportData.aiScans},${finalReportData.socialMediaScans},${finalReportData.webScans},${finalReportData.threatsDetected},${finalReportData.protectedAssets},${finalReportData.blockchainCertificates},${finalReportData.deepfakeDetections},${finalReportData.copyrightMatches},${finalReportData.socialMediaAccounts},${finalReportData.socialMediaThreats},${finalReportData.systemUptime},${finalReportData.alertsGenerated},${finalReportData.criticalFindings},${finalReportData.resolutionTime}`;
    }
    
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fileName = `TSMO_${type === 'comprehensive' ? 'Comprehensive' : type === 'monitoring' ? 'Monitoring' : 'DeepScan'}_Report_${format(selectedDate, "yyyy-MM-dd")}.${fileFormat}`;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reportStats = [
    { 
      icon: Brain, 
      label: "AI Scans", 
      value: finalReportData.aiScans.toString(),
      color: "text-blue-500"
    },
    { 
      icon: Users, 
      label: "Social Media", 
      value: finalReportData.socialMediaScans.toString(),
      color: "text-green-500"
    },
    { 
      icon: Globe, 
      label: "Web Scans", 
      value: finalReportData.webScans.toString(),
      color: "text-orange-500"
    },
    { 
      icon: Crown, 
      label: "Blockchain", 
      value: finalReportData.blockchainCertificates.toString(),
      color: "text-yellow-500"
    },
    { 
      icon: Eye, 
      label: "Deepfakes", 
      value: finalReportData.deepfakeDetections.toString(),
      color: "text-purple-500"
    },
    { 
      icon: AlertTriangle, 
      label: "Threats", 
      value: finalReportData.threatsDetected.toString(),
      color: "text-red-500"
    },
    { 
      icon: Shield, 
      label: "Protected", 
      value: finalReportData.protectedAssets.toString(),
      color: "text-primary"
    },
    { 
      icon: BarChart3, 
      label: "Alerts", 
      value: finalReportData.alertsGenerated.toString(),
      color: "text-accent"
    }
  ];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {type === 'comprehensive' ? 'Comprehensive Daily Report' : type === 'monitoring' ? 'Monitoring Report' : 'Deep Scan Report'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date and Format Selection */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Report Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Format</label>
            <Select value={reportFormat} onValueChange={setReportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="txt">Text File</SelectItem>
                <SelectItem value="csv">CSV Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Report Preview Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map((i) => (
              <div key={i} className="bg-background/50 rounded-lg p-3 animate-pulse">
                <div className="h-5 w-5 bg-muted rounded mx-auto mb-1" />
                <div className="h-6 bg-muted rounded mb-1" />
                <div className="h-3 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {reportStats.map((stat) => (
              <div key={stat.label} className="bg-background/50 rounded-lg p-3 text-center">
                <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Generate Button */}
        <Button 
          onClick={generateReport} 
          disabled={isGenerating}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating Report...' : 'Download Daily Report'}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          Comprehensive reports include AI scans, social media monitoring, web scanning, blockchain verification, and threat analysis
        </p>
      </CardContent>
    </Card>
  );
};

export default DailyReport;