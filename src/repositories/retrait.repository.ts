import type { PoolClient } from 'pg';
import { db } from '../database/connection.js';

/**
 * =========================================
 * 🔍 récupérer transfert
 * =========================================
 */
export async function findTransfertForUpdate(
  client: PoolClient,
  code_reference: string
) {
  const res = await client.query(
    `
    SELECT *
    FROM transfert_client
    WHERE code_reference = $1
    FOR UPDATE
    `,
    [code_reference]
  );

  return res.rows[0];
}

/**
 * =========================================
 * 🔍 récupérer caisse
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
 * 💾 CREATE RETRAIT
 * 🔥 date_operation envoyé depuis le body
 * =========================================
 */
export async function createRetrait(
  client: PoolClient,
  data: any
) {
  const res = await client.query(
    `
    INSERT INTO retrait
    (
      agence_id,
      caisse_id,
      transfert_id,
      code_secret_hash,
      numero_piece,
      montant,
      devise,
      statut,
      created_by,
      date_operation
    )
    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
    )
    RETURNING *
    `,
    [
      data.agence_id,
      data.caisse_id,
      data.transfert_id,
      data.code_secret_hash,
      data.numero_piece,
      data.montant,
      data.devise,
      data.statut || 'EXECUTE',
      data.created_by,
      data.date_operation
    ]
  );

  return res.rows[0];
}

/**
 * =========================================
 * 💰 crédit caisse
 * =========================================
 */
export async function creditCaisse(
  client: PoolClient,
  id: string,
  montant: number
) {
  await client.query(
    `
    UPDATE caisse
    SET solde = solde + $1
    WHERE id = $2
    `,
    [montant, id]
  );
}

/**
 * =========================================
 * 🔄 update statut transfert
 * =========================================
 */
export async function updateTransfertToExecuted(
  client: PoolClient,
  id: string
) {
  await client.query(
    `
    UPDATE transfert_client
    SET statut = 'EXECUTE',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    `,
    [id]
  );
}

/**
 * =========================================
 * 📊 ledger
 * =========================================
 */
export async function insertLedger(
  client: PoolClient,
  data: any
) {
  await client.query(
    `
    INSERT INTO ledger
    (
      type_operation,
      montant,
      devise,
      sens,
      caisse_id,
      reference_id,
      reference_type
    )
    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7
    )
    `,
    [
      data.type_operation,
      data.montant,
      data.devise,
      data.sens,
      data.caisse_id,
      data.reference_id,
      data.reference_type
    ]
  );
}

/**
 * =========================================
 * 🔍 historique retrait par agent
 * + filtres :
 * - statut
 * - date_operation
 * =========================================
 */
export async function getRetraitsByAgent(
  agent_id: string,
  limit: number,
  offset: number,
  filters: {
    statut?: string;
    date_operation?: string;
  }
) {
  let where = `WHERE r.created_by = $1`;
  const values: any[] = [agent_id];
  let index = 2;

  // 🔥 filtre statut
  if (filters.statut) {
    where += ` AND r.statut = $${index}`;
    values.push(filters.statut);
    index++;
  }

  // 🔥 filtre date_operation
  if (filters.date_operation) {
    where += ` AND DATE(r.date_operation) = $${index}`;
    values.push(filters.date_operation);
    index++;
  }

  const dataRes = await db.query(
    `
    SELECT
      r.*,

      -- 🔥 EXPEDITEUR STRUCTURÉ
      json_build_object(
        'nom', t.exp_nom,
        'postnom', t.exp_postnom,
        'prenom', t.exp_prenom,
        'phone', t.exp_phone
      ) AS expediteur,

      -- 🔥 DESTINATAIRE STRUCTURÉ
      json_build_object(
        'nom', t.dest_nom,
        'postnom', t.dest_postnom,
        'prenom', t.dest_prenom,
        'phone', t.dest_phone
      ) AS destinataire,

      t.code_reference,
      t.montant AS transfert_montant,
      t.devise AS transfert_devise

    FROM retrait r
    JOIN transfert_client t
      ON r.transfert_id = t.id

    ${where}

    ORDER BY r.date_operation DESC
    LIMIT $${index} OFFSET $${index + 1}
    `,
    [
      ...values,
      limit,
      offset
    ]
  );

  const countRes = await db.query(
    `
    SELECT COUNT(*)
    FROM retrait r
    ${where}
    `,
    [...values]
  );

  return {
    data: dataRes.rows,
    total: Number(countRes.rows[0].count)
  };
}