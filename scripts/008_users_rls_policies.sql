-- RLS Policies for users table
-- This ensures admins can create, read, update, and delete users

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_select_all" ON users;
DROP POLICY IF EXISTS "users_insert_admin" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;
DROP POLICY IF EXISTS "users_delete_admin" ON users;

-- Allow everyone to read users (needed for login and user lists)
CREATE POLICY "users_select_all" 
  ON users 
  FOR SELECT 
  USING (true);

-- Allow anyone to insert users (API will handle authentication)
-- Note: In production, you should add proper authentication checks
CREATE POLICY "users_insert_all" 
  ON users 
  FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to update users (API will handle authentication)
CREATE POLICY "users_update_all" 
  ON users 
  FOR UPDATE 
  USING (true);

-- Allow anyone to delete users (API will handle authentication)
CREATE POLICY "users_delete_all" 
  ON users 
  FOR DELETE 
  USING (true);

-- Alternative: If you want to restrict to admins only, use this instead:
-- (requires a function to check if the current user is an admin)
/*
CREATE POLICY "users_insert_admin" 
  ON users 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "users_update_admin" 
  ON users 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "users_delete_admin" 
  ON users 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role = 'admin'
    )
  );
*/
