-- Production Readiness: Fix Critical Security Issues
-- Phase 2: Address Public Data Exposure (Corrected)

-- 1. Fix community_posts table - require authentication
DROP POLICY IF EXISTS "Anyone can view community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can create their own community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update their own community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete their own community posts" ON public.community_posts;

CREATE POLICY "Authenticated users can view community posts"
ON public.community_posts
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create posts"
ON public.community_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.community_posts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.community_posts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. Fix platform_api_configs table - admin only access
DROP POLICY IF EXISTS "Anyone can view platform API configs" ON public.platform_api_configs;
DROP POLICY IF EXISTS "Admins can view platform API configs" ON public.platform_api_configs;
DROP POLICY IF EXISTS "Admins can manage platform API configs" ON public.platform_api_configs;

CREATE POLICY "Admins can view platform API configs"
ON public.platform_api_configs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage platform API configs"
ON public.platform_api_configs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3. Fix white_label_users - restrict to organization members only
DROP POLICY IF EXISTS "Anyone can view white label users" ON public.white_label_users;
DROP POLICY IF EXISTS "Organization members can view white label users" ON public.white_label_users;
DROP POLICY IF EXISTS "Organization owners can manage white label users" ON public.white_label_users;

CREATE POLICY "Organization members can view white label users"
ON public.white_label_users
FOR SELECT
TO authenticated
USING (
  -- User is the owner of the organization
  EXISTS (
    SELECT 1 FROM public.white_label_organizations
    WHERE id = white_label_users.organization_id
    AND owner_id = auth.uid()
  )
  OR
  -- User is a member of the organization
  organization_id IN (
    SELECT organization_id FROM public.white_label_users
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Organization owners can manage white label users"
ON public.white_label_users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.white_label_organizations
    WHERE id = white_label_users.organization_id
    AND owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.white_label_organizations
    WHERE id = organization_id
    AND owner_id = auth.uid()
  )
);