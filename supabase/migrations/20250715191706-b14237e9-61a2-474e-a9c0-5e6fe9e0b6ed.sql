-- Create IP lawyers directory table
CREATE TABLE public.ip_lawyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  law_firm TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  location TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  years_experience INTEGER,
  bar_admissions TEXT[] DEFAULT '{}',
  description TEXT,
  hourly_rate_range TEXT,
  languages TEXT[] DEFAULT '{"English"}',
  is_verified BOOLEAN DEFAULT false,
  accepts_new_clients BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ip_lawyers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (lawyers directory should be publicly viewable)
CREATE POLICY "Anyone can view IP lawyers directory" 
ON public.ip_lawyers 
FOR SELECT 
USING (true);

-- Only admins can manage lawyer listings
CREATE POLICY "Admins can manage IP lawyers directory" 
ON public.ip_lawyers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ip_lawyers_updated_at
BEFORE UPDATE ON public.ip_lawyers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample IP lawyers
INSERT INTO public.ip_lawyers (
  name, law_firm, email, phone, website, specialties, location, state, city, 
  years_experience, bar_admissions, description, hourly_rate_range, languages, is_verified
) VALUES 
(
  'Sarah Johnson', 
  'Johnson IP Law', 
  'sarah@johnsoniplaw.com', 
  '(555) 123-4567',
  'https://www.johnsoniplaw.com',
  ARRAY['Copyright Law', 'Trademark Law', 'Digital Art Protection'],
  'New York, NY',
  'NY',
  'New York',
  12,
  ARRAY['New York', 'California'],
  'Specializing in intellectual property law with focus on digital art and creative works. Over 12 years of experience protecting artists and creators.',
  '$300-500/hour',
  ARRAY['English', 'Spanish'],
  true
),
(
  'Michael Chen', 
  'Chen & Associates', 
  'michael@chenlaw.com', 
  '(555) 234-5678',
  'https://www.chenlaw.com',
  ARRAY['Copyright Law', 'Entertainment Law', 'DMCA Takedowns'],
  'Los Angeles, CA',
  'CA',
  'Los Angeles',
  8,
  ARRAY['California', 'Nevada'],
  'Entertainment and copyright lawyer serving artists, filmmakers, and content creators in the digital age.',
  '$250-400/hour',
  ARRAY['English', 'Mandarin'],
  true
),
(
  'Jessica Rodriguez', 
  'Rodriguez IP Group', 
  'jessica@rodriguezipgroup.com', 
  '(555) 345-6789',
  'https://www.rodriguezipgroup.com',
  ARRAY['Trademark Law', 'Copyright Law', 'Brand Protection'],
  'Miami, FL',
  'FL',
  'Miami',
  15,
  ARRAY['Florida', 'Texas'],
  'Comprehensive IP protection for artists, brands, and creative professionals. Fluent in English and Spanish.',
  '$275-425/hour',
  ARRAY['English', 'Spanish'],
  true
),
(
  'David Thompson', 
  'Thompson Legal Services', 
  'david@thompsonlegal.com', 
  '(555) 456-7890',
  'https://www.thompsonlegal.com',
  ARRAY['Copyright Law', 'Digital Rights', 'NFT Law'],
  'Austin, TX',
  'TX',
  'Austin',
  6,
  ARRAY['Texas'],
  'Modern IP lawyer specializing in digital rights, NFTs, and blockchain technology for artists and creators.',
  '$200-350/hour',
  ARRAY['English'],
  true
),
(
  'Emily Park', 
  'Park & Partners', 
  'emily@parkpartners.com', 
  '(555) 567-8901',
  'https://www.parkpartners.com',
  ARRAY['Copyright Law', 'Trademark Law', 'International IP'],
  'Seattle, WA',
  'WA',
  'Seattle',
  10,
  ARRAY['Washington', 'Oregon'],
  'International IP law with expertise in cross-border copyright and trademark protection for digital artists.',
  '$300-450/hour',
  ARRAY['English', 'Korean'],
  true
),
(
  'Robert Wilson', 
  'Wilson IP Counsel', 
  'robert@wilsonip.com', 
  '(555) 678-9012',
  'https://www.wilsonip.com',
  ARRAY['Copyright Law', 'Fair Use Defense', 'Litigation'],
  'Chicago, IL',
  'IL',
  'Chicago',
  20,
  ARRAY['Illinois', 'Indiana'],
  'Veteran IP litigator with extensive experience in copyright disputes and fair use cases for creative professionals.',
  '$400-600/hour',
  ARRAY['English'],
  true
)