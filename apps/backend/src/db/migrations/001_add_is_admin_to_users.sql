-- Migration 001: Add isAdmin field to users table
-- Description: Add admin role functionality to users

-- Add isAdmin column to users table
ALTER TABLE users 
ADD COLUMN isAdmin BOOLEAN DEFAULT FALSE;

-- Create index for admin queries
CREATE INDEX idx_users_is_admin ON users(isAdmin);

-- Set first user as admin (optional - for initial setup)
-- This should be adjusted based on your needs
-- UPDATE users SET isAdmin = TRUE WHERE email = 'admin@example.com';

-- Update the updated_at timestamp for existing users
UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE isAdmin IS NOT NULL;
