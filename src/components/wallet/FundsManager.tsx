import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { moonPayService } from '@/lib/services/moonpay-service';
import { useAccount } from 'wagmi';
import { Loader2, ExternalLink, DollarSign, ArrowRight } from 'lucide-react';

interface FundsManagerProps {
  onFundingComplete?: () => void;
}

const MOONPAY_API_KEY = 'pk_test_123'; // TODO: Move to env/config

export function FundsManager({ onFundingComplete }: FundsManagerProps) {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>('100');
  const [currency, setCurrency] = useState<string>('ETH');
  const [loading, setLoading] = useState(false);
  const [supportedCurrencies, setSupportedCurrencies] = useState<Array<{
    code: string;
    name: string;
    type: string;
    minBuyAmount?: number;
    maxBuyAmount?: number;
  }>>([]);

  useEffect(() => {
    loadSupportedCurrencies();
  }, []);

  const loadSupportedCurrencies = async () => {
    try {
      const currencies = await moonPayService.getSupportedCurrencies();
      setSupportedCurrencies(currencies.filter(c => c.type === 'crypto'));
    } catch (error) {
      console.error('Failed to load currencies:', error);
    }
  };

  const handlePurchase = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const selectedCurrency = supportedCurrencies.find(c => c.code === currency);
    if (selectedCurrency) {
      if (selectedCurrency.minBuyAmount && amountNum < selectedCurrency.minBuyAmount) {
        toast({
          title: "Amount Too Low",
          description: `Minimum purchase is $${selectedCurrency.minBuyAmount}`,
          variant: "destructive",
        });
        return;
      }
      if (selectedCurrency.maxBuyAmount && amountNum > selectedCurrency.maxBuyAmount) {
        toast({
          title: "Amount Too High",
          description: `Maximum purchase is $${selectedCurrency.maxBuyAmount}`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setLoading(true);

      // Generate MoonPay widget URL
      const widgetUrl = moonPayService.generateWidgetUrl({
        walletAddress: address,
        cryptoCurrency: currency,
        baseCurrencyAmount: amountNum,
        baseCurrencyCode: 'USD',
        colorCode: '6366f1', // Indigo color
        redirectURL: window.location.origin + '/wallet',
      });

      // Track transaction initiation
      await moonPayService.trackTransaction({
        externalTransactionId: `pending-${Date.now()}`,
        status: 'pending',
        currency: 'USD',
        cryptoCurrency: currency,
        fiatAmount: amountNum,
        fiatCurrency: 'USD',
        walletAddress: address,
      });

      // Open MoonPay widget in new window
      const width = 500;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      window.open(
        widgetUrl,
        'MoonPay',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      toast({
        title: "Purchase Window Opened",
        description: "Complete your purchase in the MoonPay window",
      });

      onFundingComplete?.();
    } catch (error) {
      console.error('Failed to initiate purchase:', error);
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Failed to initiate purchase",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Add Funds via MoonPay
        </CardTitle>
        <CardDescription>
          Purchase crypto directly to your wallet using credit card or bank transfer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Connect your wallet to add funds</p>
            <Button disabled>
              Connect Wallet First
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="currency">Cryptocurrency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  {supportedCurrencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.name} ({curr.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                min="30"
                max="50000"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount in USD"
              />
              <p className="text-xs text-muted-foreground">
                Min: $30 | Max: $50,000
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
              <span>Powered by MoonPay</span>
            </div>

            <Button 
              onClick={handlePurchase} 
              disabled={loading || !isConnected}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening MoonPay...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Purchase Crypto
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              You'll be redirected to MoonPay to complete your purchase securely
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
