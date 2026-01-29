-- ============================================
-- תיקוני אבטחה קריטיים - Row Level Security
-- ============================================

-- 1. הסרת policies הישנים (לא מאובטחים)
DROP POLICY IF EXISTS "tasks_select_all" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_all" ON tasks;
DROP POLICY IF EXISTS "tasks_update_all" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_all" ON tasks;

DROP POLICY IF EXISTS "notifications_select_all" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_all" ON notifications;
DROP POLICY IF EXISTS "notifications_update_all" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_all" ON notifications;

DROP POLICY IF EXISTS "sticky_notes_select_all" ON sticky_notes;
DROP POLICY IF EXISTS "sticky_notes_insert_all" ON sticky_notes;
DROP POLICY IF EXISTS "sticky_notes_update_all" ON sticky_notes;
DROP POLICY IF EXISTS "sticky_notes_delete_all" ON sticky_notes;

DROP POLICY IF EXISTS "archived_tasks_select_all" ON archived_tasks;
DROP POLICY IF EXISTS "archived_tasks_insert_all" ON archived_tasks;
DROP POLICY IF EXISTS "archived_tasks_update_all" ON archived_tasks;
DROP POLICY IF EXISTS "archived_tasks_delete_all" ON archived_tasks;

-- 2. פונקציה עזר - בדיקה אם המשתמש admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()::text
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Tasks - RLS מאובטח
-- קריאה: משתמש רואה משימות שהוא יצר, הוקצה לו, או מטפל בהן, או admin
CREATE POLICY "tasks_select_policy" ON tasks
FOR SELECT
USING (
  is_admin() OR
  (data->>'createdBy')::text = auth.uid()::text OR
  (data->>'assigneeId')::text = auth.uid()::text OR
  (data->>'handlerId')::text = auth.uid()::text OR
  auth.uid()::text = ANY(
    SELECT jsonb_array_elements_text(data->'taggedUserIds')
  )
);

-- יצירה: כל משתמש מאומת יכול ליצור משימה
CREATE POLICY "tasks_insert_policy" ON tasks
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  (data->>'createdBy')::text = auth.uid()::text
);

-- עדכון: רק יוצר, אחראי, מטפל, או admin
CREATE POLICY "tasks_update_policy" ON tasks
FOR UPDATE
USING (
  is_admin() OR
  (data->>'createdBy')::text = auth.uid()::text OR
  (data->>'assigneeId')::text = auth.uid()::text OR
  (data->>'handlerId')::text = auth.uid()::text
)
WITH CHECK (
  is_admin() OR
  (data->>'createdBy')::text = auth.uid()::text OR
  (data->>'assigneeId')::text = auth.uid()::text OR
  (data->>'handlerId')::text = auth.uid()::text
);

-- מחיקה: רק admin
CREATE POLICY "tasks_delete_policy" ON tasks
FOR DELETE
USING (is_admin());

-- 4. Notifications - RLS מאובטח
-- קריאה: רק התראות של המשתמש
CREATE POLICY "notifications_select_policy" ON notifications
FOR SELECT
USING ((data->>'userId')::text = auth.uid()::text);

-- יצירה: מערכת בלבד (או admin)
CREATE POLICY "notifications_insert_policy" ON notifications
FOR INSERT
WITH CHECK (is_admin());

-- עדכון: רק התראות של המשתמש (לסמן כנקרא)
CREATE POLICY "notifications_update_policy" ON notifications
FOR UPDATE
USING ((data->>'userId')::text = auth.uid()::text)
WITH CHECK ((data->>'userId')::text = auth.uid()::text);

-- מחיקה: רק admin
CREATE POLICY "notifications_delete_policy" ON notifications
FOR DELETE
USING (is_admin());

-- 5. Sticky Notes - RLS מאובטח
-- קריאה: רק פתקים של המשתמש
CREATE POLICY "sticky_notes_select_policy" ON sticky_notes
FOR SELECT
USING ((data->>'userId')::text = auth.uid()::text);

-- יצירה: רק המשתמש יכול ליצור פתק משלו
CREATE POLICY "sticky_notes_insert_policy" ON sticky_notes
FOR INSERT
WITH CHECK ((data->>'userId')::text = auth.uid()::text);

-- עדכון: רק פתקים של המשתמש
CREATE POLICY "sticky_notes_update_policy" ON sticky_notes
FOR UPDATE
USING ((data->>'userId')::text = auth.uid()::text)
WITH CHECK ((data->>'userId')::text = auth.uid()::text);

-- מחיקה: רק פתקים של המשתמש
CREATE POLICY "sticky_notes_delete_policy" ON sticky_notes
FOR DELETE
USING ((data->>'userId')::text = auth.uid()::text);

-- 6. Archived Tasks - RLS מאובטח
-- קריאה: כמו tasks רגילות
CREATE POLICY "archived_tasks_select_policy" ON archived_tasks
FOR SELECT
USING (
  is_admin() OR
  (data->>'createdBy')::text = auth.uid()::text OR
  (data->>'assigneeId')::text = auth.uid()::text OR
  (data->>'handlerId')::text = auth.uid()::text
);

-- יצירה: רק מי שיכול לערוך את המשימה
CREATE POLICY "archived_tasks_insert_policy" ON archived_tasks
FOR INSERT
WITH CHECK (
  is_admin() OR
  (data->>'createdBy')::text = auth.uid()::text
);

-- עדכון: רק admin (לשחזור)
CREATE POLICY "archived_tasks_update_policy" ON archived_tasks
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- מחיקה: רק admin
CREATE POLICY "archived_tasks_delete_policy" ON archived_tasks
FOR DELETE
USING (is_admin());

-- 7. Users table - RLS מאובטח
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- קריאה: כולם רואים את כל המשתמשים (לצורך הקצאות)
CREATE POLICY "users_select_policy" ON users
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- יצירה: רק admin
CREATE POLICY "users_insert_policy" ON users
FOR INSERT
WITH CHECK (is_admin());

-- עדכון: משתמש יכול לעדכן רק את עצמו, admin יכול הכל
CREATE POLICY "users_update_policy" ON users
FOR UPDATE
USING (
  is_admin() OR
  id = auth.uid()::text
)
WITH CHECK (
  is_admin() OR
  id = auth.uid()::text
);

-- מחיקה: רק admin
CREATE POLICY "users_delete_policy" ON users
FOR DELETE
USING (is_admin());

-- 8. הפעלת RLS על כל הטבלאות (למקרה שהושבת)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticky_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_tasks ENABLE ROW LEVEL SECURITY;

-- 9. יצירת audit log table (אופציונלי אבל מומלץ)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS על audit log - רק admin רואה
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select_policy" ON audit_log
FOR SELECT
USING (is_admin());

CREATE POLICY "audit_log_insert_policy" ON audit_log
FOR INSERT
WITH CHECK (true); -- מערכת יכולה לכתוב

COMMENT ON TABLE audit_log IS 'Audit trail for security and compliance';

-- 10. הוספת indexes לביצועים
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks ((data->>'createdBy'));
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks ((data->>'assigneeId'));
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications ((data->>'userId'));
CREATE INDEX IF NOT EXISTS idx_sticky_notes_user ON sticky_notes ((data->>'userId'));

-- הצלחה!
SELECT 'RLS policies updated successfully! 🔒' as status;
