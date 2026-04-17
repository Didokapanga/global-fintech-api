import { query } from '../database/db.js';

export async function createLedgerEntry(data: any) {
  const result = await query(
    `INSERT INTO ledger
    (type_operation, montant, devise, sens, caisse_id, reference_id, reference_type)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *`,
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

  return result[0];
}