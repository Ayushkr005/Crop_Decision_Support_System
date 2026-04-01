
-- Table for admin-managed crop profiles (state, district, crop, soil parameters)
CREATE TABLE public.crop_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  n_value NUMERIC NOT NULL DEFAULT 0,
  p_value NUMERIC NOT NULL DEFAULT 0,
  k_value NUMERIC NOT NULL DEFAULT 0,
  temperature NUMERIC NOT NULL DEFAULT 0,
  humidity NUMERIC NOT NULL DEFAULT 0,
  ph NUMERIC NOT NULL DEFAULT 0,
  rainfall NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(state, district, crop_name)
);

-- Enable RLS
ALTER TABLE public.crop_profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read crop profiles
CREATE POLICY "Anyone can read crop profiles"
ON public.crop_profiles FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert crop profiles"
ON public.crop_profiles FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Only admins can update
CREATE POLICY "Admins can update crop profiles"
ON public.crop_profiles FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Only admins can delete
CREATE POLICY "Admins can delete crop profiles"
ON public.crop_profiles FOR DELETE
TO authenticated
USING (public.is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_crop_profiles_updated_at
BEFORE UPDATE ON public.crop_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
