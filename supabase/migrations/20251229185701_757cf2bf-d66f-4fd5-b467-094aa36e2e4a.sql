-- Create saved email addresses table
CREATE TABLE public.saved_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_emails ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved emails" 
ON public.saved_emails 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved emails" 
ON public.saved_emails 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved emails" 
ON public.saved_emails 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add unique constraint for user + email combination
CREATE UNIQUE INDEX idx_saved_emails_user_email ON public.saved_emails(user_id, email);