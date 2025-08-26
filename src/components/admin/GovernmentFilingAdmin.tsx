import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Eye, Edit, FileText, Clock, DollarSign, User, Building2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface FilingRequest {
  id: string;
  user_id: string;
  filing_type: string;
  document_title: string;
  document_description?: string;
  document_paths: any; // JSON field from Supabase
  filing_jurisdiction: string;
  urgency_level: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  additional_instructions?: string;
  filing_fee_paid: boolean;
  amount_paid: number;
  payment_status: string;
  filing_status: string;
  admin_notes?: string;
  filed_at?: string;
  filed_by?: string;
  tracking_number?: string;
  government_response?: any;
  created_at: string;
  updated_at: string;
}

const GovernmentFilingAdmin: React.FC = () => {
  const [filingRequests, setFilingRequests] = useState<FilingRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<FilingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [editingNotes, setEditingNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchFilingRequests();
  }, []);

  const fetchFilingRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('government_filing_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFilingRequests(data || []);
    } catch (error) {
      console.error('Error fetching filing requests:', error);
      toast({
        title: "Error",
        description: "Failed to load filing requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('government-filings')
        .download(filePath);

      if (error) throw error;

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  };

  const updateFilingStatus = async (requestId: string, status: string, notes?: string, tracking?: string) => {
    try {
      const updateData: any = {
        filing_status: status,
        updated_at: new Date().toISOString()
      };

      if (notes) updateData.admin_notes = notes;
      if (tracking) updateData.tracking_number = tracking;
      if (status === 'filed' || status === 'completed') {
        updateData.filed_at = new Date().toISOString();
        updateData.filed_by = 'admin';
      }

      const { error } = await supabase
        .from('government_filing_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      // Create notification for user
      const request = filingRequests.find(r => r.id === requestId);
      if (request) {
        await supabase
          .from('legal_notifications')
          .insert({
            user_id: request.user_id,
            notification_type: 'government_filing_status_update',
            title: 'Government Filing Status Update',
            message: `Your filing "${request.document_title}" status has been updated to: ${status}${tracking ? `. Tracking number: ${tracking}` : ''}`,
            priority: 'normal'
          });
      }

      toast({
        title: "Success",
        description: "Filing status updated successfully",
      });

      fetchFilingRequests();
      setSelectedRequest(null);
      setEditingNotes(false);
      setAdminNotes('');
      setTrackingNumber('');
      setNewStatus('');
    } catch (error) {
      console.error('Error updating filing status:', error);
      toast({
        title: "Error",
        description: "Failed to update filing status",
        variant: "destructive"
      });
    }
  };

  const sendActualFiling = async (requestId: string) => {
    try {
      const request = filingRequests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');

      // Call government filing automation with actual filing
      const { data, error } = await supabase.functions.invoke('government-filing-automation', {
        body: {
          documentId: request.id,
          filingType: request.filing_type,
          jurisdiction: request.filing_jurisdiction,
          urgency: request.urgency_level,
          autoFile: true
        }
      });

      if (error) throw error;

      toast({
        title: "Filing Sent",
        description: `Government filing has been sent via email. Reference: ${data.referenceNumber}`,
      });

      // Update local status
      await updateFilingStatus(requestId, 'filed', 'Filed via automated system', data.referenceNumber);
      
    } catch (error) {
      console.error('Error sending filing:', error);
      toast({
        title: "Filing Failed",
        description: "Failed to send filing to government agency",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'filed':
        return 'bg-blue-100 text-blue-800';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = filingRequests.filter(request => {
    const statusMatch = statusFilter === 'all' || request.filing_status === statusFilter;
    const paymentMatch = paymentFilter === 'all' || request.payment_status === paymentFilter;
    return statusMatch && paymentMatch;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Government Filing Administration</h1>
          <p className="text-muted-foreground">Manage and process government filing requests</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            {filteredRequests.length} requests
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="filed">Filed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filing Requests */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{request.document_title}</h3>
                    <Badge className={getStatusColor(request.filing_status)}>
                      {request.filing_status}
                    </Badge>
                    <Badge className={getPaymentStatusColor(request.payment_status)}>
                      {request.payment_status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{request.filing_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{request.filing_jurisdiction}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{request.urgency_level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${(request.amount_paid / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{request.contact_name} ({request.contact_email})</span>
                    </div>
                    <span>•</span>
                    <span>Created {format(new Date(request.created_at), 'MMM dd, yyyy')}</span>
                  </div>

                  {request.tracking_number && (
                    <div className="text-sm">
                      <strong>Tracking:</strong> {request.tracking_number}
                    </div>
                  )}

                  {request.admin_notes && (
                    <div className="bg-muted p-3 rounded text-sm">
                      <strong>Admin Notes:</strong> {request.admin_notes}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Filing Request Details</DialogTitle>
                      </DialogHeader>
                      
                      {selectedRequest && (
                        <div className="space-y-6">
                          {/* Basic Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Document Title</Label>
                              <p className="font-medium">{selectedRequest.document_title}</p>
                            </div>
                            <div>
                              <Label>Filing Type</Label>
                              <p>{selectedRequest.filing_type}</p>
                            </div>
                            <div>
                              <Label>Jurisdiction</Label>
                              <p>{selectedRequest.filing_jurisdiction}</p>
                            </div>
                            <div>
                              <Label>Urgency Level</Label>
                              <p className="capitalize">{selectedRequest.urgency_level}</p>
                            </div>
                          </div>

                          {/* Description */}
                          {selectedRequest.document_description && (
                            <div>
                              <Label>Description</Label>
                              <p className="bg-muted p-3 rounded">{selectedRequest.document_description}</p>
                            </div>
                          )}

                          {/* Contact Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Contact Name</Label>
                              <p>{selectedRequest.contact_name}</p>
                            </div>
                            <div>
                              <Label>Contact Email</Label>
                              <p>{selectedRequest.contact_email}</p>
                            </div>
                          </div>

                          {/* Documents */}
                          <div>
                            <Label>Uploaded Documents</Label>
                            <div className="space-y-2 mt-2">
                              {Array.isArray(selectedRequest.document_paths) && selectedRequest.document_paths.map((path, index) => (
                                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                                  <span className="text-sm">Document {index + 1}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadDocument(path, `document-${index + 1}`)}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              ))}
                              {(!Array.isArray(selectedRequest.document_paths) || selectedRequest.document_paths.length === 0) && (
                                <p className="text-sm text-muted-foreground">No documents uploaded</p>
                              )}
                            </div>
                          </div>

                          {/* Additional Instructions */}
                          {selectedRequest.additional_instructions && (
                            <div>
                              <Label>Additional Instructions</Label>
                              <p className="bg-muted p-3 rounded">{selectedRequest.additional_instructions}</p>
                            </div>
                          )}

                          {/* Status Update */}
                          <div className="border-t pt-4">
                            <div className="flex gap-4 mb-4">
                              <div className="flex-1">
                                <Label>Update Status</Label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select new status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="received">Received</SelectItem>
                                    <SelectItem value="in_review">In Review</SelectItem>
                                    <SelectItem value="filed">Filed</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex-1">
                                <Label>Tracking Number</Label>
                                <Input
                                  value={trackingNumber}
                                  onChange={(e) => setTrackingNumber(e.target.value)}
                                  placeholder="Enter tracking number"
                                />
                              </div>
                            </div>

                            <div className="mb-4">
                              <Label>Admin Notes</Label>
                              <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add notes about this filing request"
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => updateFilingStatus(
                                  selectedRequest.id,
                                  newStatus || selectedRequest.filing_status,
                                  adminNotes || selectedRequest.admin_notes,
                                  trackingNumber || selectedRequest.tracking_number
                                )}
                                disabled={!newStatus && !adminNotes && !trackingNumber}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Update Filing
                              </Button>
                              
                              {selectedRequest.filing_status === 'received' && selectedRequest.payment_status === 'paid' && (
                                <Button
                                  onClick={() => sendActualFiling(selectedRequest.id)}
                                  variant="destructive"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Send Filing Now
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Filing Requests</h3>
            <p className="text-muted-foreground">
              No government filing requests found matching your filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GovernmentFilingAdmin;