
-- Add slug column
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS cars_slug_unique ON public.cars (slug);

-- Function to generate slug from make, model, year
CREATE OR REPLACE FUNCTION public.generate_car_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  base_slug text;
  new_slug text;
  counter integer := 0;
BEGIN
  -- Generate base slug: lowercase, replace spaces/special chars with hyphens
  base_slug := lower(NEW.make || '-' || NEW.model || '-' || NEW.year::text);
  base_slug := regexp_replace(base_slug, '[^a-z0-9\-]', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  new_slug := base_slug;
  
  -- Handle duplicates by appending a counter
  LOOP
    -- Check if slug exists (excluding current record on update)
    IF NOT EXISTS (
      SELECT 1 FROM public.cars 
      WHERE slug = new_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      EXIT;
    END IF;
    counter := counter + 1;
    new_slug := base_slug || '-' || counter::text;
  END LOOP;
  
  NEW.slug := new_slug;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate slug on insert
CREATE TRIGGER set_car_slug
  BEFORE INSERT ON public.cars
  FOR EACH ROW
  WHEN (NEW.slug IS NULL)
  EXECUTE FUNCTION public.generate_car_slug();

-- Trigger to update slug when make/model/year changes
CREATE TRIGGER update_car_slug
  BEFORE UPDATE ON public.cars
  FOR EACH ROW
  WHEN (OLD.make IS DISTINCT FROM NEW.make OR OLD.model IS DISTINCT FROM NEW.model OR OLD.year IS DISTINCT FROM NEW.year)
  EXECUTE FUNCTION public.generate_car_slug();

-- Backfill existing cars with slugs
DO $$
DECLARE
  car_record RECORD;
  base_slug text;
  new_slug text;
  counter integer;
BEGIN
  FOR car_record IN SELECT id, make, model, year FROM public.cars WHERE slug IS NULL ORDER BY created_at ASC
  LOOP
    base_slug := lower(car_record.make || '-' || car_record.model || '-' || car_record.year::text);
    base_slug := regexp_replace(base_slug, '[^a-z0-9\-]', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    new_slug := base_slug;
    counter := 0;
    
    LOOP
      IF NOT EXISTS (SELECT 1 FROM public.cars WHERE slug = new_slug AND id != car_record.id) THEN
        EXIT;
      END IF;
      counter := counter + 1;
      new_slug := base_slug || '-' || counter::text;
    END LOOP;
    
    UPDATE public.cars SET slug = new_slug WHERE id = car_record.id;
  END LOOP;
END;
$$;
