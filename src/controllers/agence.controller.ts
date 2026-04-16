import type { RequestHandler } from 'express';
import {
  getAgencesService,
  getAgenceService,
  createAgenceService
} from '../services/agence.service.js';

export const getAgences: RequestHandler = async (req, res) => {
  try {
    const agences = await getAgencesService();
    res.json(agences);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAgence: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;

    const agence = await getAgenceService(id);

    res.json(agence);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const createAgence: RequestHandler = async (req, res) => {
  try {
    const agence = await createAgenceService(req.body);
    res.json(agence);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};