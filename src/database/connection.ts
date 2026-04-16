// src/database/connection.ts

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const db = new Pool({
  connectionString: getEnv('DATABASE_URL'),

  // important pour Render (SSL obligatoire)
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});