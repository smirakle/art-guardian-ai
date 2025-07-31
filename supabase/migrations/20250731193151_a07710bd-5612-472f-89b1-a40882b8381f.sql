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