import { query } from '../database/db.js';

// 🔍 GET ALL (paginated)
export async function getAllTransferts(limit: number, offset: number) {
  const data = await query(
    `SELECT *
     FROM transfert_caisse
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const totalRes = await query(
    `SELECT COUNT(*) FROM transfert_caisse`
  );

  return {
    data,
    total: Number(totalRes[0].count)
  };
}

// 🔍 GET BY AGENCE
export async function getTransfertsByAgence(
  agence_id: string,
  limit: number,
  offset: number
) {
  const data = await query(
    `SELECT t.*
     FROM transfert_caisse t
     JOIN caisse c ON t.caisse_source_id = c.id
     WHERE c.agence_id = $1
     ORDER BY t.created_at DESC
     LIMIT $2 OFFSET $3`,
    [agence_id, limit, offset]
  );

  const totalRes = await query(
    `SELECT COUNT(*)
     FROM transfert_caisse t
     JOIN caisse c ON t.caisse_source_id = c.id
     WHERE c.agence_id = $1`,
    [agence_id]
  );

  return {
    data,
    total: Number(totalRes[0].count)
  };
}

// 🔍 GET BY AGENT (ME)
export async function getTransfertsByAgent(
  user_id: string,
  limit: number,
  offset: number
) {
  const data = await query(
    `SELECT *
     FROM transfert_caisse
     WHERE created_by = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [user_id, limit, offset]
  );

  const totalRes = await query(
    `SELECT COUNT(*)
     FROM transfert_caisse
     WHERE created_by = $1`,
    [user_id]
  );

  return {
    data,
    total: Number(totalRes[0].count)
  };
}

// 🔥 GET TRANSFERTS À VALIDER / EXECUTER
export async function getTransfertsCaisseToProcess(
  agence_id: string,
  limit: number,
  offset: number
) {
 const data = await query(
  `
  SELECT t.*
  FROM transfert_caisse t
  JOIN caisse cs ON t.caisse_source_id = cs.id
  JOIN caisse cd ON t.caisse_destination_id = cd.id
  WHERE (cs.agence_id = $1 OR cd.agence_id = $1)
    AND t.statut IN ('INITIE', 'VALIDE')
  ORDER BY t.created_at DESC
  LIMIT $2 OFFSET $3
  `,
  [agence_id, limit, offset]
);
  const totalRes = await query(
  `
  SELECT COUNT(*)
  FROM transfert_caisse t
  JOIN caisse cs ON t.caisse_source_id = cs.id
  JOIN caisse cd ON t.caisse_destination_id = cd.id
  WHERE (cs.agence_id = $1 OR cd.agence_id = $1)
    AND t.statut IN ('INITIE', 'VALIDE')
  `,
  [agence_id]
);

  return {
    data,
    total: Number(totalRes[0].count)
  };
}