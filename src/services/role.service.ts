import { getAllRoles, createRole, updateRole, softDeleteRole } from '../repositories/role.repository.js';

export async function getRolesService() {
  return await getAllRoles();
}

export async function createRoleService(role_name: string) {
  if (!role_name) {
    throw new Error('Role name is required');
  }

  return await createRole(role_name);
}

export async function updateRoleService(id: string, role_name: string) {
  if (!role_name) {
    throw new Error('Role name is required');
  }

  const role = await updateRole(id, role_name);

  if (!role) {
    throw new Error('Role not found or inactive');
  }

  return role;
}

export async function deleteRoleService(id: string) {
  const role = await softDeleteRole(id);

  if (!role) {
    throw new Error('Role not found');
  }

  return { message: 'Role désactivé avec succès' };
}