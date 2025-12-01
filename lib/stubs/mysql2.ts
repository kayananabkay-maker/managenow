/**
 * MySQL2 Stub Implementation
 * This is a temporary mock to allow the app to run without installing mysql2 package
 * Replace with actual mysql2 when network allows npm install
 */

export interface Connection {
  query(sql: string, values?: any[]): Promise<any>;
  execute(sql: string, values?: any[]): Promise<any>;
  release(): void;
  end(): Promise<void>;
}

export interface Pool {
  query(sql: string, values?: any[]): Promise<any>;
  execute(sql: string, values?: any[]): Promise<any>;
  getConnection(): Promise<Connection>;
  end(): Promise<void>;
}

export interface PoolOptions {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  waitForConnections?: boolean;
  connectionLimit?: number;
  queueLimit?: number;
}

// In-memory data store for stub implementation
const inMemoryDB = {
  users: [] as any[],
  sessions: [] as any[],
  banks: [] as any[],
  transactions: [] as any[],
};

function executeQuery(sql: string, values: any[] = []): any {
  const sqlLower = sql.toLowerCase().trim();
  
  // Handle INSERT queries
  if (sqlLower.startsWith('insert into')) {
    if (sqlLower.includes('users')) {
      const user = {
        id: values[0],           // userId from values[0]
        email: values[1],        // email from values[1]
        password: values[2],     // hashed password from values[2]
        first_name: values[3],   // firstName from values[3]
        last_name: values[4],    // lastName from values[4]
        address: values[5] || null,
        city: values[6] || null,
        postal_code: values[7] || null,
        date_of_birth: values[8] || null,
        ssn: values[9] || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryDB.users.push(user);
      console.log('[MySQL Stub] User created:', { id: user.id, email: user.email });
      return [{ insertId: user.id, affectedRows: 1 }];
    } else if (sqlLower.includes('sessions')) {
      const session = {
        id: values[0],           // session id
        userId: values[1],       // user_id
        token: values[2],        // token
        expiresAt: values[3],    // expires_at
        createdAt: new Date(),
      };
      inMemoryDB.sessions.push(session);
      console.log('[MySQL Stub] Session created:', { token: session.token, userId: session.userId });
      return [{ insertId: session.id, affectedRows: 1 }];
    } else if (sqlLower.includes('banks')) {
      const bank = {
        id: Date.now().toString(),
        userId: values[0],
        bankId: values[1],
        accountId: values[2],
        accessToken: values[3],
        fundingSourceUrl: values[4] || null,
        shareableId: values[5] || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryDB.banks.push(bank);
      return [{ insertId: bank.id, affectedRows: 1 }];
    } else if (sqlLower.includes('transactions')) {
      const transaction = {
        id: Date.now().toString(),
        bankId: values[0],
        accountId: values[1],
        amount: values[2],
        category: values[3] || null,
        date: values[4] || new Date(),
        name: values[5] || null,
        channel: values[6] || null,
        type: values[7] || null,
        pending: values[8] || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryDB.transactions.push(transaction);
      return [{ insertId: transaction.id, affectedRows: 1 }];
    }
    return [{ insertId: 1, affectedRows: 1 }];
  }
  
  // Handle SELECT queries
  if (sqlLower.startsWith('select')) {
    // Handle JOIN query for sessions with user data (for getLoggedInUser)
    if (sqlLower.includes('from sessions s') && sqlLower.includes('join users u')) {
      const token = values[0];
      const session = inMemoryDB.sessions.find(s => s.token === token);
      
      if (!session) {
        console.log('[MySQL Stub] SELECT session with JOIN: token not found:', token);
        return [[]];
      }
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        console.log('[MySQL Stub] SELECT session with JOIN: session expired');
        return [[]];
      }
      
      // Find the user
      const user = inMemoryDB.users.find(u => u.id === session.userId);
      
      if (!user) {
        console.log('[MySQL Stub] SELECT session with JOIN: user not found for session');
        return [[]];
      }
      
      // Combine session and user data
      const result = {
        ...session,
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        address: user.address,
        city: user.city,
        postal_code: user.postal_code,
        date_of_birth: user.date_of_birth,
      };
      
      console.log('[MySQL Stub] SELECT session with JOIN: Found user:', user.first_name, user.last_name);
      return [[result]];
    }
    
    if (sqlLower.includes('from users')) {
      if (sqlLower.includes('where email')) {
        const email = values[0];
        const user = inMemoryDB.users.find(u => u.email === email);
        console.log('[MySQL Stub] SELECT user by email:', email, 'Found:', !!user);
        return [user ? [user] : []];
      } else if (sqlLower.includes('where id')) {
        const id = values[0];
        const user = inMemoryDB.users.find(u => u.id === id);
        console.log('[MySQL Stub] SELECT user by id:', id, 'Found:', !!user);
        return [user ? [user] : []];
      }
      return [inMemoryDB.users];
    } else if (sqlLower.includes('from sessions')) {
      if (sqlLower.includes('where token')) {
        const token = values[0];
        const session = inMemoryDB.sessions.find(s => s.token === token);
        return [[session].filter(Boolean)];
      }
      return [inMemoryDB.sessions];
    } else if (sqlLower.includes('from banks')) {
      if (sqlLower.includes('where user_id') || sqlLower.includes('where userId')) {
        const userId = values[0];
        const banks = inMemoryDB.banks.filter(b => b.userId === userId);
        return [banks];
      } else if (sqlLower.includes('where id')) {
        const id = values[0];
        const bank = inMemoryDB.banks.find(b => b.id === id);
        return [[bank].filter(Boolean)];
      }
      return [inMemoryDB.banks];
    } else if (sqlLower.includes('from transactions')) {
      if (sqlLower.includes('where bank_id') || sqlLower.includes('where bankId')) {
        const bankId = values[0];
        const transactions = inMemoryDB.transactions.filter(t => t.bankId === bankId);
        return [transactions];
      }
      return [inMemoryDB.transactions];
    }
    return [[]];
  }
  
  // Handle UPDATE queries
  if (sqlLower.startsWith('update')) {
    return [{ affectedRows: 1 }];
  }
  
  // Handle DELETE queries
  if (sqlLower.startsWith('delete')) {
    if (sqlLower.includes('from sessions')) {
      const token = values[0];
      const index = inMemoryDB.sessions.findIndex(s => s.token === token);
      if (index !== -1) {
        inMemoryDB.sessions.splice(index, 1);
        return [{ affectedRows: 1 }];
      }
    }
    return [{ affectedRows: 0 }];
  }
  
  return [[]];
}

const mockConnection: Connection = {
  async query(sql: string, values?: any[]) {
    console.log('[MySQL Stub] Query:', sql, values);
    return executeQuery(sql, values);
  },
  async execute(sql: string, values?: any[]) {
    console.log('[MySQL Stub] Execute:', sql, values);
    return executeQuery(sql, values);
  },
  release() {
    // No-op for stub
  },
  async end() {
    // No-op for stub
  },
};

const mockPool: Pool = {
  async query(sql: string, values?: any[]) {
    console.log('[MySQL Stub] Pool Query:', sql, values);
    return executeQuery(sql, values);
  },
  async execute(sql: string, values?: any[]) {
    console.log('[MySQL Stub] Pool Execute:', sql, values);
    return executeQuery(sql, values);
  },
  async getConnection() {
    console.log('[MySQL Stub] Getting connection');
    return mockConnection;
  },
  async end() {
    console.log('[MySQL Stub] Closing pool');
  },
};

export function createPool(options: PoolOptions): Pool {
  console.log('[MySQL Stub] Creating pool with options:', options);
  console.warn('⚠️  Using MySQL stub implementation. Data is stored in memory only.');
  console.warn('⚠️  Install mysql2 package for persistent database: npm install mysql2');
  return mockPool;
}

const mysql = {
  createPool,
};

export default mysql;
