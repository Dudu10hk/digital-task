-- המרת טבלת tasks למבנה JSONB פשוט
-- יש להריץ ב-Supabase SQL Editor

-- 1. גיבוי הנתונים הקיימים (אם יש)
CREATE TABLE IF NOT EXISTS tasks_backup AS SELECT * FROM tasks;

-- 2. מחק את הטבלה הישנה (והטבלאות המקושרות)
DROP TABLE IF EXISTS task_history CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS task_files CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- 3. צור טבלה חדשה עם JSONB
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. אפשר RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 5. מדיניות גישה: כולם יכולים לקרוא ולכתוב (לפי הצורך שלך)
CREATE POLICY "tasks_select_all" ON tasks FOR SELECT USING (true);
CREATE POLICY "tasks_insert_all" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "tasks_update_all" ON tasks FOR UPDATE USING (true);
CREATE POLICY "tasks_delete_all" ON tasks FOR DELETE USING (true);

-- 6. צור טבלאות נוספות עם JSONB
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_all" ON notifications FOR SELECT USING (true);
CREATE POLICY "notifications_insert_all" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update_all" ON notifications FOR UPDATE USING (true);
CREATE POLICY "notifications_delete_all" ON notifications FOR DELETE USING (true);

-- 7. צור טבלת sticky_notes
CREATE TABLE IF NOT EXISTS sticky_notes (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE sticky_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sticky_notes_select_all" ON sticky_notes FOR SELECT USING (true);
CREATE POLICY "sticky_notes_insert_all" ON sticky_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "sticky_notes_update_all" ON sticky_notes FOR UPDATE USING (true);
CREATE POLICY "sticky_notes_delete_all" ON sticky_notes FOR DELETE USING (true);

-- 8. צור טבלת archived_tasks
CREATE TABLE IF NOT EXISTS archived_tasks (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE archived_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "archived_tasks_select_all" ON archived_tasks FOR SELECT USING (true);
CREATE POLICY "archived_tasks_insert_all" ON archived_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "archived_tasks_update_all" ON archived_tasks FOR UPDATE USING (true);
CREATE POLICY "archived_tasks_delete_all" ON archived_tasks FOR DELETE USING (true);

-- 9. צור indexes לביצועים
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_data_column ON tasks USING gin ((data->'column'));
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_sticky_notes_created_at ON sticky_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_archived_tasks_archived_at ON archived_tasks(archived_at);

-- 10. הצג את המבנה החדש
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('tasks', 'notifications', 'sticky_notes', 'archived_tasks')
ORDER BY table_name, ordinal_position;
