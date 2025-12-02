# 📊 DB Browser for SQLite - Complete Guide

## ✅ What You've Already Done Right

Good news! Your database **already persists** and won't restart when you restart VS Code! 🎉

**Proof:**
```bash
file managenow.db
# Output: SQLite 3.x database, last written using SQLite version 3051001
```

The file `managenow.db` is a **persistent file** on your disk at:
```
/Users/nabilakayana/Desktop/managenow/managenow.db
```

---

## 🔍 Understanding How SQLite Works

### SQLite vs In-Memory Databases

**SQLite (File-Based) ← What You're Using ✅**
- Data stored in `managenow.db` file
- Persists between program restarts
- Can be opened by multiple tools
- Your data is **PERMANENT** unless you delete the file

**In-Memory Database (Not Used)**
- Data stored in RAM only
- Disappears when program closes
- Faster but temporary

---

## 📖 How to Use DB Browser for SQLite

### Step 1: Open Your Database ✅ (You've Done This!)

1. Open **DB Browser for SQLite**
2. Click **"Open Database"**
3. Navigate to: `/Users/nabilakayana/Desktop/managenow/`
4. Select: `managenow.db`
5. Click **"Open"**

---

### Step 2: View Your Tables

After opening the database, you'll see 4 tabs at the top:

#### **A. Database Structure Tab** 📋
Shows all your tables:
- `users`
- `sessions`
- `categories`
- `transactions`
- `bills`
- `bill_payments`
- `budgets`
- `financial_goals`
- `goal_contributions`
- `challenges`
- `user_challenges`
- `educational_content`
- `user_progress`
- `quick_shortcuts`

Click the **▶** arrow next to any table to see its columns.

---

#### **B. Browse Data Tab** 🔍
View actual data in tables:

1. Select a table from the **"Table:"** dropdown
2. See all rows of data
3. **Search/Filter** using the filter box
4. **Sort** by clicking column headers

**Example: View Categories**
- Select table: `categories`
- You should see 15 default categories:
  - Salary
  - Freelance
  - Investment
  - Other Income
  - Food & Dining
  - Transportation
  - Shopping
  - Entertainment
  - Bills & Utilities
  - Health & Fitness
  - Education
  - Personal Care
  - Travel
  - Gifts & Donations
  - Other Expense

---

#### **C. Execute SQL Tab** ⚡
Run custom SQL queries:

**Example Queries:**

```sql
-- View all transactions
SELECT * FROM transactions ORDER BY date DESC LIMIT 10;

-- Get total income and expenses
SELECT 
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
FROM transactions;

-- See budget status
SELECT * FROM budget_summary_view;

-- Check goals progress
SELECT * FROM goal_progress_view;

-- View upcoming bills
SELECT * FROM upcoming_bills_view;

-- Get spending by category
SELECT * FROM spending_by_category_view;
```

**How to run:**
1. Click **"Execute SQL"** tab
2. Type your SQL query
3. Click **▶ Execute SQL** button (or press F5)
4. See results below

---

