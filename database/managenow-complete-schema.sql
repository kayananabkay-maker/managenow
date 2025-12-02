-- ManageNow Complete Database Schema
-- Features: Manual Transaction Entry, Bills, Budgeting, Goals, Analytics

-- ============================================
-- CATEGORIES TABLE
-- Custom spending and income categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    icon VARCHAR(50) DEFAULT '💰',
    color VARCHAR(7) DEFAULT '#3b82f6',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_categories (user_id, type)
);

-- ============================================
-- TRANSACTIONS TABLE
-- Manual entry of income and expenses
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    receipt_url VARCHAR(500),
    notes TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_bill_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_user_transactions (user_id, transaction_date),
    INDEX idx_category (category_id),
    INDEX idx_type (type)
);

-- ============================================
-- BILLS TABLE (Recurring Payments)
-- Track recurring income and expenses
-- ============================================
CREATE TABLE IF NOT EXISTS bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    frequency ENUM('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly') NOT NULL,
    due_day INT NOT NULL COMMENT 'Day of month (1-31) or week (1-7)',
    start_date DATE NOT NULL,
    end_date DATE NULL,
    reminder_days INT DEFAULT 3 COMMENT 'Days before due date to remind',
    is_active BOOLEAN DEFAULT TRUE,
    auto_create_transaction BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_user_bills (user_id, is_active),
    INDEX idx_due_day (due_day)
);

-- ============================================
-- BILL PAYMENTS TABLE
-- Track which bills have been paid
-- ============================================
CREATE TABLE IF NOT EXISTS bill_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    transaction_id INT NULL,
    due_date DATE NOT NULL,
    paid_date DATE NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status ENUM('pending', 'paid', 'overdue', 'skipped') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    INDEX idx_bill_payments (bill_id, due_date),
    INDEX idx_status (status, due_date)
);

-- ============================================
-- BUDGETS TABLE (Envelope System)
-- Allocate funds to categories
-- ============================================
CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    month_year VARCHAR(7) NOT NULL COMMENT 'Format: YYYY-MM',
    allocated_amount DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_budget (user_id, category_id, month_year),
    INDEX idx_user_month (user_id, month_year)
);

-- ============================================
-- FINANCIAL GOALS TABLE
-- Track savings and financial milestones
-- ============================================
CREATE TABLE IF NOT EXISTS financial_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0,
    target_date DATE NULL,
    category ENUM('savings', 'debt', 'investment', 'purchase', 'emergency', 'other') DEFAULT 'savings',
    icon VARCHAR(50) DEFAULT '🎯',
    color VARCHAR(7) DEFAULT '#10b981',
    status ENUM('active', 'completed', 'paused', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    INDEX idx_user_goals (user_id, status)
);

-- ============================================
-- GOAL CONTRIBUTIONS TABLE
-- Track contributions to goals
-- ============================================
CREATE TABLE IF NOT EXISTS goal_contributions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    goal_id INT NOT NULL,
    transaction_id INT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    contribution_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (goal_id) REFERENCES financial_goals(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    INDEX idx_goal_contributions (goal_id, contribution_date)
);

-- ============================================
-- CHALLENGES TABLE
-- Gamification: Spend Less Challenges
-- ============================================
CREATE TABLE IF NOT EXISTS challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type ENUM('spend_less', 'save_more', 'habit', 'custom') DEFAULT 'spend_less',
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    points INT DEFAULT 10,
    duration_days INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USER CHALLENGES TABLE
-- Track user participation in challenges
-- ============================================
CREATE TABLE IF NOT EXISTS user_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    challenge_id INT NOT NULL,
    category_id INT NULL,
    target_amount DECIMAL(15, 2) NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'completed', 'failed', 'abandoned') DEFAULT 'active',
    points_earned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user_challenges (user_id, status)
);

