-- ManageNow Complete Database Schema for SQLite
-- Features: Manual Transaction Entry, Bills, Budgeting, Goals, Analytics

-- ============================================
-- CATEGORIES TABLE
-- Custom spending and income categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    icon TEXT DEFAULT '💰',
    color TEXT DEFAULT '#3b82f6',
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_categories ON categories(user_id, type);

-- ============================================
-- TRANSACTIONS TABLE
-- Manual entry of income and expenses
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    description TEXT,
    transaction_date DATE NOT NULL,
    receipt_url TEXT,
    notes TEXT,
    is_recurring INTEGER DEFAULT 0,
    recurring_bill_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_user_transactions ON transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transaction_date ON transactions(transaction_date);

-- ============================================
-- BILLS TABLE (Recurring Payments)
-- Track recurring income and expenses
-- ============================================
CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    due_day INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    reminder_days INTEGER DEFAULT 3,
    is_active INTEGER DEFAULT 1,
    auto_create_transaction INTEGER DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_user_bills ON bills(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_due_day ON bills(due_day);

-- ============================================
-- BILL PAYMENTS TABLE
-- Track which bills have been paid
-- ============================================
CREATE TABLE IF NOT EXISTS bill_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    transaction_id INTEGER,
    due_date DATE NOT NULL,
    paid_date DATE,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'overdue', 'skipped')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bill_payments ON bill_payments(bill_id, due_date);
CREATE INDEX IF NOT EXISTS idx_status ON bill_payments(status, due_date);
CREATE INDEX IF NOT EXISTS idx_bill_due_date ON bill_payments(due_date, status);

-- ============================================
-- BUDGETS TABLE (Envelope System)
-- Allocate funds to categories
-- ============================================
CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    month_year TEXT NOT NULL,
    allocated_amount REAL NOT NULL,
    spent_amount REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(user_id, category_id, month_year)
);

CREATE INDEX IF NOT EXISTS idx_user_month ON budgets(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_budget_month ON budgets(month_year);

-- ============================================
-- FINANCIAL GOALS TABLE
-- Track savings and financial milestones
-- ============================================
CREATE TABLE IF NOT EXISTS financial_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    target_amount REAL NOT NULL,
    current_amount REAL DEFAULT 0,
    target_date DATE,
    category TEXT DEFAULT 'savings' CHECK(category IN ('savings', 'debt', 'investment', 'purchase', 'emergency', 'other')),
    icon TEXT DEFAULT '🎯',
    color TEXT DEFAULT '#10b981',
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_user_goals ON financial_goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_goal_status ON financial_goals(status, target_date);

-- ============================================
-- GOAL CONTRIBUTIONS TABLE
-- Track contributions to goals
-- ============================================
CREATE TABLE IF NOT EXISTS goal_contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_id INTEGER NOT NULL,
    transaction_id INTEGER,
    amount REAL NOT NULL,
    contribution_date DATE NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (goal_id) REFERENCES financial_goals(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_goal_contributions ON goal_contributions(goal_id, contribution_date);

-- ============================================
-- CHALLENGES TABLE
-- Gamification: Spend Less Challenges
-- ============================================
CREATE TABLE IF NOT EXISTS challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'spend_less' CHECK(type IN ('spend_less', 'save_more', 'habit', 'custom')),
    difficulty TEXT DEFAULT 'medium' CHECK(difficulty IN ('easy', 'medium', 'hard')),
    points INTEGER DEFAULT 10,
    duration_days INTEGER DEFAULT 30,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USER CHALLENGES TABLE
-- Track user participation in challenges
-- ============================================
CREATE TABLE IF NOT EXISTS user_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    challenge_id INTEGER NOT NULL,
    category_id INTEGER,
    target_amount REAL,
    current_amount REAL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'failed', 'abandoned')),
    points_earned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_user_challenges ON user_challenges(user_id, status);

-- ============================================
-- QUICK SHORTCUTS TABLE
-- Custom shortcuts for frequent transactions
-- ============================================
CREATE TABLE IF NOT EXISTS quick_shortcuts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    amount REAL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    icon TEXT DEFAULT '⚡',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_shortcuts ON quick_shortcuts(user_id, sort_order);

-- ============================================
-- EDUCATIONAL CONTENT TABLE
-- Financial literacy articles and tips
-- ============================================
CREATE TABLE IF NOT EXISTS educational_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general' CHECK(category IN ('budgeting', 'saving', 'investing', 'debt', 'general')),
    difficulty TEXT DEFAULT 'beginner' CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')),
    reading_time_minutes INTEGER DEFAULT 5,
    is_published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_category_published ON educational_content(category, is_published);

