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