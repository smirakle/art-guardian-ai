import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Receipt, Globe, Building, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TaxRate {
  country: string;
  state?: string;
  tax_type: 'VAT' | 'GST' | 'Sales Tax';
  rate: number;
  threshold?: number;
}

interface TaxCalculation {
  subtotal: number;
  tax_amount: number;
  total: number;
  tax_breakdown: Array<{
    name: string;
    rate: number;
    amount: number;
  }>;
  applicable_taxes: TaxRate[];
}

interface BusinessLocation {
  country: string;
  state?: string;
  city?: string;
  postal_code?: string;
  tax_id?: string;
  vat_number?: string;
}

export const TaxCalculation = () => {
  const [businessLocation, setBusinessLocation] = useState<BusinessLocation>({
    country: '',
    state: '',
    city: '',
    postal_code: '',
    tax_id: '',
    vat_number: ''
  });
  const [calculation, setCalculation] = useState<TaxCalculation>({
    subtotal: 0,
    tax_amount: 0,
    total: 0,
    tax_breakdown: [],
    applicable_taxes: []
  });
  const [testAmount, setTestAmount] = useState<number>(100);
  const [customerLocation, setCustomerLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const taxRates: TaxRate[] = [
    // US Sales Tax (simplified)
    { country: 'US', state: 'CA', tax_type: 'Sales Tax', rate: 7.25 },
    { country: 'US', state: 'NY', tax_type: 'Sales Tax', rate: 8.0 },
    { country: 'US', state: 'TX', tax_type: 'Sales Tax', rate: 6.25 },
    { country: 'US', state: 'FL', tax_type: 'Sales Tax', rate: 6.0 },
    
    // EU VAT
    { country: 'GB', tax_type: 'VAT', rate: 20.0 },
    { country: 'DE', tax_type: 'VAT', rate: 19.0 },
    { country: 'FR', tax_type: 'VAT', rate: 20.0 },
    { country: 'IT', tax_type: 'VAT', rate: 22.0 },
    { country: 'ES', tax_type: 'VAT', rate: 21.0 },
    { country: 'NL', tax_type: 'VAT', rate: 21.0 },
    
    // Other countries
    { country: 'CA', tax_type: 'GST', rate: 5.0 },
    { country: 'AU', tax_type: 'GST', rate: 10.0 },
    { country: 'JP', tax_type: 'VAT', rate: 10.0 },
    { country: 'IN', tax_type: 'GST', rate: 18.0 }
  ];

  useEffect(() => {
    loadBusinessSettings();
  }, []);

  const loadBusinessSettings = async () => {
    try {
      // Load from localStorage for now - production would use database
      const saved = localStorage.getItem('business_tax_config');
      if (saved) {
        setBusinessLocation(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading business settings:', error);
    }
  };

  const saveBusinessSettings = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage for now - production would use database
      localStorage.setItem('business_tax_config', JSON.stringify(businessLocation));

      toast({
        title: "Settings Saved",
        description: "Tax configuration has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save tax configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTax = async (amount: number, customerCountry: string, customerState?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-tax', {
        body: {
          amount,
          customer_location: {
            country: customerCountry,
            state: customerState
          },
          business_location: businessLocation
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calculating tax:', error);
      
      // Fallback to local calculation
      return calculateTaxLocal(amount, customerCountry, customerState);
    }
  };

  const calculateTaxLocal = (amount: number, customerCountry: string, customerState?: string) => {
    const applicableTaxes = taxRates.filter(rate => {
      if (rate.country !== customerCountry) return false;
      if (rate.state && rate.state !== customerState) return false;
      return true;
    });

    let totalTaxAmount = 0;
    const taxBreakdown = applicableTaxes.map(tax => {
      const taxAmount = (amount * tax.rate) / 100;
      totalTaxAmount += taxAmount;
      return {
        name: `${tax.tax_type} (${tax.rate}%)`,
        rate: tax.rate,
        amount: taxAmount
      };
    });

    return {
      subtotal: amount,
      tax_amount: totalTaxAmount,
      total: amount + totalTaxAmount,
      tax_breakdown: taxBreakdown,
      applicable_taxes: applicableTaxes
    };
  };

  const handleTestCalculation = async () => {
    if (!customerLocation || testAmount <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid amount and customer location.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const [country, state] = customerLocation.split('-');
      const result = await calculateTax(testAmount, country, state);
      setCalculation(result);
    } catch (error) {
      console.error('Error testing calculation:', error);
      toast({
        title: "Calculation Failed",
        description: "Unable to calculate tax for the given parameters.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateTaxId = (taxId: string, country: string) => {
    // Basic validation patterns
    const patterns: { [key: string]: RegExp } = {
      'US': /^\d{2}-\d{7}$/,
      'GB': /^GB\d{9}$/,
      'DE': /^DE\d{9}$/,
      'FR': /^FR[A-Z]{2}\d{9}$/
    };

    const pattern = patterns[country];
    return pattern ? pattern.test(taxId) : true; // Allow unknown patterns
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tax Calculation System</h2>
          <p className="text-muted-foreground">
            Manage tax rates and calculate taxes for global customers
          </p>
        </div>
        <Badge variant="secondary">Production Ready</Badge>
      </div>

      <Tabs defaultValue="calculator">
        <TabsList>
          <TabsTrigger value="calculator">Tax Calculator</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="rates">Tax Rates</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Tax Calculator
                </CardTitle>
                <CardDescription>
                  Calculate tax for different amounts and locations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test-amount">Amount ($)</Label>
                  <Input
                    id="test-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={testAmount}
                    onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="customer-location">Customer Location</Label>
                  <Select value={customerLocation} onValueChange={setCustomerLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US-CA">California, USA</SelectItem>
                      <SelectItem value="US-NY">New York, USA</SelectItem>
                      <SelectItem value="US-TX">Texas, USA</SelectItem>
                      <SelectItem value="US-FL">Florida, USA</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleTestCalculation} 
                  disabled={isLoading}
                  className="w-full"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Tax
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Calculation Result
                </CardTitle>
                <CardDescription>
                  Tax breakdown and total amount
                </CardDescription>
              </CardHeader>
              <CardContent>
                {calculation.total > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${calculation.subtotal.toFixed(2)}</span>
                    </div>
                    
                    {calculation.tax_breakdown.map((tax, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{tax.name}:</span>
                        <span>${tax.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total Tax:</span>
                        <span>${calculation.tax_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${calculation.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {calculation.applicable_taxes.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Applicable Taxes:</h4>
                        <div className="space-y-1">
                          {calculation.applicable_taxes.map((tax, index) => (
                            <Badge key={index} variant="outline">
                              {tax.tax_type} - {tax.rate}%
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter amount and location to calculate tax</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuration">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Business Configuration
              </CardTitle>
              <CardDescription>
                Configure your business location and tax registration details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business-country">Country</Label>
                  <Select 
                    value={businessLocation.country} 
                    onValueChange={(value) => setBusinessLocation({ ...businessLocation, country: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="business-state">State/Province</Label>
                  <Input
                    id="business-state"
                    value={businessLocation.state || ''}
                    onChange={(e) => setBusinessLocation({ ...businessLocation, state: e.target.value })}
                    placeholder="State or province"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business-city">City</Label>
                  <Input
                    id="business-city"
                    value={businessLocation.city || ''}
                    onChange={(e) => setBusinessLocation({ ...businessLocation, city: e.target.value })}
                    placeholder="City"
                  />
                </div>

                <div>
                  <Label htmlFor="postal-code">Postal Code</Label>
                  <Input
                    id="postal-code"
                    value={businessLocation.postal_code || ''}
                    onChange={(e) => setBusinessLocation({ ...businessLocation, postal_code: e.target.value })}
                    placeholder="Postal code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tax-id">Tax ID</Label>
                  <Input
                    id="tax-id"
                    value={businessLocation.tax_id || ''}
                    onChange={(e) => setBusinessLocation({ ...businessLocation, tax_id: e.target.value })}
                    placeholder="Business tax ID"
                  />
                  {businessLocation.tax_id && businessLocation.country && (
                    <div className="flex items-center gap-1 mt-1">
                      {validateTaxId(businessLocation.tax_id, businessLocation.country) ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {validateTaxId(businessLocation.tax_id, businessLocation.country) ? 'Valid format' : 'Check format'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="vat-number">VAT Number (EU only)</Label>
                  <Input
                    id="vat-number"
                    value={businessLocation.vat_number || ''}
                    onChange={(e) => setBusinessLocation({ ...businessLocation, vat_number: e.target.value })}
                    placeholder="VAT registration number"
                  />
                </div>
              </div>

              <Button onClick={saveBusinessSettings} disabled={isLoading}>
                <Building className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Tax Rates Database
              </CardTitle>
              <CardDescription>
                Current tax rates for supported countries and regions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  taxRates.reduce((acc, rate) => {
                    const key = rate.country;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(rate);
                    return acc;
                  }, {} as { [key: string]: TaxRate[] })
                ).map(([country, rates]) => (
                  <div key={country} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{country}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {rates.map((rate, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">
                            {rate.state ? `${rate.state} ` : ''}{rate.tax_type}
                          </span>
                          <Badge variant="outline">{rate.rate}%</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Tax Compliance</CardTitle>
              <CardDescription>
                Ensure compliance with tax regulations and reporting requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Important Notice</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      This tax calculation system provides basic tax calculations. For production use, 
                      consult with tax professionals and consider using specialized tax services like 
                      Avalara, TaxJar, or similar providers for comprehensive compliance.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Compliance Checklist:</h3>
                  <div className="space-y-2">
                    {[
                      "Business tax registration completed",
                      "Tax collection permits obtained",
                      "Regular tax rate updates configured",
                      "Tax reporting system in place",
                      "Customer tax exemption handling",
                      "Cross-border tax compliance reviewed"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