-- ============================================
-- USER PROGRESS TABLE
-- Track user achievements and milestones
-- ============================================
CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    transactions_count INTEGER DEFAULT 0,
    budgets_created INTEGER DEFAULT 0,
    goals_completed INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_progress ON user_progress(user_id);

-- ============================================
-- INSERT DEFAULT CATEGORIES
-- ============================================
INSERT OR IGNORE INTO categories (user_id, name, type, icon, color, is_default) VALUES
('default', 'Salary', 'income', '💼', '#10b981', 1),
('default', 'Freelance', 'income', '💻', '#06b6d4', 1),
('default', 'Investment', 'income', '📈', '#8b5cf6', 1),
('default', 'Other Income', 'income', '💰', '#f59e0b', 1),
('default', 'Food & Dining', 'expense', '🍽️', '#ef4444', 1),
('default', 'Transportation', 'expense', '🚗', '#3b82f6', 1),
('default', 'Shopping', 'expense', '🛍️', '#ec4899', 1),
('default', 'Entertainment', 'expense', '🎬', '#a855f7', 1),
('default', 'Bills & Utilities', 'expense', '📄', '#f97316', 1),
('default', 'Healthcare', 'expense', '⚕️', '#14b8a6', 1),
('default', 'Education', 'expense', '📚', '#6366f1', 1),
('default', 'Housing', 'expense', '🏠', '#0ea5e9', 1),
('default', 'Personal Care', 'expense', '💅', '#d946ef', 1),
('default', 'Subscriptions', 'expense', '📱', '#8b5cf6', 1),
('default', 'Other Expense', 'expense', '📝', '#64748b', 1);

-- ============================================
-- INSERT SAMPLE CHALLENGES
-- ============================================
INSERT OR IGNORE INTO challenges (title, description, type, difficulty, points, duration_days) VALUES
('No Eating Out Week', 'Cook all meals at home for 7 days', 'spend_less', 'easy', 50, 7),
('Coffee Shop Challenge', 'Skip coffee shops for 30 days and save!', 'spend_less', 'medium', 100, 30),
('Shopping Freeze', 'No non-essential purchases for 2 weeks', 'spend_less', 'medium', 150, 14),
('Save $500 in 30 Days', 'Set aside $500 this month', 'save_more', 'hard', 200, 30),
('Daily Expense Tracker', 'Log every expense for 30 days', 'habit', 'easy', 100, 30);

-- ============================================
-- INSERT SAMPLE EDUCATIONAL CONTENT
-- ============================================
INSERT OR IGNORE INTO educational_content (title, content, category, difficulty, reading_time_minutes) VALUES
('The 50/30/20 Budget Rule', 'Learn how to allocate your income: 50% needs, 30% wants, 20% savings. This simple rule helps you maintain financial balance and ensures you''re covering essential expenses while still enjoying life and building savings for the future.', 'budgeting', 'beginner', 5),
('Emergency Fund 101', 'Why you need 3-6 months of expenses saved and how to build it step by step. An emergency fund provides financial security and peace of mind when unexpected expenses arise, such as medical bills, car repairs, or job loss.', 'saving', 'beginner', 7),
('Envelope Budgeting Method', 'Master the envelope system: allocate cash (or digital funds) to specific categories and only spend what you have allocated. This proven method helps you stay within budget and avoid overspending in any category.', 'budgeting', 'beginner', 6),
('Debt Snowball vs Avalanche', 'Two proven methods to pay off debt: emotional wins vs mathematical efficiency. The snowball method focuses on small victories, while the avalanche method saves you the most money in interest. Choose the strategy that matches your personality and motivation style.', 'debt', 'intermediate', 10),
('Start Investing with $100', 'You don''t need to be rich to invest. Learn how to start with small amounts using index funds, ETFs, or micro-investing apps. Time in the market beats timing the market, and starting early with even small amounts can lead to significant long-term growth.', 'investing', 'beginner', 8);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Update timestamp trigger for categories
CREATE TRIGGER IF NOT EXISTS update_categories_timestamp 
AFTER UPDATE ON categories
BEGIN
    UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update timestamp trigger for transactions
CREATE TRIGGER IF NOT EXISTS update_transactions_timestamp 
AFTER UPDATE ON transactions
BEGIN
    UPDATE transactions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update timestamp trigger for bills
CREATE TRIGGER IF NOT EXISTS update_bills_timestamp 
AFTER UPDATE ON bills
BEGIN
    UPDATE bills SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update timestamp trigger for budgets
CREATE TRIGGER IF NOT EXISTS update_budgets_timestamp 
AFTER UPDATE ON budgets
BEGIN
    UPDATE budgets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update budget spent amount when transaction is added
