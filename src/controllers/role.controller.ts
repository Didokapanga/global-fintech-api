import type { RequestHandler } from 'express';
import { getRolesService, createRoleService, updateRoleService, deleteRoleService } from '../services/role.service.js';

import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getRoles: RequestHandler = async (req, res) => {
  try {
    const roles = await getRolesService();

    res.json(successResponse('Liste des rôles', roles));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message));
  }
};

export const createRole: RequestHandler = async (req, res) => {
  try {
    const { role_name } = req.body as any;

    const role = await createRoleService(role_name);

    res.json(successResponse('Rôle créé avec succès', role));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const updateRole: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;
    const { role_name } = req.body as any;

    const role = await updateRoleService(id, role_name);

    res.json(successResponse('Rôle mis à jour', role));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const deleteRole: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;

    await deleteRoleService(id);

    res.json(successResponse('Rôle désactivé'));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};