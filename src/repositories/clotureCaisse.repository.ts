import type { PoolClient } from 'pg';

// 🔍 récupérer caisse
export async function findCaisseForUpdate(client: PoolClient, id: string) {
  const res = await client.query(
    `SELECT * FROM caisse WHERE id = $1 FOR UPDATE`,
    [id]
  );

  return res.rows[0];
}

// 💾 créer cloture
export async function createCloture(client: PoolClient, data: any) {
  const res = await client.query(
    `INSERT INTO cloture_caisse
    (caisse_id, solde_systeme, solde_physique, ecart,
     devise, created_by)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *`,
    [
      data.caisse_id,
      data.solde_systeme,
      data.solde_physique,
      data.ecart,
      data.devise,
      data.created_by
    ]
  );

  return res.rows[0];
}

// 🔒 fermer caisse
export async function closeCaisse(client: PoolClient, id: string) {
  await client.query(
    `UPDATE caisse 
     SET state = 'FERMEE', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [id]
  );
}

export async function updateClotureStatus(
  client: PoolClient,
  id: string,
  status: string,
  validated_by: string
) {
  const res = await client.query(
    `UPDATE cloture_caisse
     SET statut = $1,
         validated_by = $2
     WHERE id = $3
     RETURNING *`,
    [status, validated_by, id]
  );

  return res.rows[0];
}