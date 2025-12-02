'use server';

/**
 * User Actions - SQLite Implementation
 * Handles user authentication and session management with SQLite
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, execute } from '@/lib/sqlite';

const SESSION_COOKIE_NAME = 'session_token';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface SignUpParams {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  state?: string;
  postalCode: string;
  dateOfBirth: string;
  ssn?: string;
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  date_of_birth?: string;
  ssn?: string;
  created_at?: string;
}

/**
 * Sign up a new user
 */
export async function signUp(userData: SignUpParams) {
  try {
    console.log('[Sign Up] Starting sign up process for:', userData.email);

    // Check if user already exists
    const existingUser = queryOne<User>(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [userData.email]
    );

    if (existingUser) {
      return { error: 'Email sudah terdaftar. Silakan gunakan email lain atau sign in.' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const userId = uuidv4();
    execute(
      `INSERT INTO users (
        id, email, password, first_name, last_name, 
        address, city, postal_code, date_of_birth, ssn, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        userId,
        userData.email,
        hashedPassword,
        userData.firstName,
        userData.lastName,
        userData.address1,
        userData.city,
        userData.postalCode,
        userData.dateOfBirth,
        userData.ssn || '',
      ]
    );

    console.log('[Sign Up] ✅ User created successfully:', userId);

    // Create session
    const sessionToken = uuidv4();
    const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString();

    execute(
      'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [uuidv4(), userId, sessionToken, expiresAt]
    );

    // Set cookie
    (await cookies()).set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    });

    console.log('[Sign Up] ✅ Session created for user:', userId);

    return { success: true };
  } catch (error) {
    console.error('[Sign Up] ❌ Error:', error);
    return { error: 'Terjadi kesalahan saat membuat akun. Silakan coba lagi.' };
  }
}

/**
 * Sign in existing user
 */
export async function signIn({ email, password }: { email: string; password: string }) {
  try {
    console.log('[Sign In] Attempting sign in for:', email);

    // Find user
    const user = queryOne<User>('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);

    if (!user) {
      console.log('[Sign In] User not found:', email);
      return { error: 'Email atau password salah.' };
    }

    console.log('[Sign In] User found:', user.id);

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log('[Sign In] Password mismatch for user:', email);
      return { error: 'Email atau password salah.' };
    }

    // Create session
    const sessionToken = uuidv4();
    const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString();

    execute(
      'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [uuidv4(), user.id, sessionToken, expiresAt]
    );

    // Set cookie
    (await cookies()).set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    });

    console.log('[Sign In] ✅ Session created for user:', user.id);

    return { success: true };
  } catch (error) {
    console.error('[Sign In] ❌ Error:', error);
    return { error: 'Terjadi kesalahan saat sign in. Silakan coba lagi.' };
  }
}

/**
 * Get logged in user from session
 */
export async function getLoggedInUser() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    // Get user from session
    const result = queryOne<User & { token: string }>(
      `SELECT s.*, u.id, u.email, u.first_name, u.last_name, 
              u.address, u.city, u.postal_code, u.date_of_birth
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')
       LIMIT 1`,
      [sessionToken]
    );

    if (!result) {
      return null;
    }

    const userData = {
      id: result.id,
      $id: result.id,
      email: result.email,
      userId: result.id,
      firstName: result.first_name,
      lastName: result.last_name,
      name: `${result.first_name} ${result.last_name}`,
      address1: result.address || '',
      city: result.city || '',
      postalCode: result.postal_code || '',
      dateOfBirth: result.date_of_birth || '',
    };

    console.log('[getLoggedInUser] Returning user:', userData.id, userData.email);

    return userData;
  } catch (error) {
    console.error('[Get User] ❌ Error:', error);
    return null;
  }
}

/**
 * Logout user
 */
export async function logoutAccount() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      // Delete session from database
      execute('DELETE FROM sessions WHERE token = ?', [sessionToken]);
    }

    // Clear cookie
    cookieStore.delete(SESSION_COOKIE_NAME);

    redirect('/sign-in');
  } catch (error) {
    console.error('[Logout] ❌ Error:', error);
    return null;
  }
}

/**
 * Update user profile information
 */
export async function updateUserProfile(params: {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  address1?: string;
  city?: string;
  postalCode?: string;
  dateOfBirth?: string;
}) {
  try {
    console.log('[Update Profile] Updating user:', params.userId);

    // Check if email is already taken by another user
    if (params.email) {
      const existingUser = queryOne<User>(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [params.email, params.userId]
      );

      if (existingUser) {
        return {
          success: false,
          error: 'Email already in use by another account'
        };
      }
    }

    // Update user data
    execute(
      `UPDATE users SET 
        first_name = ?,
        last_name = ?,
        email = ?,
        address = ?,
        city = ?,
        postal_code = ?,
        date_of_birth = ?
      WHERE id = ?`,
      [
        params.firstName,
        params.lastName,
        params.email,
        params.address1 || null,
        params.city || null,
        params.postalCode || null,
        params.dateOfBirth || null,
        params.userId
      ]
    );

    console.log('[Update Profile] ✅ Profile updated successfully');

    return {
      success: true,
      message: 'Profile updated successfully!'
    };
  } catch (error) {
    console.error('[Update Profile] ❌ Error:', error);
    return {
      success: false,
      error: 'Failed to update profile'
    };
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(params: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) {
  try {
    console.log('[Update Password] Updating password for user:', params.userId);

    // Get current user data
    const user = queryOne<User>('SELECT * FROM users WHERE id = ?', [params.userId]);

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(params.currentPassword, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Current password is incorrect'
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(params.newPassword, 10);

    // Update password
    execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, params.userId]);

    console.log('[Update Password] ✅ Password updated successfully');

    return {
      success: true,
      message: 'Password updated successfully!'
    };
  } catch (error) {
    console.error('[Update Password] ❌ Error:', error);
    return {
      success: false,
      error: 'Failed to update password'
    };
  }
}
