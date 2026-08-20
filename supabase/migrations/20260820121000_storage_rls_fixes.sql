-- Drop existing owner-based policies for user-profile-picture
DROP POLICY IF EXISTS "Users can insert their own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile picture" ON storage.objects;

-- Recreate policies using path segment matching as recommended by Supabase Security Advisor
CREATE POLICY "Users can insert their own profile picture" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'user-profile-picture' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own profile picture" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'user-profile-picture' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own profile picture" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'user-profile-picture' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add explicit restrictive policies for database_export_18_08_26 to satisfy security scanner
-- (Assuming only service role / admins need access, so we deny all authenticated/anon traffic)
CREATE POLICY "Deny all access to database exports" 
ON storage.objects FOR ALL 
USING (bucket_id = 'database_export_18_08_26' AND false);
