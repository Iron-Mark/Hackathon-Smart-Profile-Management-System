-- Row Level Security for the restored Smart Profile Management System.
-- Run after supabase_schema.sql and after creating the pictures-and-documents bucket.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.account_details
    WHERE id = auth.uid()::text
      AND type = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION private.is_current_user_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_current_user_admin() TO authenticated;

ALTER TABLE public.account_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_background ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_development ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.account_details TO authenticated;
GRANT UPDATE (name, "avatarUrl") ON public.account_details TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_details TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.educational_background TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_experiences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_development TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

DROP POLICY IF EXISTS "Users can view own account details" ON public.account_details;
DROP POLICY IF EXISTS "Users can update own account details" ON public.account_details;
DROP POLICY IF EXISTS "Allow insert during registration" ON public.account_details;
DROP POLICY IF EXISTS "Users and admins can view account details" ON public.account_details;
DROP POLICY IF EXISTS "Users and admins can update account details" ON public.account_details;
DROP POLICY IF EXISTS "Users and admins can insert account details" ON public.account_details;
DROP POLICY IF EXISTS "Users can update own profile account fields" ON public.account_details;
DROP POLICY IF EXISTS "Admins can update account profile fields" ON public.account_details;
DROP POLICY IF EXISTS "Users can insert own faculty account details" ON public.account_details;
DROP POLICY IF EXISTS "Admins can insert account details" ON public.account_details;

CREATE POLICY "Users and admins can view account details"
ON public.account_details FOR SELECT
USING (auth.uid()::text = id OR (select private.is_current_user_admin()));

CREATE POLICY "Users can update own profile account fields"
ON public.account_details FOR UPDATE
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id AND type = 'faculty');

CREATE POLICY "Admins can update account profile fields"
ON public.account_details FOR UPDATE
USING ((select private.is_current_user_admin()))
WITH CHECK ((select private.is_current_user_admin()) AND type IN ('faculty', 'admin'));

CREATE POLICY "Users can insert own faculty account details"
ON public.account_details FOR INSERT
WITH CHECK (auth.uid()::text = id AND type = 'faculty');

CREATE POLICY "Admins can insert account details"
ON public.account_details FOR INSERT
WITH CHECK ((select private.is_current_user_admin()) AND type IN ('faculty', 'admin'));

DROP POLICY IF EXISTS "Users can view own profile" ON public.profile_details;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profile_details;
DROP POLICY IF EXISTS "Allow insert profile details" ON public.profile_details;
DROP POLICY IF EXISTS "Users and admins can view profiles" ON public.profile_details;
DROP POLICY IF EXISTS "Users and admins can update profiles" ON public.profile_details;
DROP POLICY IF EXISTS "Users and admins can insert profiles" ON public.profile_details;

CREATE POLICY "Users and admins can view profiles"
ON public.profile_details FOR SELECT
USING (auth.uid()::text = id OR (select private.is_current_user_admin()));

CREATE POLICY "Users and admins can update profiles"
ON public.profile_details FOR UPDATE
USING (auth.uid()::text = id OR (select private.is_current_user_admin()))
WITH CHECK (auth.uid()::text = id OR (select private.is_current_user_admin()));

CREATE POLICY "Users and admins can insert profiles"
ON public.profile_details FOR INSERT
WITH CHECK (auth.uid()::text = id OR (select private.is_current_user_admin()));

DROP POLICY IF EXISTS "Users can manage own education" ON public.educational_background;
DROP POLICY IF EXISTS "Users and admins can manage education" ON public.educational_background;

CREATE POLICY "Users and admins can manage education"
ON public.educational_background FOR ALL
USING (auth.uid()::text = user_id OR (select private.is_current_user_admin()))
WITH CHECK (auth.uid()::text = user_id OR (select private.is_current_user_admin()));

DROP POLICY IF EXISTS "Users can manage own work experience" ON public.work_experiences;
DROP POLICY IF EXISTS "Users and admins can manage work experience" ON public.work_experiences;

CREATE POLICY "Users and admins can manage work experience"
ON public.work_experiences FOR ALL
USING (auth.uid()::text = user_id OR (select private.is_current_user_admin()))
WITH CHECK (auth.uid()::text = user_id OR (select private.is_current_user_admin()));

DROP POLICY IF EXISTS "Users can manage own professional development" ON public.professional_development;
DROP POLICY IF EXISTS "Users and admins can manage professional development" ON public.professional_development;

CREATE POLICY "Users and admins can manage professional development"
ON public.professional_development FOR ALL
USING (auth.uid()::text = user_id OR (select private.is_current_user_admin()))
WITH CHECK (auth.uid()::text = user_id OR (select private.is_current_user_admin()));

DROP POLICY IF EXISTS "Users can view own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can insert own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users and admins can view submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users and admins can insert submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users and admins can update submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users and admins can delete submissions" ON public.submissions;

CREATE POLICY "Users and admins can view submissions"
ON public.submissions FOR SELECT
USING (auth.uid()::text = user_id OR (select private.is_current_user_admin()));

CREATE POLICY "Users and admins can insert submissions"
ON public.submissions FOR INSERT
WITH CHECK (auth.uid()::text = user_id OR (select private.is_current_user_admin()));

CREATE POLICY "Users and admins can update submissions"
ON public.submissions FOR UPDATE
USING (auth.uid()::text = user_id OR (select private.is_current_user_admin()))
WITH CHECK (auth.uid()::text = user_id OR (select private.is_current_user_admin()));

CREATE POLICY "Users and admins can delete submissions"
ON public.submissions FOR DELETE
USING (auth.uid()::text = user_id OR (select private.is_current_user_admin()));

DROP POLICY IF EXISTS "Users and admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;

CREATE POLICY "Users and admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (auth.uid()::text = user_id OR (select private.is_current_user_admin()));

CREATE POLICY "Users can insert own audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users and admins can view files" ON storage.objects;
DROP POLICY IF EXISTS "Users and admins can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users and admins can update files" ON storage.objects;
DROP POLICY IF EXISTS "Users and admins can delete files" ON storage.objects;

CREATE POLICY "Users and admins can view files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'pictures-and-documents'
  AND (
    auth.uid()::text = (string_to_array(name, '/'))[1]
    OR (select private.is_current_user_admin())
  )
);

CREATE POLICY "Users and admins can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pictures-and-documents'
  AND (
    auth.uid()::text = (string_to_array(name, '/'))[1]
    OR (select private.is_current_user_admin())
  )
);

CREATE POLICY "Users and admins can update files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'pictures-and-documents'
  AND (
    auth.uid()::text = (string_to_array(name, '/'))[1]
    OR (select private.is_current_user_admin())
  )
)
WITH CHECK (
  bucket_id = 'pictures-and-documents'
  AND (
    auth.uid()::text = (string_to_array(name, '/'))[1]
    OR (select private.is_current_user_admin())
  )
);

CREATE POLICY "Users and admins can delete files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pictures-and-documents'
  AND (
    auth.uid()::text = (string_to_array(name, '/'))[1]
    OR (select private.is_current_user_admin())
  )
);
