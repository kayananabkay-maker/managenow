# MySQL Server Installation Guide for macOS

## Option 1: Install using Homebrew (Recommended - Easiest)

### Step 1: Install Homebrew (if not installed)
Open Terminal and run:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, follow the instructions to add Homebrew to your PATH.

### Step 2: Install MySQL
```bash
brew install mysql
```

### Step 3: Start MySQL Service
```bash
brew services start mysql
```

### Step 4: Secure MySQL Installation (Optional but Recommended)
```bash
mysql_secure_installation
```
- Press Enter for no password when prompted
- Set a new root password (or skip)
- Answer Y to remaining questions

### Step 5: Test Connection
```bash
mysql -uroot
```

---

## Option 2: Download Official MySQL Installer (No Homebrew needed)

### Step 1: Download MySQL
1. Go to: https://dev.mysql.com/downloads/mysql/
2. Select **macOS** as your operating system
3. Choose the **DMG Archive** (e.g., "macOS 14 (ARM, 64-bit), DMG Archive")
4. Click **Download** (you don't need to create an Oracle account - click "No thanks, just start my download")

### Step 2: Install MySQL
1. Open the downloaded `.dmg` file
2. Double-click the `.pkg` installer
3. Follow the installation wizard
4. **IMPORTANT**: Write down the temporary root password shown at the end!

### Step 3: Start MySQL
MySQL should start automatically. If not:

**Option A: Using System Preferences**
1. Open **System Preferences** (or **System Settings** on newer macOS)
2. Click **MySQL** at the bottom
3. Click **Start MySQL Server**

**Option B: Using Terminal**
```bash
sudo /usr/local/mysql/support-files/mysql.server start
```

### Step 4: Add MySQL to PATH
Add this to your `~/.zshrc` file:
```bash
echo 'export PATH="/usr/local/mysql/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Step 5: Change Root Password (if needed)
```bash
mysql -uroot -p
# Enter the temporary password from installation
```

Then in MySQL:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
-- Or set a new password:
-- ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
EXIT;
```

---

## After Installation: Setup Your Database

### Step 1: Create Database
```bash
cd /Users/nabilakayana/Desktop/managenow
mysql -uroot < database/schema.sql
```

Or manually:
```bash
mysql -uroot
```

Then run:
```sql
CREATE DATABASE managenow;
USE managenow;
SOURCE database/schema.sql;
EXIT;
```

### Step 2: Update Environment Variables
Your `.env.local` is already configured:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=managenow
```

If you set a MySQL root password, update `DB_PASSWORD` accordingly.

### Step 3: Test the Connection
```bash
cd /Users/nabilakayana/Desktop/managenow
node test-db.js
```

You should see:
```
✅ MySQL connection successful!
✅ Database "managenow" exists!
✅ Table "users" exists!
```

### Step 4: Update Code to Use Real MySQL
Run these commands to switch from stubs to real MySQL:
```bash
# This will be done automatically - files need to be updated
```

### Step 5: Restart Your Dev Server
```bash
# Kill existing server
lsof -ti:3000,3001 | xargs kill -9

# Start fresh
npm run dev
```

---

## Verification Commands

Check if MySQL is running:
```bash
ps aux | grep mysql
```

Check MySQL version:
```bash
mysql --version
```

Connect to MySQL:
```bash
mysql -uroot
```

Stop MySQL:
```bash
# Homebrew
brew services stop mysql

# Manual installation
sudo /usr/local/mysql/support-files/mysql.server stop
```

---

## Troubleshooting

### "Command not found: mysql"
MySQL is not in your PATH. Add it:
```bash
export PATH="/usr/local/mysql/bin:$PATH"
```

### "Access denied for user 'root'"
Your password is incorrect. Use the temporary password from installation or reset it.

### "Can't connect to MySQL server"
MySQL service is not running. Start it using one of the methods above.

### Port 3306 already in use
Another MySQL instance is running. Kill it:
```bash
lsof -ti:3306 | xargs kill -9
```

---

## Quick Start After Installation

1. **Start MySQL** (if not running)
2. **Setup database**: `mysql -uroot < database/schema.sql`
3. **Restart dev server**: `npm run dev`
4. **Go to**: http://localhost:3000/sign-up
5. **Create account and sign in!**

---

## Need Help?

If you encounter issues, run this diagnostic:
```bash
cd /Users/nabilakayana/Desktop/managenow
node test-db.js
```

And share the output!
