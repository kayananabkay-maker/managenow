# 🐬 MySQL Database Setup Guide

Complete guide to set up MySQL for ManageNow authentication.

---

## ✅ Why MySQL?

- ✅ **Works locally** - No internet required after initial setup
- ✅ **No network blocks** - Runs on your computer
- ✅ **Fast** - Direct connection, no API calls
- ✅ **Free** - MySQL Community Edition is open source
- ✅ **Mature** - Well-tested and reliable
- ✅ **Full control** - You own your data

---

## 📦 Step 1: Install MySQL

### Option A: Using Homebrew (macOS - Recommended)

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation (set root password)
mysql_secure_installation
```

### Option B: Download MySQL Installer

1. Go to: https://dev.mysql.com/downloads/mysql/
2. Download **MySQL Community Server** for macOS
3. Install the `.dmg` file
4. Follow installer instructions
5. Remember the root password you set!

### Option C: Using XAMPP/MAMP (Easiest)

1. Download **XAMPP** from https://www.apachefriends.org/
2. Or download **MAMP** from https://www.mamp.info/
3. Install and start MySQL from the control panel
4. Default credentials usually: root / root or root / (no password)

---

## 🗄️ Step 2: Create Database & Tables

### Method 1: Using Terminal

```bash
# Log into MySQL
mysql -u root -p
# Enter your password

# Create database
CREATE DATABASE managenow;

# Exit
exit
```

Then run the schema file:

```bash
mysql -u root -p managenow < database/schema.sql
```

### Method 2: Using MySQL Workbench (GUI)

1. Download **MySQL Workbench**: https://dev.mysql.com/downloads/workbench/
2. Open MySQL Workbench
3. Create connection:
   - Host: localhost
   - Port: 3306
   - Username: root
   - Password: (your password)
4. Open `database/schema.sql` file
5. Click **Execute** (⚡ icon)
6. Database and tables created!

### Method 3: Using phpMyAdmin (if using XAMPP/MAMP)

1. Start XAMPP/MAMP
2. Go to: http://localhost/phpmyadmin
3. Click **"New"** to create database
4. Name it: **managenow**
5. Click **"SQL"** tab
6. Copy contents of `database/schema.sql`
7. Paste and click **"Go"**

---

## ⚙️ Step 3: Configure Environment Variables

Update `.env.local` with your MySQL credentials:

```bash
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_mysql_password  # ← Change this!
DB_NAME=managenow
```

**Important:** Replace `your_actual_mysql_password` with your real MySQL password!

---

## 📦 Step 4: Install Required Packages

When you have network access (or use VPN/mobile hotspot):

```bash
npm install mysql2 bcryptjs uuid
npm install --save-dev @types/bcryptjs @types/uuid
```

**If npm is blocked**, try:
1. Use VPN
2. Use mobile hotspot
3. Download packages manually from https://www.npmjs.com

---

## 🔄 Step 5: Update AuthForm

Change import in `components/AuthForm.tsx` (around line 20):

**FROM:**
```typescript
import { signIn, signUp } from '@/lib/actions/user.actions.mock'
```

**TO:**
```typescript
import { signIn, signUp } from '@/lib/actions/user.actions.mysql'
```

---

## 🚀 Step 6: Test Connection

Create a test file: `scripts/test-mysql.js`

```javascript
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'your_password',  // ← Your password
      database: 'managenow'
    });
    
    console.log('✅ MySQL connected!');
    
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('📊 Tables:', rows);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection();
```

Run it:
```bash
node scripts/test-mysql.js
```

---

## 🧪 Step 7: Test Authentication

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Sign up:**
   - Go to: http://localhost:3000/sign-up
   - Fill form and submit
   - Should redirect to homepage!

3. **Verify in database:**
   ```bash
   mysql -u root -p managenow
   SELECT * FROM users;
   SELECT * FROM sessions;
   ```

   You should see your new user!

4. **Test sign in:**
   - Go to: http://localhost:3000/sign-in
   - Use same credentials
   - Should work!

---

## 📊 Database Structure

### Users Table
- `id` - Unique user identifier (UUID)
- `email` - User email (unique)
- `password` - Hashed password (bcrypt)
- `first_name`, `last_name` - User name
- `address`, `city`, `postal_code` - Address info
- `date_of_birth`, `ssn` - Personal info
- `created_at`, `updated_at` - Timestamps

### Sessions Table
- `id` - Session identifier (UUID)
- `user_id` - Foreign key to users
- `token` - Session token (UUID, stored in cookie)
- `expires_at` - Expiration timestamp (7 days)
- Automatically cleans up expired sessions

### Banks Table (for future use)
- `id`, `user_id` - Bank account identifiers
- `account_id`, `bank_id` - Bank details
- `balance`, `available_balance` - Account balances
- `currency` - Currency type

### Transactions Table (for future use)
- `id`, `user_id`, `bank_id` - Transaction identifiers
- `amount`, `type`, `category` - Transaction details
- `date`, `status` - Transaction metadata

---

## 🔒 Security Features

✅ **Password Hashing**: Using bcryptjs (10 rounds)
✅ **Session Management**: UUID tokens, 7-day expiry
✅ **SQL Injection Protection**: Parameterized queries
✅ **Secure Cookies**: httpOnly, sameSite, secure flags
✅ **Foreign Keys**: Data integrity with CASCADE
✅ **Indexes**: Fast queries on email, user_id, dates

---

## 🐛 Troubleshooting

### "Can't connect to MySQL server"
**Problem**: MySQL not running
**Solution**: 
```bash
# Homebrew
brew services start mysql

