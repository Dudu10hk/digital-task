-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  column TEXT NOT NULL CHECK (column IN ('todo', 'in-progress', 'done')),
  status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'done', 'on-hold', 'qa', 'canceled')),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  due_date TIMESTAMPTZ,
  
  -- Assignee (אחראי כללי)
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assignee_name TEXT,
  assignee_avatar TEXT,
  
  -- Handler (גורם מטפל)
  handler_id UUID REFERENCES users(id) ON DELETE SET NULL,
  handler_name TEXT,
  handler_avatar TEXT,
  
  -- In Progress Station
  in_progress_station TEXT CHECK (in_progress_station IN ('design', 'development', 'testing', 'feasibility', 'business-review', 'ux-requirements')),
  station_note TEXT,
  
  -- Links
  figma_link TEXT,
  process_spec_link TEXT,
  
  -- Metadata
  tagged_user_ids UUID[],
  order_index INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Files table
CREATE TABLE task_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'excel', 'word', 'other')),
  url TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Comments table
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  tagged_user_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task History table
CREATE TABLE task_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  field TEXT,
  old_value TEXT,
  new_value TEXT,
  station_from TEXT,
  station_to TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('mention', 'assignment', 'comment', 'handler')),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  task_title TEXT NOT NULL,
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_user_name TEXT NOT NULL,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_tasks_column ON tasks(column);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_handler ON tasks(handler_id);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_task_files_task ON task_files(task_id);
CREATE INDEX idx_task_comments_task ON task_comments(task_id);
CREATE INDEX idx_task_history_task ON task_history(task_id);
CREATE INDEX idx_notifications_to_user ON notifications(to_user_id, read);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies - כל משתמש מחובר יכול לקרוא הכל
CREATE POLICY "Anyone can read users" ON users FOR SELECT USING (true);
CREATE POLICY "Anyone can read tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Anyone can read task files" ON task_files FOR SELECT USING (true);
CREATE POLICY "Anyone can read task comments" ON task_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can read task history" ON task_history FOR SELECT USING (true);
CREATE POLICY "Users can read their notifications" ON notifications FOR SELECT USING (true);

-- RLS Policies - כתיבה
CREATE POLICY "Users can insert tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Admins can delete tasks" ON tasks FOR DELETE USING (true);

CREATE POLICY "Users can insert comments" ON task_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert files" ON task_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert history" ON task_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update notifications" ON notifications FOR UPDATE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for tasks
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo users
INSERT INTO users (id, name, email, avatar, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'דנה כהן', 'dana@insurance.co.il', '/woman-with-brown-hair-professional.jpg', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'יוסי לוי', 'yossi@insurance.co.il', '/professional-man-glasses.png', 'user'),
  ('00000000-0000-0000-0000-000000000003', 'מיכל אברהם', 'michal@insurance.co.il', '/professional-blonde-woman.png', 'admin'),
  ('00000000-0000-0000-0000-000000000004', 'אלון שמיר', 'alon@insurance.co.il', '/man-beard-professional.jpg', 'user');
