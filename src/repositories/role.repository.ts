import { query } from '../database/db.js';

export async function getAllRoles() {
  return await query(`SELECT * FROM role ORDER BY id`);
}

export async function createRole(role_name: string) {
  const result = await query(
    `INSERT INTO role (role_name) VALUES ($1) RETURNING *`,
    [role_name]
  );

  return result[0];
}