CREATE TRIGGER IF NOT EXISTS update_budget_spent_after_insert
AFTER INSERT ON transactions
BEGIN
    UPDATE budgets 
    SET spent_amount = spent_amount + NEW.amount
    WHERE user_id = NEW.user_id 
        AND category_id = NEW.category_id
        AND month_year = strftime('%Y-%m', NEW.transaction_date)
        AND NEW.type = 'expense';
END;

-- Update budget spent amount when transaction is deleted
CREATE TRIGGER IF NOT EXISTS update_budget_spent_after_delete
AFTER DELETE ON transactions
BEGIN
    UPDATE budgets 
    SET spent_amount = spent_amount - OLD.amount
    WHERE user_id = OLD.user_id 
        AND category_id = OLD.category_id
        AND month_year = strftime('%Y-%m', OLD.transaction_date)
        AND OLD.type = 'expense';
END;

-- Update goal amount when contribution is added
CREATE TRIGGER IF NOT EXISTS update_goal_amount_after_contribution
AFTER INSERT ON goal_contributions
BEGIN
    UPDATE financial_goals 
    SET current_amount = current_amount + NEW.amount,
        status = CASE 
            WHEN (current_amount + NEW.amount) >= target_amount THEN 'completed'
            ELSE status
        END,
        completed_at = CASE 
            WHEN (current_amount + NEW.amount) >= target_amount THEN CURRENT_TIMESTAMP
            ELSE completed_at
        END
    WHERE id = NEW.goal_id;
END;

-- Update user progress after transaction
CREATE TRIGGER IF NOT EXISTS update_user_progress_after_transaction
AFTER INSERT ON transactions
BEGIN
    INSERT INTO user_progress (user_id, transactions_count, last_activity_date)
    VALUES (NEW.user_id, 1, DATE('now'))
    ON CONFLICT(user_id) DO UPDATE SET 
        transactions_count = transactions_count + 1,
        last_activity_date = DATE('now'),
        streak_days = CASE 
            WHEN last_activity_date = DATE('now', '-1 day') THEN streak_days + 1
            WHEN last_activity_date = DATE('now') THEN streak_days
            ELSE 1
        END;
END;

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Monthly spending summary
CREATE VIEW IF NOT EXISTS monthly_spending_summary AS
SELECT 
    t.user_id,
    strftime('%Y-%m', t.transaction_date) as month_year,
    c.name as category_name,
    c.type,
    SUM(t.amount) as total_amount,
    COUNT(*) as transaction_count
FROM transactions t
JOIN categories c ON t.category_id = c.id
GROUP BY t.user_id, month_year, c.id, c.name, c.type;

-- Budget vs Actual
CREATE VIEW IF NOT EXISTS budget_vs_actual AS
SELECT 
    b.user_id,
    b.month_year,
    c.name as category_name,
    b.allocated_amount,
    COALESCE(SUM(t.amount), 0) as spent_amount,
    b.allocated_amount - COALESCE(SUM(t.amount), 0) as remaining,
    CASE 
        WHEN b.allocated_amount > 0 THEN (COALESCE(SUM(t.amount), 0) / b.allocated_amount) * 100
        ELSE 0
    END as percentage_used
FROM budgets b
JOIN categories c ON b.category_id = c.id
LEFT JOIN transactions t ON 
    t.category_id = b.category_id 
    AND t.user_id = b.user_id
    AND strftime('%Y-%m', t.transaction_date) = b.month_year
GROUP BY b.id, b.user_id, b.month_year, c.name, b.allocated_amount;

-- Upcoming bills
CREATE VIEW IF NOT EXISTS upcoming_bills AS
SELECT 
    b.id,
    b.user_id,
    b.name,
    b.amount,
    b.type,
    c.name as category_name,
    bp.due_date,
    bp.status,
    CAST(julianday(bp.due_date) - julianday('now') AS INTEGER) as days_until_due
FROM bills b
JOIN categories c ON b.category_id = c.id
JOIN bill_payments bp ON b.id = bp.bill_id
WHERE b.is_active = 1 
    AND bp.status IN ('pending', 'overdue')
    AND bp.due_date >= DATE('now', '-30 days')
ORDER BY bp.due_date ASC;

-- Goal progress
CREATE VIEW IF NOT EXISTS goal_progress AS
SELECT 
    g.id,
    g.user_id,
    g.name,
    g.target_amount,
    g.current_amount,
    g.target_date,
    g.status,
    CASE 
        WHEN g.target_amount > 0 THEN (g.current_amount / g.target_amount) * 100
        ELSE 0
    END as progress_percentage,
    CASE 
        WHEN g.target_date IS NOT NULL THEN CAST(julianday(g.target_date) - julianday('now') AS INTEGER)
        ELSE NULL
    END as days_remaining
FROM financial_goals g
WHERE g.status = 'active';
