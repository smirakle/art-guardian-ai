-- Add delete policies for social media monitoring results
CREATE POLICY "Users can delete their social media monitoring results" 
ON public.social_media_monitoring_results 
FOR DELETE 
USING (account_id IN ( 
  SELECT social_media_accounts.id
  FROM social_media_accounts
  WHERE social_media_accounts.user_id = auth.uid()
));

-- Add delete policy for copyright matches
CREATE POLICY "Users can delete their copyright matches" 
ON public.copyright_matches 
FOR DELETE 
USING (artwork_id IN ( 
  SELECT artwork.id
  FROM artwork
  WHERE artwork.user_id = auth.uid()
));