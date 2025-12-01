# Quick Start: Connect MySQL to Your Project

This is a step-by-step guide to get MySQL working with your ManageNow project.

## Current Status
- ✅ MySQL code is ready (`lib/mysql.ts`, `lib/actions/user.actions.mysql.ts`)
- ✅ Database schema is ready (`database/schema.sql`)
- ✅ AuthForm updated to use MySQL
- ⏳ Waiting for MySQL installation
- ⏳ Waiting for npm packages (blocked by network)

## Prerequisites
- macOS (you're already on it)
- Terminal access
- MySQL needs to be installed

---

## Quick Setup (5 Steps)

### Step 1: Install MySQL (Choose One Method)

#### Method A: Homebrew (Recommended - 5 minutes)
```bash
# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation (set root password)
mysql_secure_installation
```

When prompted:
- Set root password: Choose a strong password
- Remove anonymous users: Yes
- Disallow root login remotely: Yes
- Remove test database: Yes
- Reload privilege tables: Yes

#### Method B: XAMPP (Easiest GUI - 10 minutes)
1. Download: https://www.apachefriends.org/
2. Install XAMPP
3. Open XAMPP Control Panel
4. Start MySQL
5. Click "Shell" button
6. You're ready!

#### Method C: MySQL Installer (Official - 15 minutes)
1. Download: https://dev.mysql.com/downloads/mysql/
2. Choose "macOS DMG Archive"
3. Install following the wizard
4. Remember your root password!

---

### Step 2: Create Database and Tables

#### Option A: Using the Setup Script (Easiest)
```bash
# Make script executable
chmod +x scripts/setup-mysql.sh

# Run the script
./scripts/setup-mysql.sh
```

The script will:
- ✅ Check MySQL installation
- ✅ Test connection
- ✅ Create `managenow` database
- ✅ Create all tables
- ✅ Update .env.local
- ✅ Verify everything works

#### Option B: Manual Setup
```bash
# Login to MySQL (you'll be prompted for password)
mysql -u root -p

# Create database
CREATE DATABASE managenow;

# Exit MySQL
exit

# Import schema
mysql -u root -p managenow < database/schema.sql

# Verify tables were created
mysql -u root -p managenow -e "SHOW TABLES;"
```

You should see:
```
+---------------------+
| Tables_in_managenow |
+---------------------+
| banks               |
| sessions            |
| transactions        |
| users               |
+---------------------+
```

---

### Step 3: Update .env.local

Edit `.env.local` and update the MySQL password:

```bash
DB_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD_HERE
```

Replace `your_mysql_password` with the password you set in Step 1.

---

### Step 4: Install npm Packages

**⚠️ Your network blocks npm! Choose one solution:**

#### Solution A: Use VPN (Fastest)
```bash
# Install ProtonVPN (free) from: https://protonvpn.com/
# Connect to VPN
# Then run:
npm install mysql2 bcryptjs uuid @types/bcryptjs @types/uuid
```

#### Solution B: Use Mobile Hotspot
```bash
# Enable hotspot on your phone
# Connect your Mac to the hotspot
# Then run:
npm install mysql2 bcryptjs uuid @types/bcryptjs @types/uuid
```

#### Solution C: Try Alternative Registry
```bash
# Use Taobao mirror (might not be blocked)
npm config set registry https://registry.npmmirror.com
npm install mysql2 bcryptjs uuid @types/bcryptjs @types/uuid

# Reset to default (optional)
npm config set registry https://registry.npmjs.org
```

#### Solution D: Manual Installation
See detailed instructions in: `docs/MYSQL_MANUAL_INSTALL.md`

---

### Step 5: Test Everything

#### A. Test MySQL Connection
```bash
node scripts/test-mysql-connection.js
```

Expected output:
```
🔍 Testing MySQL connection...
✓ MySQL module loaded successfully
📡 Testing database connection...
✓ Database connection successful
📊 Checking database...
✓ Current database: managenow
📋 Listing tables...
✓ Found tables:
  - banks
  - sessions
  - transactions
  - users
✅ All tests passed!
```

#### B. Start Development Server
```bash
npm run dev
```

Expected output:
```
▲ Next.js 16.0.3
- Local:        http://localhost:3000
✓ Ready in 1043ms
```

#### C. Test Authentication
1. Go to: http://localhost:3000/sign-up
2. Fill in the form:
   - **First Name**: John
   - **Last Name**: Doe
   - **Email**: john@example.com
   - **Password**: password123
3. Click "Sign Up"
4. Should redirect to homepage

#### D. Verify in Database
```bash
mysql -u root -p managenow

# Check if user was created
SELECT id, email, first_name, last_name FROM users;

# Check if session was created
SELECT user_id, token, expires_at FROM sessions;

# Exit
exit
```

---

## Troubleshooting

### Error: MySQL command not found
**Problem**: MySQL not installed
**Solution**: Go back to Step 1

### Error: Access denied for user 'root'
**Problem**: Wrong password in .env.local
**Solution**: 
1. Check your MySQL password
2. Update `DB_PASSWORD` in .env.local
3. Restart dev server

### Error: Cannot connect to MySQL server (ECONNREFUSED)
**Problem**: MySQL service not running
**Solution**:
```bash
# If using Homebrew
brew services start mysql

# If using XAMPP
# Start MySQL from XAMPP Control Panel
```

### Error: Cannot find module 'mysql2'
**Problem**: npm packages not installed
**Solution**: Go back to Step 4

### Error: Database 'managenow' doesn't exist
**Problem**: Database not created
**Solution**: Go back to Step 2

### Error: Table 'users' doesn't exist
**Problem**: Schema not imported
**Solution**:
```bash
mysql -u root -p managenow < database/schema.sql
```

---

## File Structure

Here's what each file does:

```
managenow/
├── lib/
│   ├── mysql.ts                          # MySQL connection pool
│   └── actions/
│       └── user.actions.mysql.ts         # Authentication functions
├── database/
│   └── schema.sql                        # Database structure
├── components/
│   └── AuthForm.tsx                      # Sign-up/Sign-in form
├── scripts/
│   ├── setup-mysql.sh                    # Automated setup script
│   └── test-mysql-connection.js          # Connection test
├── docs/
│   ├── MYSQL_SETUP.md                    # Detailed guide
│   ├── MYSQL_QUICK_START.md              # This file
│   └── MYSQL_MANUAL_INSTALL.md           # Manual package install
└── .env.local                            # Configuration
```

---

## What's Working Right Now

Even without MySQL installed, you can test the UI:
- ✅ Forms render correctly
- ✅ Validation works
- ✅ Loading states work
- ✅ Navigation works

Once MySQL is connected:
- ✅ Real user registration
- ✅ Secure password hashing
- ✅ Session management
- ✅ User authentication
- ✅ Database persistence

---

## Next Features to Build

After MySQL is working, you can add:

1. **Bank Account Management**
   - Connect to Plaid API
   - Add/remove bank accounts
   - View balances
   - Table: `banks` (already created)

2. **Transaction History**
   - View all transactions
   - Filter by date/category
   - Search transactions
   - Table: `transactions` (already created)

3. **Payment Transfers**
   - Connect to Dwolla API
   - Transfer money between accounts
   - Transaction status tracking

4. **Dashboard**
   - Total balance chart
   - Recent transactions
   - Quick actions

---

## Common Commands

```bash
# Start MySQL
brew services start mysql

# Stop MySQL
brew services stop mysql

# Login to MySQL
mysql -u root -p

# Show databases
mysql -u root -p -e "SHOW DATABASES;"

# Show tables in managenow
mysql -u root -p managenow -e "SHOW TABLES;"

# Count users
mysql -u root -p managenow -e "SELECT COUNT(*) FROM users;"

# View all users
mysql -u root -p managenow -e "SELECT * FROM users;"

# Clear all sessions (logout everyone)
mysql -u root -p managenow -e "DELETE FROM sessions;"

# Test connection
node scripts/test-mysql-connection.js

# Start dev server
npm run dev
```

---

## Need More Help?

Check these detailed guides:
- **Full setup guide**: `docs/MYSQL_SETUP.md`
- **Manual package installation**: `docs/MYSQL_MANUAL_INSTALL.md`
- **Database status**: `docs/DATABASE_STATUS.md`

---

## Summary Checklist

- [ ] MySQL installed
- [ ] Database `managenow` created
- [ ] Tables created from schema.sql
- [ ] .env.local password updated
- [ ] npm packages installed (mysql2, bcryptjs, uuid)
- [ ] Connection test passed
- [ ] Dev server running
- [ ] Sign-up form works
- [ ] User created in database

Once all boxes are checked, you're ready to go! 🚀
