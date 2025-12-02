-- Add Brick API specific columns to banks table
-- Run this after the initial schema setup

USE managenow;

-- Add columns for Brick (Indonesian banks)
ALTER TABLE banks 
ADD COLUMN IF NOT EXISTS institution_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS account_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS account_holder VARCHAR(255);

-- Add column for external transaction ID
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS external_transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add index for external transaction ID
ALTER TABLE transactions
ADD INDEX IF NOT EXISTS idx_external_transaction_id (external_transaction_id);

-- Show updated structure
DESCRIBE banks;
DESCRIBE transactions;
