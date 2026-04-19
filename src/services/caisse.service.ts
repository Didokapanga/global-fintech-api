import {
  createCaisse,
  getAllCaisses,
  getCaisseById,
  getCaissesByAgence,
  softDeleteCaisse,
  updateCaisse,
  updateCaisseState
} from '../repositories/caisse.repository.js';

export async function createCaisseService(data: any) {
  if (!data.agence_id || !data.type || !data.devise || !data.code_caisse) {
    throw new Error('Missing required fields');
  }

  return await createCaisse(data);
}

export async function getCaissesService(
  page: number,
  limit: number,
  offset: number
) {
  return await getAllCaisses(limit, offset);
}

export async function getCaisseService(id: string) {
  const caisse = await getCaisseById(id);

  if (!caisse) {
    throw new Error('Caisse not found');
  }

  return caisse;
}

export async function getCaissesByAgenceService(agence_id: string) {
  if (!agence_id) {
    throw new Error('Agence id requis');
  }

  return await getCaissesByAgence(agence_id);
}

export async function openCaisseService(id: string) {
  const caisse = await getCaisseById(id);

  if (!caisse) {
    throw new Error('Caisse not found');
  }

  if (caisse.state === 'OUVERTE') {
    throw new Error('Caisse déjà ouverte');
  }

  if (caisse.state === 'CLOTUREE') {
    throw new Error('Caisse clôturée');
  }

  const updated = await updateCaisseState(id, 'OUVERTE');

  return updated;
}

export async function closeCaisseService(id: string) {
  const caisse = await getCaisseById(id);

  if (!caisse) {
    throw new Error('Caisse not found');
  }

  if (caisse.state === 'FERMEE') {
    throw new Error('Caisse déjà fermée');
  }

  if (caisse.state === 'CLOTUREE') {
    throw new Error('Caisse clôturée');
  }

  const updated = await updateCaisseState(id, 'FERMEE');

  return updated;
}

export async function updateCaisseService(id: string, data: any) {
  if (!data.agence_id || !data.type || !data.devise || !data.code_caisse) {
    throw new Error('Missing required fields');
  }

  const caisse = await updateCaisse(id, data);

  if (!caisse) {
    throw new Error('Caisse not found or inactive');
  }

  return caisse;
}

export async function deleteCaisseService(id: string) {
  const caisse = await softDeleteCaisse(id);

  if (!caisse) {
    throw new Error('Caisse not found');
  }

  return { message: 'Caisse désactivée avec succès' };
}