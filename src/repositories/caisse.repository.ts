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
    `SELECT 
      c.*,

      a.libelle as agence_name,
      a.code_agence,
      a.ville,

      u.user_name as agent_name

     FROM caisse c
     LEFT JOIN agence a ON c.agence_id = a.id
     LEFT JOIN "user" u ON c.agent_id = u.id

     WHERE c.is_activated = true
     ORDER BY c.created_at DESC
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
    `SELECT 
      c.*,

      a.libelle as agence_name,
      a.code_agence,
      a.ville,

      u.user_name as agent_name

     FROM caisse c
     LEFT JOIN agence a ON c.agence_id = a.id
     LEFT JOIN "user" u ON c.agent_id = u.id

     WHERE c.id = $1 AND c.is_activated = true
     LIMIT 1`,
    [id]
  );

  return result[0];
}

export async function getCaissesByAgence(agence_id: string) {
  return await query(
    `SELECT 
      c.*,

      a.libelle as agence_name,
      u.user_name as agent_name

     FROM caisse c
     LEFT JOIN agence a ON c.agence_id = a.id
     LEFT JOIN "user" u ON c.agent_id = u.id

     WHERE c.agence_id = $1
     AND c.is_activated = true
     ORDER BY c.created_at DESC`,
    [agence_id]
  );
}

export async function updateCaisse(id: string, data: any) {
  const fields: string[] = [];
  const values: any[] = [];
  
  let index = 1;

  if (data.agence_id !== undefined) {
    fields.push(`agence_id = $${index++}`);
    values.push(data.agence_id);
  }

  if (data.agent_id !== undefined) {
    fields.push(`agent_id = $${index++}`);
    values.push(data.agent_id);
  }

  if (data.type !== undefined) {
    fields.push(`type = $${index++}`);
    values.push(data.type);
  }

  if (data.devise !== undefined) {
    fields.push(`devise = $${index++}`);
    values.push(data.devise);
  }

  if (data.code_caisse !== undefined) {
    fields.push(`code_caisse = $${index++}`);
    values.push(data.code_caisse);
  }

  // ⚠️ aucun champ envoyé
  if (fields.length === 0) {
    throw new Error('Aucune donnée à mettre à jour');
  }

  // 🔥 toujours mettre à jour timestamp
  fields.push(`updated_at = CURRENT_TIMESTAMP`);

  const queryText = `
    UPDATE caisse
    SET ${fields.join(', ')}
    WHERE id = $${index} AND is_activated = true
    RETURNING *
  `;

  values.push(id);

  const result = await query(queryText, values);

  if (!result[0]) {
    throw new Error('Caisse introuvable ou désactivée');
  }

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