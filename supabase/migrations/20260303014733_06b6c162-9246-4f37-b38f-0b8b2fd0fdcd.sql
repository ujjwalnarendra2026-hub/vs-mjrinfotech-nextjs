
-- Open positions table (admin-managed)
CREATE TABLE public.open_positions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  department text,
  location text,
  type text DEFAULT 'Full-time',
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.open_positions ENABLE ROW LEVEL SECURITY;

-- Anyone can read active positions (needed for careers page)
CREATE POLICY "Anyone can read active open positions"
ON public.open_positions
FOR SELECT
USING (is_active = true);

-- No public writes
CREATE POLICY "No public inserts on open positions"
ON public.open_positions
FOR INSERT
WITH CHECK (false);

-- Career applications table
CREATE TABLE public.career_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  position text NOT NULL,
  cover_letter text,
  linkedin_url text,
  admin_notes text,
  status text NOT NULL DEFAULT 'new',
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit career application"
ON public.career_applications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "No public reads on career applications"
ON public.career_applications
FOR SELECT
USING (false);

-- Triggers for updated_at
CREATE TRIGGER update_open_positions_updated_at
  BEFORE UPDATE ON public.open_positions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_applications_updated_at
  BEFORE UPDATE ON public.career_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
