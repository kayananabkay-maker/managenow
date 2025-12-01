# SQL Database Setup Guide for ManageNow

## Why SQL for Banking Apps?

✅ **ACID Compliance** - Guaranteed transaction consistency
✅ **Strong Data Integrity** - Enforced relationships and constraints
✅ **Mature Technology** - Battle-tested for financial applications
✅ **Complex Queries** - Great for financial reports and analytics
✅ **Scalability** - Handle millions of transactions

## Option 1: PostgreSQL with Supabase (Easiest) ⭐ Recommended

Supabase = PostgreSQL + Authentication + Real-time + Storage

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### Step 2: Create Supabase Account

1. Go to https://supabase.com
2. Sign up (free tier available)
3. Create new project
4. Copy your Project URL and API Key

### Step 3: Database Schema

Supabase will create this SQL for you:

```sql
-- Users table (Supabase Auth handles this automatically)

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
  date_of_birth DATE,
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

-- Indexes for performance
CREATE INDEX idx_banks_user_id ON banks(user_id);
CREATE INDEX idx_transactions_bank_id ON transactions(bank_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_sender ON transactions(sender_bank_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_bank_id);

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

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

### Step 4: Environment Variables

Create/update `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Plaid (for bank connections)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
```

### Step 5: Create Supabase Client

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### Step 6: Create Auth Actions

Create `lib/actions/supabase-auth.ts`:

```typescript
'use server'

import { supabase, supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signUp(formData: SignUpParams) {
  const { email, password, firstName, lastName, ...profile } = formData

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    }
  })

  if (authError) throw authError

  // Create user profile
  if (authData.user) {
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        ...profile
      })

    if (profileError) throw profileError
  }

  revalidatePath('/')
  redirect('/')
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  revalidatePath('/')
  redirect('/')
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  
  revalidatePath('/')
  redirect('/sign-in')
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get full profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { ...user, profile }
}
```

### Step 7: Update AuthForm

Modify `components/AuthForm.tsx` to use Supabase:

```typescript
import { signIn, signUp } from '@/lib/actions/supabase-auth'

// In onSubmit function:
const onSubmit = async (data: z.infer<typeof formSchema>) => {
  setIsLoading(true)
  
  try {
    if (type === 'sign-up') {
      await signUp(data as SignUpParams)
    } else {
      await signIn(data.email, data.password)
    }
  } catch (error: any) {
    console.error(error)
    // Show error to user
    alert(error.message)
  } finally {
    setIsLoading(false)
  }
}
```

---

## Option 2: PostgreSQL with Prisma (More Control)

### Step 1: Install Dependencies

```bash
npm install @prisma/client
npm install -D prisma
```

### Step 2: Initialize Prisma

```bash
npx prisma init
```

### Step 3: Create Schema

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  password          String
  firstName         String
  lastName          String
  name              String
  address1          String?
  city              String?
  state             String?
  postalCode        String?
  dateOfBirth       String?
  ssn               String?
  dwollaCustomerId  String?
  dwollaCustomerUrl String?
  banks             Bank[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model Bank {
  id                 String        @id @default(cuid())
  userId             String
  user               User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  accountId          String
  bankId             String
  accessToken        String
  fundingSourceUrl   String?
  shareableId        String        @unique
  institutionId      String?
  officialName       String?
  mask               String?
  currentBalance     Decimal       @default(0)
  availableBalance   Decimal       @default(0)
  type               String?
  subtype            String?
  transactions       Transaction[]
  sentTransactions   Transaction[] @relation("SenderBank")
  receivedTransactions Transaction[] @relation("ReceiverBank")
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  @@index([userId])
}

model Transaction {
  id              String   @id @default(cuid())
  bankId          String
  bank            Bank     @relation(fields: [bankId], references: [id], onDelete: Cascade)
  senderBankId    String?
  senderBank      Bank?    @relation("SenderBank", fields: [senderBankId], references: [id])
  receiverBankId  String?
  receiverBank    Bank?    @relation("ReceiverBank", fields: [receiverBankId], references: [id])
  name            String
  amount          Decimal
  paymentChannel  String?
  type            String
  category        String?
  pending         Boolean  @default(false)
  date            DateTime
  createdAt       DateTime @default(now())

  @@index([bankId])
  @@index([date])
}
```

### Step 4: Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/managenow?schema=public"
```

### Step 5: Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Step 6: Create Prisma Client

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## Option 3: MySQL with PlanetScale (Serverless)

Similar to Prisma setup but:
- Use PlanetScale for serverless MySQL
- Change provider to `mysql` in schema
- No migrations needed (use `prisma db push`)

---

## Comparison Table

| Feature | Supabase | Prisma | Appwrite |
|---------|----------|---------|----------|
| Setup Time | 10 min | 30 min | 15 min |
| Auth Built-in | ✅ Yes | ❌ No | ✅ Yes |
| Real-time | ✅ Yes | ❌ No | ✅ Yes |
| Type Safety | ✅ Good | ✅ Excellent | ⚠️ Basic |
| Free Tier | 500MB | Self-host | 75k MAU |
| Best For | Rapid dev | Large apps | All-in-one |

---

## My Recommendation for ManageNow

**Use Supabase** because:
1. ✅ Built-in authentication (save time)
2. ✅ PostgreSQL (ACID compliant for banking)
3. ✅ Row Level Security (better data protection)
4. ✅ Real-time subscriptions (for live balance updates)
5. ✅ Easy to start, scales well
6. ✅ Free tier is generous

---

## Quick Start with Supabase

Want me to set it up? I can:
1. Install Supabase packages
2. Create the configuration files
3. Update AuthForm to use Supabase
4. Set up the database schema

Just say "set up supabase" and I'll do it all for you! 🚀
