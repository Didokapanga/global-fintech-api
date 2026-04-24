// src/repositories/user.repository.ts
import { query } from '../database/db.js';

// 🔥 TOUS LES USERS (ENRICHI)
export async function getAllUsers() {
  return await query(
    `SELECT 
      u.id,
      u.user_name,
      u.phone,
      u.email,
      u.is_activated,
      u.created_at,

      r.id as role_id,
      r.role_name,

      a.id as agence_id,
      a.libelle as agence_name,
      a.code_agence,
      a.ville

    FROM "user" u
    LEFT JOIN role r ON u.role_id = r.id
    LEFT JOIN agence a ON u.agence_id = a.id
    ORDER BY u.created_at DESC`
  );
}

// 🔥 USERS PAR AGENCE
export async function getUsersByAgence(agence_id: string) {
  return await query(
    `SELECT 
      u.id,
      u.user_name,
      u.phone,
      u.email,
      u.is_activated,

      r.role_name,

      a.libelle as agence_name,
      a.ville

    FROM "user" u
    LEFT JOIN role r ON u.role_id = r.id
    LEFT JOIN agence a ON u.agence_id = a.id
    WHERE u.agence_id = $1
    ORDER BY u.created_at DESC`,
    [agence_id]
  );
}

export async function findUserById(id: string) {
  const users = await query(
    `SELECT 
      u.id,
      u.user_name,
      u.phone,
      u.email,
      u.is_activated,
      u.created_at,

      r.id as role_id,
      r.role_name,

      a.id as agence_id,
      a.libelle as agence_name,
      a.code_agence,
      a.ville

    FROM "user" u
    LEFT JOIN role r ON u.role_id = r.id
    LEFT JOIN agence a ON u.agence_id = a.id
    WHERE u.id = $1
    LIMIT 1`,
    [id]
  );

  return users[0];
}

export async function findUserByUserName(user_name: string) {
  const users = await query(
    `SELECT 
        u.id,
        u.user_name,
        u.phone,
        u.email,
        u.hash_password,
        u.is_activated,
        u.created_at,

        r.id as role_id,
        r.role_name,

        a.id as agence_id,
        a.libelle as agence_name,
        a.code_agence,
        a.ville

     FROM "user" u
     LEFT JOIN role r ON u.role_id = r.id
     LEFT JOIN agence a ON u.agence_id = a.id
     WHERE u.user_name = $1
     LIMIT 1`,
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
  const fields = [];
  const values = [];
  let index = 1;

  // 🔥 construire dynamiquement
  if (data.role_id !== undefined) {
    fields.push(`role_id = $${index++}`);
    values.push(data.role_id);
  }

  if (data.agence_id !== undefined) {
    fields.push(`agence_id = $${index++}`);
    values.push(data.agence_id);
  }

  if (data.user_name !== undefined) {
    fields.push(`user_name = $${index++}`);
    values.push(data.user_name);
  }

  if (data.phone !== undefined) {
    fields.push(`phone = $${index++}`);
    values.push(data.phone);
  }

  if (data.email !== undefined) {
    fields.push(`email = $${index++}`);
    values.push(data.email);
  }

  // ⚠️ aucun champ envoyé
  if (fields.length === 0) {
    throw new Error('Aucune donnée à mettre à jour');
  }

  // 🔥 ajouter updated_at
  fields.push(`updated_at = CURRENT_TIMESTAMP`);

  const queryText = `
    UPDATE "user"
    SET ${fields.join(', ')}
    WHERE id = $${index}
    RETURNING *
  `;

  values.push(id);

  const result = await query(queryText, values);

  return result[0];
}

export async function deleteUser(id: string) {
  const result = await query(
    `DELETE FROM "user" WHERE id = $1 RETURNING *`,
    [id]
  );

  return result[0];
}