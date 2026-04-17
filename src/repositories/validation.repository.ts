import { query } from '../database/db.js';

export async function createValidationLog(data: any) {
  const res = await query(
    `INSERT INTO validation_log
    (operation_type, reference_id, validated_by, niveau,
     decision, commentaire, statut_avant, statut_apres)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *`,
    [
      data.operation_type,
      data.reference_id,
      data.validated_by,
      data.niveau,
      data.decision,
      data.commentaire,
      data.statut_avant,
      data.statut_apres
    ]
  );

  return res[0];
}