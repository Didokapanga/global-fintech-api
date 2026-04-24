import {
  createCaisse,
  getAllCaisses,
  getCaisseById,
  getCaissesByAgence,
  getCaissesByAgencePaginated,
  getCaissesByAgent,
  softDeleteCaisse,
  updateCaisse,
  updateCaisseState
} from '../repositories/caisse.repository.js';
import { logAudit } from '../utils/auditLogger.js';

export async function createCaisseService(data: any) {
  if (!data.agence_id || !data.type || !data.devise || !data.code_caisse) {
    throw new Error('Missing required fields');
  }

  return await createCaisse(data);
}

export async function getCaissesService(
  user: any,
  page: number,
  limit: number,
  offset: number
) {
  // const role = user.role_name;
  const role = user.role_name?.toUpperCase();
  const userId = user.id;
  const agenceId = user.agence_id;

  // 🔴 ADMIN → toutes les caisses
  if (role === 'ADMIN') {
    return await getAllCaisses(limit, offset);
  }

  // 🟡 N+1 / N+2 → caisses de l’agence
  if (role === 'N+1' || role === 'N+2') {
    return await getCaissesByAgencePaginated(agenceId, limit, offset);
  }

  // 🟢 CAISSIER → sa caisse uniquement
  if (role === 'CAISSIER') {
    const data = await getCaissesByAgent(userId);

    return {
      data,
      total: data.length
    };
  }
  console.log('USER:', user);

  throw new Error('Accès refusé');
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

export async function openCaisseService(id: string, user: any, meta?: any) {
  const caisse = await getCaisseById(id);

  if (!caisse) {
    throw new Error('Caisse not found');
  }

  if (
    caisse.agent_id !== user.id &&
    user.role_name?.toUpperCase() !== 'ADMIN'
  ) {
    throw new Error('Vous ne pouvez pas ouvrir cette caisse');
  }

  if (caisse.state === 'OUVERTE') {
    throw new Error('Caisse déjà ouverte');
  }

  if (caisse.state === 'CLOTUREE') {
    throw new Error('Caisse clôturée');
  }

  const oldState = caisse.state;

  const updated = await updateCaisseState(id, 'OUVERTE');

  // 🔐 AUDIT
  await logAudit({
    user_id: user.id,
    action: 'OPEN',
    table_name: 'caisse',
    code_reference: id,
    old_data: { state: oldState },
    new_data: { state: 'OUVERTE' },
    ip_address: meta?.ip,
    user_agent: meta?.user_agent
  });

  return updated;
}

export async function closeCaisseService(id: string, user: any, meta?: any) {
  const caisse = await getCaisseById(id);

  if (!caisse) {
    throw new Error('Caisse not found');
  }

  if (
    caisse.agent_id !== user.id &&
    user.role_name?.toUpperCase() !== 'ADMIN'
  ) {
    throw new Error('Vous ne pouvez pas fermer cette caisse');
  }

  if (caisse.state === 'FERMEE') {
    throw new Error('Caisse déjà fermée');
  }

  if (caisse.state === 'CLOTUREE') {
    throw new Error('Caisse clôturée');
  }

  const oldState = caisse.state;

  const updated = await updateCaisseState(id, 'FERMEE');

  await logAudit({
    user_id: user.id,
    action: 'CLOSE',
    table_name: 'caisse',
    code_reference: id,
    old_data: { state: oldState },
    new_data: { state: 'FERMEE' },
    ip_address: meta?.ip,
    user_agent: meta?.user_agent
  });

  return updated;
}

export async function updateCaisseService(id: string, data: any, user: any, meta?: any) {
  const oldCaisse = await getCaisseById(id);

  if (!oldCaisse) {
    throw new Error('Caisse not found');
  }

  const updated = await updateCaisse(id, data);

  if (!updated) {
    throw new Error('Caisse not found or inactive');
  }

  await logAudit({
    user_id: user.id,
    action: 'UPDATE',
    table_name: 'caisse',
    code_reference: id,
    old_data: oldCaisse,
    new_data: updated,
    ip_address: meta?.ip,
    user_agent: meta?.user_agent
  });

  return updated;
}

export async function deleteCaisseService(id: string, user: any, meta?: any) {
  const caisse = await getCaisseById(id);

  if (!caisse) {
    throw new Error('Caisse not found');
  }

  const deleted = await softDeleteCaisse(id);

  if (!deleted) {
    throw new Error('Caisse not found');
  }

  await logAudit({
    user_id: user.id,
    action: 'DELETE',
    table_name: 'caisse',
    code_reference: id,
    old_data: caisse,
    new_data: { is_active: false },
    ip_address: meta?.ip,
    user_agent: meta?.user_agent
  });

  return { message: 'Caisse désactivée avec succès' };
}