import { query } from '../database/db.js';

export async function createCaisse(data: any) {
  const result = await query(
    `INSERT INTO caisse
    (agence_id, agent_id, type, devise, code_caisse, state)
    VALUES ($1,$2,$3,$4,$5,'FERMEE')
    RETURNING *`,
    [
      data.agence_id,
      data.agent_id,
      data.type,
      data.devise,
      data.code_caisse
    ]
  );

  return result[0];
}

export async function getAllCaisses(limit: number, offset: number) {
  const data = await query(
    `SELECT * FROM caisse
     WHERE is_activated = true
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const totalResult = await query(
    `SELECT COUNT(*) FROM caisse WHERE is_activated = true`
  );

  const total = Number(totalResult[0].count);

  return { data, total };
}

export async function getCaisseById(id: string) {
  const result = await query(
    `SELECT * FROM caisse 
     WHERE id = $1 AND is_activated = true
     LIMIT 1`,
    [id]
  );

  return result[0];
}

export async function updateCaisse(id: string, data: any) {
  const result = await query(
    `UPDATE caisse
     SET agence_id = $1,
         agent_id = $2,
         type = $3,
         devise = $4,
         code_caisse = $5,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6 AND is_activated = true
     RETURNING *`,
    [
      data.agence_id,
      data.agent_id,
      data.type,
      data.devise,
      data.code_caisse,
      id
    ]
  );

  return result[0];
}

export async function updateCaisseState(id: string, state: string) {
  const result = await query(
    `UPDATE caisse
     SET state = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 AND is_activated = true
     RETURNING *`,
    [state, id]
  );

  return result[0];
}

export async function softDeleteCaisse(id: string) {
  const result = await query(
    `UPDATE caisse
     SET is_activated = false,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result[0];
}