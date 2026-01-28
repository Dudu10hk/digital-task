-- הגדרת Storage bucket לתמונות פרופיל
-- יש להריץ ב-Supabase SQL Editor

-- יצירת bucket לתמונות פרופיל
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true, -- נגיש לכולם לקריאה
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- מדיניות גישה: כולם יכולים לקרוא
CREATE POLICY "תמונות פרופיל נגישות לכולם"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- מדיניות העלאה: משתמשים מאומתים יכולים להעלות
CREATE POLICY "משתמשים מאומתים יכולים להעלות תמונות"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-images');

-- מדיניות עדכון: משתמשים יכולים לעדכן את התמונות שלהם
CREATE POLICY "משתמשים יכולים לעדכן תמונות"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-images')
WITH CHECK (bucket_id = 'profile-images');

-- מדיניות מחיקה: משתמשים יכולים למחוק תמונות ישנות שלהם
CREATE POLICY "משתמשים יכולים למחוק תמונות"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-images');

-- הצג מידע על ה-bucket
SELECT * FROM storage.buckets WHERE id = 'profile-images';
