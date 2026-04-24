import { db } from '../database/connection.js';
import { query } from '../database/db.js';

/**
 * =========================================
 * 🔥 HELPER FILTRES DYNAMIQUES
 * =========================================
 */
function buildTransfertFilters(
  filters: {
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

  // 🔹 filtre devise
  if (filters.devise) {
    where += ` AND ${prefix}devise = $${index}`;
    values.push(filters.devise);
    index++;
  }

  // 🔹 filtre statut
  if (filters.statut) {
    where += ` AND ${prefix}statut = $${index}`;
    values.push(filters.statut);
    index++;
  }

  // 🔹 filtre date_operation
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
 * 🔍 GET ALL (paginated + filters)
 * =========================================
 */
export async function getAllTransferts(
  limit: number,
  offset: number,
  filters: {
    devise?: string;
    statut?: string;
    date_operation?: string;
  }
) {
  const { where, values, nextIndex } =
    buildTransfertFilters(filters, 1);

  const data = await query(
    `
    SELECT *
    FROM transfert_caisse
    WHERE 1=1
    ${where}
    ORDER BY created_at DESC
    LIMIT $${nextIndex} OFFSET $${nextIndex + 1}
    `,
    [
      ...values,
      limit,
      offset
    ]
  );

  const totalRes = await query(
    `
    SELECT COUNT(*)
    FROM transfert_caisse
    WHERE 1=1
    ${where}
    `,
    [...values]
  );

  return {
    data,
    total: Number(totalRes[0].count)
  };
}

/**
 * =========================================
 * 🔍 GET BY AGENCE
 * =========================================
 */
export async function getTransfertsByAgence(
  agence_id: string,
  limit: number,
  offset: number,
  filters: {
    devise?: string;
    statut?: string;
    date_operation?: string;
  }
) {
  const { where, values, nextIndex } =
    buildTransfertFilters(filters, 2, 't');

  const data = await query(
    `
    SELECT t.*
    FROM transfert_caisse t
    JOIN caisse c ON t.caisse_source_id = c.id
    WHERE c.agence_id = $1
    ${where}
    ORDER BY t.created_at DESC
    LIMIT $${nextIndex} OFFSET $${nextIndex + 1}
    `,
    [
      agence_id,
      ...values,
      limit,
      offset
    ]
  );

  const totalRes = await query(
    `
    SELECT COUNT(*)
    FROM transfert_caisse t
    JOIN caisse c ON t.caisse_source_id = c.id
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
    total: Number(totalRes[0].count)
  };
}

/**
 * =========================================
 * 🔍 GET BY AGENT (ME)
 * =========================================
 */
export async function getTransfertsByAgent(
  user_id: string,
  limit: number,
  offset: number,
  filters: {
    devise?: string;
    statut?: string;
    date_operation?: string;
  }
) {
  const { where, values, nextIndex } =
    buildTransfertFilters(filters, 2);

  const data = await query(
    `
    SELECT *
    FROM transfert_caisse
    WHERE created_by = $1
    ${where}
    ORDER BY created_at DESC
    LIMIT $${nextIndex} OFFSET $${nextIndex + 1}
    `,
    [
      user_id,
      ...values,
      limit,
      offset
    ]
  );

  const totalRes = await query(
    `
    SELECT COUNT(*)
    FROM transfert_caisse
    WHERE created_by = $1
    ${where}
    `,
    [
      user_id,
      ...values
    ]
  );

  return {
    data,
    total: Number(totalRes[0].count)
  };
}

/**
 * =========================================
 * 🔍 GET BY CAISSIER
 * =========================================
 */
export async function getTransfertsByCaissier(
  user_id: string,
  limit: number,
  offset: number,
  filters: {
    devise?: string;
    statut?: string;
    date_operation?: string;
  }
) {
  const { where, values, nextIndex } =
    buildTransfertFilters(filters, 2, 't');

  const res = await db.query(
    `
    SELECT t.*
    FROM transfert_caisse t
    JOIN caisse c1 ON t.caisse_source_id = c1.id
    JOIN caisse c2 ON t.caisse_destination_id = c2.id
    WHERE (
      c1.agent_id = $1
      OR c2.agent_id = $1
    )
    ${where}
    ORDER BY t.created_at DESC
    LIMIT $${nextIndex} OFFSET $${nextIndex + 1}
    `,
    [
      user_id,
      ...values,
      limit,
      offset
    ]
  );

  const countRes = await db.query(
    `
    SELECT COUNT(*)
    FROM transfert_caisse t
    JOIN caisse c1 ON t.caisse_source_id = c1.id
    JOIN caisse c2 ON t.caisse_destination_id = c2.id
    WHERE (
      c1.agent_id = $1
      OR c2.agent_id = $1
    )
    ${where}
    `,
    [
      user_id,
      ...values
    ]
  );

  return {
    data: res.rows,
    total: Number(countRes.rows[0].count)
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

export async function getAllTransfertsToProcess(
  limit: number,
  offset: number
) {
  const res = await db.query(
    `
    SELECT *
    FROM transfert_caisse
    WHERE statut IN ('INITIE', 'VALIDE')
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  const countRes = await db.query(
    `
    SELECT COUNT(*)
    FROM transfert_caisse
    WHERE statut IN ('INITIE', 'VALIDE')
    `
  );

  return {
    data: res.rows,
    total: Number(countRes.rows[0].count)
  };
}

export async function getTransfertsCaisseToProcessByCaisses(
  caisseIds: string[],
  limit: number,
  offset: number
) {
  const res = await db.query(
    `
    SELECT *
    FROM transfert_caisse
    WHERE statut IN ('INITIE', 'VALIDE')
      AND (
        caisse_source_id = ANY($1)
        OR caisse_destination_id = ANY($1)
      )
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [caisseIds, limit, offset]
  );

  const countRes = await db.query(
    `
    SELECT COUNT(*)
    FROM transfert_caisse
    WHERE statut IN ('INITIE', 'VALIDE')
      AND (
        caisse_source_id = ANY($1)
        OR caisse_destination_id = ANY($1)
      )
    `,
    [caisseIds]
  );

  return {
    data: res.rows,
    total: Number(countRes.rows[0].count)
  };
}