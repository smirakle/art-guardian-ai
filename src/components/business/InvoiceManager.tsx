import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  FileText, 
  Download, 
  Send, 
  Eye,
  Search,
  Filter,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  description: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  payment_method?: string;
  notes?: string;
}

const InvoiceManager: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      // Mock invoice data - replace with real data from Supabase
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoice_number: 'INV-2024-001',
          customer_name: 'Creative Studios LLC',
          customer_email: 'billing@creativestudios.com',
          amount: 299.99,
          currency: 'USD',
          status: 'paid',
          issue_date: '2024-01-15',
          due_date: '2024-02-15',
          description: 'Professional Plan Subscription',
          line_items: [
            {
              description: 'TSMO Professional Plan (Monthly)',
              quantity: 1,
              unit_price: 299.99,
              total: 299.99
            }
          ],
          payment_method: 'Credit Card',
          notes: 'Thank you for your business!'
        },
        {
          id: '2',
          invoice_number: 'INV-2024-002',
          customer_name: 'Digital Art Collective',
          customer_email: 'admin@digitalart.org',
          amount: 1999.99,
          currency: 'USD',
          status: 'sent',
          issue_date: '2024-01-20',
          due_date: '2024-02-20',
          description: 'Enterprise Plan Subscription',
          line_items: [
            {
              description: 'TSMO Enterprise Plan (Annual)',
              quantity: 1,
              unit_price: 1999.99,
              total: 1999.99
            }
          ],
          notes: 'Annual enterprise subscription'
        },
        {
          id: '3',
          invoice_number: 'INV-2024-003',
          customer_name: 'Independent Artist',
          customer_email: 'artist@example.com',
          amount: 79.99,
          currency: 'USD',
          status: 'overdue',
          issue_date: '2023-12-15',
          due_date: '2024-01-15',
          description: 'Starter Plan Subscription',
          line_items: [
            {
              description: 'TSMO Starter Plan (Monthly)',
              quantity: 1,
              unit_price: 79.99,
              total: 79.99
            }
          ]
        }
      ];

      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (subscriptionData: any) => {
    try {
      // Generate invoice PDF and send via email
      const { error } = await supabase.functions.invoke('generate-invoice', {
        body: subscriptionData
      });

      if (error) throw error;

      await loadInvoices(); // Refresh list
    } catch (error) {
      console.error('Failed to generate invoice:', error);
    }
  };

  const sendInvoice = async (invoice: Invoice) => {
    try {
      const { error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          invoice_id: invoice.id,
          customer_email: invoice.customer_email,
          invoice_number: invoice.invoice_number
        }
      });

      if (error) throw error;

      // Update status to sent
      setInvoices(invoices.map(inv => 
        inv.id === invoice.id 
          ? { ...inv, status: 'sent' as const }
          : inv
      ));
    } catch (error) {
      console.error('Failed to send invoice:', error);
    }
  };

  const downloadInvoice = async (invoice: Invoice) => {
    try {
      // Generate and download PDF
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { invoice_id: invoice.id }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download invoice:', error);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'sent':
        return <Send className="w-4 h-4 text-blue-500" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmount = invoices
    .filter(inv => inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueAmount = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoice Manager</h1>
          <p className="text-muted-foreground">
            Manage billing and invoice generation
          </p>
        </div>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue, 'USD')}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{formatCurrency(pendingAmount, 'USD')}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{formatCurrency(overdueAmount, 'USD')}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(invoice.status)}
                  <div>
                    <p className="font-medium">{invoice.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.customer_name} • {invoice.customer_email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(invoice.amount, invoice.currency)}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInvoice(invoice)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Invoice Details</DialogTitle>
                        </DialogHeader>
                        {selectedInvoice && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Invoice Number</p>
                                <p className="font-medium">{selectedInvoice.invoice_number}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge className={getStatusColor(selectedInvoice.status)}>
                                  {selectedInvoice.status}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Customer</p>
                                <p className="font-medium">{selectedInvoice.customer_name}</p>
                                <p className="text-sm text-muted-foreground">{selectedInvoice.customer_email}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="font-medium text-lg">
                                  {formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Line Items</p>
                              <div className="border rounded-lg">
                                {selectedInvoice.line_items.map((item, index) => (
                                  <div key={index} className="flex justify-between p-3 border-b last:border-b-0">
                                    <div>
                                      <p className="font-medium">{item.description}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Qty: {item.quantity} × {formatCurrency(item.unit_price, selectedInvoice.currency)}
                                      </p>
                                    </div>
                                    <p className="font-medium">
                                      {formatCurrency(item.total, selectedInvoice.currency)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadInvoice(invoice)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    {invoice.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendInvoice(invoice)}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceManager;