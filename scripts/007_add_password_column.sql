-- Add password column to users table
-- This allows simple password-based authentication for the demo system

-- Add password column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'password'
  ) THEN
    ALTER TABLE users ADD COLUMN password TEXT;
  END IF;
END $$;

-- Update existing users with a default password if they don't have one
UPDATE users 
SET password = 'demo123' 
WHERE password IS NULL OR password = '';

-- Make password NOT NULL after setting defaults
ALTER TABLE users ALTER COLUMN password SET NOT NULL;

-- Add comment to document this column
COMMENT ON COLUMN users.password IS 'Plain text password for simple demo authentication (not for production use)';
