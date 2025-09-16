-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'custom',
  subject_template TEXT NOT NULL,
  content_template TEXT NOT NULL,
  thumbnail_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unsubscribe preferences table
CREATE TABLE public.email_unsubscribe_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL,
  user_id UUID NOT NULL,
  unsubscribed_from JSONB NOT NULL DEFAULT '{}',
  preferences JSONB NOT NULL DEFAULT '{}',
  unsubscribe_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add template_id to email campaigns
ALTER TABLE public.email_campaigns 
ADD COLUMN template_id UUID REFERENCES public.email_templates(id);

-- Add unsubscribe_token to email_subscribers 
ALTER TABLE public.email_subscribers 
ADD COLUMN unsubscribe_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex');

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_unsubscribe_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for email_templates
CREATE POLICY "Users can manage their own templates" 
ON public.email_templates 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates" 
ON public.email_templates 
FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

-- Create policies for unsubscribe preferences
CREATE POLICY "Users can manage unsubscribe preferences for their subscribers" 
ON public.email_unsubscribe_preferences 
FOR ALL 
USING (auth.uid() = user_id);

-- Create function to update template usage count
CREATE OR REPLACE FUNCTION public.increment_template_usage(template_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.email_templates 
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = template_id_param;
END;
$$;

-- Create trigger to update updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_unsubscribe_preferences_updated_at
BEFORE UPDATE ON public.email_unsubscribe_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();