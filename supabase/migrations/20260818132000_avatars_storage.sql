ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_color TEXT;

INSERT INTO storage.buckets (id, name, public) VALUES ('user-profile-picture', 'user-profile-picture', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'user-profile-picture');
CREATE POLICY "Users can insert their own avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user-profile-picture' AND auth.uid() = owner);
CREATE POLICY "Users can update their own avatar." ON storage.objects FOR UPDATE USING (bucket_id = 'user-profile-picture' AND auth.uid() = owner);
CREATE POLICY "Users can delete their own avatar." ON storage.objects FOR DELETE USING (bucket_id = 'user-profile-picture' AND auth.uid() = owner);
