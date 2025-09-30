import { supabase } from "@/integrations/supabase/client";

interface MoonPayConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  defaultCurrency?: string;
}

interface MoonPayPurchaseParams {
  walletAddress: string;
  cryptoCurrency: string;
  baseCurrencyAmount?: number;
  baseCurrencyCode?: string;
  colorCode?: string;
  redirectURL?: string;
}

export class MoonPayService {
  private config: MoonPayConfig;
  private baseUrl: string;

  constructor(config: MoonPayConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production' 
      ? 'https://buy.moonpay.com'
      : 'https://buy-sandbox.moonpay.com';
  }

  /**
   * Generate a MoonPay widget URL for purchasing crypto
   */
  generateWidgetUrl(params: MoonPayPurchaseParams): string {
    const urlParams = new URLSearchParams({
      apiKey: this.config.apiKey,
      walletAddress: params.walletAddress,
      currencyCode: params.cryptoCurrency.toLowerCase(),
      ...(params.baseCurrencyAmount && { baseCurrencyAmount: params.baseCurrencyAmount.toString() }),
      ...(params.baseCurrencyCode && { baseCurrencyCode: params.baseCurrencyCode }),
      ...(params.colorCode && { colorCode: params.colorCode }),
      ...(params.redirectURL && { redirectURL: params.redirectURL }),
    });

    return `${this.baseUrl}?${urlParams.toString()}`;
  }

  /**
   * Track a MoonPay transaction in our database
   */
  async trackTransaction(data: {
    externalTransactionId: string;
    status: string;
    currency: string;
    cryptoCurrency: string;
    fiatAmount: number;
    fiatCurrency: string;
    walletAddress: string;
    cryptoAmount?: number;
  }) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('moonpay_transactions')
      .insert({
        user_id: session.session.user.id,
        external_transaction_id: data.externalTransactionId,
        status: data.status,
        currency: data.currency,
        crypto_currency: data.cryptoCurrency,
        crypto_amount: data.cryptoAmount,
        fiat_amount: data.fiatAmount,
        fiat_currency: data.fiatCurrency,
        wallet_address: data.walletAddress,
      });

    if (error) throw error;
  }

  /**
   * Get user's MoonPay transaction history
   */
  async getUserTransactions() {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('moonpay_transactions')
      .select('*')
      .eq('user_id', session.session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get supported currencies from MoonPay
   */
  async getSupportedCurrencies(): Promise<Array<{
    code: string;
    name: string;
    type: 'crypto' | 'fiat';
    minBuyAmount?: number;
    maxBuyAmount?: number;
  }>> {
    // In a real implementation, this would call MoonPay's API
    // For now, returning common currencies
    return [
      { code: 'ETH', name: 'Ethereum', type: 'crypto', minBuyAmount: 30, maxBuyAmount: 50000 },
      { code: 'BTC', name: 'Bitcoin', type: 'crypto', minBuyAmount: 30, maxBuyAmount: 50000 },
      { code: 'USDC', name: 'USD Coin', type: 'crypto', minBuyAmount: 30, maxBuyAmount: 50000 },
      { code: 'USDT', name: 'Tether', type: 'crypto', minBuyAmount: 30, maxBuyAmount: 50000 },
    ];
  }
}

// Export a configured instance
// Note: The API key should come from environment or be passed at runtime
export const moonPayService = new MoonPayService({
  apiKey: 'pk_test_key', // This will be replaced with actual key
  environment: 'sandbox',
  defaultCurrency: 'ETH',
});
