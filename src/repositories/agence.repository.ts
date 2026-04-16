import { query } from '../database/db.js';

export async function getAllAgences() {
  return await query(`SELECT * FROM agence ORDER BY created_at DESC`);
}

export async function getAgenceById(id: string) {
  const result = await query(
    `SELECT * FROM agence WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result[0];
}

export async function createAgence(data: any) {
  const result = await query(
    `INSERT INTO agence 
    (libelle, code_agence, ville, commune, quartier)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *`,
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