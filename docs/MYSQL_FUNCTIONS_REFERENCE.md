# MySQL Functions Quick Reference

All available functions in your MySQL setup, organized by category.

## 👤 User Actions (`lib/actions/user.actions.mysql.ts`)

### Authentication

```typescript
// Sign up a new user
signUp(userData: SignUpParams): Promise<User>
// Parameters: email, password, firstName, lastName, address, city, state, postalCode, dateOfBirth, ssn

// Sign in existing user
signIn({ email, password }: signInProps): Promise<{ success: boolean }>

// Get currently logged-in user
getLoggedInUser(): Promise<User | null>

// Logout current user
logoutAccount(): Promise<{ success: boolean }>
```

---

## 🏦 Bank Actions (`lib/actions/bank.actions.mysql.ts`)

### Create & Manage Banks

```typescript
// Create new bank account
createBankAccount(props: createBankAccountProps): Promise<Bank>
// Parameters: userId, bankId, accountId, accessToken, fundingSourceUrl, shareableId

// Get all banks for a user
getBanks({ userId }: getBanksProps): Promise<Bank[]>

// Get specific bank by ID
getBank({ documentId }: getBankProps): Promise<Bank>

// Get bank by account ID
getBankByAccountId({ accountId }: getBankByAccountIdProps): Promise<Bank | null>

// Delete bank account
deleteBankAccount(bankId: string): Promise<{ success: boolean }>
```

### Balance Operations

```typescript
// Update bank balance
updateBankBalance({
  bankId: string,
  balance?: number,
  availableBalance?: number,
  currentBalance?: number
}): Promise<void>

// Get total balance across all banks
getTotalBalance(userId: string): Promise<number>

// Get banks with transaction details
getBanksWithDetails(userId: string): Promise<Bank[]>
```

---

## 💳 Transaction Actions (`lib/actions/transaction.actions.mysql.ts`)

### Create & Retrieve Transactions

```typescript
// Create new transaction
createTransaction(transaction: CreateTransactionProps): Promise<Transaction>
// Parameters: name, amount, senderId, senderBankId, receiverId, receiverBankId, email

// Get all transactions for a user
getTransactions(userId: string): Promise<Transaction[]>

// Get recent transactions (default 10)
getRecentTransactions(userId: string, limit?: number): Promise<Transaction[]>

// Get specific transaction by ID
getTransaction(transactionId: string): Promise<Transaction>

// Get transactions for a specific bank
getTransactionsByBankId({ bankId }: getTransactionsByBankIdProps): Promise<Transaction[]>
```

### Filter & Search

```typescript
// Get transactions in date range
getTransactionsByDateRange({
  userId: string,
  startDate: Date,
  endDate: Date
}): Promise<Transaction[]>

// Get transactions by category
getTransactionsByCategory({
  userId: string,
  category: string
}): Promise<Transaction[]>
```

### Statistics & Analytics

```typescript
// Get transaction statistics
getTransactionStats(userId: string): Promise<{
  total_transactions: number,
  total_debits: number,
  total_credits: number,
  average_amount: number,
  max_transaction: number,
  min_transaction: number
}>

// Get spending by category
getSpendingByCategory(userId: string): Promise<Array<{
  category: string,
  transaction_count: number,
  total_amount: number,
  average_amount: number
}>>
```

### Update & Delete

```typescript
// Update transaction status
updateTransactionStatus({
  transactionId: string,
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
}): Promise<{ success: boolean }>

// Delete transaction
deleteTransaction(transactionId: string): Promise<{ success: boolean }>
```

---

## 🔌 MySQL Connection (`lib/mysql.ts`)

### Low-Level Database Access

```typescript
// Execute parameterized query
query(sql: string, params?: any[]): Promise<any>

// Test database connection
testConnection(): Promise<void>

// Get raw connection from pool
getConnection(): Promise<Connection>
```

---

## 📋 Usage Examples

### Complete User Flow

```typescript
// 1. Sign up
const newUser = await signUp({
  email: 'john@example.com',
  password: 'secure123',
  firstName: 'John',
  lastName: 'Doe',
  address: '123 Main St',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  dateOfBirth: '1990-01-01',
  ssn: '123-45-6789'
});

// 2. Sign in
await signIn({
  email: 'john@example.com',
  password: 'secure123'
});

// 3. Get current user
const user = await getLoggedInUser();

// 4. Add bank
const bank = await createBankAccount({
  userId: user.id,
  bankId: 'chase',
  accountId: 'acc_123',
  accessToken: 'access-token',
  fundingSourceUrl: 'https://dwolla.com/...',
  shareableId: 'share_123'
});

// 5. Get all banks
const banks = await getBanks({ userId: user.id });

// 6. Get total balance
const total = await getTotalBalance(user.id);

// 7. Create transaction
const transaction = await createTransaction({
  name: 'Transfer',
  amount: '100.00',
  senderId: user.id,
  senderBankId: banks[0].id,
  receiverId: user.id,
  receiverBankId: banks[1].id,
  email: user.email
});

// 8. Get recent transactions
const recent = await getRecentTransactions(user.id, 5);

// 9. Get statistics
const stats = await getTransactionStats(user.id);

// 10. Logout
await logoutAccount();
```

