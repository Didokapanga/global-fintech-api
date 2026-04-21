import type { PoolClient } from 'pg';
import { db } from '../database/connection.js';

// 🔍 récupérer transfert
export async function findTransfertForUpdate(client: PoolClient, code_reference: string) {
  const res = await client.query(
    `SELECT * FROM transfert_client WHERE code_reference = $1 FOR UPDATE`,
    [code_reference]
  );

  return res.rows[0];
}

// 🔍 récupérer caisse
export async function findCaisseForUpdate(client: PoolClient, id: string) {
  const res = await client.query(
    `SELECT * FROM caisse WHERE id = $1 FOR UPDATE`,
    [id]
  );

  return res.rows[0];
}

export async function createRetrait(client: PoolClient, data: any) {
  const res = await client.query(
    `INSERT INTO retrait
    (agence_id, caisse_id, transfert_id,
     code_secret_hash, numero_piece,
     montant, devise, created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *`,
    [
      data.agence_id,
      data.caisse_id,
      data.transfert_id,
      data.code_secret_hash,
      data.numero_piece,
      data.montant,
      data.devise,
      data.created_by
    ]
  );

  return res.rows[0];
}

// 💰 crédit caisse
export async function creditCaisse(client: PoolClient, id: string, montant: number) {
  await client.query(
    `UPDATE caisse SET solde = solde + $1 WHERE id = $2`,
    [montant, id]
  );
}

// 🔄 update statut
export async function updateTransfertToExecuted(client: PoolClient, id: string) {
  await client.query(
    `UPDATE transfert_client 
     SET statut = 'EXECUTE', updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1`,
    [id]
  );
}

// 📊 ledger
export async function insertLedger(client: PoolClient, data: any) {
  await client.query(
    `INSERT INTO ledger
    (type_operation, montant, devise, sens, caisse_id, reference_id, reference_type)
    VALUES ($1,$2,$3,$4,$5,$6,$7)`,
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

// 🔍 historique retrait par agent
export async function getRetraitsByAgent(
  agent_id: string,
  limit: number,
  offset: number
) {
  const dataRes = await db.query(
    `SELECT *
     FROM retrait
     WHERE created_by = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [agent_id, limit, offset]
  );

  const countRes = await db.query(
    `SELECT COUNT(*) 
     FROM retrait 
     WHERE created_by = $1`,
    [agent_id]
  );

  return {
    data: dataRes.rows,
    total: Number(countRes.rows[0].count)
  };
}