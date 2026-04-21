import { query } from '../database/db.js';
import type { PoolClient } from 'pg';

// ✅ version simple (optionnelle)
export async function createTransfertClient(data: any) {
  const result = await query(
    `INSERT INTO transfert_client
    (agence_exp, agence_dest, client_exp, client_dest,
     type_piece, numero_piece,
     montant, frais, commission, devise,
     code_secret_hash, code_reference, created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *`,
    [
      data.agence_exp,
      data.agence_dest,
      data.client_exp,
      data.client_dest,
      data.type_piece,
      data.numero_piece,
      data.montant,
      data.frais,
      data.commission,
      data.devise,
      data.code_secret_hash,
      data.code_reference,
      data.created_by
    ]
  );

  return result[0];
}

// 🔥 version transaction (IMPORTANT)
export async function createTransfertClientTx(client: PoolClient, data: any) {
  const result = await client.query(
    `INSERT INTO transfert_client
    (agence_exp, agence_dest, client_exp, client_dest,
     type_piece, numero_piece,
     montant, frais, commission, devise,
     code_secret_hash, code_reference, created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *`,
    [
      data.agence_exp,
      data.agence_dest,
      data.client_exp,
      data.client_dest,
      data.type_piece,
      data.numero_piece,
      data.montant,
      data.frais,
      data.commission,
      data.devise,
      data.code_secret_hash,
      data.code_reference,
      data.created_by
    ]
  );

  return result.rows[0];
}

// 🔍 GET BY AGENCE
export async function getTransfertsClientByAgence(
  agence_id: string,
  limit: number,
  offset: number
) {
  const data = await query(
    `SELECT *
     FROM transfert_client
     WHERE agence_exp = $1 OR agence_dest = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [agence_id, limit, offset]
  );

  const totalRes = await query(
    `SELECT COUNT(*)
     FROM transfert_client
     WHERE agence_exp = $1 OR agence_dest = $1`,
    [agence_id]
  );

  return {
    data,
    total: Number(totalRes[0].count)
  };
}

// 🔍 GET BY AGENT
export async function getTransfertsClientByAgent(
  user_id: string,
  limit: number,
  offset: number
) {
  const data = await query(
    `SELECT *
     FROM transfert_client
     WHERE created_by = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [user_id, limit, offset]
  );

  const totalRes = await query(
    `SELECT COUNT(*)
     FROM transfert_client
     WHERE created_by = $1`,
    [user_id]
  );

  return {
    data,
    total: Number(totalRes[0].count)
  };
}

// 🔥 VERSION SÉCURISÉE
export async function getTransfertsClientToValidate(
  agence_id: string,
  limit: number,
  offset: number
) {
  const data = await query(
    `SELECT *
     FROM transfert_client
     WHERE statut = 'INITIE'
       AND agence_exp = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [agence_id, limit, offset]
  );

  const totalRes = await query(
    `SELECT COUNT(*)
     FROM transfert_client
     WHERE statut = 'INITIE'
       AND agence_exp = $1`,
    [agence_id]
  );

  return {
    data,
    total: Number(totalRes[0].count)
  };
}

// 🔥 TRANSFERTS DISPONIBLES POUR RETRAIT
export async function getTransfertsClientToWithdraw(
  agence_id: string,
  limit: number,
  offset: number
) {
  const data = await query(
    `SELECT *
     FROM transfert_client
     WHERE statut = 'VALIDE'
       AND agence_dest = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [agence_id, limit, offset]
  );

  const totalRes = await query(
    `SELECT COUNT(*)
     FROM transfert_client
     WHERE statut = 'VALIDE'
       AND agence_dest = $1`,
    [agence_id]
  );

  return {
    data,
    total: Number(totalRes[0].count)
  };
}

export async function findTransfertByReference(code: string) {
  const res = await query(
    `SELECT * FROM transfert_client WHERE code_reference = $1`,
    [code]
  );

  return res[0];
}

export async function updateTransfertStatus(id: string, status: string) {
  const res = await query(
    `UPDATE transfert_client SET statut = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );

  return res[0];
}