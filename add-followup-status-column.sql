-- ============================================
-- Migration: Add follow_up_status column
-- ============================================
-- Run this SQL in your Supabase SQL Editor to add the follow_up_status column to the follow_up_history table

-- Add the follow_up_status column with default value 'Pending'
ALTER TABLE follow_up_history 
ADD COLUMN IF NOT EXISTS follow_up_status TEXT DEFAULT 'Pending';

-- Update existing records to have 'Pending' status if null
UPDATE follow_up_history 
SET follow_up_status = 'Pending' 
WHERE follow_up_status IS NULL;

-- Done! The follow_up_status column has been added to your follow_up_history table.
