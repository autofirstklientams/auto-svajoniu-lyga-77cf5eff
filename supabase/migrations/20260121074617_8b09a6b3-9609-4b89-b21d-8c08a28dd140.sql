-- Add use_count column to track popularity
ALTER TABLE public.saved_emails 
ADD COLUMN use_count integer NOT NULL DEFAULT 0;

-- Add last_used_at column for additional sorting
ALTER TABLE public.saved_emails 
ADD COLUMN last_used_at timestamp with time zone;

-- Allow users to update their own saved emails (for incrementing use_count)
CREATE POLICY "Users can update their own saved emails" 
ON public.saved_emails 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);