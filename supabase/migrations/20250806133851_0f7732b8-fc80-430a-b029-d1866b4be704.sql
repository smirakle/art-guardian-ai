-- Create compliance_reminders table with proper relationship to legal_compliance_tracking
CREATE TABLE IF NOT EXISTS public.compliance_reminders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    compliance_tracking_id UUID NOT NULL REFERENCES public.legal_compliance_tracking(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('deadline_warning', 'deadline_past', 'response_required', 'follow_up')),
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    reminder_count INTEGER NOT NULL DEFAULT 0,
    email_sent BOOLEAN NOT NULL DEFAULT false,
    notification_sent BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.compliance_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for compliance_reminders
CREATE POLICY "Users can view their own compliance reminders" 
ON public.compliance_reminders 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.legal_compliance_tracking lct 
        WHERE lct.id = compliance_reminders.compliance_tracking_id 
        AND lct.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create their own compliance reminders" 
ON public.compliance_reminders 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.legal_compliance_tracking lct 
        WHERE lct.id = compliance_reminders.compliance_tracking_id 
        AND lct.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own compliance reminders" 
ON public.compliance_reminders 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.legal_compliance_tracking lct 
        WHERE lct.id = compliance_reminders.compliance_tracking_id 
        AND lct.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own compliance reminders" 
ON public.compliance_reminders 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.legal_compliance_tracking lct 
        WHERE lct.id = compliance_reminders.compliance_tracking_id 
        AND lct.user_id = auth.uid()
    )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_compliance_reminders_updated_at
BEFORE UPDATE ON public.compliance_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_compliance_reminders_tracking_id ON public.compliance_reminders(compliance_tracking_id);
CREATE INDEX idx_compliance_reminders_scheduled_for ON public.compliance_reminders(scheduled_for);
CREATE INDEX idx_compliance_reminders_active ON public.compliance_reminders(is_active) WHERE is_active = true;