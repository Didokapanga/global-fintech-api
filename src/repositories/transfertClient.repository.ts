import { query } from '../database/db.js';
import type { PoolClient } from 'pg';

/**
 * =========================================
 * 🔥 HELPER FILTRES
 * =========================================
 */
function buildTransfertClientFilters(
  filters: {
    statut?: string;
    date_operation?: string;
  },
  startIndex: number = 1
) {
  let where = '';
  const values: any[] = [];
  let index = startIndex;

  // 🔹 statut
  if (filters.statut) {
    where += ` AND statut = $${index}`;
    values.push(filters.statut);
    index++;
  }

  // 🔹 date_operation
  if (filters.date_operation) {
    where += ` AND DATE(date_operation) = $${index}`;
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
 * 🔥 date_operation envoyé depuis le body
 * =========================================
 */
export async function createTransfertClientTx(
  client: PoolClient,
  data: any
) {
  const result = await client.query(
    `
    INSERT INTO transfert_client
    (
      agence_exp,
      agence_dest,

      exp_nom,
      exp_postnom,
      exp_prenom,
      exp_phone,
      exp_type_piece,
      exp_numero_piece,

      dest_nom,
      dest_postnom,
      dest_prenom,
      dest_phone,
      dest_type_piece,
      dest_numero_piece,

      montant,
      frais,
      commission,
      devise,

      code_secret_hash,
      code_reference,
      created_by,
      statut,
      date_operation
    )
    VALUES
    (
      $1,$2,
      $3,$4,$5,$6,$7,$8,
      $9,$10,$11,$12,$13,$14,
      $15,$16,$17,$18,
      $19,$20,$21,$22,$23
    )
    RETURNING *
    `,
    [
      data.agence_exp,
      data.agence_dest,

      data.exp_nom,
      data.exp_postnom,
      data.exp_prenom,
      data.exp_phone,
      data.exp_type_piece,
      data.exp_numero_piece,

      data.dest_nom,
      data.dest_postnom,
      data.dest_prenom,
      data.dest_phone,
      data.dest_type_piece,
      data.dest_numero_piece,

      data.montant,
      data.frais,
      data.commission,
      data.devise,

      data.code_secret_hash,
      data.code_reference,
      data.created_by,
      data.statut,
      data.date_operation
    ]
  );

  return result.rows[0];
}

/**
 * =========================================
 * GET BY AGENCE
 * + filtres :
 * - statut
 * - date_operation
 * =========================================
 */
export async function getTransfertsClientByAgence(
  agence_id: string,
  limit: number,
  offset: number,
  filters: {
    statut?: string;
    date_operation?: string;
  }
) {
  const { where, values, nextIndex } =
    buildTransfertClientFilters(filters, 2);

  const data = await query(
    `
    SELECT *
    FROM transfert_client
    WHERE (agence_exp = $1 OR agence_dest = $1)
    ${where}
    ORDER BY date_operation DESC
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
    FROM transfert_client
    WHERE (agence_exp = $1 OR agence_dest = $1)
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
 * GET BY AGENT
 * + filtres :
 * - statut
 * - date_operation
 * =========================================
 */
export async function getTransfertsClientByAgent(
  user_id: string,
  limit: number,
  offset: number,
  filters: {
    statut?: string;
    date_operation?: string;
  }
) {
  const { where, values, nextIndex } =
    buildTransfertClientFilters(filters, 2);

  const data = await query(
    `
    SELECT *
    FROM transfert_client
    WHERE created_by = $1
    ${where}
    ORDER BY date_operation DESC
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
    FROM transfert_client
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
 * TO VALIDATE
 * + filtres :
 * - statut
 * - date_operation
 * =========================================
 */
export async function getTransfertsClientToValidate(
  agence_id: string,
  limit: number,
  offset: number,
  filters: {
    statut?: string;
    date_operation?: string;
  }
) {
  const { where, values, nextIndex } =
    buildTransfertClientFilters(filters, 2);

  const data = await query(
    `
    SELECT *
    FROM transfert_client
    WHERE agence_exp = $1
      AND statut = 'INITIE'
    ${where}
    ORDER BY date_operation DESC
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
    FROM transfert_client
    WHERE agence_exp = $1
      AND statut = 'INITIE'
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
 * TO WITHDRAW
 * + filtres :
 * - statut
 * - date_operation
 * =========================================
 */
export async function getTransfertsClientToWithdraw(
  agence_id: string,
  limit: number,
  offset: number,
  filters: {
    statut?: string;
    date_operation?: string;
  }
) {
  const { where, values, nextIndex } =
    buildTransfertClientFilters(filters, 2);

  const data = await query(
    `
    SELECT *
    FROM transfert_client
    WHERE agence_dest = $1
      AND statut = 'VALIDE'
    ${where}
    ORDER BY date_operation DESC
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
    FROM transfert_client
    WHERE agence_dest = $1
      AND statut = 'VALIDE'
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