#### **D. Edit Pragmas Tab** ⚙️
Database settings (you probably won't need this)

---

### Step 3: Add/Edit/Delete Data Manually

#### **Add a Transaction Manually:**

1. Go to **"Browse Data"** tab
2. Select table: `transactions`
3. Click **"New Record"** button
4. Fill in the fields:
   - `id`: Leave blank (auto-generated)
   - `user_id`: Your user ID (copy from `users` table)
   - `category_id`: A valid category ID (e.g., `1` for Salary)
   - `amount`: `5000.00`
   - `type`: `income`
   - `description`: `Monthly Salary`
   - `date`: `2025-12-01`
   - `receipt_url`: Leave blank or add a URL
   - `notes`: Optional
   - `created_at`: Leave blank (auto-generated)
5. Click **"Apply"** (checkmark button)
6. Click **"Write Changes"** (💾 Save button)

#### **Edit Existing Data:**

1. Browse to the table
2. Double-click the cell you want to edit
3. Type new value
4. Press Enter
5. Click **"Write Changes"** (💾 Save)

#### **Delete Data:**

1. Browse to the table
2. Click the row number on the left to select the row
3. Click **"Delete Record"** button (❌)
4. Click **"Write Changes"** (💾 Save)

---

### Step 4: View Database in Real-Time

You can keep DB Browser open **while your Next.js app is running**!

**What happens:**
- When you add data in your web app → Refresh DB Browser to see it
- When you add data in DB Browser → Refresh your web page to see it

**To refresh DB Browser:**
- Press **F5**
- Or click **"Refresh"** button
- Or close/reopen the table

---

## 🔄 Understanding Data Persistence

### Your Data Flow:

```
Next.js App (localhost:3000)
        ↓
    Server Actions
   (financial.actions.ts)
        ↓
    SQLite Library
   (better-sqlite3)
        ↓
  managenow.db FILE ← PERMANENT STORAGE
        ↑
   DB Browser for SQLite
```

**Key Points:**
1. ✅ Data is written to `managenow.db` file on disk
2. ✅ File persists even when you:
   - Close VS Code
   - Stop the Next.js server (`Ctrl+C`)
   - Restart your computer
3. ✅ Data only disappears if you:
   - Delete `managenow.db` file
   - Run `npm run db:setup` again (recreates database)
   - Manually clear tables

---

## 🧪 Test Data Persistence

### Test 1: Add Data and Restart Server

1. **While server is running:**
   ```bash
   npm run dev
   ```
   - Go to http://localhost:3000/transactions
   - Add a transaction (e.g., "Test Transaction $100")

2. **Stop the server:**
   ```bash
   Ctrl + C  # In terminal
   ```

3. **Restart the server:**
   ```bash
   npm run dev
   ```

4. **Check the data:**
   - Go back to http://localhost:3000/transactions
   - Your "Test Transaction" should **still be there** ✅

### Test 2: View in DB Browser

1. **Open DB Browser**
2. **Open `managenow.db`**
3. **Browse Data** → Select `transactions` table
4. **You should see your test transaction!** ✅

### Test 3: Add Data in DB Browser, View in Web

1. **In DB Browser:**
   - Add a transaction manually (see Step 3 above)
   - Click **"Write Changes"** 💾

2. **In your web browser:**
   - Refresh http://localhost:3000/transactions
   - You should see the new transaction! ✅

---

## ⚠️ Important Notes

### File Locking
- **SQLite uses file locking** to prevent data corruption
- If you get "database is locked" error:
  - Close DB Browser
  - Restart your Next.js server
  - Reopen DB Browser

### Multiple Connections
- SQLite allows **multiple readers** but only **one writer** at a time
- You can **view** in DB Browser while app is running ✅
- But writing simultaneously might cause locks ⚠️

### Backup Your Database
**Create backups regularly:**

```bash
# Copy database file
cp managenow.db managenow.backup.db

# Or with timestamp
cp managenow.db "managenow.backup.$(date +%Y%m%d_%H%M%S).db"
```

### Reset Database
If you want to start fresh:

```bash
# Option 1: Delete and recreate
rm managenow.db
npm run db:setup

# Option 2: Keep as backup
mv managenow.db managenow.old.db
npm run db:setup
```

---

## 🎯 Common DB Browser Tasks

### Task 1: Export Data to CSV

1. **Execute SQL** tab
2. Run your query:
   ```sql
   SELECT * FROM transactions WHERE date >= '2025-12-01';
   ```
3. Right-click results
4. **"Export to CSV"**
5. Save file

### Task 2: View Table Schema

1. **Database Structure** tab
2. Click **▶** next to table name
3. See columns, types, and constraints

Or run SQL:
```sql
PRAGMA table_info(transactions);
```

### Task 3: Check Triggers

```sql
-- View all triggers
SELECT name, tbl_name, sql 
FROM sqlite_master 
WHERE type = 'trigger';
```

### Task 4: Analyze Database Size

```sql
-- Database file size and page count
PRAGMA page_count;
PRAGMA page_size;

-- Analyze tables
ANALYZE;
```

---

## 🔧 Troubleshooting

### Problem: "Database file is encrypted or is not a database"

**Solution:**
- File might be corrupted
- Delete and recreate: `rm managenow.db && npm run db:setup`

### Problem: "No such table: transactions"

**Solution:**
- Tables not created yet
- Run: `npm run db:setup`

### Problem: Changes don't appear in web app

**Solution:**
1. Make sure you clicked **"Write Changes"** 💾 in DB Browser
2. Refresh your web browser
3. Check the correct user_id is used

### Problem: "Database is locked"

**Solution:**
1. Close DB Browser
2. Restart Next.js server
3. Reopen DB Browser
4. Or wait a few seconds and try again

---

## 📊 View Your Data Structure

Here's what your database looks like:

```
managenow.db
│
├── users (authentication)
│   └── id, email, password, first_name, last_name
│
├── sessions (login sessions)
│   └── token, user_id, expires_at
│
├── categories (15 default categories)
│   └── id, user_id, name, type, color, icon
│
├── transactions (income & expenses)
│   └── id, user_id, category_id, amount, type, date, description
│
├── bills (recurring payments)
│   └── id, user_id, name, amount, frequency, due_day
│
├── bill_payments (payment history)
│   └── id, bill_id, amount, paid_date
│
├── budgets (envelope budgeting)
│   └── id, user_id, category_id, month, year, allocated_amount
│
├── financial_goals (savings goals)
│   └── id, user_id, name, target_amount, current_amount, target_date
│
├── goal_contributions (goal deposits)
│   └── id, goal_id, amount, contribution_date
│
├── challenges (gamification)
│   └── id, title, description, points, target_value
│
├── user_challenges (user progress)
│   └── id, user_id, challenge_id, progress, completed_at
│
├── educational_content (financial tips)
│   └── id, title, content, category, difficulty
│
├── user_progress (gamification stats)
│   └── user_id, points, level, achievements_unlocked
│
└── quick_shortcuts (quick entry buttons)
    └── id, user_id, label, category_id, default_amount
```

---

## ✅ Summary - What You Need to Know

1. **Your database ALREADY persists!** ✅
   - File: `/Users/nabilakayana/Desktop/managenow/managenow.db`
   - Data stays even when you restart VS Code or server

2. **DB Browser is just a viewer/editor** 👁️
   - Like Windows Explorer for your database
   - View, edit, query, and export data
   - Real-time access while app runs

3. **Best Practice Workflow:**
   - Build features in Next.js app
   - Test data in browser
   - Use DB Browser to:
     - Verify data structure
     - Debug queries
     - Add test data
     - Export reports
     - Check triggers & views

4. **Backup regularly:**
   ```bash
   cp managenow.db managenow.backup.db
   ```

5. **Reset if needed:**
   ```bash
   npm run db:setup
   ```

---

## 🎉 You're All Set!

Your database is **persistent** and **working perfectly**! 

Open DB Browser, explore your data, and enjoy managing ManageNow! 🚀

---

**Last Updated:** December 1, 2025
