'use server';

import { query } from '../mysql';
import { v4 as uuidv4 } from '../stubs/uuid';
import { parseStringify } from '../utils';
import { revalidatePath } from 'next/cache';
import { getBrickAccounts, getBrickBalance, getBrickTransactions } from '../brick';

/**
 * Connect a new Indonesian bank account using Brick API
 */
export const connectBrickBank = async ({
  userId,
  accessToken,
  institutionId,
  institutionName,
}: {
  userId: string;
  accessToken: string;
  institutionId: string;
  institutionName: string;
}) => {
  try {
    // Get account details from Brick
    const accounts = await getBrickAccounts(accessToken);
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // Use the first account (or you can let user select)
    const account = accounts[0];

    // Get balance
    const balance = await getBrickBalance(accessToken, account.accountId);

    // Create bank record in database
    const bankId = uuidv4();
    await query(
      `INSERT INTO banks (
        id, user_id, institution_id, institution_name, account_id, 
        access_token, account_number, account_holder, 
        balance, currency, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        bankId,
        userId,
        institutionId,
        institutionName,
        account.accountId,
        accessToken,
        account.accountNumber || '',
        account.accountHolder || '',
        balance.available || 0,
        'IDR', // Indonesian Rupiah
      ]
    );

    console.log('[Brick] Bank connected:', {
      bankId,
      institutionName,
      accountId: account.accountId,
    });

    revalidatePath('/');
    return parseStringify({ bankId, success: true });
  } catch (error: any) {
    console.error('Error connecting Brick bank:', error);
    throw new Error(error.message || 'Failed to connect bank');
  }
};

/**
 * Get user's Indonesian bank accounts from Brick
 */
export const getBrickBankAccounts = async (userId: string) => {
  try {
    // Get all banks for this user from database
    const banks: any = await query(
      'SELECT * FROM banks WHERE user_id = ? AND currency = ?',
      [userId, 'IDR']
    );

    if (!Array.isArray(banks) || banks.length === 0) {
      return [];
    }

    // Get updated balances from Brick for each bank
    const banksWithBalance = await Promise.all(
      banks.map(async (bank: any) => {
        try {
          const balance = await getBrickBalance(bank.access_token, bank.account_id);
          return {
            id: bank.id,
            institutionName: bank.institution_name,
            accountNumber: bank.account_number,
            accountHolder: bank.account_holder,
            balance: balance.available || bank.balance,
            currency: 'IDR',
            type: 'depository',
          };
        } catch (error) {
          // If Brick API fails, use cached balance from database
          return {
            id: bank.id,
            institutionName: bank.institution_name,
            accountNumber: bank.account_number,
            accountHolder: bank.account_holder,
            balance: bank.balance,
            currency: 'IDR',
            type: 'depository',
          };
        }
      })
    );

    return parseStringify(banksWithBalance);
  } catch (error: any) {
    console.error('Error getting Brick bank accounts:', error);
    throw new Error(error.message || 'Failed to get bank accounts');
  }
};

/**
 * Sync transactions from Brick for a specific bank
 */
export const syncBrickTransactions = async (bankId: string) => {
  try {
    // Get bank details
    const banks: any = await query('SELECT * FROM banks WHERE id = ? LIMIT 1', [bankId]);

    if (!Array.isArray(banks) || banks.length === 0) {
      throw new Error('Bank not found');
    }

    const bank = banks[0];

    // Get transactions from Brick (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
    const toDate = new Date().toISOString().split('T')[0];

    const transactions = await getBrickTransactions(
      bank.access_token,
      bank.account_id,
      fromDate,
      toDate
    );

    // Store transactions in database
    for (const txn of transactions) {
      const transactionId = uuidv4();
      
      // Check if transaction already exists
      const existing: any = await query(
        'SELECT id FROM transactions WHERE bank_id = ? AND external_transaction_id = ? LIMIT 1',
        [bankId, txn.id || txn.referenceId]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        continue; // Skip if already exists
      }

      await query(
        `INSERT INTO transactions (
          id, bank_id, external_transaction_id, amount, currency,
          description, category, transaction_date, type, status,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          transactionId,
          bankId,
          txn.id || txn.referenceId,
          Math.abs(txn.amount),
          'IDR',
          txn.description || txn.reference || '',
          txn.category || 'general',
          txn.dateTimestamp || txn.date,
          txn.direction === 'in' ? 'credit' : 'debit',
          'completed',
        ]
      );
    }

    console.log('[Brick] Synced transactions:', {
      bankId,
      count: transactions.length,
    });

    revalidatePath('/transaction-history');
    return parseStringify({ success: true, count: transactions.length });
  } catch (error: any) {
    console.error('Error syncing Brick transactions:', error);
    throw new Error(error.message || 'Failed to sync transactions');
  }
};
