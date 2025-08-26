import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DeliveryStatus {
  id: string;
  filing_type: string;
  document_title: string;
  filing_jurisdiction: string;
  filing_status: string;
  contact_email: string;
  created_at: string;
  filed_at?: string;
  tracking_number?: string;
  delivery_attempts?: number;
  last_delivery_error?: string;
  government_response?: any;
}

const FilingDeliveryMonitor: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeliveryStatus();
  }, []);

  const fetchDeliveryStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('government_filing_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error) {
      console.error('Error fetching delivery status:', error);
      toast({
        title: "Error",
        description: "Failed to load delivery status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshDeliveryStatus = async () => {
    setRefreshing(true);
    await fetchDeliveryStatus();
    setRefreshing(false);
  };

  const retryFailedDelivery = async (deliveryId: string) => {
    try {
      const { error } = await supabase.functions.invoke('government-filing-automation', {
        body: {
          documentId: deliveryId,
          filingType: 'retry_delivery',
          autoFile: true
        }
      });

      if (error) throw error;

      toast({
        title: "Retry Initiated",
        description: "Delivery retry has been initiated",
      });

      await fetchDeliveryStatus();
    } catch (error) {
      console.error('Error retrying delivery:', error);
      toast({
        title: "Retry Failed",
        description: "Failed to retry delivery",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string, hasError: boolean) => {
    if (hasError) return <XCircle className="h-4 w-4 text-red-500" />;
    
    switch (status) {
      case 'completed':
      case 'filed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string, hasError: boolean) => {
    if (hasError) return 'bg-red-100 text-red-800';
    
    switch (status) {
      case 'completed':
      case 'filed':
        return 'bg-green-100 text-green-800';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryMetrics = () => {
    const total = deliveries.length;
    const successful = deliveries.filter(d => ['filed', 'completed'].includes(d.filing_status)).length;
    const failed = deliveries.filter(d => d.last_delivery_error || d.filing_status === 'failed').length;
    const pending = deliveries.filter(d => ['received', 'in_review'].includes(d.filing_status)).length;
    
    return { total, successful, failed, pending };
  };

  const metrics = getDeliveryMetrics();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{metrics.total}</div>
            <div className="text-sm text-muted-foreground">Total Filings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{metrics.successful}</div>
            <div className="text-sm text-muted-foreground">Successful</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{metrics.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{metrics.failed}</div>
            <div className="text-sm text-muted-foreground">Failed/Errors</div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Monitor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filing Delivery Monitor</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshDeliveryStatus}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveries.map((delivery) => {
              const hasError = !!delivery.last_delivery_error;
              return (
                <div key={delivery.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(delivery.filing_status, hasError)}
                        <h3 className="font-semibold">{delivery.document_title}</h3>
                        <Badge className={getStatusColor(delivery.filing_status, hasError)}>
                          {hasError ? 'Delivery Error' : delivery.filing_status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <strong>Type:</strong> {delivery.filing_type}
                        </div>
                        <div>
                          <strong>Jurisdiction:</strong> {delivery.filing_jurisdiction}
                        </div>
                        <div>
                          <strong>Contact:</strong> {delivery.contact_email}
                        </div>
                        <div>
                          <strong>Created:</strong> {format(new Date(delivery.created_at), 'MMM dd, yyyy')}
                        </div>
                      </div>

                      {delivery.tracking_number && (
                        <div className="text-sm">
                          <strong>Tracking:</strong> {delivery.tracking_number}
                        </div>
                      )}

                      {delivery.filed_at && (
                        <div className="text-sm text-green-600">
                          <strong>Filed:</strong> {format(new Date(delivery.filed_at), 'MMM dd, yyyy HH:mm')}
                        </div>
                      )}

                      {hasError && (
                        <div className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                          <div className="flex items-center gap-2 text-red-800">
                            <AlertTriangle className="h-4 w-4" />
                            <strong>Delivery Error:</strong>
                          </div>
                          <div className="text-red-700 mt-1">{delivery.last_delivery_error}</div>
                          {delivery.delivery_attempts && (
                            <div className="text-red-600 text-xs mt-1">
                              Attempts: {delivery.delivery_attempts}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {hasError && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryFailedDelivery(delivery.id)}
                        >
                          Retry
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {deliveries.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No filing deliveries found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FilingDeliveryMonitor;