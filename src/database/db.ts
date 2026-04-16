// src/database/db.ts

import { db } from './connection.js';

export async function query(sql: string, params: any[] = []) {
  const result = await db.query(sql, params);
  return result.rows;
}