-- ============================================
-- QUICK SHORTCUTS TABLE
-- Custom shortcuts for frequent transactions
-- ============================================
CREATE TABLE IF NOT EXISTS quick_shortcuts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(15, 2) NULL COMMENT 'NULL for variable amount',
    type ENUM('income', 'expense') NOT NULL,
    icon VARCHAR(50) DEFAULT '⚡',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_user_shortcuts (user_id, sort_order)
);

-- ============================================
-- EDUCATIONAL CONTENT TABLE
-- Financial literacy articles and tips
-- ============================================
CREATE TABLE IF NOT EXISTS educational_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('budgeting', 'saving', 'investing', 'debt', 'general') DEFAULT 'general',
    difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    reading_time_minutes INT DEFAULT 5,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category, is_published)
);

-- ============================================
-- USER PROGRESS TABLE
-- Track user achievements and milestones
-- ============================================
CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    total_points INT DEFAULT 0,
    level INT DEFAULT 1,
    transactions_count INT DEFAULT 0,
    budgets_created INT DEFAULT 0,
    goals_completed INT DEFAULT 0,
    challenges_completed INT DEFAULT 0,
    streak_days INT DEFAULT 0,
    last_activity_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_progress (user_id)
);

-- ============================================
-- INSERT DEFAULT CATEGORIES
-- ============================================
INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES
('default', 'Salary', 'income', '💼', '#10b981', TRUE),
('default', 'Freelance', 'income', '💻', '#06b6d4', TRUE),
('default', 'Investment', 'income', '📈', '#8b5cf6', TRUE),
('default', 'Other Income', 'income', '💰', '#f59e0b', TRUE),
('default', 'Food & Dining', 'expense', '🍽️', '#ef4444', TRUE),
('default', 'Transportation', 'expense', '🚗', '#3b82f6', TRUE),
('default', 'Shopping', 'expense', '🛍️', '#ec4899', TRUE),
('default', 'Entertainment', 'expense', '🎬', '#a855f7', TRUE),
('default', 'Bills & Utilities', 'expense', '📄', '#f97316', TRUE),
('default', 'Healthcare', 'expense', '⚕️', '#14b8a6', TRUE),
('default', 'Education', 'expense', '📚', '#6366f1', TRUE),
('default', 'Housing', 'expense', '🏠', '#0ea5e9', TRUE),
('default', 'Personal Care', 'expense', '💅', '#d946ef', TRUE),
('default', 'Subscriptions', 'expense', '📱', '#8b5cf6', TRUE),
('default', 'Other Expense', 'expense', '📝', '#64748b', TRUE);

-- ============================================
-- INSERT SAMPLE CHALLENGES
-- ============================================
INSERT INTO challenges (title, description, type, difficulty, points, duration_days) VALUES
('No Eating Out Week', 'Cook all meals at home for 7 days', 'spend_less', 'easy', 50, 7),
('Coffee Shop Challenge', 'Skip coffee shops for 30 days and save!', 'spend_less', 'medium', 100, 30),
('Shopping Freeze', 'No non-essential purchases for 2 weeks', 'spend_less', 'medium', 150, 14),
('Save $500 in 30 Days', 'Set aside $500 this month', 'save_more', 'hard', 200, 30),
('Daily Expense Tracker', 'Log every expense for 30 days', 'habit', 'easy', 100, 30);

-- ============================================
-- INSERT SAMPLE EDUCATIONAL CONTENT
-- ============================================
INSERT INTO educational_content (title, content, category, difficulty, reading_time_minutes) VALUES
('The 50/30/20 Budget Rule', 'Learn how to allocate your income: 50% needs, 30% wants, 20% savings. This simple rule helps you maintain financial balance...', 'budgeting', 'beginner', 5),
('Emergency Fund 101', 'Why you need 3-6 months of expenses saved and how to build it step by step...', 'saving', 'beginner', 7),
('Envelope Budgeting Method', 'Master the envelope system: allocate cash (or digital funds) to specific categories and only spend what you have allocated...', 'budgeting', 'beginner', 6),
('Debt Snowball vs Avalanche', 'Two proven methods to pay off debt: emotional wins vs mathematical efficiency...', 'debt', 'intermediate', 10),
('Start Investing with $100', 'You don''t need to be rich to invest. Learn how to start with small amounts...', 'investing', 'beginner', 8);

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Monthly spending summary
CREATE OR REPLACE VIEW monthly_spending_summary AS
SELECT 
    user_id,
    DATE_FORMAT(transaction_date, '%Y-%m') as month_year,
    c.name as category_name,
    c.type,
    SUM(t.amount) as total_amount,
    COUNT(*) as transaction_count
