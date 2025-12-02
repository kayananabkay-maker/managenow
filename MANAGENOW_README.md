# 🎯 ManageNow - Complete Personal Finance Management System

A comprehensive personal finance management application built with Next.js, featuring manual transaction entry, bill tracking, envelope budgeting, financial goals, and analytics.

## ✨ Features

### 🧾 Core Manual Entry & Tracking
- **Intuitive Manual Input**: Quick and simple logging of income and expenses
- **Customizable Categories**: Create personalized spending and income categories
- **Receipt Management**: Attach receipt photos to transactions
- **Offline Access**: Full functionality without internet connection
- **Quick Shortcuts**: Custom shortcuts for frequent transactions

### 💰 Budgeting & Planning Tools
- **Envelope Budgeting System**: Digital "envelope" method for category-based budgeting
- **Goal Setting & Tracking**: Set and visualize progress toward financial milestones
- **Recurring Payments Management**: Track and forecast recurring bills and income
- **Forecasting & Projections**: Project future balances based on spending patterns

### 📊 Analysis & Education
- **Visual Spending Analysis**: Charts and graphs for expense visualization
- **Custom Reports & Data Export**: Export data as CSV for deeper analysis
- **Financial Literacy Content**: Built-in educational articles and tips
- **"Spend Less" Challenges**: Gamified savings challenges with points and achievements

## 🗂️ Database Schema

The application uses SQLite with the following structure:

### Core Tables
- **categories** - Income and expense categories (customizable per user)
- **transactions** - Manual transaction entries
- **bills** - Recurring payment/income definitions
- **bill_payments** - Individual bill payment tracking
- **budgets** - Envelope-style budget allocations
- **financial_goals** - Savings and financial milestone tracking
- **goal_contributions** - Track progress toward goals

### Gamification & Education
- **challenges** - Available financial challenges
- **user_challenges** - User participation in challenges
- **educational_content** - Financial literacy articles
- **user_progress** - Achievement tracking and streaks
- **quick_shortcuts** - Custom transaction shortcuts

### Analytics Views
- **monthly_spending_summary** - Aggregated spending by category
- **budget_vs_actual** - Budget performance tracking
- **upcoming_bills** - Bills due soon or overdue
- **goal_progress** - Progress toward active goals

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd managenow
```

2. Install dependencies:
```bash
npm install
```

3. Setup the database:
```bash
node scripts/setup-sqlite-db.js
```

This creates:
- ✅ 13 database tables
- ✅ 15 default categories  
- ✅ 5 pre-loaded challenges
- ✅ 5 educational articles
- ✅ 4 analytics views
- ✅ 8 automated triggers

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📱 Main Features & Pages

### 1. **Transactions** (`/transactions`)
- Add income/expenses manually
- Quick-add with saved shortcuts
- View transaction history
- Delete/edit transactions
- Real-time balance summary

### 2. **Bills & Payments** (`/bills`)
- Create recurring bills (daily, weekly, monthly, etc.)
- Track due dates and payment status
- Set payment reminders
- Mark bills as paid
- View upcoming and overdue bills

### 3. **Budgets** (`/budgets`)
- Envelope budgeting system
- Allocate funds to categories
- Real-time budget vs actual spending
- Visual progress bars
- Overspending alerts

### 4. **Financial Goals** (`/goals`)
- Set savings targets
- Track multiple goals simultaneously
- Visual progress charts
- Add contributions
- Goal completion celebration

### 5. **Analytics** (`/analytics`)
- Spending trends over time
- Income vs expense charts
- Category breakdown (pie charts)
- Monthly comparisons
- Export data to CSV

### 6. **Dashboard** (`/`)
- Overview of financial health
- Quick stats: income, expenses, net
- Upcoming bills widget
- Goal progress summary
- Recent transactions
- Achievement streaks

## 🎮 Gamification Features

### Challenges
- **No Eating Out Week** - Cook at home for 7 days (50 pts)
- **Coffee Shop Challenge** - Skip coffee shops for 30 days (100 pts)
- **Shopping Freeze** - No non-essential purchases for 2 weeks (150 pts)
- **Save $500 in 30 Days** - Aggressive savings goal (200 pts)
- **Daily Expense Tracker** - Log every expense for 30 days (100 pts)

### Achievements
- Transaction streaks
- Budget adherence badges
- Goal completion rewards
- Level up system
- Points and leaderboards (coming soon)

## 📚 Educational Content

Built-in financial literacy articles:
- The 50/30/20 Budget Rule
- Emergency Fund 101
- Envelope Budgeting Method
- Debt Snowball vs Avalanche
- Start Investing with $100

## 🔧 API Actions

All business logic is in `/lib/actions/financial.actions.ts`:

### Transactions
- `createTransaction(params)` - Add new transaction
- `getTransactions(userId, limit)` - Fetch transactions
- `deleteTransaction(id, userId)` - Remove transaction

### Categories
- `getCategories(userId, type)` - Get user categories
- `createCategory(params)` - Add custom category

### Bills
- `createBill(params)` - Create recurring bill
- `getBills(userId, isActive)` - Get all bills
- `getUpcomingBills(userId)` - Get bills due soon
- `markBillAsPaid(id, userId, paidDate)` - Mark as paid

### Budgets
- `createBudget(params)` - Allocate budget
- `getBudgets(userId, monthYear)` - Get budget status
- `getBudgetSummary(userId, monthYear)` - Overall budget health

### Goals
- `createGoal(params)` - Create financial goal
- `getGoals(userId)` - Get all goals with progress
- `addGoalContribution(params)` - Add money to goal

### Analytics
- `getMonthlySpending(userId, monthYear)` - Category breakdown
- `getSpendingTrends(userId, months)` - Historical trends
- `getDashboardSummary(userId)` - Complete dashboard data
- `exportTransactionsCSV(userId, startDate, endDate)` - Export to CSV

### Quick Shortcuts
- `getQuickShortcuts(userId)` - Get saved shortcuts
- `createQuickShortcut(params)` - Create new shortcut

### Education & Challenges
- `getEducationalContent(category)` - Get articles
- `getActiveChallenges()` - Get available challenges
- `getUserChallenges(userId)` - Get user's active challenges

## 🗄️ Database

Location: `./managenow.db` (SQLite)

### Automated Triggers
- Auto-update budget spent amounts when transactions are added/deleted
- Auto-update goal progress when contributions are made
- Track user activity streaks
- Update timestamps on record changes

### Sample Data Included
- 15 default categories (income and expense)
- 5 financial challenges
- 5 educational articles
- Pre-configured analytics views

## 📊 Technologies

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Authentication**: Custom auth with SQLite sessions
- **State Management**: React Hooks
- **Forms**: React Hook Form (optional)

## 🎨 UI Components

Modern, intuitive interface with:
- Responsive design (mobile-first)
- Clean card-based layouts
- Interactive charts and graphs
- Color-coded categories
- Icon-based navigation
- Toast notifications
- Modal dialogs
- Loading states

## 🔒 Security

- Password hashing with bcrypt
- Session-based authentication
- SQL injection protection with prepared statements
- User data isolation (all queries filtered by user_id)
- Input validation and sanitization

## 📝 File Structure

```
managenow/
├── app/
│   ├── (root)/
│   │   ├── transactions/      # Transaction management
│   │   ├── bills/              # Bill tracking
│   │   ├── budgets/            # Envelope budgeting
│   │   ├── goals/              # Financial goals
│   │   ├── analytics/          # Reports & charts
│   │   └── page.tsx            # Dashboard
├── components/
│   ├── pages/
│   │   ├── TransactionsPage.tsx
│   │   ├── BillsPage.tsx
│   │   ├── BudgetsPage.tsx
│   │   ├── GoalsPage.tsx
│   │   └── AnalyticsPage.tsx
├── lib/
│   ├── actions/
│   │   └── financial.actions.ts  # All business logic
│   └── sqlite.ts                  # Database connection
├── database/
│   └── managenow-sqlite-schema.sql  # Complete schema
├── scripts/
│   └── setup-sqlite-db.js         # DB initialization
└── types/
    └── index.d.ts                  # TypeScript definitions
