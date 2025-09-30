-- Create table for tracking MoonPay transactions
CREATE TABLE IF NOT EXISTS public.moonpay_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  external_transaction_id TEXT NOT NULL,
  status TEXT NOT NULL,
  currency TEXT NOT NULL,
  crypto_currency TEXT NOT NULL,
  crypto_amount DECIMAL,
  fiat_amount DECIMAL NOT NULL,
  fiat_currency TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.moonpay_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own MoonPay transactions" 
ON public.moonpay_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MoonPay transactions" 
ON public.moonpay_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_moonpay_transactions_user_id ON public.moonpay_transactions(user_id);
CREATE INDEX idx_moonpay_transactions_external_id ON public.moonpay_transactions(external_transaction_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_moonpay_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_moonpay_transactions_timestamp
BEFORE UPDATE ON public.moonpay_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_moonpay_transactions_updated_at();