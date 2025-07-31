-- Create a function to get template download counts
CREATE OR REPLACE FUNCTION public.get_template_download_count(template_id_param text)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT COALESCE(COUNT(*)::integer, 0)
  FROM public.template_purchases 
  WHERE template_id = template_id_param 
  AND status = 'completed';
$function$

-- Create a function to get all template download counts
CREATE OR REPLACE FUNCTION public.get_all_template_download_counts()
RETURNS TABLE(template_id text, download_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    tp.template_id,
    COUNT(*) as download_count
  FROM public.template_purchases tp
  WHERE tp.status = 'completed'
  GROUP BY tp.template_id;
$function$

-- Create an update template purchases function for tracking downloads
CREATE OR REPLACE FUNCTION public.update_template_download_status(session_id text, new_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  UPDATE public.template_purchases 
  SET 
    status = new_status,
    updated_at = now()
  WHERE stripe_session_id = session_id;
END;
$function$