-- Drop and recreate the tables to ensure clean state
DROP TABLE IF EXISTS public.ai_agent_deployments CASCADE;
DROP TABLE IF EXISTS public.ai_monitoring_agents CASCADE;
DROP TABLE IF EXISTS public.ai_threat_detections CASCADE;
DROP TABLE IF EXISTS public.ai_protection_rate_limits CASCADE;

-- Create tables for AI agent network functionality
CREATE TABLE public.ai_agent_deployments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    deployment_status TEXT NOT NULL DEFAULT 'pending',
    platforms_requested TEXT[] NOT NULL,
    agents_deployed INTEGER DEFAULT 0,
    config JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for monitoring agents
CREATE TABLE public.ai_monitoring_agents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    platform_id TEXT NOT NULL,
    platform_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'inactive',
    scan_frequency INTEGER DEFAULT 60,
    threats_detected INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    last_scan TIMESTAMP WITH TIME ZONE,
    agent_config JSONB,
    performance_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for threat detections
CREATE TABLE public.ai_threat_detections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    agent_id UUID REFERENCES public.ai_monitoring_agents(id),
    platform TEXT NOT NULL,
    threat_type TEXT NOT NULL,
    threat_level TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    threat_data JSONB,
    source_url TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for rate limiting
CREATE TABLE public.ai_protection_rate_limits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    endpoint TEXT NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, endpoint, window_start)
);

-- Enable RLS
ALTER TABLE public.ai_agent_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_monitoring_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_threat_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_protection_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own agent deployments" 
ON public.ai_agent_deployments 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own monitoring agents" 
ON public.ai_monitoring_agents 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own threat detections" 
ON public.ai_threat_detections 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own rate limits" 
ON public.ai_protection_rate_limits 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_ai_agent_deployments_user_id ON public.ai_agent_deployments(user_id);
CREATE INDEX idx_ai_monitoring_agents_user_id ON public.ai_monitoring_agents(user_id);
CREATE INDEX idx_ai_monitoring_agents_platform ON public.ai_monitoring_agents(platform_id);
CREATE INDEX idx_ai_threat_detections_user_id ON public.ai_threat_detections(user_id);
CREATE INDEX idx_ai_threat_detections_agent_id ON public.ai_threat_detections(agent_id);
CREATE INDEX idx_ai_protection_rate_limits_user_endpoint ON public.ai_protection_rate_limits(user_id, endpoint);