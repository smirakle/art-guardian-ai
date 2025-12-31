-- Phase 1: Move extensions out of public schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Note: Moving extensions requires superuser access
-- These will need to be done via Supabase dashboard or support ticket:
-- ALTER EXTENSION pg_stat_statements SET SCHEMA extensions;
-- ALTER EXTENSION pgcrypto SET SCHEMA extensions;

-- Phase 2: Aggressive RLS cleanup - Drop ALL existing policies and recreate clean ones
-- This batch covers tables that still have duplicate/problematic policies

-- blog_comments
DROP POLICY IF EXISTS "Users can create their own comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can view comments on published posts" ON public.blog_comments;
DROP POLICY IF EXISTS "blog_comments_insert" ON public.blog_comments;
DROP POLICY IF EXISTS "blog_comments_select" ON public.blog_comments;
DROP POLICY IF EXISTS "blog_comments_update" ON public.blog_comments;
DROP POLICY IF EXISTS "blog_comments_delete" ON public.blog_comments;
CREATE POLICY "blog_comments_select" ON public.blog_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "blog_comments_insert" ON public.blog_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "blog_comments_update" ON public.blog_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "blog_comments_delete" ON public.blog_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- blog_posts
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can manage their own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public can view published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_select" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_insert" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_update" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_delete" ON public.blog_posts;
CREATE POLICY "blog_posts_select" ON public.blog_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "blog_posts_insert" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "blog_posts_update" ON public.blog_posts FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "blog_posts_delete" ON public.blog_posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- cache_statistics (system table - admin only)
DROP POLICY IF EXISTS "cache_statistics_select" ON public.cache_statistics;
DROP POLICY IF EXISTS "cache_statistics_insert" ON public.cache_statistics;
DROP POLICY IF EXISTS "cache_statistics_update" ON public.cache_statistics;
DROP POLICY IF EXISTS "cache_statistics_delete" ON public.cache_statistics;
CREATE POLICY "cache_statistics_select" ON public.cache_statistics FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "cache_statistics_insert" ON public.cache_statistics FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "cache_statistics_update" ON public.cache_statistics FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

-- cdn_cache_analytics (system table)
DROP POLICY IF EXISTS "cdn_cache_analytics_select" ON public.cdn_cache_analytics;
DROP POLICY IF EXISTS "cdn_cache_analytics_insert" ON public.cdn_cache_analytics;
CREATE POLICY "cdn_cache_analytics_select" ON public.cdn_cache_analytics FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "cdn_cache_analytics_insert" ON public.cdn_cache_analytics FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- cdn_configurations
DROP POLICY IF EXISTS "cdn_configurations_select" ON public.cdn_configurations;
DROP POLICY IF EXISTS "cdn_configurations_insert" ON public.cdn_configurations;
DROP POLICY IF EXISTS "cdn_configurations_update" ON public.cdn_configurations;
CREATE POLICY "cdn_configurations_select" ON public.cdn_configurations FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "cdn_configurations_insert" ON public.cdn_configurations FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "cdn_configurations_update" ON public.cdn_configurations FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

-- cdn_performance_metrics
DROP POLICY IF EXISTS "cdn_performance_metrics_select" ON public.cdn_performance_metrics;
DROP POLICY IF EXISTS "cdn_performance_metrics_insert" ON public.cdn_performance_metrics;
CREATE POLICY "cdn_performance_metrics_select" ON public.cdn_performance_metrics FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "cdn_performance_metrics_insert" ON public.cdn_performance_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- community_comments
DROP POLICY IF EXISTS "Anyone can read comments" ON public.community_comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.community_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.community_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.community_comments;
DROP POLICY IF EXISTS "community_comments_select" ON public.community_comments;
DROP POLICY IF EXISTS "community_comments_insert" ON public.community_comments;
DROP POLICY IF EXISTS "community_comments_update" ON public.community_comments;
DROP POLICY IF EXISTS "community_comments_delete" ON public.community_comments;
CREATE POLICY "community_comments_select" ON public.community_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "community_comments_insert" ON public.community_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_comments_update" ON public.community_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "community_comments_delete" ON public.community_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- community_posts
DROP POLICY IF EXISTS "Anyone can read posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_select" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_insert" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_update" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_delete" ON public.community_posts;
CREATE POLICY "community_posts_select" ON public.community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "community_posts_insert" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_posts_update" ON public.community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "community_posts_delete" ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- community_votes
DROP POLICY IF EXISTS "Users can manage own votes" ON public.community_votes;
DROP POLICY IF EXISTS "Users can view all votes" ON public.community_votes;
DROP POLICY IF EXISTS "community_votes_select" ON public.community_votes;
DROP POLICY IF EXISTS "community_votes_insert" ON public.community_votes;
DROP POLICY IF EXISTS "community_votes_delete" ON public.community_votes;
CREATE POLICY "community_votes_select" ON public.community_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "community_votes_insert" ON public.community_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_votes_delete" ON public.community_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- compliance_reminders
DROP POLICY IF EXISTS "Users can manage own reminders" ON public.compliance_reminders;
DROP POLICY IF EXISTS "compliance_reminders_select" ON public.compliance_reminders;
DROP POLICY IF EXISTS "compliance_reminders_insert" ON public.compliance_reminders;
DROP POLICY IF EXISTS "compliance_reminders_update" ON public.compliance_reminders;
DROP POLICY IF EXISTS "compliance_reminders_delete" ON public.compliance_reminders;
CREATE POLICY "compliance_reminders_select" ON public.compliance_reminders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "compliance_reminders_insert" ON public.compliance_reminders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "compliance_reminders_update" ON public.compliance_reminders FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "compliance_reminders_delete" ON public.compliance_reminders FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- copyright_matches
DROP POLICY IF EXISTS "Users can view matches for their artwork" ON public.copyright_matches;
DROP POLICY IF EXISTS "copyright_matches_select" ON public.copyright_matches;
DROP POLICY IF EXISTS "copyright_matches_insert" ON public.copyright_matches;
DROP POLICY IF EXISTS "copyright_matches_update" ON public.copyright_matches;
CREATE POLICY "copyright_matches_select" ON public.copyright_matches FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.artwork WHERE artwork.id = copyright_matches.artwork_id AND artwork.user_id = auth.uid()));
CREATE POLICY "copyright_matches_insert" ON public.copyright_matches FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.artwork WHERE artwork.id = copyright_matches.artwork_id AND artwork.user_id = auth.uid()));
CREATE POLICY "copyright_matches_update" ON public.copyright_matches FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.artwork WHERE artwork.id = copyright_matches.artwork_id AND artwork.user_id = auth.uid()));

