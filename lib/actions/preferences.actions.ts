'use server';

import { getDatabase } from '@/lib/sqlite';

interface UserPreferences {
  id?: number;
  user_id: string;
  currency: string;
  language: string;
  date_format: string;
  notifications_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string) {
  try {
    const db = getDatabase();
    
    const preferences = db
      .prepare(`
        SELECT * FROM user_preferences 
        WHERE user_id = ?
      `)
      .get(userId) as UserPreferences | undefined;

    if (!preferences) {
      // Return default preferences if not found
      return {
        success: true,
        data: {
          currency: 'IDR',
          language: 'id',
          date_format: 'DD/MM/YYYY',
          notifications_enabled: true,
        }
      };
    }

    return {
      success: true,
      data: {
        currency: preferences.currency,
        language: preferences.language,
        date_format: preferences.date_format,
        notifications_enabled: Boolean(preferences.notifications_enabled),
      }
    };
  } catch (error) {
    console.error('[Get Preferences] Error:', error);
    return {
      success: false,
      error: 'Failed to get preferences'
    };
  }
}

/**
 * Update or create user preferences
 */
export async function updateUserPreferences(params: {
  userId: string;
  currency: string;
  language: string;
  dateFormat: string;
  notificationsEnabled: boolean;
}) {
  try {
    const db = getDatabase();
    
    // Check if preferences exist
    const existing = db
      .prepare('SELECT id FROM user_preferences WHERE user_id = ?')
      .get(params.userId);

    if (existing) {
      // Update existing preferences
      db.prepare(`
        UPDATE user_preferences 
        SET currency = ?,
            language = ?,
            date_format = ?,
            notifications_enabled = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        params.currency,
        params.language,
        params.dateFormat,
        params.notificationsEnabled ? 1 : 0,
        params.userId
      );
    } else {
      // Create new preferences
      db.prepare(`
        INSERT INTO user_preferences (
          user_id, currency, language, date_format, notifications_enabled
        ) VALUES (?, ?, ?, ?, ?)
      `).run(
        params.userId,
        params.currency,
        params.language,
        params.dateFormat,
        params.notificationsEnabled ? 1 : 0
      );
    }

    console.log('[Update Preferences] ✅ Preferences updated successfully');

    return {
      success: true,
      message: 'Preferences saved successfully!'
    };
  } catch (error) {
    console.error('[Update Preferences] Error:', error);
    return {
      success: false,
      error: 'Failed to save preferences'
    };
  }
}

/**
 * Get currency symbol
 */
export async function getCurrencySymbol(currency: string): Promise<string> {
  const symbols: Record<string, string> = {
    'IDR': 'Rp',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'SGD': 'S$',
    'MYR': 'RM',
  };
  
  return symbols[currency] || currency;
}

/**
 * Format amount with user's currency
 */
export async function formatCurrency(amount: number, userId: string): Promise<string> {
  const prefsResult = await getUserPreferences(userId);
  
  if (!prefsResult.success || !prefsResult.data) {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }
  
  const symbol = await getCurrencySymbol(prefsResult.data.currency);
  const locale = prefsResult.data.language === 'id' ? 'id-ID' : 'en-US';
  
  return `${symbol} ${amount.toLocaleString(locale)}`;
}
