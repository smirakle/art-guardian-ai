-- AI Company Policies Table - Stores verified information about AI companies' opt-out programs
CREATE TABLE public.ai_company_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  company_slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  respects_robots_txt BOOLEAN DEFAULT NULL,
  has_opt_out_program BOOLEAN DEFAULT NULL,
  opt_out_url TEXT,
  opt_out_effectiveness TEXT CHECK (opt_out_effectiveness IN ('effective', 'partial', 'ineffective', 'unknown', 'none')),
  crawler_name TEXT, -- e.g., 'GPTBot', 'CCBot', 'anthropic-ai'
  last_verified TIMESTAMPTZ DEFAULT now(),
  policy_sources JSONB DEFAULT '[]'::jsonb,
  legal_cases JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Robots.txt Monitoring Table - Track compliance checks for user websites
CREATE TABLE public.robots_txt_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  robots_txt_content TEXT,
  ai_crawlers_blocked TEXT[] DEFAULT '{}',
  missing_crawlers TEXT[] DEFAULT '{}',
  last_checked TIMESTAMPTZ DEFAULT now(),
  check_count INTEGER DEFAULT 1,
  compliance_status JSONB DEFAULT '{}'::jsonb,
  evidence_generated BOOLEAN DEFAULT false,
  evidence_pdf_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, domain)
);

-- Enable RLS
ALTER TABLE public.ai_company_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robots_txt_monitoring ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_company_policies (public read, admin write)
CREATE POLICY "Anyone can view AI company policies"
  ON public.ai_company_policies
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage AI company policies"
  ON public.ai_company_policies
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for robots_txt_monitoring (user-specific)
CREATE POLICY "Users can view their own robots.txt monitoring"
  ON public.robots_txt_monitoring
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own robots.txt monitoring"
  ON public.robots_txt_monitoring
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own robots.txt monitoring"
  ON public.robots_txt_monitoring
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own robots.txt monitoring"
  ON public.robots_txt_monitoring
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_ai_company_policies_slug ON public.ai_company_policies(company_slug);
CREATE INDEX idx_ai_company_policies_active ON public.ai_company_policies(is_active);
CREATE INDEX idx_robots_txt_monitoring_user ON public.robots_txt_monitoring(user_id);
CREATE INDEX idx_robots_txt_monitoring_domain ON public.robots_txt_monitoring(domain);

-- Trigger for updated_at
CREATE TRIGGER update_ai_company_policies_updated_at
  BEFORE UPDATE ON public.ai_company_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_robots_txt_monitoring_updated_at
  BEFORE UPDATE ON public.robots_txt_monitoring
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with real, verified AI company policy data
INSERT INTO public.ai_company_policies (company_name, company_slug, crawler_name, respects_robots_txt, has_opt_out_program, opt_out_url, opt_out_effectiveness, policy_sources, legal_cases, notes) VALUES
(
  'OpenAI',
  'openai',
  'GPTBot',
  true,
  false,
  NULL,
  'none',
  '[{"url": "https://platform.openai.com/docs/gptbot", "title": "GPTBot Documentation", "date": "2024-01"}, {"url": "https://arstechnica.com/ai/2025/01/openai-quietly-kills-promised-tool-that-detects-ai-images/", "title": "OpenAI kills promised detection tool", "date": "2025-01"}]'::jsonb,
  '[{"name": "NYT v. OpenAI", "status": "active", "filed": "2023-12"}]'::jsonb,
  'GPTBot respects robots.txt but no retroactive opt-out for training data already collected. Promised media manager tool was never delivered.'
),
(
  'Midjourney',
  'midjourney',
  NULL,
  false,
  false,
  NULL,
  'none',
  '[{"url": "https://docs.midjourney.com/docs/terms-of-service", "title": "Midjourney ToS", "date": "2024-01"}]'::jsonb,
  '[{"name": "Andersen v. Midjourney", "status": "active", "filed": "2023-01"}]'::jsonb,
  'No documented opt-out program. No known crawler to block. Artists have no way to prevent their work from being used.'
),
(
  'Stability AI',
  'stability-ai',
  'StabilityAI',
  true,
  true,
  'https://haveibeentrained.com',
  'partial',
  '[{"url": "https://stability.ai/legal", "title": "Stability AI Legal", "date": "2024-01"}, {"url": "https://haveibeentrained.com", "title": "Have I Been Trained", "date": "2024-01"}]'::jsonb,
  '[{"name": "Getty v. Stability AI", "status": "active", "filed": "2023-02"}]'::jsonb,
  'Partners with Have I Been Trained for opt-out. Only applies to future training, not existing models. LAION removal possible.'
),
(
  'Google',
  'google',
  'Google-Extended',
  true,
  true,
  'https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers',
  'effective',
  '[{"url": "https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers", "title": "Google Crawlers", "date": "2024-01"}]'::jsonb,
  '[]'::jsonb,
  'Google-Extended crawler can be blocked via robots.txt. Applies to Bard/Gemini training. Clear documentation available.'
),
(
  'Meta AI',
  'meta-ai',
  'Meta-ExternalAgent',
  true,
  true,
  'https://www.facebook.com/help/contact/1461223444092298',
  'partial',
  '[{"url": "https://ai.meta.com/blog/meta-ai-features-update/", "title": "Meta AI Features", "date": "2024-01"}]'::jsonb,
  '[]'::jsonb,
  'Opt-out primarily available for EU users under GDPR. US users have limited options. Meta-ExternalAgent respects robots.txt for AI training.'
),
(
  'Adobe Firefly',
  'adobe-firefly',
  NULL,
  true,
  true,
  'https://www.adobe.com/legal/terms.html',
  'effective',
  '[{"url": "https://www.adobe.com/products/firefly.html", "title": "Adobe Firefly", "date": "2024-01"}]'::jsonb,
  '[]'::jsonb,
  'Claims to only use Adobe Stock, openly licensed, and public domain content. No web scraping. Content Credentials initiative participant.'
),
(
  'Anthropic',
  'anthropic',
  'anthropic-ai',
  true,
  false,
  NULL,
  'unknown',
  '[{"url": "https://www.anthropic.com/terms", "title": "Anthropic Terms", "date": "2024-01"}]'::jsonb,
  '[]'::jsonb,
  'anthropic-ai crawler can be blocked. Limited public information about training data practices. No formal opt-out program announced.'
),
(
  'Common Crawl',
  'common-crawl',
  'CCBot',
  true,
  false,
  NULL,
  'partial',
  '[{"url": "https://commoncrawl.org/big-picture/frequently-asked-questions", "title": "Common Crawl FAQ", "date": "2024-01"}]'::jsonb,
  '[]'::jsonb,
  'Non-profit that provides training data to many AI companies. Respects robots.txt. Data is used by OpenAI, Google, and others.'
);