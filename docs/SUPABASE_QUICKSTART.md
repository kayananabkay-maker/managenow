# 🚀 Supabase Quick Start - 15 Minutes to Live Database

## ✅ All Errors Fixed - App is Ready!

Your dev server is running at: **http://localhost:3000**

Now just set up the database:

---

## Step 1: Create Supabase Account (3 min)

🌐 **Open in browser:** https://supabase.com

1. Click "Start your project"
2. Sign up with GitHub or Email
3. Verify email if needed

---

## Step 2: Create Project (2 min)

1. Click "New Project"
2. Fill in:
   - **Name:** ManageNow
   - **Database Password:** (create a strong password - SAVE IT!)
   - **Region:** Choose closest to you (e.g., Southeast Asia)
3. Click "Create new project"
4. Wait 1-2 minutes for setup

---

## Step 3: Get API Keys (1 min)

In your Supabase project:

1. Click **Settings** (gear icon, bottom left)
2. Click **API** in sidebar
3. Find these values:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public: eyJhbGciOiJI...
service_role: eyJhbGciOiJI...  ⚠️ Keep this secret!
```

---

## Step 4: Update .env.local (1 min)

Open: `/Users/nabilakayana/Desktop/managenow/.env.local`

Replace these 3 values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
```

**Save the file!**

---

## Step 5: Create Database Tables (3 min)

In Supabase Dashboard:

1. Click **SQL Editor** (left sidebar, </> icon)
2. Click **+ New query**
3. **Copy and paste this SQL:**

```sql
-- User profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  date_of_birth TEXT,
  ssn TEXT,
  dwolla_customer_id TEXT,
  dwolla_customer_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Banks table
CREATE TABLE banks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  account_id TEXT NOT NULL,
  bank_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  funding_source_url TEXT,
  shareable_id TEXT UNIQUE NOT NULL,
  institution_id TEXT,
  official_name TEXT,
  mask TEXT,
  current_balance DECIMAL(15, 2) DEFAULT 0,
  available_balance DECIMAL(15, 2) DEFAULT 0,
  type TEXT,
  subtype TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_id UUID REFERENCES banks ON DELETE CASCADE NOT NULL,
  sender_bank_id UUID REFERENCES banks ON DELETE SET NULL,
  receiver_bank_id UUID REFERENCES banks ON DELETE SET NULL,
  name TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  payment_channel TEXT,
  type TEXT NOT NULL,
  category TEXT,
  pending BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for performance
CREATE INDEX idx_banks_user_id ON banks(user_id);
CREATE INDEX idx_transactions_bank_id ON transactions(bank_id);
CREATE INDEX idx_transactions_date ON transactions(date);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own banks" ON banks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own banks" ON banks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM banks
      WHERE banks.id = transactions.bank_id
      AND banks.user_id = auth.uid()
    )
  );
```

4. Click **Run** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

---

## Step 6: Restart Dev Server (1 min)

In your terminal:

```bash
# Stop current server (Ctrl+C if needed)
# Then run:
npm run dev
```

✅ Server should start at http://localhost:3000

---

## Step 7: Test Sign Up! (2 min)

1. **Open browser:** http://localhost:3000/sign-up

2. **Fill in the form:**
   - First Name: John
   - Last Name: Doe
   - Address: 123 Test Street
   - City: Jakarta
   - State: JK
   - Postal Code: 12345
   - Date of Birth: 1990-01-01
   - SSN: 1234
   - Email: test@example.com
   - Password: Test123456!

3. **Click "Sign Up"**

4. **Success?** You'll be redirected to the homepage! 🎉

---

## Step 8: Verify in Supabase (1 min)

In Supabase Dashboard:

1. Click **Authentication** (left sidebar)
2. Click **Users** tab
3. **You should see your new user!**
4. Click **Table Editor** (left sidebar)
5. Select **user_profiles** table
6. **You should see your profile data!**

---

## 🎉 Success! You're Live!

### ✅ What You Have Now:

- ✅ PostgreSQL database (production-ready!)
- ✅ User authentication working
- ✅ Secure Row Level Security
- ✅ Sign up form with all fields
- ✅ User profiles saving to database
- ✅ Ready for bank integration

### 🎯 Test These:

- Sign up: http://localhost:3000/sign-up ✅
- Sign in: http://localhost:3000/sign-in ✅
- Homepage: http://localhost:3000 ✅

---

## 🆘 Troubleshooting

### ❌ "Failed to sign up"
**Check:**
1. Is .env.local updated with correct keys?
2. Did you restart server after changing .env.local?
3. Did SQL run successfully in Supabase?
4. Check browser console (F12) for errors

### ❌ "Table does not exist"
**Fix:**
1. Go to Supabase SQL Editor
2. Verify tables exist in Table Editor
3. Re-run the SQL if needed

### ❌ "Invalid JWT"
**Fix:**
1. Double-check you copied the FULL keys (they're very long!)
2. Make sure no extra spaces in .env.local
3. Restart dev server

### ❌ "Row level security"
**This is good!** It means security is working.
**Fix:** Make sure you're logged in as the user who owns the data.

---

## 📞 Need Help?

**If stuck, check:**
1. Supabase Dashboard → Logs (see error details)
2. Browser Console (F12) → Console tab
3. Terminal (see server errors)
4. Supabase Documentation: https://supabase.com/docs

**Common issues:**
- Forgot to restart server after .env.local change
- Copied wrong/incomplete API keys
- SQL didn't run completely
- Table names have typos

---

## 🚀 Next Steps (Optional)

Once basic auth works:

1. **Enable Email Verification:**
   - Supabase → Authentication → Settings
   - Turn on "Confirm email"

2. **Add Password Reset:**
   - Already built into Supabase
   - Just add a "Forgot Password" link

3. **Add Social Login:**
   - Supabase → Authentication → Providers
   - Enable Google, GitHub, etc.

4. **Connect Real Banks:**
   - Use Plaid API
   - Store bank data in `banks` table

5. **Add Transactions:**
   - Fetch from Plaid
   - Store in `transactions` table

---

## ✨ You're All Set!

Your banking app is now running with:
- ✅ PostgreSQL database
- ✅ Secure authentication
- ✅ Production-ready infrastructure
- ✅ Zero errors

**Time to build your features!** 🎊

Questions? Just ask! 😊
