-- Remove law firms with broken or non-existent website links
DELETE FROM ip_lawyers WHERE law_firm IN (
  'Johnson IP Law',
  'Chen & Associates',
  'Creative Rights Law Firm',
  'Digital Arts Legal',
  'Green IP Solutions',
  'Park & Partners',
  'Roberts IP Law Group',
  'Rodriguez IP Group',
  'Thompson Legal Services',
  'Wilson IP Counsel',
  'Wu & Associates IP'
);