-- Enable real-time for legal tables
ALTER PUBLICATION supabase_realtime ADD TABLE legal_professionals;
ALTER PUBLICATION supabase_realtime ADD TABLE legal_actions; 
ALTER PUBLICATION supabase_realtime ADD TABLE legal_notifications;

-- Set REPLICA IDENTITY FULL for complete row data during updates
ALTER TABLE legal_professionals REPLICA IDENTITY FULL;
ALTER TABLE legal_actions REPLICA IDENTITY FULL;
ALTER TABLE legal_notifications REPLICA IDENTITY FULL;

-- Create real-time legal cases table
CREATE TABLE public.legal_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  professional_id UUID REFERENCES public.legal_professionals(id),
  case_type TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'normal',
  title TEXT NOT NULL,
  description TEXT,
  estimated_cost INTEGER,
  estimated_timeline TEXT,
  actual_cost INTEGER DEFAULT 0,
  time_spent_hours NUMERIC DEFAULT 0,
  documents JSONB DEFAULT '[]'::jsonb,
  communication_log JSONB DEFAULT '[]'::jsonb,
  next_action TEXT,
  next_action_due TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for legal cases
ALTER TABLE public.legal_cases ENABLE ROW LEVEL SECURITY;

-- Create policies for legal cases
CREATE POLICY "Users can view their own cases" 
ON public.legal_cases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Professionals can view assigned cases" 
ON public.legal_cases 
FOR SELECT 
USING (professional_id IN (
  SELECT id FROM public.legal_professionals 
  WHERE email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
));

CREATE POLICY "Users can create their own cases" 
ON public.legal_cases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update cases" 
ON public.legal_cases 
FOR UPDATE 
USING (true);

-- Create real-time messaging table
CREATE TABLE public.legal_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.legal_cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'professional', 'system')),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'status_update', 'system')),
  content TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_encrypted BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for legal messages
ALTER TABLE public.legal_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for legal messages
CREATE POLICY "Case participants can view messages" 
ON public.legal_messages 
FOR SELECT 
USING (
  case_id IN (
    SELECT id FROM public.legal_cases 
    WHERE user_id = auth.uid() 
    OR professional_id IN (
      SELECT id FROM public.legal_professionals 
      WHERE email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Case participants can create messages" 
ON public.legal_messages 
FOR INSERT 
WITH CHECK (
  case_id IN (
    SELECT id FROM public.legal_cases 
    WHERE user_id = auth.uid() 
    OR professional_id IN (
      SELECT id FROM public.legal_professionals 
      WHERE email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  )
);

-- Enable real-time for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE legal_cases;
ALTER PUBLICATION supabase_realtime ADD TABLE legal_messages;
ALTER TABLE legal_cases REPLICA IDENTITY FULL;
ALTER TABLE legal_messages REPLICA IDENTITY FULL;

-- Create trigger for updating updated_at
CREATE TRIGGER update_legal_cases_updated_at
  BEFORE UPDATE ON public.legal_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_messages_updated_at
  BEFORE UPDATE ON public.legal_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function for real-time case status updates
CREATE OR REPLACE FUNCTION public.update_case_status(
  case_id_param UUID,
  new_status TEXT,
  message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update case status
  UPDATE public.legal_cases 
  SET status = new_status, updated_at = now()
  WHERE id = case_id_param;
  
  -- Add system message if provided
  IF message IS NOT NULL THEN
    INSERT INTO public.legal_messages (
      case_id,
      sender_id,
      sender_type,
      message_type,
      content
    ) VALUES (
      case_id_param,
      auth.uid(),
      'system',
      'status_update',
      message
    );
  END IF;
  
  RETURN TRUE;
END;
$$;