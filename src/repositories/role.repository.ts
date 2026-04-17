import { query } from '../database/db.js';

export async function getAllRoles() {
  return await query(
    `SELECT * FROM role 
     WHERE is_activated = true 
     ORDER BY id`
  );
}

export async function createRole(role_name: string) {
  const result = await query(
    `INSERT INTO role (role_name) VALUES ($1) RETURNING *`,
    [role_name]
  );

  return result[0];
}

export async function updateRole(id: string, role_name: string) {
  const result = await query(
    `UPDATE role
     SET role_name = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 AND is_activated = true
     RETURNING *`,
    [role_name, id]
  );

  return result[0];
}

export async function softDeleteRole(id: string) {
  const result = await query(
    `UPDATE role
     SET is_activated = false,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result[0];
}