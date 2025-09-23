-- Add metadata column to subscriptions table if it doesn't exist
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.subscriptions.metadata IS 'Additional metadata for subscriptions including beta activation details';