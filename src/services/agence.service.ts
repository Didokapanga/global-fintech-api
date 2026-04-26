import {
  getAllAgences,
  getAgenceById,
  createAgence,
  softDeleteAgence,
  updateAgence,
  getLastAgenceCode
} from '../repositories/agence.repository.js';

export async function getAgencesService(
  page: number,
  limit: number,
  offset: number
) {
  return await getAllAgences(limit, offset); // ✅ correspond au repo
}

export async function getAgenceService(id: string) {
  const agence = await getAgenceById(id);

  if (!agence) {
    throw new Error('Agence not found');
  }

  return agence;
}

/**
 * =========================================
 * 🏢 CREATE AGENCE
 *
 * code_agence auto :
 * 100000
 * 101000
 * 102000
 * ...
 * =========================================
 */
export async function createAgenceService(data: any) {
  if (!data.libelle || !data.ville) {
    throw new Error(
      'libelle et ville sont requis'
    );
  }

  /**
   * ==========================
   * Génération code agence
   * ==========================
   */
  const lastAgence =
    await getLastAgenceCode();

  let nextCode = 100000;

  if (
    lastAgence &&
    lastAgence.code_agence
  ) {
    nextCode =
      Number(lastAgence.code_agence) + 1000;
  }

  /**
   * ==========================
   * Create
   * ==========================
   */
  return await createAgence({
    ...data,
    code_agence: String(nextCode)
  });
}

export async function updateAgenceService(id: string, data: any) {
  if (!data.libelle || !data.code_agence || !data.ville) {
    throw new Error('Missing required fields');
  }

  const agence = await updateAgence(id, data);

  if (!agence) {
    throw new Error('Agence not found or inactive');
  }

  return agence;
}

export async function deleteAgenceService(id: string) {
  const agence = await softDeleteAgence(id);

  if (!agence) {
    throw new Error('Agence not found');
  }

  return { message: 'Agence désactivée avec succès' };
}