-- Enable Row Level Security on the tables
ALTER TABLE public.account_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_background ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_development ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- Policies for 'account_details'
-- ==========================================
-- Users can only read their own account details
CREATE POLICY "Users can view own account details"
ON public.account_details FOR SELECT
USING (auth.uid()::text = id);

-- Users can only update their own account details
CREATE POLICY "Users can update own account details"
ON public.account_details FOR UPDATE
USING (auth.uid()::text = id);

-- Allow insert during registration
CREATE POLICY "Allow insert during registration"
ON public.account_details FOR INSERT
WITH CHECK (auth.uid()::text = id);


-- ==========================================
-- Policies for 'profile_details'
-- ==========================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profile_details FOR SELECT
USING (auth.uid()::text = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profile_details FOR UPDATE
USING (auth.uid()::text = id);

-- Allow insert during registration
CREATE POLICY "Allow insert profile details"
ON public.profile_details FOR INSERT
WITH CHECK (auth.uid()::text = id);


-- ==========================================
-- Policies for 'educational_background'
-- ==========================================
CREATE POLICY "Users can manage own education"
ON public.educational_background FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- ==========================================
-- Policies for 'work_experiences'
-- ==========================================
CREATE POLICY "Users can manage own work experience"
ON public.work_experiences FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- ==========================================
-- Policies for 'professional_development'
-- ==========================================
CREATE POLICY "Users can manage own professional development"
ON public.professional_development FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- ==========================================
-- Policies for 'submissions'
-- ==========================================
-- Faculty can view and insert their own submissions
CREATE POLICY "Users can view own submissions"
ON public.submissions FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own submissions"
ON public.submissions FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Note: In a real system, you would identify admins using custom claims or an admin table.
-- Here is an example of an admin override that you could add if you create an admin role:
-- CREATE POLICY "Admins can view all submissions"
-- ON public.submissions FOR SELECT
-- USING ( (SELECT type FROM public.account_details WHERE id = auth.uid()::text) = 'admin' );

-- CREATE POLICY "Admins can update submissions"
-- ON public.submissions FOR UPDATE
-- USING ( (SELECT type FROM public.account_details WHERE id = auth.uid()::text) = 'admin' );

-- ==========================================
-- Storage Bucket Policies
-- ==========================================
-- Note: Replace 'pictures-and-documents' with your actual bucket ID if different.

-- Allow users to view files in their own folder
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING ( bucket_id = 'pictures-and-documents' AND auth.uid()::text = (string_to_array(name, '/'))[1] );

-- Allow users to upload to their own folder
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'pictures-and-documents' AND auth.uid()::text = (string_to_array(name, '/'))[1] );

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'pictures-and-documents' AND auth.uid()::text = (string_to_array(name, '/'))[1] );

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING ( bucket_id = 'pictures-and-documents' AND auth.uid()::text = (string_to_array(name, '/'))[1] );
