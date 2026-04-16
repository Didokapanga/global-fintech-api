import { getAllRoles, createRole } from '../repositories/role.repository.js';

export async function getRolesService() {
  return await getAllRoles();
}

export async function createRoleService(role_name: string) {
  if (!role_name) {
    throw new Error('Role name is required');
  }

  return await createRole(role_name);
}