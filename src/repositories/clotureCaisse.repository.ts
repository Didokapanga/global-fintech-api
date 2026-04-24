import type { PoolClient } from 'pg';
import { db } from '../database/connection.js';

/**
 * =========================================
 * 🔍 RÉCUPÉRER CAISSE + LOCK
 * =========================================
 */
export async function findCaisseForUpdate(
  client: PoolClient,
  id: string
) {
  const res = await client.query(
    `
    SELECT *
    FROM caisse
    WHERE id = $1
    FOR UPDATE
    `,
    [id]
  );

  return res.rows[0];
}

/**
 * =========================================
 * 🔍 RÉCUPÉRER CLÔTURE + LOCK
 * =========================================
 */
export async function findClotureForUpdate(
  client: PoolClient,
  id: string
) {
  const res = await client.query(
    `
    SELECT
      cc.*,
      c.agence_id
    FROM cloture_caisse cc
    JOIN caisse c
      ON c.id = cc.caisse_id
    WHERE cc.id = $1
    FOR UPDATE
    `,
    [id]
  );

  return res.rows[0];
}

/**
 * =========================================
 * 💾 CRÉER CLÔTURE
 * =========================================
 */
export async function createCloture(
  client: PoolClient,
  data: any
) {
  const res = await client.query(
    `
    INSERT INTO cloture_caisse
    (
      code_reference,
      caisse_id,

      solde_systeme,
      solde_physique,
      ecart,
      devise,

      motif_ecart,
      observation,

      date_operation,

      statut,

      created_by
    )
    VALUES
    (
      $1,$2,
      $3,$4,$5,$6,
      $7,$8,
      $9,
      $10,
      $11
    )
    RETURNING *
    `,
    [
      data.code_reference,
      data.caisse_id,

      data.solde_systeme,
      data.solde_physique,
      data.ecart,
      data.devise,

      data.motif_ecart,
      data.observation,

      data.date_operation,

      data.statut,

      data.created_by
    ]
  );

  return res.rows[0];
}

/**
 * =========================================
 * 🔍 LISTE DES CLÔTURES À VALIDER
 *
 * 🔥 uniquement :
 * - statut INITIE
 * - agence du validateur
 *
 * ADMIN → tout voir
 * N+1 / N+2 → uniquement son agence
 * =========================================
 */
export async function getCloturesToValidate(
  user: any,
  limit: number,
  offset: number
) {
  /**
   * ==========================
   * ADMIN → accès global
   * ==========================
   */
  if (user.role_name === 'ADMIN') {
    const dataRes = await db.query(
      `
      SELECT
        cc.*,
        c.agence_id,
        c.code_caisse,
        c.devise AS caisse_devise
      FROM cloture_caisse cc
      JOIN caisse c
        ON c.id = cc.caisse_id
      WHERE cc.statut = 'INITIE'
      ORDER BY cc.created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    const countRes = await db.query(
      `
      SELECT COUNT(*)
      FROM cloture_caisse
      WHERE statut = 'INITIE'
      `
    );

    return {
      data: dataRes.rows,
      total: Number(countRes.rows[0].count)
    };
  }

  /**
   * ==========================
   * N+1 / N+2 → agence obligatoire
   * ==========================
   */
  if (!user.agence_id) {
    throw new Error(
      'Agence utilisateur manquante'
    );
  }

  const dataRes = await db.query(
    `
    SELECT
      cc.*,
      c.agence_id,
      c.code_caisse,
      c.devise AS caisse_devise
    FROM cloture_caisse cc
    JOIN caisse c
      ON c.id = cc.caisse_id
    WHERE
      cc.statut = 'INITIE'
      AND c.agence_id = $1
    ORDER BY cc.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [
      user.agence_id,
      limit,
      offset
    ]
  );

  const countRes = await db.query(
    `
    SELECT COUNT(*)
    FROM cloture_caisse cc
    JOIN caisse c
      ON c.id = cc.caisse_id
    WHERE
      cc.statut = 'INITIE'
      AND c.agence_id = $1
    `,
    [user.agence_id]
  );

  return {
    data: dataRes.rows,
    total: Number(countRes.rows[0].count)
  };
}

/**
 * =========================================
 * 🔒 FERMER CAISSE
 * + remettre solde à zéro
 * =========================================
 */
export async function closeAndResetCaisse(
  client: PoolClient,
  id: string
) {
  await client.query(
    `
    UPDATE caisse
    SET
      state = 'FERMEE',
      solde = 0,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    `,
    [id]
  );
}

/**
 * =========================================
 * 🔄 UPDATE STATUT CLÔTURE
 * =========================================
 */
export async function updateClotureStatus(
  client: PoolClient,
  id: string,
  status: string,
  validated_by: string
) {
  const res = await client.query(
    `
    UPDATE cloture_caisse
    SET
      statut = $1,
      validated_by = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
    `,
    [
      status,
      validated_by,
      id
    ]
  );

  return res.rows[0];
}