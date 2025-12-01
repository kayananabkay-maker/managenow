# Database Setup

This folder contains the MySQL database schema for ManageNow.

## Quick Setup

### 1. Create Database
```bash
mysql -u root -p
CREATE DATABASE managenow;
exit
```

### 2. Import Schema
```bash
mysql -u root -p managenow < schema.sql
```

### 3. Verify
```bash
mysql -u root -p managenow -e "SHOW TABLES;"
```

You should see:
- banks
- sessions  
- transactions
- users

## Database Structure

### `users` table
Stores user account information:
- id (UUID primary key)
- email (unique, indexed)
- password (bcrypt hashed)
- first_name, last_name
- address, city, state, postal_code
- date_of_birth
- ssn (encrypted)
- created_at, updated_at

### `sessions` table
Manages user authentication sessions:
- id (UUID primary key)
- user_id (foreign key to users)
- token (UUID, unique, indexed)
- expires_at (7-day expiry)
- created_at

**Auto-cleanup**: Expired sessions are automatically deleted daily at 3 AM.

### `banks` table
Links user accounts to their bank accounts:
- id (UUID primary key)
- user_id (foreign key to users)
- account_id (indexed)
- bank_id
- institution_id (from Plaid)
- balance (DECIMAL 15,2)
- available_balance, current_balance
- currency (default USD)
- timestamps

### `transactions` table
Records all financial transactions:
- id (UUID primary key)
- bank_id (foreign key to banks)
- user_id (foreign key to users)
- sender_bank_id, receiver_bank_id (for transfers)
- name (transaction description)
- amount (DECIMAL 15,2)
- type (debit/credit, indexed)
- category (indexed)
- payment_channel
- date (indexed)
- status
- timestamps

## Relationships

```
users (1) ─── (many) sessions
  │
  └── (many) banks
        │
        └── (many) transactions
```

All foreign keys use `CASCADE` on delete, so:
- Deleting a user deletes all their sessions, banks, and transactions
- Deleting a bank deletes all its transactions

## Indexes

Optimized for common queries:
- users.email (unique lookups)
- sessions.token (authentication checks)
- sessions.user_id (session listing)
- sessions.expires_at (cleanup query)
- banks.user_id (user's bank accounts)
- banks.account_id (account lookups)
- transactions.bank_id (bank transactions)
- transactions.user_id (user transactions)
- transactions.date (date range queries)
- transactions.type (filter by type)
- transactions.category (filter by category)

## Security Features

1. **Password Hashing**: All passwords hashed with bcrypt (10 rounds)
2. **UUID**: All IDs are UUIDs (prevents enumeration attacks)
3. **Prepared Statements**: All queries use parameterized queries
4. **Foreign Keys**: Enforce referential integrity
5. **Indexes**: Prevent slow queries on large datasets
6. **Auto-cleanup**: Expired sessions automatically removed

## Maintenance

### View active sessions
```sql
SELECT u.email, s.token, s.expires_at 
FROM sessions s 
JOIN users u ON s.user_id = u.id 
WHERE s.expires_at > NOW();
```

### Clear expired sessions manually
```sql
DELETE FROM sessions WHERE expires_at < NOW();
```

### View user statistics
```sql
SELECT 
  COUNT(*) as total_users,
  COUNT(DISTINCT u.id) as users_with_banks
FROM users u
LEFT JOIN banks b ON u.id = b.user_id;
```

### View transaction statistics
```sql
SELECT 
  COUNT(*) as total_transactions,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount
FROM transactions;
```

## Backup

### Create backup
```bash
mysqldump -u root -p managenow > backup_$(date +%Y%m%d).sql
```

### Restore from backup
```bash
mysql -u root -p managenow < backup_20251130.sql
```

## Useful Commands

```sql
-- Show table structure
DESCRIBE users;

-- Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM sessions;
SELECT COUNT(*) FROM banks;
SELECT COUNT(*) FROM transactions;

-- View recent users
SELECT id, email, first_name, last_name, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- View recent transactions
SELECT t.*, u.email, b.account_id
FROM transactions t
JOIN users u ON t.user_id = u.id
JOIN banks b ON t.bank_id = b.id
ORDER BY t.date DESC
LIMIT 10;

-- Check database size
SELECT 
  table_name AS 'Table',
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'managenow'
ORDER BY (data_length + index_length) DESC;
```

## Need Help?

See the main documentation:
- `docs/CONNECT_MYSQL_NOW.md` - Quick start guide
- `docs/MYSQL_SETUP.md` - Detailed setup
- `docs/MYSQL_MANUAL_INSTALL.md` - Manual package installation
