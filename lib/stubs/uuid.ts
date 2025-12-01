/**
 * UUID Stub Implementation
 * This uses Node.js built-in crypto.randomUUID() to generate UUIDs
 * Replace with actual uuid package when network allows npm install
 */

import { randomUUID } from 'crypto';

/**
 * Generate a v4 (random) UUID
 */
export function v4(): string {
  return randomUUID();
}

/**
 * Generate a v1 (timestamp-based) UUID
 * Note: This is a simplified implementation using v4 as fallback
 */
export function v1(): string {
  console.warn('[UUID Stub] v1() using v4() as fallback. Install uuid package for proper v1 support.');
  return randomUUID();
}

/**
 * Generate a v3 (namespace MD5) UUID
 * Note: This is a simplified implementation using v4 as fallback
 */
export function v3(name: string, namespace: string): string {
  console.warn('[UUID Stub] v3() using v4() as fallback. Install uuid package for proper v3 support.');
  return randomUUID();
}

/**
 * Generate a v5 (namespace SHA-1) UUID
 * Note: This is a simplified implementation using v4 as fallback
 */
export function v5(name: string, namespace: string): string {
  console.warn('[UUID Stub] v5() using v4() as fallback. Install uuid package for proper v5 support.');
  return randomUUID();
}

console.warn('⚠️  Using UUID stub implementation with Node.js crypto.randomUUID().');
console.warn('⚠️  Install uuid package for full UUID support: npm install uuid');

export default {
  v1,
  v3,
  v4,
  v5,
};
