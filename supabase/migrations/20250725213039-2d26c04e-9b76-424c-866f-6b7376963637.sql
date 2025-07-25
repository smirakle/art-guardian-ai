-- Create table for tracking legal template purchases
CREATE TABLE public.template_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  template_title TEXT NOT NULL,
  amount_paid INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  stripe_session_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  purchased_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.template_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view their own template purchases" 
ON public.template_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

-- System can create purchases (for checkout process)
CREATE POLICY "System can create template purchases" 
ON public.template_purchases 
FOR INSERT 
WITH CHECK (true);

-- System can update purchases (for payment status updates)
CREATE POLICY "System can update template purchases" 
ON public.template_purchases 
FOR UPDATE 
USING (true);

-- Create function to check if user has an active subscription/membership
CREATE OR REPLACE FUNCTION public.user_has_membership(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  -- Check if user has any active subscription from pricing plans
  -- For now, we'll check if they have any successful payment history as a simple membership check
  -- In a real system, this would check subscription status from a subscriptions table
  SELECT EXISTS (
    SELECT 1 FROM public.template_purchases 
    WHERE user_id = _user_id 
    AND status = 'completed'
    AND purchased_at > now() - interval '30 days' -- Consider as member if purchased within 30 days
  );
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_template_purchases_updated_at
  BEFORE UPDATE ON public.template_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();