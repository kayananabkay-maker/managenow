// Temporary stub for mysql2 until packages can be installed
// This allows TypeScript to compile without errors

export interface Connection {
  execute(sql: string, values?: any[]): Promise<any[]>;
  release(): void;
  end(): Promise<void>;
}

export interface Pool {
  execute(sql: string, values?: any[]): Promise<any[]>;
  getConnection(): Promise<Connection>;
  end(): Promise<void>;
}

export interface PoolOptions {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  waitForConnections?: boolean;
  connectionLimit?: number;
  queueLimit?: number;
}

function createPool(options: PoolOptions): Pool {
  throw new Error('mysql2 package not installed. Please install with: npm install mysql2');
}

export default { createPool };
