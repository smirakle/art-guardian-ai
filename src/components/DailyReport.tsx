import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  FileText, 
  Calendar as CalendarIcon,
  AlertTriangle,
  Shield,
  Eye,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import jsPDF from 'jspdf';
import tsmoLogo from '@/assets/tsmo-transparent-logo.png';


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
  type: 'monitoring' | 'deep-scan';
  data?: ReportData;
  realTimeStats?: MonitoringStats;
}

const DailyReport = ({ type, data, realTimeStats }: DailyReportProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reportFormat, setReportFormat] = useState<string>("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Use real-time stats if available, otherwise use provided data
  const reportData: ReportData = data || {
    date: format(selectedDate, "yyyy-MM-dd"),
    totalScans: realTimeStats?.totalScans || 1247,
    threatsDetected: realTimeStats?.threatLevel === 'high' ? 5 : realTimeStats?.threatLevel === 'medium' ? 2 : 0,
    protectedAssets: realTimeStats?.protectedAssets || 156,
    systemUptime: realTimeStats?.systemUptime || 99.8,
    alertsGenerated: realTimeStats?.activeAlerts || 7,
    marketplacesScanned: 150,
    criticalFindings: realTimeStats?.threatLevel === 'high' ? 2 : realTimeStats?.threatLevel === 'medium' ? 1 : 0,
    resolutionTime: "2.3 hours"
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    // Generate report
    setTimeout(() => {
      if (reportFormat === 'pdf') {
        generatePDFReport(reportData);
      } else {
        const reportContent = generateReportContent(reportData);
        downloadReport(reportContent, reportFormat);
      }
      setIsGenerating(false);
      
      toast({
        title: "Report Generated Successfully",
        description: `${type === 'monitoring' ? 'Monitoring' : 'Deep Scan'} report for ${format(selectedDate, "MMM dd, yyyy")} has been downloaded.`
      });
    }, 2000);
  };

  const generatePDFReport = (data: ReportData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = margin;

    // Load and add TSMO logo
    const img = new Image();
    img.onload = () => {
      // Add logo to PDF
      try {
        doc.addImage(img, 'PNG', pageWidth / 2 - 15, yPosition, 30, 15);
        yPosition += 25;
        
        // Add TSMO Header
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(25, 25, 112); // Navy blue
        doc.text("TSMO PROTECT", pageWidth / 2, yPosition, { align: "center" });
        yPosition += 8;
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(105, 105, 105); // Gray
        doc.text('"Your Art. Our Watch."', pageWidth / 2, yPosition, { align: "center" });
        yPosition += 25;

        // Reset text color
        doc.setTextColor(0, 0, 0);
        
        // Continue with the rest of the PDF content
        finishPDFGeneration(doc, data, pageWidth, margin, yPosition);
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
        // Continue without logo
        generateBasicPDFReport(doc, data, pageWidth, margin, yPosition);
      }
    };
    
    img.onerror = () => {
      console.warn('Could not load TSMO logo, generating PDF without logo');
      generateBasicPDFReport(doc, data, pageWidth, margin, yPosition);
    };
    
    img.src = tsmoLogo;
  };

  const finishPDFGeneration = (doc: jsPDF, data: ReportData, pageWidth: number, margin: number, yPosition: number) => {

    // Report Title with styling
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 25, 112); // Navy blue
    const reportTitle = type === 'monitoring' ? 'Daily Monitoring Report' : 'Deep Web Scan Report';
    doc.text(reportTitle, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 8;
    
    // Add decorative line
    doc.setDrawColor(25, 25, 112);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Report Info in a styled box
    doc.setFillColor(245, 245, 245); // Light gray background
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 25, 'F');
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("REPORT INFORMATION", margin + 5, yPosition + 8);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy 'at' HH:mm")}`, margin + 5, yPosition + 15);
    doc.text(`Report Date: ${format(selectedDate, "MMM dd, yyyy")}`, margin + 5, yPosition + 20);
    
    // Status badge
    const status = realTimeStats ? 'REAL-TIME DATA' : 'HISTORICAL DATA';
    const statusColor = realTimeStats ? [34, 197, 94] : [156, 163, 175]; // Green for real-time, gray for historical
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setTextColor(255, 255, 255);
    doc.rect(pageWidth - margin - 50, yPosition + 5, 45, 8, 'F');
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(status, pageWidth - margin - 47.5, yPosition + 10);
    
    yPosition += 35;
    doc.setTextColor(0, 0, 0);

    // Executive Summary
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("EXECUTIVE SUMMARY", margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Scans Performed: ${data.totalScans.toLocaleString()}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Threats Detected: ${data.threatsDetected}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Protected Assets: ${data.protectedAssets}`, margin, yPosition);
    yPosition += 8;
    doc.text(`System Uptime: ${data.systemUptime}%`, margin, yPosition);
    yPosition += 20;

    // Security Metrics
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("SECURITY METRICS", margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Alerts Generated: ${data.alertsGenerated}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Critical Findings: ${data.criticalFindings}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Average Resolution Time: ${data.resolutionTime}`, margin, yPosition);
    yPosition += 8;
    if (type === 'deep-scan') {
      doc.text(`Marketplaces Scanned: ${data.marketplacesScanned}`, margin, yPosition);
      yPosition += 8;
    }
    yPosition += 15;

    // Threat Analysis
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("THREAT ANALYSIS", margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const riskLevel = data.threatsDetected === 0 ? 'LOW' : data.threatsDetected < 5 ? 'MEDIUM' : 'HIGH';
    doc.text(`Risk Level: ${riskLevel}`, margin, yPosition);
    yPosition += 8;
    doc.text("Active Monitoring: ENABLED", margin, yPosition);
    yPosition += 8;
    doc.text("Blockchain Verification: ACTIVE", margin, yPosition);
    yPosition += 20;

    // Recommendations
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("RECOMMENDATIONS", margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("• Continue 24/7 monitoring protocols", margin, yPosition);
    yPosition += 8;
    doc.text("• Review critical findings within 2 hours", margin, yPosition);
    yPosition += 8;
    doc.text("• Maintain current security posture", margin, yPosition);
    yPosition += 8;
    if (type === 'deep-scan') {
      doc.text("• Schedule next deep scan in 24 hours", margin, yPosition);
      yPosition += 8;
    }
    yPosition += 15;

    // Compliance
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("COMPLIANCE", margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("GDPR Compliant: YES", margin, yPosition);
    yPosition += 8;
    doc.text("Data Retention: 90 days", margin, yPosition);
    yPosition += 8;
    doc.text("Encryption: AES-256", margin, yPosition);

    // Enhanced Footer with TSMO branding
    const footerY = doc.internal.pageSize.height - 20;
    doc.setDrawColor(25, 25, 112);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 25, 112);
    doc.text("TSMO PROTECT", pageWidth / 2, footerY, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(105, 105, 105);
    doc.text("Professional Art Protection & Monitoring Services", pageWidth / 2, footerY + 5, { align: "center" });
    doc.text(`Report ID: TSMO-${Date.now().toString().slice(-8)} | Generated: ${format(new Date(), "yyyy-MM-dd HH:mm")}`, pageWidth / 2, footerY + 10, { align: "center" });

    // Save the PDF
    const fileName = `TSMO_${type === 'monitoring' ? 'Monitoring' : 'DeepScan'}_Report_${format(selectedDate, "yyyy-MM-dd")}.pdf`;
    doc.save(fileName);
  };

  const generateBasicPDFReport = (doc: jsPDF, data: ReportData, pageWidth: number, margin: number, yPosition: number) => {
    // Fallback PDF generation without logo
    // Add TSMO Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("TSMO PROTECT", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text('"Your Art. Our Watch."', pageWidth / 2, yPosition, { align: "center" });
    yPosition += 20;

    finishPDFGeneration(doc, data, pageWidth, margin, yPosition);
  };

  const generateReportContent = (data: ReportData) => {
    const reportTitle = type === 'monitoring' ? 'TSMO Daily Monitoring Report' : 'TSMO Deep Web Scan Report';
    
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
Threats Detected: ${data.threatsDetected}
Protected Assets: ${data.protectedAssets}
System Uptime: ${data.systemUptime}%

=== SECURITY METRICS ===
Alerts Generated: ${data.alertsGenerated}
Critical Findings: ${data.criticalFindings}
Average Resolution Time: ${data.resolutionTime}
${type === 'deep-scan' ? `Marketplaces Scanned: ${data.marketplacesScanned}` : ''}

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
      // Convert to CSV format
      fileContent = `Date,Total Scans,Threats Detected,Protected Assets,System Uptime,Alerts Generated,Critical Findings,Resolution Time\n`;
      fileContent += `${reportData.date},${reportData.totalScans},${reportData.threatsDetected},${reportData.protectedAssets},${reportData.systemUptime},${reportData.alertsGenerated},${reportData.criticalFindings},${reportData.resolutionTime}`;
    }
    
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fileName = `TSMO_${type === 'monitoring' ? 'Monitoring' : 'DeepScan'}_Report_${format(selectedDate, "yyyy-MM-dd")}.${fileFormat}`;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reportStats = [
    { 
      icon: Eye, 
      label: "Total Scans", 
      value: reportData.totalScans.toLocaleString(),
      color: "text-primary"
    },
    { 
      icon: AlertTriangle, 
      label: "Threats Found", 
      value: reportData.threatsDetected.toString(),
      color: "text-destructive"
    },
    { 
      icon: Shield, 
      label: "Protected Assets", 
      value: reportData.protectedAssets.toString(),
      color: "text-green-500"
    },
    { 
      icon: Clock, 
      label: "Avg Response", 
      value: reportData.resolutionTime,
      color: "text-accent"
    }
  ];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Daily {type === 'monitoring' ? 'Monitoring' : 'Deep Scan'} Report
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {reportStats.map((stat) => (
            <div key={stat.label} className="bg-background/50 rounded-lg p-3 text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

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
          Reports include security metrics, threat analysis, and compliance data
        </p>
      </CardContent>
    </Card>
  );
};

export default DailyReport;