### Dashboard Example

```typescript
export default async function Dashboard() {
  // Get user data
  const user = await getLoggedInUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Get financial data
  const banks = await getBanks({ userId: user.id });
  const totalBalance = await getTotalBalance(user.id);
  const recentTransactions = await getRecentTransactions(user.id, 10);
  const stats = await getTransactionStats(user.id);
  const spending = await getSpendingByCategory(user.id);

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <p>Total Balance: ${totalBalance}</p>
      <BankList banks={banks} />
      <TransactionList transactions={recentTransactions} />
      <StatsWidget stats={stats} />
      <SpendingChart data={spending} />
    </div>
  );
}
```

### Bank Page Example

```typescript
export default async function BanksPage() {
  const user = await getLoggedInUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const banks = await getBanksWithDetails(user.id);

  return (
    <div>
      <h1>My Banks</h1>
      {banks.map(bank => (
        <BankCard
          key={bank.id}
          bank={bank}
          transactionCount={bank.transaction_count}
          lastTransaction={bank.last_transaction_date}
        />
      ))}
    </div>
  );
}
```

### Transaction History Example

```typescript
export default async function TransactionHistoryPage({
  searchParams
}: {
  searchParams: { category?: string }
}) {
  const user = await getLoggedInUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Get transactions (filtered by category if provided)
  const transactions = searchParams.category
    ? await getTransactionsByCategory({
        userId: user.id,
        category: searchParams.category
      })
    : await getTransactions(user.id);

  return (
    <div>
      <h1>Transaction History</h1>
      <CategoryFilter />
      <TransactionTable transactions={transactions} />
    </div>
  );
}
```

---

## 🔍 Function Signatures Reference

### Type Definitions

```typescript
// User types
interface SignUpParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  dateOfBirth: string;
  ssn: string;
}

interface signInProps {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  dateOfBirth?: string;
  ssn?: string;
}

// Bank types
interface createBankAccountProps {
  userId: string;
  bankId: string;
  accountId: string;
  accessToken: string;
  fundingSourceUrl: string;
  shareableId: string;
}

interface getBanksProps {
  userId: string;
}

interface getBankProps {
  documentId: string;
}

interface getBankByAccountIdProps {
  accountId: string;
}

interface Bank {
  id: string;
  user_id: string;
  account_id: string;
  bank_id?: string;
  institution_id?: string;
  access_token?: string;
  funding_source_url?: string;
  balance?: number;
  available_balance?: number;
  current_balance?: number;
  currency?: string;
  shareable_id?: string;
}

// Transaction types
interface CreateTransactionProps {
  name: string;
  amount: string;
  senderId: string;
  senderBankId: string;
  receiverId: string;
  receiverBankId: string;
  email: string;
}

interface getTransactionsByBankIdProps {
  bankId: string;
}

interface Transaction {
  id: string;
  bank_id: string;
  user_id: string;
  sender_bank_id?: string;
  receiver_bank_id?: string;
  name: string;
  amount: number;
  type: string;
  category?: string;
  payment_channel?: string;
  date: Date;
  status: string;
  email?: string;
}
```

---

## 🚀 Import Paths

```typescript
// User actions
import {
  signUp,
  signIn,
  getLoggedInUser,
  logoutAccount
} from '@/lib/actions/user.actions.mysql';

// Bank actions
import {
  createBankAccount,
  getBanks,
  getBank,
  getBankByAccountId,
  updateBankBalance,
  deleteBankAccount,
  getTotalBalance,
  getBanksWithDetails
} from '@/lib/actions/bank.actions.mysql';

// Transaction actions
import {
  createTransaction,
  getTransactions,
  getRecentTransactions,
  getTransaction,
  getTransactionsByBankId,
  getTransactionsByDateRange,
  getTransactionsByCategory,
  getTransactionStats,
  getSpendingByCategory,
  updateTransactionStatus,
  deleteTransaction
} from '@/lib/actions/transaction.actions.mysql';

// Direct database access (advanced)
import { query, testConnection } from '@/lib/mysql';
```

---

## 📊 Function Count

- **User Actions**: 4 functions
- **Bank Actions**: 8 functions
- **Transaction Actions**: 12 functions
- **Total**: 24 functions

All functions have the same signatures as your previous Appwrite setup! 🎉
