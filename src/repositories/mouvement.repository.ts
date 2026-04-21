import { query } from '../database/db.js';

export async function createMouvement(data: any) {
  const result = await query(
    `INSERT INTO mouvement_caisse
    (caisse_id, type_mouvement, montant, devise, statut, reference_type, code_reference, created_by, date_operation)
    VALUES ($1,$2,$3,$4,'EXECUTE',$5,$6,$7,NOW())
    RETURNING *`,
    [
      data.caisse_id,
      data.type_mouvement,
      data.montant,
      data.devise,
      data.reference_type,
      data.code_reference,
      data.created_by
    ]
  );

  return result[0];
}

// 🔹 GET ALL PAGINATED (ADMIN)
export async function getAllMouvementsPaginated(page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  const data = await query(
    `
    SELECT m.*, c.agence_id
    FROM mouvement_caisse m
    JOIN caisse c ON c.id = m.caisse_id
    ORDER BY m.date_operation DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  const countRes = await query(`SELECT COUNT(*) FROM mouvement_caisse`);
  const total = parseInt(countRes[0].count, 10);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

// 🔹 GET BY AGENCE
// 🔥 FIXED VERSION
export async function getMouvementsByAgence(
  agence_id: string,
  limit: number,
  offset: number
) {
  const data = await query(
    `
    SELECT m.*, c.agence_id
    FROM mouvement_caisse m
    JOIN caisse c ON c.id = m.caisse_id
    WHERE c.agence_id = $1
    ORDER BY m.date_operation DESC
    LIMIT $2 OFFSET $3
    `,
    [agence_id, limit, offset]
  );

  const countRes = await query(
    `
    SELECT COUNT(*)
    FROM mouvement_caisse m
    JOIN caisse c ON c.id = m.caisse_id
    WHERE c.agence_id = $1
    `,
    [agence_id]
  );

  return {
    data,
    total: Number(countRes[0].count)
  };
}

export async function updateCaisseSolde(id: string, montant: number) {
  await query(
    `UPDATE caisse
     SET solde = solde + $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [montant, id]
  );
}