import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileUp, Upload, CreditCard, Clock, AlertTriangle, CheckCircle, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';

const filingFormSchema = z.object({
  filingType: z.string().min(1, 'Filing type is required'),
  documentTitle: z.string().min(1, 'Document title is required'),
  documentDescription: z.string().optional(),
  filingJurisdiction: z.string().min(1, 'Jurisdiction is required'),
  urgencyLevel: z.enum(['standard', 'expedited', 'rush']),
  contactName: z.string().min(1, 'Contact name is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().optional(),
  additionalInstructions: z.string().optional(),
});

type FilingFormData = z.infer<typeof filingFormSchema>;

const FILING_TYPES = [
  'GDPR Privacy Policy',
  'Enterprise Cease & Desist',
  'NFT Terms',
  'Smart Contract',
  'DMCA Takedown Notice Pro'
];

const JURISDICTIONS = [
  'Federal (USPTO)',
  'Federal (Copyright Office)',
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
];

interface GovernmentFilingServiceProps {
  userSubscription?: { plan_id: string } | null;
}

const GovernmentFilingService: React.FC<GovernmentFilingServiceProps> = ({ userSubscription }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filingRequests, setFilingRequests] = useState<any[]>([]);
  const { toast } = useToast();

  const form = useForm<FilingFormData>({
    resolver: zodResolver(filingFormSchema),
    defaultValues: {
      urgencyLevel: 'standard',
      filingType: '',
      filingJurisdiction: '',
    }
  });

  useEffect(() => {
    fetchFilingRequests();
  }, []);

  const fetchFilingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('government_filing_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFilingRequests(data || []);
    } catch (error) {
      console.error('Error fetching filing requests:', error);
    }
  };

  const getPricing = (planId: string | undefined, urgencyLevel: string) => {
    let basePrice: number;
    
    switch (planId) {
      case 'student':
        basePrice = 99;
        break;
      case 'starter':
        basePrice = 199;
        break;
      case 'professional':
        basePrice = 499;
        break;
      case 'enterprise':
        basePrice = 999;
        break;
      default:
        basePrice = 199;
    }

    if (urgencyLevel === 'expedited') {
      return Math.round(basePrice * 1.5);
    } else if (urgencyLevel === 'rush') {
      return Math.round(basePrice * 2);
    }
    
    return basePrice;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      const isValidType = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/tiff'
      ].includes(file.type);
      
      return isValidSize && isValidType;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Some files were rejected. Please upload PDF, DOC, DOCX, JPG, PNG, or TIFF files under 50MB.",
        variant: "destructive"
      });
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (filingRequestId: string) => {
    const uploadedPaths: string[] = [];
    
    for (const file of selectedFiles) {
      const fileName = `${filingRequestId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('government-filings')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading file:', error);
        throw new Error(`Failed to upload ${file.name}`);
      }

      uploadedPaths.push(data.path);
    }

    return uploadedPaths;
  };

  const onSubmit = async (data: FilingFormData) => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one document to file.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create Stripe checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'government-filing-checkout',
        {
          body: data
        }
      );

      if (checkoutError) throw checkoutError;

      // Upload files to the filing request
      if (checkoutData.filing_request_id) {
        const uploadedPaths = await uploadFiles(checkoutData.filing_request_id);
        
        // Update filing request with document paths
        await supabase
          .from('government_filing_requests')
          .update({ document_paths: uploadedPaths })
          .eq('id', checkoutData.filing_request_id);
      }

      // Redirect to Stripe checkout
      if (checkoutData.url) {
        window.open(checkoutData.url, '_blank');
      }

      toast({
        title: "Filing Request Created",
        description: "Your filing request has been created. Complete payment to proceed.",
      });

      // Reset form
      form.reset();
      setSelectedFiles([]);
      
      // Refresh filing requests
      fetchFilingRequests();

    } catch (error) {
      console.error('Error creating filing request:', error);
      toast({
        title: "Error",
        description: "Failed to create filing request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPrice = getPricing(userSubscription?.plan_id, form.watch('urgencyLevel'));

  return (
    <div className="space-y-8">
      {/* Live Service Notice */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Live Service:</strong> Government filings are now processed and sent via secure email to the appropriate agencies. 
          All documents are filed with real government authorities and you will receive confirmation emails.
        </AlertDescription>
      </Alert>
      {/* Service Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle className="text-2xl text-blue-900">Government Filing Service</CardTitle>
              <p className="text-blue-700 mt-1">
                Professional document filing for trademarks, copyrights, business licenses, and more
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Expert filing assistance</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-sm">Expedited processing available</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm">Compliance guaranteed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Alert */}
      <Alert>
        <CreditCard className="h-4 w-4" />
        <AlertDescription>
          <strong>Current Pricing:</strong> ${currentPrice} for {form.watch('urgencyLevel')} processing
          {form.watch('urgencyLevel') !== 'standard' && (
            <span className="text-orange-600 ml-2">
              ({form.watch('urgencyLevel')} processing includes additional fees)
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Filing Form */}
      <Card>
        <CardHeader>
          <CardTitle>New Government Filing Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Filing Type */}
            <div>
              <Label htmlFor="filingType">Filing Type *</Label>
              <Select 
                value={form.watch('filingType')} 
                onValueChange={(value) => form.setValue('filingType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select filing type" />
                </SelectTrigger>
                <SelectContent>
                  {FILING_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.filingType && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.filingType.message}</p>
              )}
            </div>

            {/* Document Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="documentTitle">Document Title *</Label>
                <Input
                  {...form.register('documentTitle')}
                  placeholder="e.g., TSMO Trademark Application"
                />
                {form.formState.errors.documentTitle && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.documentTitle.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="filingJurisdiction">Jurisdiction *</Label>
                <Select 
                  value={form.watch('filingJurisdiction')} 
                  onValueChange={(value) => form.setValue('filingJurisdiction', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {JURISDICTIONS.map((jurisdiction) => (
                      <SelectItem key={jurisdiction} value={jurisdiction}>{jurisdiction}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.filingJurisdiction && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.filingJurisdiction.message}</p>
                )}
              </div>
            </div>

            {/* Document Description */}
            <div>
              <Label htmlFor="documentDescription">Document Description</Label>
              <Textarea
                {...form.register('documentDescription')}
                placeholder="Brief description of the documents and filing purpose"
                rows={3}
              />
            </div>

            {/* Processing Urgency */}
            <div>
              <Label htmlFor="urgencyLevel">Processing Speed *</Label>
              <Select 
                value={form.watch('urgencyLevel')} 
                onValueChange={(value: 'standard' | 'expedited' | 'rush') => form.setValue('urgencyLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (10-15 business days)</SelectItem>
                  <SelectItem value="expedited">Expedited (5-7 business days) - +50%</SelectItem>
                  <SelectItem value="rush">Rush (1-3 business days) - +100%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  {...form.register('contactName')}
                  placeholder="Primary contact person"
                />
                {form.formState.errors.contactName && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.contactName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  {...form.register('contactEmail')}
                  type="email"
                  placeholder="contact@example.com"
                />
                {form.formState.errors.contactEmail && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.contactEmail.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                {...form.register('contactPhone')}
                placeholder="(555) 123-4567"
              />
            </div>

            {/* File Upload */}
            <div>
              <Label>Documents to File *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload PDF, DOC, DOCX, JPG, PNG, or TIFF files (max 50MB each)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Select Files
                  </Button>
                </Label>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>Selected Files:</Label>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Instructions */}
            <div>
              <Label htmlFor="additionalInstructions">Additional Instructions</Label>
              <Textarea
                {...form.register('additionalInstructions')}
                placeholder="Any specific requirements or special instructions for filing"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-lg font-semibold">
                Total: ${currentPrice}
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting || selectedFiles.length === 0}
                size="lg"
              >
                {isSubmitting ? (
                  "Creating Request..."
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Filing Requests */}
      {filingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Filing Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{request.document_title}</h4>
                      <p className="text-sm text-gray-600">{request.filing_type} - {request.filing_jurisdiction}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={
                        request.payment_status === 'paid' ? 'default' :
                        request.payment_status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {request.payment_status}
                      </Badge>
                      <Badge variant={
                        request.filing_status === 'completed' ? 'default' :
                        request.filing_status === 'filed' ? 'secondary' :
                        request.filing_status === 'in_review' ? 'outline' : 'secondary'
                      }>
                        {request.filing_status}
                      </Badge>
                    </div>
                  </div>
                  {request.tracking_number && (
                    <p className="text-sm mt-2 text-blue-600">
                      Tracking: {request.tracking_number}
                    </p>
                  )}
                  {request.admin_notes && (
                    <p className="text-sm mt-2 text-gray-600 bg-gray-50 p-2 rounded">
                      {request.admin_notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GovernmentFilingService;