'use server';

import bcrypt from '../stubs/bcryptjs';
import { cookies } from "next/headers";
import { query } from "../mysql";
import { v4 as uuidv4 } from '../stubs/uuid';

// Sign in with email and password
export const signIn = async ({ email, password }: { email: string; password: string }) => {
  try {
    // Find user by email
    const users: any = await query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = users[0];
    console.log('[Sign In] User found:', { id: user.id, email: user.email, hasPassword: !!user.password });

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Create session token
    const sessionToken = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store session in database
    await query(
      'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [uuidv4(), user.id, sessionToken, expiresAt]
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("mysql-session", sessionToken, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      expires: expiresAt,
    });

    return { 
      success: true, 
      userId: user.id,
      email: user.email 
    };
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

// Sign up new user
export const signUp = async (userData: SignUpParams) => {
  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    address1, 
    city, 
    postalCode, 
    dateOfBirth, 
    ssn 
  } = userData;

  try {
    // Check if user already exists
    const existingUsers: any = await query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user ID
    const userId = uuidv4();

    // Insert user into database
    await query(
      `INSERT INTO users (
        id, email, password, first_name, last_name, 
        address, city, postal_code, date_of_birth, ssn, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        email,
        hashedPassword,
        firstName,
        lastName,
        address1 || '',
        city || '',
        postalCode || '',
        dateOfBirth || null,
        ssn || '',
      ]
    );

    // Create session token
    const sessionToken = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Store session
    await query(
      'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [uuidv4(), userId, sessionToken, expiresAt]
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("mysql-session", sessionToken, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      expires: expiresAt,
    });

    return { 
      success: true, 
      userId,
      email 
    };
  } catch (error: any) {
    console.error('Error signing up:', error);
    throw new Error(error.message || 'Failed to sign up');
  }
};

// Get logged in user
export async function getLoggedInUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("mysql-session");
    
    if (!session || !session.value) {
      return null;
    }

    // Find valid session
    const sessions: any = await query(
      `SELECT s.*, u.id, u.email, u.first_name, u.last_name, 
              u.address, u.city, u.postal_code, u.date_of_birth
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token = ? AND s.expires_at > NOW()
       LIMIT 1`,
      [session.value]
    );

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return null;
    }

    const data = sessions[0];

    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      address: data.address,
      city: data.city,
      postalCode: data.postal_code,
      dateOfBirth: data.date_of_birth,
    };
  } catch (error) {
    console.error('Error getting logged in user:', error);
    return null;
  }
}

// Logout
export async function logoutAccount() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("mysql-session");
    
    if (session && session.value) {
      // Delete session from database
      await query(
        'DELETE FROM sessions WHERE token = ?',
        [session.value]
      );
    }

    // Clear cookie
    cookieStore.delete("mysql-session");
    
    return { success: true };
  } catch (error) {
    console.error('Error logging out:', error);
    return null;
  }
}