# Or manually
mysql.server start

# XAMPP/MAMP - start from control panel
```

### "Access denied for user 'root'@'localhost'"
**Problem**: Wrong password
**Solution**: 
- Check your MySQL password
- Update `.env.local` with correct password
- Or reset MySQL root password

### "Database 'managenow' doesn't exist"
**Problem**: Database not created
**Solution**:
```bash
mysql -u root -p
CREATE DATABASE managenow;
exit
```

### "Cannot find module 'mysql2'"
**Problem**: Packages not installed
**Solution**: Install with VPN/mobile hotspot:
```bash
npm install mysql2 bcryptjs uuid
```

### "Table 'users' doesn't exist"
**Problem**: Tables not created
**Solution**: Run the schema file:
```bash
mysql -u root -p managenow < database/schema.sql
```

---

## 💡 Useful MySQL Commands

```bash
# Login to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use managenow database
USE managenow;

# Show tables
SHOW TABLES;

# View users
SELECT * FROM users;

# View sessions
SELECT * FROM sessions;

# Count users
SELECT COUNT(*) FROM users;

# Delete all sessions (logout everyone)
DELETE FROM sessions;

# Delete all data (start fresh)
TRUNCATE TABLE transactions;
TRUNCATE TABLE banks;
TRUNCATE TABLE sessions;
DELETE FROM users;

# Exit
exit
```

---

## 🎯 Next Steps

After MySQL is working:

1. ✅ Test sign-up and sign-in
2. Add bank account features
3. Implement transaction tracking
4. Connect Plaid for real bank data
5. Add Dwolla for transfers
6. Deploy application

---

## 📚 Additional Resources

- **MySQL Documentation**: https://dev.mysql.com/doc/
- **MySQL Workbench**: https://dev.mysql.com/downloads/workbench/
- **mysql2 npm package**: https://www.npmjs.com/package/mysql2
- **bcryptjs**: https://www.npmjs.com/package/bcryptjs

---

## 🆘 Still Need Help?

Check these files in your project:
- `lib/mysql.ts` - Database connection
- `lib/actions/user.actions.mysql.ts` - Authentication functions
- `database/schema.sql` - Database structure
- `.env.local` - Configuration

**Common mistakes:**
- ❌ MySQL not running
- ❌ Wrong password in `.env.local`
- ❌ Database/tables not created
- ❌ Packages not installed (need npm access)

---

Good luck! 🚀 MySQL is a solid choice for local development!
