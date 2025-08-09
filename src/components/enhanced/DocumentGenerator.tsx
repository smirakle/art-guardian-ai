import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Download, Send, Signature, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRateLimiting } from '@/hooks/useRateLimiting';
import { useEnhancedCaching } from '@/hooks/useEnhancedCaching';
import { isPromptAllowed } from '@/lib/promptGuard';
import jsPDF from 'jspdf';

interface LegalTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  format: string;
  difficulty: string;
  icon: React.ComponentType<any>;
  content: string;
  tags: string[];
  customFields: string[];
}

interface DocumentGeneratorProps {
  template: LegalTemplate;
  onGenerated?: (document: any) => void;
}

const dmcaFormSchema = z.object({
  workTitle: z.string().min(1, 'Work title is required'),
  workDescription: z.string().min(10, 'Please provide a detailed description'),
  creationDate: z.string().min(1, 'Creation date is required'),
  registrationNumber: z.string().optional(),
  infringingUrl: z.string().url('Please enter a valid URL'),
  infringementDescription: z.string().min(10, 'Please describe the infringement'),
});

type DMCAFormData = z.infer<typeof dmcaFormSchema>;

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ template, onGenerated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<any>(null);
  const [step, setStep] = useState<'form' | 'preview' | 'download'>('form');

  const form = useForm<DMCAFormData>({
    resolver: zodResolver(dmcaFormSchema),
    defaultValues: {
      workTitle: '',
      workDescription: '',
      creationDate: '',
      registrationNumber: '',
      infringingUrl: '',
      infringementDescription: '',
    },
  });

