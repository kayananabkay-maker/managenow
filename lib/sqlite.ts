/**
 * SQLite Database Client for ManageNow
 * Simple, fast, and file-based database - no password needed!
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DATABASE_PATH = process.env.DATABASE_URL || path.join(process.cwd(), 'managenow.db');
const SCHEMA_PATH = path.join(process.cwd(), 'database', 'sqlite-schema.sql');

let db: Database.Database | null = null;

/**
 * Get or create SQLite database connection
 */
export function getDatabase(): Database.Database {
  if (db) {
    return db;
  }

  console.log('📦 Initializing SQLite database at:', DATABASE_PATH);

  // Create database connection
  db = new Database(DATABASE_PATH);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Initialize schema if tables don't exist
  initializeSchema(db);
  
  console.log('✅ SQLite database ready!');
  
  return db;
}

/**
 * Initialize database schema from SQL file
 */
function initializeSchema(database: Database.Database) {
  try {
    // Check if users table exists
    const tableExists = database
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
      .get();

    if (!tableExists) {
      console.log('📝 Creating database tables...');
      
      // Read and execute schema file
      if (fs.existsSync(SCHEMA_PATH)) {
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
        database.exec(schema);
        console.log('✅ Database tables created successfully!');
      } else {
        console.warn('⚠️  Schema file not found, creating basic tables...');
        createBasicTables(database);
      }
    }
    
    // Always ensure user_preferences table exists
    ensureUserPreferencesTable(database);
  } catch (error) {
    console.error('❌ Error initializing schema:', error);
    throw error;
  }
}

/**
 * Ensure user_preferences table exists
 */
function ensureUserPreferencesTable(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL UNIQUE,
      currency TEXT DEFAULT 'IDR',
      language TEXT DEFAULT 'id',
      date_format TEXT DEFAULT 'DD/MM/YYYY',
      notifications_enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
  `);
}

/**
 * Create basic tables if schema file is not found
 */
function createBasicTables(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      address TEXT,
      city TEXT,
      postal_code TEXT,
      date_of_birth TEXT,
      ssn TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS banks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      institution_id TEXT NOT NULL,
      institution_name TEXT NOT NULL,
      access_token TEXT,
      account_id TEXT,
      provider TEXT DEFAULT 'finverse',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
}

/**
 * Close database connection
 */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('🔒 SQLite database closed');
  }
}

/**
 * Execute a query with parameters
 */
export function query<T = any>(sql: string, params: any[] = []): T[] {
  const database = getDatabase();
  try {
    const stmt = database.prepare(sql);
    const result = stmt.all(...params);
    return result as T[];
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
}

/**
 * Execute a query and get first result
 */
export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const database = getDatabase();
  try {
    const stmt = database.prepare(sql);
    const result = stmt.get(...params);
    return (result as T) || null;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
}

/**
 * Execute an INSERT/UPDATE/DELETE query
 */
export function execute(sql: string, params: any[] = []): Database.RunResult {
  const database = getDatabase();
  try {
    const stmt = database.prepare(sql);
    const result = stmt.run(...params);
    return result;
  } catch (error) {
    console.error('❌ Execute error:', error);
    throw error;
  }
}

/**
 * Execute multiple queries in a transaction
 */
export function transaction<T>(callback: () => T): T {
  const database = getDatabase();
  const txn = database.transaction(callback);
  return txn();
}

// Export database instance getter
export default getDatabase;
