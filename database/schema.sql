-- ManageNow Database Schema for MySQL
-- Run this SQL script to create all necessary tables

-- Create database
CREATE DATABASE IF NOT EXISTS managenow;
USE managenow;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  date_of_birth DATE,
  ssn VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Banks table
CREATE TABLE IF NOT EXISTS banks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  bank_id VARCHAR(255),
  institution_id VARCHAR(255),
  account_type VARCHAR(50),
  -- Plaid integration fields
  access_token TEXT,
  item_id VARCHAR(255),
  -- Dwolla integration fields
  funding_source_url TEXT,
  -- Balance fields
  balance DECIMAL(15, 2) DEFAULT 0.00,
  available_balance DECIMAL(15, 2) DEFAULT 0.00,
  current_balance DECIMAL(15, 2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'USD',
  -- Account details
  shareable_id VARCHAR(255),
  account_name VARCHAR(255),
  official_name VARCHAR(255),
  mask VARCHAR(10),
  subtype VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_account_id (account_id),
  INDEX idx_institution_id (institution_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  bank_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  sender_bank_id VARCHAR(36),
  receiver_bank_id VARCHAR(36),
  -- Transaction details
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'debit', 'credit', 'transfer'
  category VARCHAR(100),
  payment_channel VARCHAR(100),
  -- Additional info
  email VARCHAR(255),
  pending BOOLEAN DEFAULT FALSE,
  pending_transaction_id VARCHAR(255),
  -- Plaid transaction fields
  transaction_id VARCHAR(255),
  merchant_name VARCHAR(255),
  location TEXT,
  -- Date and status
  date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_bank_id) REFERENCES banks(id) ON DELETE SET NULL,
  FOREIGN KEY (receiver_bank_id) REFERENCES banks(id) ON DELETE SET NULL,
  INDEX idx_bank_id (bank_id),
  INDEX idx_user_id (user_id),
  INDEX idx_date (date),
  INDEX idx_type (type),
  INDEX idx_category (category),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clean up expired sessions (run this periodically or set up a cron job)
CREATE EVENT IF NOT EXISTS cleanup_expired_sessions
ON SCHEDULE EVERY 1 DAY
DO
  DELETE FROM sessions WHERE expires_at < NOW();

-- Display tables
SHOW TABLES;
