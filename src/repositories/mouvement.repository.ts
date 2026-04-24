import { query } from '../database/db.js';

/**
 * =========================================
 * 🔥 HELPER FILTRES DYNAMIQUES
 * =========================================
 */
function buildMouvementFilters(
  filters: {
    type_mouvement?: string;
    devise?: string;
    statut?: string;
    date_operation?: string;
  },
  startIndex: number = 1,
  alias: string = ''
) {
  let where = '';
  const values: any[] = [];
  let index = startIndex;

  const prefix = alias ? `${alias}.` : '';

  // 🔹 type_mouvement
  if (filters.type_mouvement) {
    where += ` AND ${prefix}type_mouvement = $${index}`;
    values.push(filters.type_mouvement);
    index++;
  }

  // 🔹 devise
  if (filters.devise) {
    where += ` AND ${prefix}devise = $${index}`;
    values.push(filters.devise);
    index++;
  }

  // 🔹 statut
  if (filters.statut) {
    where += ` AND ${prefix}statut = $${index}`;
    values.push(filters.statut);
    index++;
  }

  // 🔹 date_operation
  if (filters.date_operation) {
    where += ` AND DATE(${prefix}date_operation) = $${index}`;
    values.push(filters.date_operation);
    index++;
  }

  return {
    where,
    values,
    nextIndex: index
  };
}

/**
 * =========================================
 * CREATE
 * =========================================
 */
export async function createMouvement(data: any) {
  const result = await query(
    `
    INSERT INTO mouvement_caisse
    (
      caisse_id,
      type_mouvement,
      montant,
      devise,
      statut,
      reference_type,
      code_reference,
      created_by,
      date_operation
    )
    VALUES (
      $1,$2,$3,$4,'EXECUTE',$5,$6,$7,$8
    )
    RETURNING *
    `,
    [
      data.caisse_id,
      data.type_mouvement,
      data.montant,
      data.devise,
      data.reference_type,
      data.code_reference,
      data.created_by,
      data.date_operation || new Date()
    ]
  );

  return result[0];
}

/**
 * =========================================
 * 🔹 GET ALL PAGINATED (ADMIN)
 * =========================================
 */
export async function getAllMouvementsPaginated(
  page = 1,
  limit = 10,
  filters: {
    type_mouvement?: string;
    devise?: string;
    statut?: string;
    date_operation?: string;
  }
) {
  const offset = (page - 1) * limit;

  const { where, values, nextIndex } =
    buildMouvementFilters(filters, 1, 'm');

  const data = await query(
    `
    SELECT m.*, c.agence_id
    FROM mouvement_caisse m
    JOIN caisse c ON c.id = m.caisse_id
    WHERE 1=1
    ${where}
    ORDER BY m.date_operation DESC
    LIMIT $${nextIndex} OFFSET $${nextIndex + 1}
    `,
    [
      ...values,
      limit,
      offset
    ]
  );

  const countRes = await query(
    `
    SELECT COUNT(*)
    FROM mouvement_caisse m
    JOIN caisse c ON c.id = m.caisse_id
    WHERE 1=1
    ${where}
    `,
    [...values]
  );

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

/**
 * =========================================
 * 🔹 GET BY AGENCE
 * =========================================
 */
export async function getMouvementsByAgence(
  agence_id: string,
  limit: number,
  offset: number,
  filters: {
    type_mouvement?: string;
    devise?: string;
    statut?: string;
    date_operation?: string;
  }
) {
  const { where, values, nextIndex } =
    buildMouvementFilters(filters, 2, 'm');

  const data = await query(
    `
    SELECT m.*, c.agence_id
    FROM mouvement_caisse m
    JOIN caisse c ON c.id = m.caisse_id
    WHERE c.agence_id = $1
    ${where}
    ORDER BY m.date_operation DESC
    LIMIT $${nextIndex} OFFSET $${nextIndex + 1}
    `,
    [
      agence_id,
      ...values,
      limit,
      offset
    ]
  );

  const countRes = await query(
    `
    SELECT COUNT(*)
    FROM mouvement_caisse m
    JOIN caisse c ON c.id = m.caisse_id
    WHERE c.agence_id = $1
    ${where}
    `,
    [
      agence_id,
      ...values
    ]
  );

  return {
    data,
    total: Number(countRes[0].count)
  };
}

/**
 * =========================================
 * UPDATE SOLDE
 * =========================================
 */
export async function updateCaisseSolde(
  id: string,
  montant: number
) {
  await query(
    `
    UPDATE caisse
    SET solde = solde + $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    `,
    [montant, id]
  );
}