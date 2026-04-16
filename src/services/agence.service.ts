import {
  getAllAgences,
  getAgenceById,
  createAgence
} from '../repositories/agence.repository.js';

export async function getAgencesService() {
  return await getAllAgences();
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