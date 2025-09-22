-- Database Migration: Remove Approval System
-- Run these commands in pgAdmin4 to update your existing database

-- Step 1: Remove status column from registrations table (if it exists)
ALTER TABLE registrations DROP COLUMN IF EXISTS status;

-- Step 2: Remove first_name and last_name columns from students table
ALTER TABLE students DROP COLUMN IF EXISTS first_name;
ALTER TABLE students DROP COLUMN IF EXISTS last_name;
ALTER TABLE students DROP COLUMN IF EXISTS approved_date;

-- Step 3: Add first_login_date column to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS first_login_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Step 4: Update foreign key constraint for students table
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_registration_id_fkey;
ALTER TABLE students ADD CONSTRAINT students_registration_id_fkey 
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE;

-- Step 5: Remove status-related indexes
DROP INDEX IF EXISTS idx_registrations_status;

-- Step 6: Clear existing data to start fresh (optional)
-- WARNING: This will delete all existing data
-- TRUNCATE TABLE students RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE registrations RESTART IDENTITY CASCADE;

-- Verification: Check the updated table structures
SELECT 'registrations' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'registrations' 
UNION ALL
SELECT 'students' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'students'
ORDER BY table_name, column_name;