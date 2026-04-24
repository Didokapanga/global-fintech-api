import { db } from '../database/connection.js';

// 🔍 ledger par caisse (sécurisé)
export async function getLedgerByCaisse(
  caisse_id: string,
  user: any,
  limit: number,
  offset: number,
  filters?: any // 🔥 ajout
) {
  const role = user.role_name?.toUpperCase();

  const caisseRes = await db.query(
    `SELECT * FROM caisse WHERE id = $1`,
    [caisse_id]
  );

  const caisse = caisseRes.rows[0];

  if (!caisse) {
    throw new Error('Caisse introuvable');
  }

  // 🔐 sécurité (inchangé)
  if (role !== 'ADMIN') {
    if (['N+1', 'N+2'].includes(role)) {
      if (caisse.agence_id !== user.agence_id) {
        throw new Error('Accès interdit à cette caisse');
      }
    }

    if (role === 'CAISSIER') {
      if (caisse.agent_id !== user.id) {
        throw new Error('Accès interdit à cette caisse');
      }
    }
  }

  // =====================================================
  // 🔥 CONSTRUCTION DYNAMIQUE DES FILTRES
  // =====================================================

  let conditions = [`caisse_id = $1`];
  let values: any[] = [caisse_id];
  let index = 2;

  if (filters?.type_operation) {
    conditions.push(`type_operation = $${index++}`);
    values.push(filters.type_operation);
  }

  if (filters?.sens) {
    conditions.push(`sens = $${index++}`);
    values.push(filters.sens);
  }

  if (filters?.date_from) {
    conditions.push(`created_at >= $${index++}`);
    values.push(filters.date_from);
  }

  if (filters?.date_to) {
    conditions.push(`created_at <= $${index++}`);
    values.push(filters.date_to);
  }

  const whereClause = conditions.join(' AND ');

  // =====================================================
  // 📊 DATA
  // =====================================================

  const dataRes = await db.query(
    `
    SELECT *
    FROM ledger
    WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${index++} OFFSET $${index}
    `,
    [...values, limit, offset]
  );

  const countRes = await db.query(
    `
    SELECT COUNT(*)
    FROM ledger
    WHERE ${whereClause}
    `,
    values
  );

  return {
    data: dataRes.rows,
    total: Number(countRes.rows[0].count)
  };
}


// 🔍 ledger pour utilisateur connecté
export async function getMyLedger(
  user: any,
  limit: number,
  offset: number
) {
  const role = user.role_name?.toUpperCase();

  // 🟢 CAISSIER → sa caisse uniquement
  if (role === 'CAISSIER') {
    const caisseRes = await db.query(
      `SELECT id FROM caisse WHERE agent_id = $1`,
      [user.id]
    );

    const caisse = caisseRes.rows[0];

    if (!caisse) {
      throw new Error('Aucune caisse associée');
    }

    return await getLedgerByCaisse(
      caisse.id,
      user,
      limit,
      offset
    );
  }

  // 🟡 N+1 / N+2 → toutes les caisses de l'agence
  if (['N+1', 'N+2'].includes(role)) {
    const dataRes = await db.query(
      `SELECT l.*
       FROM ledger l
       JOIN caisse c ON l.caisse_id = c.id
       WHERE c.agence_id = $1
       ORDER BY l.created_at DESC
       LIMIT $2 OFFSET $3`,
      [user.agence_id, limit, offset]
    );

    const countRes = await db.query(
      `SELECT COUNT(*)
       FROM ledger l
       JOIN caisse c ON l.caisse_id = c.id
       WHERE c.agence_id = $1`,
      [user.agence_id]
    );

    return {
      data: dataRes.rows,
      total: Number(countRes.rows[0].count)
    };
  }

  // 🔴 ADMIN → tout
  if (role === 'ADMIN') {
    const dataRes = await db.query(
      `SELECT *
       FROM ledger
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countRes = await db.query(
      `SELECT COUNT(*) FROM ledger`
    );

    return {
      data: dataRes.rows,
      total: Number(countRes.rows[0].count)
    };
  }

  throw new Error('Accès refusé');
}