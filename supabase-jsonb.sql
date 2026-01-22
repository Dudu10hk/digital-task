-- פשוט מאוד - JSONB בלבד
-- לא נוגעים בטבלת users!

DROP TABLE IF EXISTS sticky_notes CASCADE;
DROP TABLE IF EXISTS archived_tasks CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- משימות - כל האובייקט ב-JSONB
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_column ON tasks ((data->>'column'));

-- התראות
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_toUserId ON notifications ((data->>'toUserId'));

-- פתקים
CREATE TABLE sticky_notes (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sticky_notes_userId ON sticky_notes ((data->>'userId'));

-- ארכיון
CREATE TABLE archived_tasks (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);
