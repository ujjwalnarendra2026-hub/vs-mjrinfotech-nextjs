
-- ── Clients table ────────────────────────────────────────────────────────────
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  logo_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active clients"
  ON public.clients FOR SELECT
  USING (is_active = true);

CREATE POLICY "No public inserts on clients"
  ON public.clients FOR INSERT
  WITH CHECK (false);

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Certificates table ───────────────────────────────────────────────────────
CREATE TABLE public.certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  file_url text NOT NULL,
  thumbnail_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active certificates"
  ON public.certificates FOR SELECT
  USING (is_active = true);

CREATE POLICY "No public inserts on certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (false);

CREATE TRIGGER update_certificates_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Storage buckets ──────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('client-logos', 'client-logos', true, 2097152, ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/svg+xml']),
  ('certificates', 'certificates', true, 10485760, ARRAY['application/pdf','image/png','image/jpeg','image/jpg','image/webp']);

-- Storage policies: public read
CREATE POLICY "Public read client logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'client-logos');

CREATE POLICY "Public read certificates"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates');
