// db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Check if required environment variables are set
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'] as const;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Database connection configuration
const poolConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: Number(process.env.DB_POOL_SIZE || '10'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
};

let _pool: Pool | null = null;

// Get or create pool
function getPool() {
  if (!_pool) {
    _pool = new Pool(poolConfig);
    
    _pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      if (process.env.NODE_ENV !== 'production') {
        console.error('Database error in development:', err);
      } else {
        process.exit(-1);
      }
    });

    _pool.on('connect', () => {
      console.log('Connected to database');
    });
  }
  return _pool;
}

// Export the db instance with lazy initialization
export const db = drizzle(getPool(), { 
  logger: process.env.NODE_ENV === 'development' 
});

// Utility function to run migrations
export async function runMigrations() {
  try {
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: 'src/drizzle/migrations' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

// Utility function to check database connection
export async function checkDatabaseConnection() {
  try {
    const pool = getPool();
    const client = await pool.connect();
    client.release();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    return false;
  }
}

// Utility function to close the pool
export async function closeDatabase() {
  try {
    if (_pool) {
      await _pool.end();
      _pool = null;
      console.log('Database pool closed');
    }
  } catch (error) {
    console.error('Error closing database pool:', error);
    throw error;
  }
}

// Type for query result
export type QueryResult<T> = T extends Promise<infer U> ? U : never;

// Basic health check query
export async function pingDatabase() {
  try {
    const result = await db.execute(sql`SELECT 1`);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database ping failed:', error);
    return false;
  }
}

// Export the pool getter for direct access if needed
export { getPool as pool };