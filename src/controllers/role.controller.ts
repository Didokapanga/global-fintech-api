import type { RequestHandler } from 'express';
import { getRolesService, createRoleService } from '../services/role.service.js';

export const getRoles: RequestHandler = async (req, res) => {
  try {
    const roles = await getRolesService();
    res.json(roles);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createRole: RequestHandler = async (req, res) => {
  try {
    const { role_name } = req.body as any;

    const role = await createRoleService(role_name);

    res.json(role);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};