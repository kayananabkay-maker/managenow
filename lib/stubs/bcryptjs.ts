/**
 * bcryptjs Stub Implementation
 * This uses Node.js built-in crypto module to provide password hashing
 * Replace with actual bcryptjs when network allows npm install
 */

import { randomBytes, pbkdf2Sync } from 'crypto';

const SALT_ROUNDS = 10;

/**
 * Hash a password using PBKDF2
 */
export async function hash(password: string, saltRounds: number = SALT_ROUNDS): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Synchronous version of hash
 */
export function hashSync(password: string, saltRounds: number = SALT_ROUNDS): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Compare a password with a hash
 */
export async function compare(password: string, hash: string): Promise<boolean> {
  try {
    console.log('[bcrypt stub] Comparing password');
    console.log('[bcrypt stub] Input password:', password);
    console.log('[bcrypt stub] Stored hash:', hash);
    
    const [salt, originalHash] = hash.split(':');
    if (!salt || !originalHash) {
      console.log('[bcrypt stub] Invalid hash format - missing salt or hash');
      return false;
    }
    
    const compareHash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    const result = compareHash === originalHash;
    
    console.log('[bcrypt stub] Comparison result:', result);
    return result;
  } catch (error) {
    console.error('[bcrypt stub] Compare error:', error);
    return false;
  }
}

/**
 * Synchronous version of compare
 */
export function compareSync(password: string, hash: string): boolean {
  try {
    const [salt, originalHash] = hash.split(':');
    if (!salt || !originalHash) {
      return false;
    }
    const compareHash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return compareHash === originalHash;
  } catch (error) {
    console.error('[bcrypt stub] CompareSync error:', error);
    return false;
  }
}

console.warn('⚠️  Using bcryptjs stub implementation with Node.js crypto module.');
console.warn('⚠️  Install bcryptjs package for production use: npm install bcryptjs');

const bcrypt = {
  hash,
  hashSync,
  compare,
  compareSync,
};

export default bcrypt;
