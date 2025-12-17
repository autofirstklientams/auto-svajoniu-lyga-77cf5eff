-- Add features column to cars table
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '{}';

-- Create table for saved default features
CREATE TABLE public.saved_car_features (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  features jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.saved_car_features ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved features"
ON public.saved_car_features
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved features"
ON public.saved_car_features
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved features"
ON public.saved_car_features
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved features"
ON public.saved_car_features
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_saved_car_features_updated_at
BEFORE UPDATE ON public.saved_car_features
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();