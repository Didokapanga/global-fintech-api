import { query } from '../database/db.js';

export async function getAllAgences(limit: number, offset: number) {
  const data = await query(
    `SELECT * FROM agence
     WHERE is_activated = true
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const totalResult = await query(
    `SELECT COUNT(*) FROM agence WHERE is_activated = true`
  );

  const total = Number(totalResult[0].count);

  return { data, total }; // ✅ IMPORTANT
}

export async function getAgenceById(id: string) {
  const result = await query(
    `SELECT * FROM agence 
     WHERE id = $1 AND is_activated = true 
     LIMIT 1`,
    [id]
  );

  return result[0];
}

/**
 * =========================================
 * 🔍 Récupérer le dernier code agence
 * =========================================
 */
export async function getLastAgenceCode() {
  const result = await query(
    `
    SELECT code_agence
    FROM agence
    ORDER BY code_agence DESC
    LIMIT 1
    `
  );

  return result[0];
}

/**
 * =========================================
 * 💾 Créer agence
 * code_agence généré automatiquement
 * =========================================
 */
export async function createAgence(data: any) {
  const result = await query(
    `
    INSERT INTO agence
    (
      libelle,
      code_agence,
      ville,
      commune,
      quartier
    )
    VALUES
    (
      $1,$2,$3,$4,$5
    )
    RETURNING *
    `,
    [
      data.libelle,
      data.code_agence,
      data.ville,
      data.commune,
      data.quartier
    ]
  );

  return result[0];
}

// export async function createAgence(data: any) {
//   const result = await query(
//     `INSERT INTO agence 
//     (libelle, code_agence, ville, commune, quartier)
//     VALUES ($1,$2,$3,$4,$5)
//     RETURNING *`,
//     [
//       data.libelle,
//       data.code_agence,
//       data.ville,
//       data.commune,
//       data.quartier
//     ]
//   );

//   return result[0];
// }

export async function updateAgence(id: string, data: any) {
  const result = await query(
    `UPDATE agence
     SET libelle = $1,
         code_agence = $2,
         ville = $3,
         commune = $4,
         quartier = $5,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6 AND is_activated = true
     RETURNING *`,
    [
      data.libelle,
      data.code_agence,
      data.ville,
      data.commune,
      data.quartier,
      id
    ]
  );

  return result[0];
}

export async function softDeleteAgence(id: string) {
  const result = await query(
    `UPDATE agence 
     SET is_activated = false,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result[0];
}