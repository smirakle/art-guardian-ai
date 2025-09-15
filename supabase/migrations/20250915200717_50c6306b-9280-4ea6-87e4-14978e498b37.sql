-- Fix public access to sensitive tables by adding proper RLS policies

-- Community tables - restrict to authenticated users
DROP POLICY IF EXISTS "Community posts visible to everyone" ON public.community_posts;
DROP POLICY IF EXISTS "Community votes visible to everyone" ON public.community_votes;

CREATE POLICY "Community posts viewable by authenticated users" 
ON public.community_posts 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Community votes viewable by authenticated users" 
ON public.community_votes 
FOR SELECT 
TO authenticated
USING (true);

-- Industry verticals - restrict to authenticated users only
DROP POLICY IF EXISTS "Industry verticals are viewable by everyone" ON public.industry_verticals;

CREATE POLICY "Industry verticals viewable by authenticated users" 
ON public.industry_verticals 
FOR SELECT 
TO authenticated
USING (true);

-- Partner pricing tiers - restrict to authenticated users
DROP POLICY IF EXISTS "Partner pricing tiers are viewable by everyone" ON public.partner_pricing_tiers;

CREATE POLICY "Partner pricing tiers viewable by authenticated users" 
ON public.partner_pricing_tiers 
FOR SELECT 
TO authenticated
USING (true);

-- Expert profiles - restrict to authenticated users
DROP POLICY IF EXISTS "Expert profiles are viewable by everyone" ON public.expert_profiles;
DROP POLICY IF EXISTS "Expert advice is viewable by everyone" ON public.expert_advice;

CREATE POLICY "Expert profiles viewable by authenticated users" 
ON public.expert_profiles 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Expert advice viewable by authenticated users" 
ON public.expert_advice 
FOR SELECT 
TO authenticated
USING (true);