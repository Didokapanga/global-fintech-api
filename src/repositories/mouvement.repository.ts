import { query } from '../database/db.js';

export async function createMouvement(data: any) {
  const result = await query(
    `INSERT INTO mouvement_caisse
    (caisse_id, type_mouvement, montant, devise, statut, reference_type, code_reference, created_by, date_operation)
    VALUES ($1,$2,$3,$4,'EXECUTE',$5,$6,$7,NOW())
    RETURNING *`,
    [
      data.caisse_id,
      data.type_mouvement,
      data.montant,
      data.devise,
      data.reference_type,
      data.code_reference,
      data.created_by
    ]
  );

  return result[0];
}

export async function updateCaisseSolde(id: string, montant: number) {
  await query(
    `UPDATE caisse
     SET solde = solde + $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [montant, id]
  );
}