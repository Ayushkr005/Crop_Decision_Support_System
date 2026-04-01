
CREATE TABLE public.farmer_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  village text,
  taluka text,
  district text NOT NULL,
  state text NOT NULL,
  land_area_acres numeric DEFAULT 0,
  soil_type text,
  irrigation_type text,
  n_value numeric DEFAULT 0,
  p_value numeric DEFAULT 0,
  k_value numeric DEFAULT 0,
  temperature numeric DEFAULT 0,
  humidity numeric DEFAULT 0,
  ph numeric DEFAULT 0,
  rainfall numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.farmer_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own farmer details"
  ON public.farmer_details FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their own farmer details"
  ON public.farmer_details FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farmer details"
  ON public.farmer_details FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own farmer details"
  ON public.farmer_details FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE TRIGGER update_farmer_details_updated_at
  BEFORE UPDATE ON public.farmer_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
