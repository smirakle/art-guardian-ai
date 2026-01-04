-- Fix artwork policies - drop existing then recreate with TO authenticated
DROP POLICY IF EXISTS "Users can view own artwork" ON public.artwork;

CREATE POLICY "Users can view own artwork" ON public.artwork FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Fix profiles policies - drop existing then recreate
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- Fix subscriptions policies - drop existing then recreate  
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);