import { query } from '../database/db.js';

export async function createTransfert(data: any) {
  const result = await query(
    `INSERT INTO transfert_caisse
    (caisse_source_id, caisse_destination_id, montant, devise, type, reference_code, created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *`,
    [
      data.caisse_source_id,
      data.caisse_destination_id,
      data.montant,
      data.devise,
      data.type,
      data.reference_code,
      data.created_by
    ]
  );

  return result[0];
}