-- SQLite Database Schema for ManageNow
-- This file creates all necessary tables for the application

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  date_of_birth TEXT,
  ssn TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Banks table (from Finverse or other providers)
CREATE TABLE IF NOT EXISTS banks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  institution_id TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  access_token TEXT,
  account_id TEXT,
  shareable_id TEXT,
  provider TEXT DEFAULT 'finverse',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Accounts table (bank accounts)
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  bank_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  official_name TEXT,
  type TEXT,
  subtype TEXT,
  mask TEXT,
  current_balance REAL DEFAULT 0,
  available_balance REAL DEFAULT 0,
  iso_currency_code TEXT DEFAULT 'IDR',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  payment_channel TEXT,
  category TEXT,
  pending INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_banks_user_id ON banks(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_bank_id ON accounts(bank_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
