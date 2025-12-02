/**
 * ManageNow Financial Actions - SQLite
 * Handles transactions, bills, budgets, goals, and analytics
 */

'use server';

import { getDatabase } from '@/lib/sqlite';
import Database from 'better-sqlite3';

// ============================================
// TRANSACTION ACTIONS
// ============================================

export async function createTransaction(params: CreateTransactionParams & { userId: string }) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO transactions (
        user_id, category_id, amount, type, description, 
        transaction_date, receipt_url, notes, is_recurring
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      params.userId,
      params.categoryId,
      params.amount,
      params.type,
      params.description || null,
      params.transactionDate,
      params.receiptUrl || null,
      params.notes || null,
      0
    );
    
    return {
      success: true,
      transactionId: result.lastInsertRowid,
      message: `${params.type === 'income' ? 'Income' : 'Expense'} recorded successfully!`
    };
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return { success: false, error: error.message };
  }
}

export async function getTransactions(userId: string, limit: number = 50) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT 
        t.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT ?
    `);
    
    const transactions = stmt.all(userId, limit);
    return { success: true, data: transactions };
  } catch (error: any) {
    console.error('Error getting transactions:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteTransaction(transactionId: number, userId: string) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      DELETE FROM transactions 
      WHERE id = ? AND user_id = ?
    `);
    
    const result = stmt.run(transactionId, userId);
    
    if (result.changes === 0) {
      return { success: false, error: 'Transaction not found' };
    }
    
    return { success: true, message: 'Transaction deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// CATEGORY ACTIONS
// ============================================

export async function getCategories(userId: string, type?: 'income' | 'expense') {
  try {
    const db = getDatabase();
    
    let query = `
      SELECT * FROM categories 
      WHERE user_id = ? OR user_id = 'default'
    `;
    
    const params: any[] = [userId];
    
    if (type) {
      query += ` AND type = ?`;
      params.push(type);
    }
    
    query += ` ORDER BY is_default DESC, name ASC`;
    
    const stmt = db.prepare(query);
    const categories = stmt.all(...params);
    
    return { success: true, data: categories };
  } catch (error: any) {
    console.error('Error getting categories:', error);
    return { success: false, error: error.message };
  }
}

export async function createCategory(params: {
  userId: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO categories (user_id, name, type, icon, color, is_default)
      VALUES (?, ?, ?, ?, ?, 0)
    `);
    
    const result = stmt.run(
      params.userId,
      params.name,
      params.type,
      params.icon || '📝',
      params.color || '#3b82f6'
    );
    
    return {
      success: true,
      categoryId: result.lastInsertRowid,
      message: 'Category created successfully!'
    };
  } catch (error: any) {
    console.error('Error creating category:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// BILL ACTIONS
// ============================================

export async function createBill(params: CreateBillParams & { userId: string }) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO bills (
        user_id, category_id, name, amount, type, frequency,
        due_day, start_date, end_date, reminder_days, 
        auto_create_transaction, notes, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    
    const result = stmt.run(
      params.userId,
      params.categoryId,
      params.name,
      params.amount,
      params.type,
      params.frequency,
      params.dueDay,
      params.startDate,
      params.endDate || null,
      params.reminderDays,
      params.autoCreateTransaction ? 1 : 0,
      params.notes || null
    );
    
    return {
      success: true,
      billId: result.lastInsertRowid,
      message: 'Recurring bill created successfully!'
    };
  } catch (error: any) {
    console.error('Error creating bill:', error);
    return { success: false, error: error.message };
  }
}

export async function getBills(userId: string, isActive: boolean = true) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT 
        b.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM bills b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ? AND b.is_active = ?
      ORDER BY b.due_day ASC
    `);
    
    const bills = stmt.all(userId, isActive ? 1 : 0);
    return { success: true, data: bills };
  } catch (error: any) {
    console.error('Error getting bills:', error);
    return { success: false, error: error.message };
  }
}

export async function getUpcomingBills(userId: string) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT * FROM upcoming_bills
      WHERE user_id = ?
      ORDER BY due_date ASC
      LIMIT 10
    `);
    
    const bills = stmt.all(userId);
    return { success: true, data: bills };
  } catch (error: any) {
    console.error('Error getting upcoming bills:', error);
    return { success: false, error: error.message };
  }
}

export async function markBillAsPaid(billPaymentId: number, userId: string, paidDate?: string) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      UPDATE bill_payments bp
      SET status = 'paid', 
          paid_date = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? 
        AND EXISTS (
          SELECT 1 FROM bills b 
          WHERE b.id = bp.bill_id AND b.user_id = ?
        )
    `);
    
    const result = stmt.run(
      paidDate || new Date().toISOString().split('T')[0],
      billPaymentId,
      userId
    );
    
    if (result.changes === 0) {
      return { success: false, error: 'Bill payment not found' };
    }
    
    return { success: true, message: 'Bill marked as paid!' };
  } catch (error: any) {
    console.error('Error marking bill as paid:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// BUDGET ACTIONS
// ============================================

export async function createBudget(params: CreateBudgetParams & { userId: string }) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO budgets (user_id, category_id, month_year, allocated_amount, notes)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, category_id, month_year) 
      DO UPDATE SET allocated_amount = excluded.allocated_amount, notes = excluded.notes
    `);
    
    const result = stmt.run(
      params.userId,
      params.categoryId,
      params.monthYear,
      params.allocatedAmount,
      params.notes || null
    );
    
    return {
      success: true,
      message: 'Budget allocated successfully!'
    };
  } catch (error: any) {
    console.error('Error creating budget:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteBudget(budgetId: number, userId: string) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      DELETE FROM budgets
      WHERE id = ? AND user_id = ?
    `);
    
    const result = stmt.run(budgetId, userId);
    
    if (result.changes === 0) {
      return { success: false, error: 'Budget not found or unauthorized' };
    }
    
    return {
      success: true,
      message: 'Budget deleted successfully!'
    };
  } catch (error: any) {
    console.error('Error deleting budget:', error);
    return { success: false, error: error.message };
  }
}

export async function getBudgets(userId: string, monthYear: string) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT 
        b.id,
        b.user_id,
        b.category_id,
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
      WHERE b.user_id = ? AND b.month_year = ?
      GROUP BY b.id, b.user_id, b.category_id, b.month_year, c.name, b.allocated_amount
      ORDER BY c.name ASC
    `);
    
    const budgets = stmt.all(userId, monthYear);
    return { success: true, data: budgets };
  } catch (error: any) {
    console.error('Error getting budgets:', error);
    return { success: false, error: error.message };
  }
}

export async function getBudgetSummary(userId: string, monthYear: string) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT 
        SUM(allocated_amount) as total_allocated,
        SUM(spent_amount) as total_spent,
        SUM(remaining) as total_remaining,
        AVG(percentage_used) as avg_percentage_used
      FROM budget_vs_actual
      WHERE user_id = ? AND month_year = ?
    `);
    
    const summary = stmt.get(userId, monthYear);
    return { success: true, data: summary };
  } catch (error: any) {
    console.error('Error getting budget summary:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// GOAL ACTIONS
// ============================================

export async function createGoal(params: CreateGoalParams & { userId: string }) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO financial_goals (
        user_id, name, description, target_amount, target_date,
        category, icon, color, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `);
    
    const result = stmt.run(
      params.userId,
      params.name,
      params.description || null,
      params.targetAmount,
      params.targetDate || null,
      params.category,
      params.icon || '🎯',
      params.color || '#10b981'
    );
    
    return {
      success: true,
      goalId: result.lastInsertRowid,
      message: 'Financial goal created successfully!'
    };
  } catch (error: any) {
    console.error('Error creating goal:', error);
    return { success: false, error: error.message };
  }
}

export async function getGoals(userId: string) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT * FROM goal_progress
      WHERE user_id = ?
      ORDER BY 
        CASE status 
          WHEN 'active' THEN 1 
          WHEN 'completed' THEN 2 
          ELSE 3 
        END,
        target_date ASC NULLS LAST
    `);
    
    const goals = stmt.all(userId);
    return { success: true, data: goals };
  } catch (error: any) {
    console.error('Error getting goals:', error);
    return { success: false, error: error.message };
  }
}

export async function addGoalContribution(params: {
  goalId: number;
  userId: string;
  amount: number;
  contributionDate?: string;
  notes?: string;
}) {
  try {
    const db = getDatabase();
    
    // Verify goal belongs to user
    const goalCheck = db.prepare(`
      SELECT id FROM financial_goals 
      WHERE id = ? AND user_id = ?
    `).get(params.goalId, params.userId);
    
    if (!goalCheck) {
      return { success: false, error: 'Goal not found' };
    }
    
    const stmt = db.prepare(`
      INSERT INTO goal_contributions (
        goal_id, amount, contribution_date, notes
      ) VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      params.goalId,
      params.amount,
      params.contributionDate || new Date().toISOString().split('T')[0],
      params.notes || null
    );
    
    return {
      success: true,
      contributionId: result.lastInsertRowid,
      message: 'Contribution added successfully!'
    };
  } catch (error: any) {
    console.error('Error adding contribution:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteGoal(goalId: number, userId: string) {
  try {
    const db = getDatabase();
    
    // Verify goal belongs to user
    const goalCheck = db.prepare(`
      SELECT id FROM financial_goals 
      WHERE id = ? AND user_id = ?
    `).get(goalId, userId);
    
    if (!goalCheck) {
      return { success: false, error: 'Goal not found' };
    }
    
    // Delete goal contributions first (foreign key constraint)
    db.prepare('DELETE FROM goal_contributions WHERE goal_id = ?').run(goalId);
    
    // Delete goal
    db.prepare('DELETE FROM financial_goals WHERE id = ?').run(goalId);
    
    return {
      success: true,
      message: 'Goal deleted successfully!'
    };
  } catch (error: any) {
    console.error('Error deleting goal:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// ANALYTICS ACTIONS
// ============================================

export async function getMonthlySpending(userId: string, monthYear: string) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT * FROM monthly_spending_summary
      WHERE user_id = ? AND month_year = ?
      ORDER BY total_amount DESC
    `);
    
    const spending = stmt.all(userId, monthYear);
    return { success: true, data: spending };
  } catch (error: any) {
    console.error('Error getting monthly spending:', error);
    return { success: false, error: error.message };
  }
}

export async function getSpendingTrends(userId: string, months: number = 6) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT 
        month_year,
        type,
        SUM(total_amount) as total
      FROM monthly_spending_summary
      WHERE user_id = ?
      GROUP BY month_year, type
      ORDER BY month_year DESC
      LIMIT ?
    `);
    
    const trends = stmt.all(userId, months * 2); // *2 for income and expense
    return { success: true, data: trends };
  } catch (error: any) {
    console.error('Error getting spending trends:', error);
    return { success: false, error: error.message };
  }
}

export async function getDashboardSummary(userId: string) {
  try {
    const db = getDatabase();
    
    // Current month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Total income and expenses for current month
    const monthlyStmt = db.prepare(`
      SELECT 
        type,
        SUM(amount) as total
      FROM transactions
      WHERE user_id = ? 
        AND strftime('%Y-%m', transaction_date) = ?
      GROUP BY type
    `);
    
    const monthlyTotals = monthlyStmt.all(userId, currentMonth);
    
    // Upcoming bills
    const billsStmt = db.prepare(`
      SELECT COUNT(*) as count, SUM(amount) as total
      FROM upcoming_bills
      WHERE user_id = ? AND status = 'pending'
    `);
    
    const upcomingBills = billsStmt.get(userId);
    
    // Active goals
    const goalsStmt = db.prepare(`
      SELECT 
        COUNT(*) as count,
        SUM(target_amount - current_amount) as remaining
      FROM financial_goals
      WHERE user_id = ? AND status = 'active'
    `);
    
    const activeGoals = goalsStmt.get(userId);
    
    // User progress
    const progressStmt = db.prepare(`
      SELECT * FROM user_progress
      WHERE user_id = ?
    `);
    
    const userProgress = progressStmt.get(userId);
    
    return {
      success: true,
      data: {
        monthlyTotals,
        upcomingBills,
        activeGoals,
        userProgress,
        currentMonth
      }
    };
  } catch (error: any) {
    console.error('Error getting dashboard summary:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// QUICK SHORTCUTS
// ============================================

export async function getQuickShortcuts(userId: string) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT 
        qs.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM quick_shortcuts qs
      JOIN categories c ON qs.category_id = c.id
      WHERE qs.user_id = ?
      ORDER BY qs.sort_order ASC
    `);
    
    const shortcuts = stmt.all(userId);
    return { success: true, data: shortcuts };
  } catch (error: any) {
    console.error('Error getting shortcuts:', error);
    return { success: false, error: error.message };
  }
}

export async function createQuickShortcut(params: {
  userId: string;
  name: string;
  categoryId: number;
  amount?: number;
  type: 'income' | 'expense';
  icon?: string;
}) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO quick_shortcuts (
        user_id, name, category_id, amount, type, icon, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM quick_shortcuts WHERE user_id = ?))
    `);
    
    const result = stmt.run(
      params.userId,
      params.name,
      params.categoryId,
      params.amount || null,
      params.type,
      params.icon || '⚡',
      params.userId
    );
    
    return {
      success: true,
      shortcutId: result.lastInsertRowid,
      message: 'Quick shortcut created!'
    };
  } catch (error: any) {
    console.error('Error creating shortcut:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// EDUCATIONAL CONTENT
// ============================================

export async function getEducationalContent(category?: string) {
  try {
    const db = getDatabase();
    
    let query = `
      SELECT * FROM educational_content
      WHERE is_published = 1
    `;
    
    const params: any[] = [];
    
    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const stmt = db.prepare(query);
    const content = params.length > 0 ? stmt.all(...params) : stmt.all();
    
    return { success: true, data: content };
  } catch (error: any) {
    console.error('Error getting educational content:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// CHALLENGES
// ============================================

export async function getActiveChallenges() {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT * FROM challenges
      WHERE is_active = 1
      ORDER BY difficulty ASC, points DESC
    `);
    
    const challenges = stmt.all();
    return { success: true, data: challenges };
  } catch (error: any) {
    console.error('Error getting challenges:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserChallenges(userId: string) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT 
        uc.*,
        c.title as challenge_title,
        c.description as challenge_description,
        c.type as challenge_type,
        c.difficulty,
        c.points as max_points
      FROM user_challenges uc
      JOIN challenges c ON uc.challenge_id = c.id
      WHERE uc.user_id = ?
      ORDER BY 
        CASE uc.status 
          WHEN 'active' THEN 1 
          WHEN 'completed' THEN 2 
          ELSE 3 
        END,
        uc.end_date ASC
    `);
    
    const userChallenges = stmt.all(userId);
    return { success: true, data: userChallenges };
  } catch (error: any) {
    console.error('Error getting user challenges:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// EXPORT DATA
// ============================================

export async function exportTransactionsCSV(userId: string, startDate?: string, endDate?: string) {
  try {
    const db = getDatabase();
    
    let query = `
      SELECT 
        t.transaction_date,
        c.name as category,
        t.type,
        t.amount,
        t.description,
        t.notes
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    
    const params: any[] = [userId];
    
    if (startDate) {
      query += ` AND t.transaction_date >= ?`;
      params.push(startDate);
    }
    
    if (endDate) {
      query += ` AND t.transaction_date <= ?`;
      params.push(endDate);
    }
    
    query += ` ORDER BY t.transaction_date DESC`;
    
    const stmt = db.prepare(query);
    const transactions = stmt.all(...params) as Record<string, any>[];
    
    // Convert to CSV
    if (transactions.length === 0) {
      return { success: false, error: 'No transactions to export' };
    }
    
    const headers = Object.keys(transactions[0]).join(',');
    const rows = transactions.map((t: Record<string, any>) => Object.values(t).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    return {
      success: true,
      data: csv,
      filename: `managenow-transactions-${new Date().toISOString().split('T')[0]}.csv`
    };
  } catch (error: any) {
    console.error('Error exporting transactions:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// HELPER FUNCTIONS FOR HOMEPAGE
// ============================================

export async function getRecentTransactions(userId: string, limit: number = 10) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT 
        t.id,
        t.amount,
        t.type,
        t.description,
        t.transaction_date,
        c.name as categoryName,
        c.icon as categoryIcon,
        c.color as categoryColor
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT ?
    `);
    
    return stmt.all(userId, limit);
  } catch (error: any) {
    console.error('Error getting recent transactions:', error);
    return [];
  }
}

export async function getMonthlyIncome(userId: string) {
  try {
    const db = getDatabase();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    const stmt = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = ?
        AND type = 'income'
        AND strftime('%Y-%m', transaction_date) = ?
    `);
    
    const result = stmt.get(userId, currentMonth) as { total: number };
    
    console.log(`[getMonthlyIncome] User: ${userId}, Month: ${currentMonth}, Income: ${result.total}`);
    
    return result.total;
  } catch (error: any) {
    console.error('Error getting monthly income:', error);
    return 0;
  }
}

export async function getMonthlyExpenses(userId: string) {
  try {
    const db = getDatabase();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    const stmt = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = ?
        AND type = 'expense'
        AND strftime('%Y-%m', transaction_date) = ?
    `);
    
    const result = stmt.get(userId, currentMonth) as { total: number };
    
    console.log(`[getMonthlyExpenses] User: ${userId}, Month: ${currentMonth}, Expense: ${result.total}`);
    
    return result.total;
  } catch (error: any) {
    console.error('Error getting monthly expenses:', error);
    return 0;
  }
}

export async function getActiveGoals(userId: string) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT *
      FROM financial_goals
      WHERE user_id = ?
        AND status = 'active'
      ORDER BY created_at DESC
    `);
    
    return stmt.all(userId);
  } catch (error: any) {
    console.error('Error getting active goals:', error);
    return [];
  }
}
