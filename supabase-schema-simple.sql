-- סכמת DB פשוטה יותר שתואמת את הקוד
-- נשתמש ב-JSONB לפשטות - שומר את כל האובייקט TypeScript כפי שהוא

-- ⚠️ לא נוגעים בטבלת users - היא כבר עובדת!

DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS task_files CASCADE;
DROP TABLE IF EXISTS task_history CASCADE;
DROP TABLE IF EXISTS sticky_notes CASCADE;
DROP TABLE IF EXISTS archived_tasks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- טבלת משימות - JSONB לפשטות
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index על שדות נפוצים
CREATE INDEX idx_tasks_column ON tasks ((data->>'column'));
CREATE INDEX idx_tasks_assigneeId ON tasks ((data->>'assigneeId'));

-- טבלת התראות - JSONB
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_toUserId ON notifications ((data->>'toUserId'));
CREATE INDEX idx_notifications_read ON notifications ((data->>'read'));

-- טבלת פתקים - JSONB
CREATE TABLE sticky_notes (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sticky_notes_userId ON sticky_notes ((data->>'userId'));

-- טבלת משימות מאורכבות - JSONB
CREATE TABLE archived_tasks (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_archived_tasks_reason ON archived_tasks ((data->>'archiveReason'));

-- Triggers לעדכון timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sticky_notes_updated_at
  BEFORE UPDATE ON sticky_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
