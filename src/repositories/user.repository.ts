// src/user.repository.ts
import { query } from '../database/db.js';

export async function findUserByUserName(user_name: string) {
  const users = await query(
    `SELECT * FROM "user" WHERE user_name = $1 LIMIT 1`,
    [user_name]
  );

  return users[0];
}

export async function findUserByEmail(email: string) {
  const users = await query(
    `SELECT * FROM "user" WHERE email = $1`,
    [email]
  );

  return users[0];
}

export async function createUser(data: any) {
  const result = await query(
    `INSERT INTO "user" 
    (role_id, agence_id, user_name, phone, email, hash_password, is_activated)
    VALUES ($1,$2,$3,$4,$5,$6,true)
    RETURNING *`,
    [
      data.role_id,
      data.agence_id,
      data.user_name,
      data.phone,
      data.email,
      data.hash_password
    ]
  );

  return result[0];
}

export async function updateUser(id: string, data: any) {
  const result = await query(
    `UPDATE "user"
     SET role_id = $1,
         agence_id = $2,
         user_name = $3,
         phone = $4,
         email = $5,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING *`,
    [
      data.role_id,
      data.agence_id,
      data.user_name,
      data.phone,
      data.email,
      id
    ]
  );

  return result[0];
}

export async function deleteUser(id: string) {
  const result = await query(
    `DELETE FROM "user" WHERE id = $1 RETURNING *`,
    [id]
  );

  return result[0];
}