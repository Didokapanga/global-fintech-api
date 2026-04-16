// src/database/connection.ts
import { Pool } from 'pg';

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const db = new Pool({
  connectionString: getEnv('DATABASE_URL'),
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});