'use server';

import { query } from '../mysql';
import { v4 as uuidv4 } from '../stubs/uuid';
import { parseStringify } from '../utils';
import { revalidatePath } from 'next/cache';
import {
  getFinverseAccounts,
  getFinverseBalance,
  getFinverseTransactions,
  getFinverseInstitution,
} from '../finverse';

/**
 * Connect a new Indonesian bank account using Finverse API
 */
export const connectFinverseBank = async ({
  userId,
  accessToken,
  itemId,
  institutionId,
}: {
  userId: string;
  accessToken: string;
  itemId: string;
  institutionId: string;
}) => {
  try {
    // Get institution details
    const institution = await getFinverseInstitution(institutionId);
    
    // Get account details from Finverse
    const accounts = await getFinverseAccounts(accessToken);
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // Use the first account (or let user select)
    const account = accounts[0];

    // Get balance
    const balance = await getFinverseBalance(accessToken, account.account_id);

    // Create bank record in database
    const bankId = uuidv4();
    await query(
      `INSERT INTO banks (
        id, user_id, institution_id, institution_name, account_id, 
        access_token, item_id, account_number, account_name,
        balance, available_balance, currency, account_type,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        bankId,
        userId,
        institutionId,
        institution.name || 'Indonesian Bank',
        account.account_id,
        accessToken,
        itemId,
        account.account_number || account.mask || '',
        account.name || '',
        balance.current || 0,
        balance.available || 0,
        'IDR', // Indonesian Rupiah
        account.type || 'depository',
      ]
    );

    console.log('[Finverse] Bank connected:', {
      bankId,
      institutionName: institution.name,
      accountId: account.account_id,
    });

    revalidatePath('/');
    revalidatePath('/my-banks');
    return parseStringify({ bankId, success: true });
  } catch (error: any) {
    console.error('Error connecting Finverse bank:', error);
    throw new Error(error.message || 'Failed to connect bank');
  }
};

/**
 * Get user's Indonesian bank accounts from Finverse
 */
export const getFinverseBankAccounts = async (userId: string) => {
  try {
    // Get all banks for this user from database
    const banks: any = await query(
      'SELECT * FROM banks WHERE user_id = ? AND currency = ?',
      [userId, 'IDR']
    );

    if (!Array.isArray(banks) || banks.length === 0) {
      return [];
    }

    // Get updated balances from Finverse for each bank
    const banksWithBalance = await Promise.all(
      banks.map(async (bank: any) => {
        try {
          const accounts = await getFinverseAccounts(bank.access_token);
          const account = accounts.find((acc: any) => acc.account_id === bank.account_id);
          
          if (account) {
            const balance = await getFinverseBalance(bank.access_token, bank.account_id);
            
            // Update balance in database
            await query(
              'UPDATE banks SET balance = ?, available_balance = ?, updated_at = NOW() WHERE id = ?',
              [balance.current || 0, balance.available || 0, bank.id]
            );
            
            return {
              id: bank.id,
              institutionName: bank.institution_name,
              accountNumber: bank.account_number,
              accountName: bank.account_name,
              balance: balance.current || bank.balance,
              availableBalance: balance.available || bank.available_balance,
              currency: 'IDR',
              type: bank.account_type || 'depository',
              mask: bank.account_number?.slice(-4) || '****',
            };
          }
        } catch (error) {
          console.error(`Error fetching balance for bank ${bank.id}:`, error);
        }
        
        // If Finverse API fails, use cached balance from database
        return {
          id: bank.id,
          institutionName: bank.institution_name,
          accountNumber: bank.account_number,
          accountName: bank.account_name,
          balance: bank.balance,
          availableBalance: bank.available_balance,
          currency: 'IDR',
          type: bank.account_type || 'depository',
          mask: bank.account_number?.slice(-4) || '****',
        };
      })
    );

    return parseStringify(banksWithBalance.filter(Boolean));
  } catch (error: any) {
    console.error('Error getting Finverse bank accounts:', error);
    throw new Error(error.message || 'Failed to get bank accounts');
  }
};

/**
 * Sync transactions from Finverse for a specific bank
 */
export const syncFinverseTransactions = async (bankId: string) => {
  try {
    // Get bank details
    const banks: any = await query('SELECT * FROM banks WHERE id = ? LIMIT 1', [bankId]);

    if (!Array.isArray(banks) || banks.length === 0) {
      throw new Error('Bank not found');
    }

    const bank = banks[0];

    // Get transactions from Finverse (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const startDate = ninetyDaysAgo.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    const transactions = await getFinverseTransactions(
      bank.access_token,
      bank.account_id,
      startDate,
      endDate
    );

    let syncedCount = 0;

    // Store transactions in database
    for (const txn of transactions) {
      const transactionId = uuidv4();
      
      // Check if transaction already exists
      const existing: any = await query(
        'SELECT id FROM transactions WHERE bank_id = ? AND external_transaction_id = ? LIMIT 1',
        [bankId, txn.transaction_id || txn.id]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        continue; // Skip if already exists
      }

      await query(
        `INSERT INTO transactions (
          id, bank_id, user_id, external_transaction_id, 
          name, amount, currency, description, category,
          date, type, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          transactionId,
          bankId,
          bank.user_id,
          txn.transaction_id || txn.id,
          txn.merchant_name || txn.name || 'Transaction',
          Math.abs(txn.amount),
          'IDR',
          txn.description || '',
          txn.category?.[0] || 'general',
          txn.date || txn.transaction_date,
          txn.amount < 0 ? 'debit' : 'credit',
          'completed',
        ]
      );
      
      syncedCount++;
    }

    console.log('[Finverse] Synced transactions:', {
      bankId,
      count: syncedCount,
    });

    revalidatePath('/transaction-history');
    return parseStringify({ success: true, count: syncedCount });
  } catch (error: any) {
    console.error('Error syncing Finverse transactions:', error);
    throw new Error(error.message || 'Failed to sync transactions');
  }
};
