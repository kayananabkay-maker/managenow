'use server';

import { query } from '../mysql';
import { v4 as uuidv4 } from '../stubs/uuid';
import { parseStringify } from '../utils';
import { revalidatePath } from 'next/cache';

/**
 * Create a new bank account for a user
 * Similar to Appwrite's createBankAccount
 */
export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  shareableId,
}: createBankAccountProps) => {
  try {
    // Check if bank account already exists
    const existingBank = await query(
      'SELECT id FROM banks WHERE user_id = ? AND account_id = ?',
      [userId, accountId]
    );

    if (existingBank.length > 0) {
      console.log('Bank account already exists');
      return parseStringify(existingBank[0]);
    }

    // Create new bank account
    const newBankId = uuidv4();
    await query(
      `INSERT INTO banks (
        id, user_id, account_id, bank_id, 
        access_token, funding_source_url, shareable_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [newBankId, userId, accountId, bankId, accessToken, fundingSourceUrl, shareableId]
    );

    console.log('✓ Bank account created:', newBankId);

    // Fetch and return the created bank
    const [bank] = await query('SELECT * FROM banks WHERE id = ?', [newBankId]);

    revalidatePath('/');
    
    return parseStringify(bank);
  } catch (error) {
    console.error('Error creating bank account:', error);
    throw new Error('Failed to create bank account');
  }
};

/**
 * Get all banks for a specific user
 * Similar to Appwrite's getBanks
 */
export const getBanks = async ({ userId }: getBanksProps) => {
  try {
    const banks = await query(
      `SELECT 
        id, user_id, account_id, bank_id, institution_id,
        access_token, funding_source_url, shareable_id,
        balance, available_balance, current_balance, currency,
        created_at, updated_at
      FROM banks 
      WHERE user_id = ? 
      ORDER BY created_at DESC`,
      [userId]
    );

    console.log(`✓ Found ${banks.length} bank(s) for user ${userId}`);

    return parseStringify(banks);
  } catch (error) {
    console.error('Error fetching banks:', error);
    throw new Error('Failed to fetch banks');
  }
};

/**
 * Get a specific bank by document ID
 * Similar to Appwrite's getBank
 */
export const getBank = async ({ documentId }: getBankProps) => {
  try {
    const [bank] = await query(
      'SELECT * FROM banks WHERE id = ?',
      [documentId]
    );

    if (!bank) {
      throw new Error('Bank not found');
    }

    console.log('✓ Bank found:', bank.id);

    return parseStringify(bank);
  } catch (error) {
    console.error('Error fetching bank:', error);
    throw new Error('Failed to fetch bank');
  }
};

/**
 * Get bank by account ID
 * Similar to Appwrite's getBankByAccountId
 */
export const getBankByAccountId = async ({ accountId }: getBankByAccountIdProps) => {
  try {
    const [bank] = await query(
      'SELECT * FROM banks WHERE account_id = ?',
      [accountId]
    );

    if (!bank) {
      console.log('Bank not found for account ID:', accountId);
      return null;
    }

    console.log('✓ Bank found by account ID:', bank.id);

    return parseStringify(bank);
  } catch (error) {
    console.error('Error fetching bank by account ID:', error);
    throw new Error('Failed to fetch bank by account ID');
  }
};

/**
 * Update bank account balance
 * Helper function to update balances after transactions
 */
export const updateBankBalance = async ({
  bankId,
  balance,
  availableBalance,
  currentBalance,
}: {
  bankId: string;
  balance?: number;
  availableBalance?: number;
  currentBalance?: number;
}) => {
  try {
    const updates: string[] = [];
    const values: any[] = [];

    if (balance !== undefined) {
      updates.push('balance = ?');
      values.push(balance);
    }
    if (availableBalance !== undefined) {
      updates.push('available_balance = ?');
      values.push(availableBalance);
    }
    if (currentBalance !== undefined) {
      updates.push('current_balance = ?');
      values.push(currentBalance);
    }

    if (updates.length === 0) {
      return;
    }

    updates.push('updated_at = NOW()');
    values.push(bankId);

    await query(
      `UPDATE banks SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    console.log('✓ Bank balance updated:', bankId);

    revalidatePath('/');
  } catch (error) {
    console.error('Error updating bank balance:', error);
    throw new Error('Failed to update bank balance');
  }
};

/**
 * Delete a bank account
 * Useful for disconnecting a bank
 */
export const deleteBankAccount = async (bankId: string) => {
  try {
    // Delete associated transactions first (if not using CASCADE)
    await query('DELETE FROM transactions WHERE bank_id = ?', [bankId]);
    
    // Delete the bank account
    await query('DELETE FROM banks WHERE id = ?', [bankId]);

    console.log('✓ Bank account deleted:', bankId);

    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error deleting bank account:', error);
    throw new Error('Failed to delete bank account');
  }
};

/**
 * Get total balance across all user's banks
 * Helper function for dashboard
 */
export const getTotalBalance = async (userId: string) => {
  try {
    const [result] = await query(
      'SELECT SUM(balance) as totalBalance FROM banks WHERE user_id = ?',
      [userId]
    );

    const totalBalance = result.totalBalance || 0;

    console.log(`✓ Total balance for user ${userId}: $${totalBalance}`);

    return parseFloat(totalBalance);
  } catch (error) {
    console.error('Error calculating total balance:', error);
    return 0;
  }
};

/**
 * Get all banks with account details for a user
 * Enhanced version with more details
 */
export const getBanksWithDetails = async (userId: string) => {
  try {
    const banks = await query(
      `SELECT 
        b.*,
        COUNT(t.id) as transaction_count,
        MAX(t.date) as last_transaction_date
      FROM banks b
      LEFT JOIN transactions t ON b.id = t.bank_id
      WHERE b.user_id = ?
      GROUP BY b.id
      ORDER BY b.created_at DESC`,
      [userId]
    );

    console.log(`✓ Found ${banks.length} bank(s) with details`);

    return parseStringify(banks);
  } catch (error) {
    console.error('Error fetching banks with details:', error);
    throw new Error('Failed to fetch banks with details');
  }
};