FROM transactions t
JOIN categories c ON t.category_id = c.id
GROUP BY user_id, month_year, c.id, c.name, c.type;

-- Budget vs Actual
CREATE OR REPLACE VIEW budget_vs_actual AS
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
    AND DATE_FORMAT(t.transaction_date, '%Y-%m') = b.month_year
GROUP BY b.id, b.user_id, b.month_year, c.name, b.allocated_amount;

-- Upcoming bills
CREATE OR REPLACE VIEW upcoming_bills AS
SELECT 
    b.id,
    b.user_id,
    b.name,
    b.amount,
    b.type,
    c.name as category_name,
    bp.due_date,
    bp.status,
    DATEDIFF(bp.due_date, CURDATE()) as days_until_due
FROM bills b
JOIN categories c ON b.category_id = c.id
JOIN bill_payments bp ON b.id = bp.bill_id
WHERE b.is_active = TRUE 
    AND bp.status IN ('pending', 'overdue')
    AND bp.due_date >= CURDATE() - INTERVAL 30 DAY
ORDER BY bp.due_date ASC;

-- Goal progress
CREATE OR REPLACE VIEW goal_progress AS
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
        WHEN g.target_date IS NOT NULL THEN DATEDIFF(g.target_date, CURDATE())
        ELSE NULL
    END as days_remaining
FROM financial_goals g
WHERE g.status = 'active';

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_bill_due_date ON bill_payments(due_date, status);
CREATE INDEX idx_budget_month ON budgets(month_year);
CREATE INDEX idx_goal_status ON financial_goals(status, target_date);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update budget spent amount when transaction is added
DELIMITER //
CREATE TRIGGER update_budget_spent_after_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    IF NEW.type = 'expense' THEN
        UPDATE budgets 
        SET spent_amount = spent_amount + NEW.amount
        WHERE user_id = NEW.user_id 
            AND category_id = NEW.category_id
            AND month_year = DATE_FORMAT(NEW.transaction_date, '%Y-%m');
    END IF;
END//

-- Update budget spent amount when transaction is deleted
CREATE TRIGGER update_budget_spent_after_delete
AFTER DELETE ON transactions
FOR EACH ROW
BEGIN
    IF OLD.type = 'expense' THEN
        UPDATE budgets 
        SET spent_amount = spent_amount - OLD.amount
        WHERE user_id = OLD.user_id 
            AND category_id = OLD.category_id
            AND month_year = DATE_FORMAT(OLD.transaction_date, '%Y-%m');
    END IF;
END//

-- Update goal current amount when contribution is added
CREATE TRIGGER update_goal_amount_after_contribution
AFTER INSERT ON goal_contributions
FOR EACH ROW
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
END//

-- Update user progress after transaction
CREATE TRIGGER update_user_progress_after_transaction
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    INSERT INTO user_progress (user_id, transactions_count, last_activity_date)
    VALUES (NEW.user_id, 1, CURDATE())
    ON DUPLICATE KEY UPDATE 
        transactions_count = transactions_count + 1,
        last_activity_date = CURDATE(),
        streak_days = CASE 
            WHEN last_activity_date = CURDATE() - INTERVAL 1 DAY THEN streak_days + 1
            WHEN last_activity_date = CURDATE() THEN streak_days
            ELSE 1
        END;
END//

DELIMITER ;

-- ============================================
-- COMPLETE!
-- ============================================
