-- הסרת טבלאות קיימות
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS task_files CASCADE;
DROP TABLE IF EXISTS task_history CASCADE;
DROP TABLE IF EXISTS sticky_notes CASCADE;
DROP TABLE IF EXISTS archived_tasks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- טבלת משתמשים
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- טבלת משימות
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  board_column TEXT NOT NULL CHECK (board_column IN ('todo', 'in-progress', 'done')),
  status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'done', 'on-hold', 'qa', 'canceled')),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  due_date TIMESTAMPTZ,
  assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  assignee_name TEXT,
  assignee_avatar TEXT,
  handler_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  handler_name TEXT,
  handler_avatar TEXT,
  in_progress_station TEXT CHECK (in_progress_station IN ('design', 'development', 'testing', 'feasibility', 'business-review', 'ux-requirements')),
  station_note TEXT,
  tagged_user_ids TEXT[], -- Array of user IDs
  figma_link TEXT,
  process_spec_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  task_order INTEGER NOT NULL DEFAULT 0
);

-- טבלת קבצים של משימות
CREATE TABLE task_files (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'excel', 'word', 'other')),
  url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by TEXT NOT NULL
);

-- טבלת הערות של משימות
CREATE TABLE task_comments (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  tagged_user_ids TEXT[], -- Array of user IDs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- טבלת היסטוריה של משימות
CREATE TABLE task_history (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  field TEXT,
  old_value TEXT,
  new_value TEXT,
  station_from TEXT,
  station_to TEXT,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- טבלת התראות
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('mention', 'assignment', 'comment', 'handler')),
  task_id TEXT NOT NULL,
  task_title TEXT NOT NULL,
  from_user_id TEXT NOT NULL,
  from_user_name TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- טבלת משימות מאורכבות
CREATE TABLE archived_tasks (
  id TEXT PRIMARY KEY,
  task_data JSONB NOT NULL, -- המשימה המלאה כ-JSON
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  archived_by TEXT NOT NULL,
  archive_reason TEXT NOT NULL CHECK (archive_reason IN ('completed', 'deleted'))
);

-- טבלת פתקים אישיים
CREATE TABLE sticky_notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color IN ('yellow', 'blue', 'green', 'pink', 'purple')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- אינדקסים לביצועים
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_handler ON tasks(handler_id);
CREATE INDEX idx_tasks_column ON tasks(board_column);
CREATE INDEX idx_task_comments_task ON task_comments(task_id);
CREATE INDEX idx_task_history_task ON task_history(task_id);
CREATE INDEX idx_task_files_task ON task_files(task_id);
CREATE INDEX idx_notifications_to_user ON notifications(to_user_id);
CREATE INDEX idx_sticky_notes_user ON sticky_notes(user_id);
CREATE INDEX idx_archived_tasks_reason ON archived_tasks(archive_reason);

-- הוספת משתמשי ברירת מחדל
INSERT INTO users (id, name, email, password, avatar, role) VALUES
('1', 'דנה כהן', 'dana@insurance.co.il', '123456', '/woman-with-brown-hair-professional.jpg', 'admin'),
('2', 'יוסי לוי', 'yossi@insurance.co.il', '123456', '/man-with-glasses-professional.jpg', 'user'),
('3', 'מיכל אברהם', 'michal@insurance.co.il', '123456', '/woman-with-blonde-hair-professional.jpg', 'admin'),
('4', 'אלון שמיר', 'alon@insurance.co.il', '123456', '/man-with-dark-hair-professional.jpg', 'user');

-- Function לעדכון updated_at אוטומטית
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers לעדכון אוטומטי של updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sticky_notes_updated_at BEFORE UPDATE ON sticky_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
