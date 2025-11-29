-- Create trademark monitoring waitlist table
CREATE TABLE public.trademark_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  use_case TEXT,
  priority_level TEXT DEFAULT 'standard',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trademark_waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own waitlist entries"
ON public.trademark_waitlist
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own waitlist entries"
ON public.trademark_waitlist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_trademark_waitlist_user_id ON public.trademark_waitlist(user_id);
CREATE INDEX idx_trademark_waitlist_status ON public.trademark_waitlist(status);

-- Add trigger for updated_at
CREATE TRIGGER update_trademark_waitlist_updated_at
BEFORE UPDATE ON public.trademark_waitlist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();