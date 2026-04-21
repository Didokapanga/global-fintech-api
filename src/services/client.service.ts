import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
} from '../repositories/client.repository.js';

export async function createClientService(data: any) {
  if (!data.name || !data.phone) {
    throw new Error('Name and phone are required');
  }

  return await createClient(data);
}

export async function getClientsService(
  page = 1,
  limit = 10,
  search?: string
) {
  const offset = (page - 1) * limit;

  return await getClients(limit, offset, search);
}

export async function getClientService(id: string) {
  const client = await getClientById(id);

  if (!client) {
    throw new Error('Client not found');
  }

  return client;
}

export async function updateClientService(id: string, data: any) {
  const client = await updateClient(id, data);

  if (!client) {
    throw new Error('Client not found');
  }

  return client;
}

export async function deleteClientService(id: string) {
  const client = await deleteClient(id);

  if (!client) {
    throw new Error('Client not found');
  }

  return { message: 'Client deleted successfully' };
}