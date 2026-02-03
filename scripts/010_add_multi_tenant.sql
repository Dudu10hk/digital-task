-- סקריפט להוספת תמיכה ב-Multi-tenant (ריבוי צוותים)
-- הרץ את זה אם אתה רוצה שצוותים שונים ישתמשו באותה מערכת

-- ======================================
-- 1. צור טבלת teams (צוותים)
-- ======================================

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- הערה על settings:
-- אפשר לשמור שם: { "brandColor": "#3b82f6", "allowFileUploads": true, etc. }

-- ======================================
-- 2. הוסף team_id לטבלת users
-- ======================================

-- הוסף עמודה אם היא לא קיימת
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id TEXT;

-- הוסף foreign key
ALTER TABLE users 
  ADD CONSTRAINT fk_users_team 
  FOREIGN KEY (team_id) 
  REFERENCES teams(id) 
  ON DELETE SET NULL;

-- צור index לביצועים
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);

-- ======================================
-- 3. הגדר RLS על טבלת teams
-- ======================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- כולם יכולים לראות את הצוות שלהם
CREATE POLICY "teams_select_own" 
  ON teams 
  FOR SELECT 
  USING (
    id IN (
      SELECT team_id FROM users WHERE id = auth.uid()::text
    )
  );

-- או פשוט - כולם רואים את כל הצוותים (לצורך בחירה ב-login)
DROP POLICY IF EXISTS "teams_select_own" ON teams;
CREATE POLICY "teams_select_all" 
  ON teams 
  FOR SELECT 
  USING (true);

-- רק admins יכולים ליצור צוותים חדשים
CREATE POLICY "teams_insert_admin" 
  ON teams 
  FOR INSERT 
  WITH CHECK (true);  -- אפשר לשנות לבדיקת admin

CREATE POLICY "teams_update_all" 
  ON teams 
  FOR UPDATE 
  USING (true);

CREATE POLICY "teams_delete_all" 
  ON teams 
  FOR DELETE 
  USING (true);

-- ======================================
-- 4. עדכן RLS על users לסנן לפי צוות
-- ======================================

-- מחק policies ישנים
DROP POLICY IF EXISTS "users_select_all" ON users;

-- משתמשים יכולים לראות רק משתמשים מהצוות שלהם
CREATE POLICY "users_select_same_team" 
  ON users 
  FOR SELECT 
  USING (
    team_id = (
      SELECT team_id FROM users WHERE id = auth.uid()::text
    )
  );

-- אבל בינתיים - נשאיר פתוח לכולם (API יטפל בסינון)
DROP POLICY IF EXISTS "users_select_same_team" ON users;
CREATE POLICY "users_select_all" 
  ON users 
  FOR SELECT 
  USING (true);

-- ======================================
-- 5. צור index על tasks לסינון לפי צוות
-- ======================================

-- tasks.data->>'teamId' 
CREATE INDEX IF NOT EXISTS idx_tasks_team_id 
  ON tasks USING gin ((data->'teamId'));

-- ======================================
-- 6. צור צוות ברירת מחדל
-- ======================================

-- צור צוות ראשון
INSERT INTO teams (id, name, description, settings)
VALUES (
  'team-default',
  'צוות ראשי',
  'הצוות הראשי של המערכת',
  '{"brandColor": "#3b82f6", "allowFileUploads": true}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- עדכן משתמשים קיימים לצוות ברירת המחדל
UPDATE users 
SET team_id = 'team-default'
WHERE team_id IS NULL;

-- ======================================
-- 7. צור trigger לעדכון updated_at
-- ======================================

CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_teams_updated_at();

-- ======================================
-- 8. פונקציה עזר - קבל את team_id של המשתמש הנוכחי
-- ======================================

CREATE OR REPLACE FUNCTION get_current_user_team_id()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT team_id 
    FROM users 
    WHERE id = auth.uid()::text
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================
-- 9. בדיקה - הצג את המצב
-- ======================================

-- הצג צוותים
SELECT 
  id,
  name,
  description,
  created_at
FROM teams
ORDER BY created_at;

-- הצג משתמשים לפי צוותים
SELECT 
  u.name as user_name,
  u.email,
  u.role,
  t.name as team_name
FROM users u
LEFT JOIN teams t ON u.team_id = t.id
ORDER BY t.name, u.name;

-- ספור משתמשים לפי צוות
SELECT 
  t.name as team_name,
  COUNT(u.id) as user_count
FROM teams t
LEFT JOIN users u ON u.team_id = t.id
GROUP BY t.id, t.name
ORDER BY t.name;

-- ======================================
-- סיכום
-- ======================================

SELECT 
  '✅ Multi-tenant הותקן בהצלחה!' as status,
  'עכשיו צריך לעדכן את הקוד לסנן לפי team_id' as next_step;

-- ======================================
-- הערות חשובות:
-- ======================================

-- 1. עדכן את הקוד (task-context.tsx) לסנן משתמשים ומשימות לפי team_id
-- 2. הוסף בחירת צוות ב-login
-- 3. הוסף teamId לכל משימה חדשה
-- 4. עדכן את ממשק ניהול המשתמשים להוסיף משתמשים לצוות
-- 5. שקול להוסיף ממשק ניהול צוותים למנהלי מערכת

-- ======================================
-- דוגמה ליצירת צוות נוסף:
-- ======================================

/*
INSERT INTO teams (id, name, description, settings)
VALUES (
  'team-' || gen_random_uuid()::text,
  'צוות שיווק',
  'צוות השיווק של החברה',
  '{"brandColor": "#ef4444", "maxUsers": 10}'::jsonb
);
*/
