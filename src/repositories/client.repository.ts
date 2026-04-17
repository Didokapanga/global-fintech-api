import { query } from '../database/db.js';

// CREATE
export async function createClient(data: any) {
  const result = await query(
    `INSERT INTO client
    (name, first_name, second_name, phone, address, commune, quartier, ville)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *`,
    [
      data.name,
      data.first_name,
      data.second_name,
      data.phone,
      data.address,
      data.commune,
      data.quartier,
      data.ville
    ]
  );

  return result[0];
}

// GET ALL (pagination ready)
export async function getClients(limit: number, offset: number) {
  const data = await query(
    `SELECT * FROM client
     WHERE is_activated = true
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const totalRes = await query(
    `SELECT COUNT(*) FROM client WHERE is_activated = true`
  );

  return {
    data,
    total: Number(totalRes[0].count)
  };
}

// GET ONE
export async function getClientById(id: string) {
  const result = await query(
    `SELECT * FROM client WHERE id = $1 AND is_activated = true`,
    [id]
  );

  return result[0];
}

// UPDATE
export async function updateClient(id: string, data: any) {
  const result = await query(
    `UPDATE client SET
      name = $1,
      first_name = $2,
      second_name = $3,
      phone = $4,
      address = $5,
      commune = $6,
      quartier = $7,
      ville = $8,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = $9
     RETURNING *`,
    [
      data.name,
      data.first_name,
      data.second_name,
      data.phone,
      data.address,
      data.commune,
      data.quartier,
      data.ville,
      id
    ]
  );

  return result[0];
}

// SOFT DELETE
export async function deleteClient(id: string) {
  const result = await query(
    `UPDATE client
     SET is_activated = false
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result[0];
}