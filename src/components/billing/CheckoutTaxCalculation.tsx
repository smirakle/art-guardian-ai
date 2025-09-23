import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Receipt } from 'lucide-react';

interface TaxRate {
  country: string;
  state?: string;
  tax_type: 'VAT' | 'GST' | 'Sales Tax';
  rate: number;
}

interface TaxCalculationResult {
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

interface CheckoutTaxCalculationProps {
  subtotal: number;
  onTaxCalculated: (result: TaxCalculationResult) => void;
}

export const CheckoutTaxCalculation: React.FC<CheckoutTaxCalculationProps> = ({
  subtotal,
  onTaxCalculated
}) => {
  const [customerLocation, setCustomerLocation] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [taxResult, setTaxResult] = useState<TaxCalculationResult>({
    subtotal,
    tax_amount: 0,
    total: subtotal,
    tax_breakdown: [],
    applicable_taxes: []
  });

  const taxRates: TaxRate[] = [
    // US Sales Tax (simplified)
    { country: 'US', state: 'CA', tax_type: 'Sales Tax', rate: 7.25 },
    { country: 'US', state: 'NY', tax_type: 'Sales Tax', rate: 8.0 },
    { country: 'US', state: 'TX', tax_type: 'Sales Tax', rate: 6.25 },
    { country: 'US', state: 'FL', tax_type: 'Sales Tax', rate: 6.0 },
    { country: 'US', state: 'WA', tax_type: 'Sales Tax', rate: 6.5 },
    { country: 'US', state: 'IL', tax_type: 'Sales Tax', rate: 6.25 },
    { country: 'US', state: 'PA', tax_type: 'Sales Tax', rate: 6.0 },
    { country: 'US', state: 'OH', tax_type: 'Sales Tax', rate: 5.75 },
    
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
    { country: 'JP', tax_type: 'VAT', rate: 10.0 }
  ];

  useEffect(() => {
    calculateTax();
  }, [subtotal, customerLocation]);

  const calculateTax = () => {
    if (!customerLocation) {
      const result = {
        subtotal,
        tax_amount: 0,
        total: subtotal,
        tax_breakdown: [],
        applicable_taxes: []
      };
      setTaxResult(result);
      onTaxCalculated(result);
      return;
    }

    const [country, state] = customerLocation.split('-');
    
    const applicableTaxes = taxRates.filter(rate => {
      if (rate.country !== country) return false;
      if (rate.state && rate.state !== state) return false;
      return true;
    });

    let totalTaxAmount = 0;
    const taxBreakdown = applicableTaxes.map(tax => {
      const taxAmount = (subtotal * tax.rate) / 100;
      totalTaxAmount += taxAmount;
      return {
        name: `${tax.tax_type} (${tax.rate}%)`,
        rate: tax.rate,
        amount: taxAmount
      };
    });

    const result = {
      subtotal,
      tax_amount: totalTaxAmount,
      total: subtotal + totalTaxAmount,
      tax_breakdown: taxBreakdown,
      applicable_taxes: applicableTaxes
    };

    setTaxResult(result);
    onTaxCalculated(result);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="w-5 h-5 text-primary" />
        <h3 className="font-medium">Tax Calculation</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="tax-location">Billing Location *</Label>
          <Select value={customerLocation} onValueChange={setCustomerLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Select your location for tax calculation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No tax (International)</SelectItem>
              <SelectItem value="US-CA">California, USA</SelectItem>
              <SelectItem value="US-NY">New York, USA</SelectItem>
              <SelectItem value="US-TX">Texas, USA</SelectItem>
              <SelectItem value="US-FL">Florida, USA</SelectItem>
              <SelectItem value="US-WA">Washington, USA</SelectItem>
              <SelectItem value="US-IL">Illinois, USA</SelectItem>
              <SelectItem value="US-PA">Pennsylvania, USA</SelectItem>
              <SelectItem value="US-OH">Ohio, USA</SelectItem>
              <SelectItem value="GB">United Kingdom</SelectItem>
              <SelectItem value="DE">Germany</SelectItem>
              <SelectItem value="FR">France</SelectItem>
              <SelectItem value="IT">Italy</SelectItem>
              <SelectItem value="ES">Spain</SelectItem>
              <SelectItem value="NL">Netherlands</SelectItem>
              <SelectItem value="CA">Canada</SelectItem>
              <SelectItem value="AU">Australia</SelectItem>
              <SelectItem value="JP">Japan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {customerLocation && (
          <div>
            <Label htmlFor="postal-code">Postal/ZIP Code (Optional)</Label>
            <Input
              id="postal-code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Enter postal/ZIP code"
            />
          </div>
        )}
      </div>

      {/* Tax Summary */}
      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${taxResult.subtotal.toFixed(2)}</span>
          </div>
          
          {taxResult.tax_breakdown.map((tax, index) => (
            <div key={index} className="flex justify-between text-sm text-muted-foreground">
              <span>{tax.name}:</span>
              <span>${tax.amount.toFixed(2)}</span>
            </div>
          ))}
          
          {taxResult.tax_amount > 0 && (
            <div className="flex justify-between font-medium border-t pt-2">
              <span>Total Tax:</span>
              <span>${taxResult.tax_amount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>${taxResult.total.toFixed(2)}</span>
          </div>

          {taxResult.applicable_taxes.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-medium mb-2">Applied Taxes:</div>
              <div className="flex flex-wrap gap-1">
                {taxResult.applicable_taxes.map((tax, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tax.tax_type} {tax.rate}%
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!customerLocation && (
        <div className="text-sm text-muted-foreground">
          Select your billing location to calculate applicable taxes.
        </div>
      )}
    </div>
  );
};
