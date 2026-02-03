-- סקריפט בדיקה: האם כל הטבלאות קיימות וכראוי?
-- הרץ את זה ב-Supabase SQL Editor כדי לבדוק את המצב

-- ======================================
-- 1. בדיקת טבלאות קיימות
-- ======================================

SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('users', 'tasks', 'notifications', 'sticky_notes', 'archived_tasks', 'otp_codes') THEN '✅'
    ELSE '⚠️'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ======================================
-- 2. בדיקת עמודות בטבלת users
-- ======================================

SELECT 
  'users' as table_name,
  column_name,
  data_type,
  is_nullable,
  CASE 
    WHEN column_name IN ('id', 'name', 'email', 'password', 'avatar', 'role', 'created_at', 'updated_at') THEN '✅'
    ELSE '⚠️'
  END as expected
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- ======================================
-- 3. בדיקת עמודות בטבלת tasks
-- ======================================

SELECT 
  'tasks' as table_name,
  column_name,
  data_type,
  is_nullable,
  CASE 
    WHEN column_name IN ('id', 'data', 'created_at') THEN '✅'
    ELSE '⚠️'
  END as expected
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tasks'
ORDER BY ordinal_position;

-- ======================================
-- 4. ספירת רשומות בכל טבלה
-- ======================================

SELECT 
  'users' as table_name,
  COUNT(*) as total_records
FROM users

UNION ALL

SELECT 
  'tasks' as table_name,
  COUNT(*) as total_records
FROM tasks

UNION ALL

SELECT 
  'notifications' as table_name,
  COUNT(*) as total_records
FROM notifications

UNION ALL

SELECT 
  'sticky_notes' as table_name,
  COUNT(*) as total_records
FROM sticky_notes

UNION ALL

SELECT 
  'archived_tasks' as table_name,
  COUNT(*) as total_records
FROM archived_tasks

UNION ALL

SELECT 
  'otp_codes' as table_name,
  COUNT(*) as total_records
FROM otp_codes;

-- ======================================
-- 5. בדיקת RLS (Row Level Security)
-- ======================================

SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ מופעל'
    ELSE '❌ כבוי'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'tasks', 'notifications', 'sticky_notes', 'archived_tasks', 'otp_codes')
ORDER BY tablename;

-- ======================================
-- 6. בדיקת Policies (מדיניות גישה)
-- ======================================

SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN policyname LIKE '%_all' THEN '✅ מאפשר הכל'
    ELSE '⚠️ מוגבל'
  END as access_level
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ======================================
-- 7. בדיקת Indexes
-- ======================================

SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'tasks', 'notifications', 'sticky_notes', 'archived_tasks', 'otp_codes')
ORDER BY tablename, indexname;

-- ======================================
-- 8. דוגמת נתונים מטבלת users (בלי סיסמאות!)
-- ======================================

SELECT 
  id,
  name,
  email,
  role,
  created_at,
  '***' as password_hidden
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- ======================================
-- 9. דוגמת נתונים מטבלת tasks
-- ======================================

SELECT 
  id,
  data->>'title' as task_title,
  data->>'column' as column,
  data->>'status' as status,
  created_at
FROM tasks
ORDER BY created_at DESC
LIMIT 5;

-- ======================================
-- סיכום
-- ======================================

SELECT 
  '✅ אם כל הבדיקות עברו - המערכת מוכנה!' as status,
  '📊 בדוק שכל הטבלאות קיימות ו-RLS מופעל' as note;
