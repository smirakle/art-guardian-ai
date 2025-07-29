-- Create custom integrations table for enterprise users
CREATE TABLE public.custom_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('webhook', 'api', 'export')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  endpoint_url TEXT,
  api_key TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.custom_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own integrations" 
ON public.custom_integrations 
FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_custom_integrations_updated_at
BEFORE UPDATE ON public.custom_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();