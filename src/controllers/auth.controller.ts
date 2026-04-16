import type { RequestHandler } from 'express';
import { registerService, loginService } from '../services/auth.service.js';

export const register: RequestHandler = async (req, res) => {
  try {
    const user = await registerService(req.body);

    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { user_name, password } = req.body as any;

    const data = await loginService(user_name, password);

    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};