const onSubmit = async (data: DMCAFormData) => {
  if (!user) {
    toast({
      title: 'Authentication Required',
      description: 'Please sign in to generate documents.',
      variant: 'destructive',
    });
    return;
  }

  // Prompt/content guard (market-ready safety)
  const combined = [
    data.workTitle,
    data.workDescription,
    data.infringementDescription,
  ].filter(Boolean).join('\n');
  const guard = isPromptAllowed(combined, { maxChars: 4000 });
  if (!guard.allowed) {
    toast({
      title: 'Blocked for Safety',
      description: guard.reason || 'Request violates content policy.',
      variant: 'destructive',
    });
    return;
  }

  setLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('legal-document-processor', {
        body: {
          action: 'generate',
          templateId: template.id,
          customFields: data
        }
      });

      if (error) throw error;

      setGeneratedDocument(response.document);
      setStep('preview');
      onGenerated?.(response.document);

      toast({
        title: 'Document Generated',
        description: 'Your legal document has been generated successfully.',
      });
    } catch (error: any) {
      console.error('Error generating document:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!generatedDocument) return;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 6;
      let yPosition = margin;

      // Header with document info
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(template.title.toUpperCase(), margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Document ID: ${generatedDocument.id}`, margin, yPosition);
      yPosition += 5;
      pdf.text(`Generated: ${new Date(generatedDocument.generated_at).toLocaleString()}`, margin, yPosition);
      yPosition += 5;
      pdf.text(`Hash: ${generatedDocument.document_hash.substring(0, 16)}...`, margin, yPosition);
      yPosition += 10;

      // Separator line
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Content
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const content = generatedDocument.generated_content;
      const lines = pdf.splitTextToSize(content, pageWidth - (2 * margin));
      
      for (let i = 0; i < lines.length; i++) {
        if (yPosition + lineHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(lines[i], margin, yPosition);
        yPosition += lineHeight;
      }

      // Footer with verification info
      const footerY = pageHeight - 20;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Generated by TSMO Legal Templates - Digitally Verified', margin, footerY);
      pdf.text(`Verification Hash: ${generatedDocument.document_hash.substring(0, 32)}`, margin, footerY + 5);

      // Save the PDF
      const fileName = `${template.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      // Update download count
      updateDownloadCount();

      toast({
        title: 'Document Downloaded',
        description: 'Your legal document has been downloaded with verification hash.',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateDownloadCount = async () => {
    if (!generatedDocument) return;

    try {
      await supabase
        .from('legal_document_generations')
        .update({
          download_count: (generatedDocument.download_count || 0) + 1,
          last_downloaded: new Date().toISOString()
        })
        .eq('id', generatedDocument.id);
    } catch (error) {
      console.error('Error updating download count:', error);
    }
  };

  const startCompliance = async () => {
    if (!generatedDocument) return;

    try {
      const { data, error } = await supabase.functions.invoke('legal-document-processor', {
        body: {
          action: 'track_compliance',
          documentId: generatedDocument.id,
          complianceType: 'dmca_filing',
          jurisdiction: 'United States'
        }
      });

      if (error) throw error;

      toast({
        title: 'Compliance Tracking Started',
        description: 'We will monitor the progress of your DMCA notice.',
      });
    } catch (error: any) {
      console.error('Error starting compliance:', error);
      toast({
        title: 'Error',
        description: 'Failed to start compliance tracking.',
        variant: 'destructive',
      });
    }
  };

  const renderForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="workTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title of Your Copyrighted Work *</FormLabel>
                <FormControl>
                  <Input placeholder="My Amazing Artwork" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description of Your Work *</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Detailed description of your copyrighted work, including medium, style, and any distinctive features..."
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="creationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Creation *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Copyright Registration Number (if applicable)</FormLabel>
                <FormControl>
                  <Input placeholder="VA123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="infringingUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL of Infringing Content *</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/infringing-content" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="infringementDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description of Infringement *</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Explain how your copyrighted work is being used without permission..."
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Document'}
          </Button>
        </div>
      </form>
    </Form>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
        <h3 className="text-lg font-semibold">Document Generated Successfully</h3>
        <p className="text-sm text-muted-foreground">
          Your legal document has been generated and is ready for download.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Document Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Document ID:</span>
            <span className="font-mono">{generatedDocument?.id?.substring(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Generated:</span>
            <span>{new Date(generatedDocument?.generated_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Verification Hash:</span>
            <span className="font-mono">{generatedDocument?.document_hash?.substring(0, 16)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expires:</span>
            <span>{new Date(generatedDocument?.expires_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto">
        <pre className="text-xs whitespace-pre-wrap">
          {generatedDocument?.generated_content?.substring(0, 1000)}
          {generatedDocument?.generated_content?.length > 1000 && '...'}
        </pre>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Button onClick={downloadPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        
        <Button variant="outline" onClick={startCompliance} className="gap-2">
          <Clock className="h-4 w-4" />
          Start Compliance Tracking
        </Button>
        
        <Button variant="outline" onClick={() => setStep('download')} className="gap-2">
          <Send className="h-4 w-4" />
          Next Steps
        </Button>
      </div>
    </div>
  );

  const renderNextSteps = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
        <h3 className="text-lg font-semibold">Document Ready for Action</h3>
        <p className="text-sm text-muted-foreground">
          Follow these next steps to protect your copyright.
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Send className="h-4 w-4" />
              1. Send the DMCA Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Send your generated DMCA notice to the website owner or their designated DMCA agent.
            Include the PDF as an attachment in your email.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              2. Monitor Response
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            We'll track the compliance status and remind you of important deadlines.
            Most platforms respond within 10 business days.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              3. Follow Up if Needed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            If no response within the deadline, consider escalating to legal action
            or filing with the platform's abuse department.
          </CardContent>
        </Card>
      </div>

      <Button onClick={() => setIsOpen(false)} className="w-full">
        Complete
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <FileText className="h-4 w-4" />
          Generate Document
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <template.icon className="h-5 w-5" />
            Generate {template.title}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' && 'Fill out the form below to generate your personalized legal document.'}
            {step === 'preview' && 'Review your generated document before downloading.'}
            {step === 'download' && 'Your document is ready. Follow the next steps to protect your rights.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && renderForm()}
        {step === 'preview' && renderPreview()}
        {step === 'download' && renderNextSteps()}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentGenerator;