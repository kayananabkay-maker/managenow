'use server';

import { query } from '../mysql';
import { v4 as uuidv4 } from '../stubs/uuid';
import { parseStringify } from '../utils';
import { revalidatePath } from 'next/cache';

/**
 * Create a new transaction
 * Similar to Appwrite's createTransaction
 */
export const createTransaction = async (transaction: CreateTransactionProps) => {
  try {
    const {
      name,
      amount,
      senderId,
      senderBankId,
      receiverId,
      receiverBankId,
      email,
    } = transaction;

    const transactionId = uuidv4();
    const transactionDate = new Date();

    // Create transaction record
    await query(
      `INSERT INTO transactions (
        id, bank_id, user_id, sender_bank_id, receiver_bank_id,
        name, amount, type, category, payment_channel,
        date, status, email, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        transactionId,
        senderBankId,
        senderId,
        senderBankId,
        receiverBankId,
        name || 'Transfer',
        parseFloat(amount),
        'debit', // Sender's perspective
        'Transfer',
        'online',
        transactionDate,
        'completed',
        email,
      ]
    );

    // Create corresponding credit transaction for receiver (if different user)
    if (senderId !== receiverId) {
      const receiverTransactionId = uuidv4();
      await query(
        `INSERT INTO transactions (
          id, bank_id, user_id, sender_bank_id, receiver_bank_id,
          name, amount, type, category, payment_channel,
          date, status, email, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          receiverTransactionId,
          receiverBankId,
          receiverId,
          senderBankId,
          receiverBankId,
          `Received from ${email}`,
          parseFloat(amount),
          'credit', // Receiver's perspective
          'Transfer',
          'online',
          transactionDate,
          'completed',
          email,
        ]
      );
    }

    console.log('✓ Transaction created:', transactionId);

    // Fetch the created transaction
    const [newTransaction] = await query(
      'SELECT * FROM transactions WHERE id = ?',
      [transactionId]
    );

    revalidatePath('/');

    return parseStringify(newTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw new Error('Failed to create transaction');
  }
};

/**
 * Get all transactions for a specific bank
 * Similar to Appwrite's getTransactionsByBankId
 */
export const getTransactionsByBankId = async ({
  bankId,
}: getTransactionsByBankIdProps) => {
  try {
    const transactions = await query(
      `SELECT 
        id, bank_id, user_id, sender_bank_id, receiver_bank_id,
        name, amount, type, category, payment_channel,
        date, status, email, created_at
      FROM transactions 
      WHERE bank_id = ? 
      ORDER BY date DESC, created_at DESC`,
      [bankId]
    );

    console.log(`✓ Found ${transactions.length} transaction(s) for bank ${bankId}`);

    return parseStringify(transactions);
  } catch (error) {
    console.error('Error fetching transactions by bank ID:', error);
    throw new Error('Failed to fetch transactions');
  }
};

/**
 * Get all transactions for a user across all their banks
 * Enhanced version of getTransactions
 */
export const getTransactions = async (userId: string) => {
  try {
    const transactions = await query(
      `SELECT 
        t.id, t.bank_id, t.user_id, t.sender_bank_id, t.receiver_bank_id,
        t.name, t.amount, t.type, t.category, t.payment_channel,
        t.date, t.status, t.email, t.created_at,
        b.account_id, b.bank_id as bank_name
      FROM transactions t
      JOIN banks b ON t.bank_id = b.id
      WHERE t.user_id = ?
      ORDER BY t.date DESC, t.created_at DESC`,
      [userId]
    );

    console.log(`✓ Found ${transactions.length} transaction(s) for user ${userId}`);

    return parseStringify(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
};

/**
 * Get recent transactions for a user
 * Useful for dashboard display
 */
export const getRecentTransactions = async (userId: string, limit: number = 10) => {
  try {
    const transactions = await query(
      `SELECT 
        t.id, t.bank_id, t.user_id, t.sender_bank_id, t.receiver_bank_id,
        t.name, t.amount, t.type, t.category, t.payment_channel,
        t.date, t.status, t.email, t.created_at,
        b.account_id, b.bank_id as bank_name
      FROM transactions t
      JOIN banks b ON t.bank_id = b.id
      WHERE t.user_id = ?
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT ?`,
      [userId, limit]
    );

    console.log(`✓ Found ${transactions.length} recent transaction(s)`);

    return parseStringify(transactions);
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    throw new Error('Failed to fetch recent transactions');
  }
};

/**
 * Get transaction by ID
 * Similar to Appwrite's getTransaction
 */
export const getTransaction = async (transactionId: string) => {
  try {
    const [transaction] = await query(
      `SELECT 
        t.*,
        b.account_id, b.bank_id as bank_name,
        sender.account_id as sender_account,
        receiver.account_id as receiver_account
      FROM transactions t
      LEFT JOIN banks b ON t.bank_id = b.id
      LEFT JOIN banks sender ON t.sender_bank_id = sender.id
      LEFT JOIN banks receiver ON t.receiver_bank_id = receiver.id
      WHERE t.id = ?`,
      [transactionId]
    );

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    console.log('✓ Transaction found:', transaction.id);

    return parseStringify(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw new Error('Failed to fetch transaction');
  }
};

/**
 * Get transactions by date range
 * Useful for filtering and reports
 */
export const getTransactionsByDateRange = async ({
  userId,
  startDate,
  endDate,
}: {
  userId: string;
  startDate: Date;
  endDate: Date;
}) => {
  try {
    const transactions = await query(
      `SELECT 
        t.*,
        b.account_id, b.bank_id as bank_name
      FROM transactions t
      JOIN banks b ON t.bank_id = b.id
      WHERE t.user_id = ? 
        AND t.date BETWEEN ? AND ?
      ORDER BY t.date DESC, t.created_at DESC`,
      [userId, startDate, endDate]
    );

    console.log(`✓ Found ${transactions.length} transaction(s) in date range`);

    return parseStringify(transactions);
  } catch (error) {
    console.error('Error fetching transactions by date range:', error);
    throw new Error('Failed to fetch transactions by date range');
  }
};

/**
 * Get transactions by category
 * Useful for expense tracking
 */
export const getTransactionsByCategory = async ({
  userId,
  category,
}: {
  userId: string;
  category: string;
}) => {
  try {
    const transactions = await query(
      `SELECT 
        t.*,
        b.account_id, b.bank_id as bank_name
      FROM transactions t
      JOIN banks b ON t.bank_id = b.id
      WHERE t.user_id = ? AND t.category = ?
      ORDER BY t.date DESC, t.created_at DESC`,
      [userId, category]
    );

    console.log(`✓ Found ${transactions.length} transaction(s) in category ${category}`);

    return parseStringify(transactions);
  } catch (error) {
    console.error('Error fetching transactions by category:', error);
    throw new Error('Failed to fetch transactions by category');
  }
};

/**
 * Get transaction statistics for a user
 * Calculate totals, averages, etc.
 */
export const getTransactionStats = async (userId: string) => {
  try {
    const [stats] = await query(
      `SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debits,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credits,
        AVG(amount) as average_amount,
        MAX(amount) as max_transaction,
        MIN(amount) as min_transaction
      FROM transactions
      WHERE user_id = ?`,
      [userId]
    );

    console.log('✓ Transaction stats calculated');

    return parseStringify(stats);
  } catch (error) {
    console.error('Error calculating transaction stats:', error);
    throw new Error('Failed to calculate transaction stats');
  }
};

/**
 * Get spending by category
 * Useful for budget tracking
 */
export const getSpendingByCategory = async (userId: string) => {
  try {
    const spending = await query(
      `SELECT 
        category,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount
      FROM transactions
      WHERE user_id = ? AND type = 'debit'
      GROUP BY category
      ORDER BY total_amount DESC`,
      [userId]
    );

    console.log(`✓ Spending by category calculated (${spending.length} categories)`);

    return parseStringify(spending);
  } catch (error) {
    console.error('Error calculating spending by category:', error);
    throw new Error('Failed to calculate spending by category');
  }
};

/**
 * Update transaction status
 * Useful for pending transactions
 */
export const updateTransactionStatus = async ({
  transactionId,
  status,
}: {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
}) => {
  try {
    await query(
      'UPDATE transactions SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, transactionId]
    );

    console.log(`✓ Transaction ${transactionId} status updated to ${status}`);

    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw new Error('Failed to update transaction status');
  }
};

/**
 * Delete a transaction
 * Use with caution - should only be for pending/failed transactions
 */
export const deleteTransaction = async (transactionId: string) => {
  try {
    await query('DELETE FROM transactions WHERE id = ?', [transactionId]);

    console.log('✓ Transaction deleted:', transactionId);

    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw new Error('Failed to delete transaction');
  }
};
