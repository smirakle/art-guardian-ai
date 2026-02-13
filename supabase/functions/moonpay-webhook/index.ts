import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, moonpay-signature',
};

interface MoonPayWebhookData {
  externalTransactionId: string;
  status: string;
  currency: {
    code: string;
  };
  baseCurrency: {
    code: string;
  };
  quoteCurrencyAmount: number;
  baseCurrencyAmount: number;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const moonpaySecretKey = Deno.env.get('MOONPAY_SECRET_KEY');

    if (!moonpaySecretKey) {
      console.error('MOONPAY_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify MoonPay signature
    const signature = req.headers.get('moonpay-signature');
    const body = await req.text();
    
    if (signature) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(moonpaySecretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
      const expectedSignature = Array.from(new Uint8Array(sig))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      if (signature !== expectedSignature) {
        console.error('Invalid MoonPay signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const webhookData: MoonPayWebhookData = JSON.parse(body);
    console.log('Processing MoonPay webhook:', webhookData.externalTransactionId, 'Status:', webhookData.status);

    // Find the transaction in our database
    const { data: transaction, error: fetchError } = await supabase
      .from('moonpay_transactions')
      .select('*')
      .eq('external_transaction_id', webhookData.externalTransactionId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      throw fetchError;
    }

    // Update or create transaction
    const transactionData = {
      external_transaction_id: webhookData.externalTransactionId,
      status: webhookData.status,
      currency: webhookData.baseCurrency.code,
      crypto_currency: webhookData.currency.code,
      crypto_amount: webhookData.quoteCurrencyAmount,
      fiat_amount: webhookData.baseCurrencyAmount,
      fiat_currency: webhookData.baseCurrency.code,
      wallet_address: webhookData.walletAddress,
      ...(webhookData.status === 'completed' && { completed_at: new Date().toISOString() }),
    };

    if (transaction) {
      // Update existing transaction
      const { error: updateError } = await supabase
        .from('moonpay_transactions')
        .update(transactionData)
        .eq('id', transaction.id);

      if (updateError) throw updateError;
      
      console.log('Updated transaction:', transaction.id);
    } else {
      // This shouldn't happen as transactions should be created when user initiates purchase
      // But we'll handle it anyway
      console.warn('Transaction not found in database, webhook received without prior record');
    }

    // Send notification to user if transaction completed or failed
    if (['completed', 'failed'].includes(webhookData.status) && transaction) {
      const notificationTitle = webhookData.status === 'completed' 
        ? 'Crypto Purchase Successful'
        : 'Crypto Purchase Failed';
      
      const notificationMessage = webhookData.status === 'completed'
        ? `Successfully purchased ${webhookData.quoteCurrencyAmount} ${webhookData.currency.code}`
        : `Your purchase of ${webhookData.currency.code} failed. Please try again.`;

      await supabase
        .from('ai_protection_notifications')
        .insert({
          user_id: transaction.user_id,
          notification_type: 'crypto_purchase',
          title: notificationTitle,
          message: notificationMessage,
          severity: webhookData.status === 'completed' ? 'info' : 'warning',
          action_url: '/wallet',
          metadata: {
            transaction_id: webhookData.externalTransactionId,
            crypto_amount: webhookData.quoteCurrencyAmount,
            crypto_currency: webhookData.currency.code,
            fiat_amount: webhookData.baseCurrencyAmount,
            fiat_currency: webhookData.baseCurrency.code,
          },
        });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing MoonPay webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
