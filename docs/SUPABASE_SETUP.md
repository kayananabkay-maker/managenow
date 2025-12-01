# Supabase SQL Database Schema for ManageNow

## Quick Setup Instructions

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up for free account
3. Create a new project
4. Choose a region closest to you
5. Set a database password (save it!)

### Step 2: Copy Your Credentials
Once your project is ready, go to **Settings** → **API**:

Copy these values:
- **Project URL**: `https://xxxxx.supabase.co`
- **Anon/Public Key**: `eyJhbGc...` (starts with eyJ)
- **Service Role Key**: `eyJhbGc...` (different from anon key)

### Step 3: Run SQL Schema
Go to **SQL Editor** in Supabase dashboard and run this:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends Supabase Auth)
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Indexes for better performance
CREATE INDEX idx_banks_user_id ON banks(user_id);
CREATE INDEX idx_transactions_bank_id ON transactions(bank_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_sender ON transactions(sender_bank_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_bank_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Security Policies for user_profiles
CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Security Policies for banks
CREATE POLICY "Users can view own banks" 
  ON banks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own banks" 
  ON banks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own banks" 
  ON banks FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own banks" 
  ON banks FOR DELETE 
  USING (auth.uid() = user_id);

-- Security Policies for transactions
CREATE POLICY "Users can view own transactions" 
  ON transactions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM banks
      WHERE banks.id = transactions.bank_id
      AND banks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transactions" 
  ON transactions FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM banks
      WHERE banks.id = transactions.bank_id
      AND banks.user_id = auth.uid()
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banks_updated_at BEFORE UPDATE ON banks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 4: Update Your .env.local File

Open `/Users/nabilakayana/Desktop/managenow/.env.local` and update:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Step 5: Test Your Setup

1. Restart dev server: `npm run dev`
2. Go to http://localhost:3000/sign-up
3. Create a test account
4. Check Supabase Dashboard → **Authentication** → **Users**
5. Check **Table Editor** → **user_profiles** for your data

---

## Database Schema Explained

### 1. **user_profiles** Table
Stores extended user information beyond auth.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users |
| email | TEXT | User email (unique) |
| first_name | TEXT | User's first name |
| last_name | TEXT | User's last name |
| address | TEXT | Street address |
| city | TEXT | City |
| state | TEXT | State/Province |
| postal_code | TEXT | ZIP/Postal code |
| date_of_birth | TEXT | Birth date |
| ssn | TEXT | Social security number (encrypted in production!) |
| dwolla_customer_id | TEXT | Dwolla ID for payments |
| dwolla_customer_url | TEXT | Dwolla customer URL |

### 2. **banks** Table
Stores connected bank accounts.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| account_id | TEXT | Plaid account ID |
| bank_id | TEXT | Bank institution ID |
| access_token | TEXT | Plaid access token |
| funding_source_url | TEXT | Dwolla funding source |
| shareable_id | TEXT | Unique shareable ID |
| institution_id | TEXT | Bank institution ID |
| official_name | TEXT | Official bank name |
| mask | TEXT | Last 4 digits of account |
| current_balance | DECIMAL | Current balance |
| available_balance | DECIMAL | Available balance |
| type | TEXT | Account type (depository, credit) |
| subtype | TEXT | Account subtype (checking, savings) |

### 3. **transactions** Table
Stores all transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| bank_id | UUID | Foreign key to banks |
| sender_bank_id | UUID | Sender bank (for transfers) |
| receiver_bank_id | UUID | Receiver bank (for transfers) |
| name | TEXT | Transaction description |
| amount | DECIMAL | Transaction amount |
| payment_channel | TEXT | Payment method |
| type | TEXT | Transaction type |
| category | TEXT | Transaction category |
| pending | BOOLEAN | Is transaction pending? |
| date | DATE | Transaction date |

---

## Security Features

### Row Level Security (RLS)
- ✅ Users can only see their own data
- ✅ Automatic user ID verification
- ✅ Protected at database level

### Policies
- Users can only **SELECT** their own profiles
- Users can only **INSERT/UPDATE** their own banks
- Users can only **VIEW** transactions from their banks

---

## Next Steps

### Add Real Bank Connections (Plaid)
```bash
npm install react-plaid-link plaid
```

### Add Payment Transfers (Dwolla)
```bash
npm install dwolla-v2
```

### Add Real-time Updates
```typescript
// Listen to balance changes
supabase
  .channel('banks')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'banks' },
    (payload) => console.log('Balance updated!', payload)
  )
  .subscribe()
```

---

## Troubleshooting

### Error: "relation does not exist"
- Run the SQL schema in Supabase SQL Editor
- Make sure all tables are created

### Error: "new row violates row-level security policy"
- Check that RLS policies are created
- Verify user is authenticated

### Error: "permission denied for table"
- Check RLS policies
- Verify service role key is correct

---

## Quick Reference

**Supabase Dashboard**: https://supabase.com/dashboard
**Documentation**: https://supabase.com/docs
**SQL Editor**: Dashboard → SQL Editor
**Table Editor**: Dashboard → Table Editor
**Authentication**: Dashboard → Authentication

---

✅ Your ManageNow app is now using PostgreSQL with Supabase!