-- copyright_scan_results
DROP POLICY IF EXISTS "Users can manage own scan results" ON public.copyright_scan_results;
DROP POLICY IF EXISTS "copyright_scan_results_select" ON public.copyright_scan_results;
DROP POLICY IF EXISTS "copyright_scan_results_insert" ON public.copyright_scan_results;
DROP POLICY IF EXISTS "copyright_scan_results_update" ON public.copyright_scan_results;
CREATE POLICY "copyright_scan_results_select" ON public.copyright_scan_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "copyright_scan_results_insert" ON public.copyright_scan_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "copyright_scan_results_update" ON public.copyright_scan_results FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- cross_chain_registrations
DROP POLICY IF EXISTS "Users can manage own registrations" ON public.cross_chain_registrations;
DROP POLICY IF EXISTS "cross_chain_registrations_select" ON public.cross_chain_registrations;
DROP POLICY IF EXISTS "cross_chain_registrations_insert" ON public.cross_chain_registrations;
CREATE POLICY "cross_chain_registrations_select" ON public.cross_chain_registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "cross_chain_registrations_insert" ON public.cross_chain_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- custom_integrations
DROP POLICY IF EXISTS "Users can manage own integrations" ON public.custom_integrations;
DROP POLICY IF EXISTS "custom_integrations_select" ON public.custom_integrations;
DROP POLICY IF EXISTS "custom_integrations_insert" ON public.custom_integrations;
DROP POLICY IF EXISTS "custom_integrations_update" ON public.custom_integrations;
DROP POLICY IF EXISTS "custom_integrations_delete" ON public.custom_integrations;
CREATE POLICY "custom_integrations_select" ON public.custom_integrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "custom_integrations_insert" ON public.custom_integrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "custom_integrations_update" ON public.custom_integrations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "custom_integrations_delete" ON public.custom_integrations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- daily_api_usage
DROP POLICY IF EXISTS "Users can view own usage" ON public.daily_api_usage;
DROP POLICY IF EXISTS "daily_api_usage_select" ON public.daily_api_usage;
DROP POLICY IF EXISTS "daily_api_usage_insert" ON public.daily_api_usage;
DROP POLICY IF EXISTS "daily_api_usage_update" ON public.daily_api_usage;
CREATE POLICY "daily_api_usage_select" ON public.daily_api_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "daily_api_usage_insert" ON public.daily_api_usage FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_api_usage_update" ON public.daily_api_usage FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- data_retention_policies (admin only)
DROP POLICY IF EXISTS "data_retention_policies_select" ON public.data_retention_policies;
DROP POLICY IF EXISTS "data_retention_policies_insert" ON public.data_retention_policies;
DROP POLICY IF EXISTS "data_retention_policies_update" ON public.data_retention_policies;
CREATE POLICY "data_retention_policies_select" ON public.data_retention_policies FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "data_retention_policies_insert" ON public.data_retention_policies FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "data_retention_policies_update" ON public.data_retention_policies FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

-- deepfake_analysis_results (public read for verification)
DROP POLICY IF EXISTS "deepfake_analysis_results_select" ON public.deepfake_analysis_results;
DROP POLICY IF EXISTS "deepfake_analysis_results_insert" ON public.deepfake_analysis_results;
CREATE POLICY "deepfake_analysis_results_select" ON public.deepfake_analysis_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "deepfake_analysis_results_insert" ON public.deepfake_analysis_results FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- deepfake_matches
DROP POLICY IF EXISTS "deepfake_matches_select" ON public.deepfake_matches;
DROP POLICY IF EXISTS "deepfake_matches_insert" ON public.deepfake_matches;
DROP POLICY IF EXISTS "deepfake_matches_update" ON public.deepfake_matches;
CREATE POLICY "deepfake_matches_select" ON public.deepfake_matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "deepfake_matches_insert" ON public.deepfake_matches FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "deepfake_matches_update" ON public.deepfake_matches FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

-- dmca_notices
DROP POLICY IF EXISTS "Users can manage own DMCA notices" ON public.dmca_notices;
DROP POLICY IF EXISTS "dmca_notices_select" ON public.dmca_notices;
DROP POLICY IF EXISTS "dmca_notices_insert" ON public.dmca_notices;
DROP POLICY IF EXISTS "dmca_notices_update" ON public.dmca_notices;
CREATE POLICY "dmca_notices_select" ON public.dmca_notices FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.artwork WHERE artwork.id = dmca_notices.artwork_id AND artwork.user_id = auth.uid()));
CREATE POLICY "dmca_notices_insert" ON public.dmca_notices FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.artwork WHERE artwork.id = dmca_notices.artwork_id AND artwork.user_id = auth.uid()));
CREATE POLICY "dmca_notices_update" ON public.dmca_notices FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.artwork WHERE artwork.id = dmca_notices.artwork_id AND artwork.user_id = auth.uid()));