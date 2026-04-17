import {
  getAllAgences,
  getAgenceById,
  createAgence,
  softDeleteAgence,
  updateAgence
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

export async function createAgenceService(data: any) {
  if (!data.libelle || !data.code_agence || !data.ville) {
    throw new Error('Missing required fields');
  }

  return await createAgence(data);
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