```

## 🌟 Key Differentiators

Unlike typical finance apps, ManageNow:
- ✅ **Manual-first**: No bank linking required (privacy-focused)
- ✅ **Offline-capable**: Works without internet
- ✅ **Educational**: Built-in financial literacy
- ✅ **Gamified**: Makes saving money fun
- ✅ **Customizable**: Create your own categories and shortcuts
- ✅ **Open source**: Full control of your data
- ✅ **No subscriptions**: Free to use forever

## 🎯 Roadmap

### Coming Soon
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Recurring transaction templates
- [ ] Automated bill payment tracking
- [ ] Multi-currency support
- [ ] Collaborative budgets (family/couples)
- [ ] Advanced analytics (forecasting, what-if scenarios)
- [ ] Voice input for transactions
- [ ] Smart categorization (AI-powered)
- [ ] Budget recommendations
- [ ] Financial health score

### Future Enhancements
- [ ] Data sync across devices
- [ ] Cloud backup
- [ ] Social features (challenge friends)
- [ ] Integration with calendar for bill reminders
- [ ] Automated savings rules
- [ ] Investment tracking
- [ ] Debt payoff calculator
- [ ] Tax preparation support

## 📖 Usage Examples

### Adding a Transaction
```typescript
await createTransaction({
  userId: user.$id,
  categoryId: 5, // Food & Dining
  amount: 45.50,
  type: 'expense',
  description: 'Lunch at cafe',
  transactionDate: '2025-12-01',
  notes: 'Birthday celebration'
});
```

### Creating a Recurring Bill
```typescript
await createBill({
  userId: user.$id,
  categoryId: 9, // Bills & Utilities
  name: 'Electric Bill',
  amount: 120.00,
  type: 'expense',
  frequency: 'monthly',
  dueDay: 15, // 15th of each month
  startDate: '2025-01-01',
  reminderDays: 3,
  autoCreateTransaction: true
});
```

### Setting a Budget
```typescript
await createBudget({
  userId: user.$id,
  categoryId: 5, // Food & Dining
  monthYear: '2025-12',
  allocatedAmount: 500.00,
  notes: 'Holiday month - extra buffer'
});
```

### Creating a Financial Goal
```typescript
await createGoal({
  userId: user.$id,
  name: 'Emergency Fund',
  description: '6 months of expenses',
  targetAmount: 15000.00,
  targetDate: '2026-06-01',
  category: 'emergency',
  icon: '🚨',
  color: '#ef4444'
});
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Inspired by YNAB, Mint, Goodbudget, and other personal finance tools
- Built with ❤️ for people who want control over their finances

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check the documentation
- Review educational content in-app

---

**ManageNow** - Your money, your way. 💰✨
