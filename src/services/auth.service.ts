// src/services/auth.service.ts

import { findUserById, getAllUsers, getUsersByAgence } from '../repositories/user.repository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  findUserByEmail,
  createUser,
  findUserByUserName,
  updateUser,
  deleteUser
} from '../repositories/user.repository.js';

// ✅ PAS DE THROW GLOBAL
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export async function registerService(data: any) {
  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await createUser({
    ...data,
    hash_password: hashedPassword,
  });

  delete user.hash_password;

  return user;
}

export async function loginService(user_name: string, password: string) {
  const user = await findUserByUserName(user_name);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.hash_password);

  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
  {
    id: user.id,
    role_id: user.role_id,
    role_name: user.role_name,
    agence_id: user.agence_id,
    agence_name: user.agence_name,
  },
  JWT_SECRET,
  { expiresIn: '1d' }
);

  delete user.hash_password;

  return { token, user };
}

export async function getAllUsersService() {
  return await getAllUsers();
}

export async function getUsersByAgenceService(agence_id: string) {
  if (!agence_id) {
    throw new Error('Agence id requis');
  }

  return await getUsersByAgence(agence_id);
}

export async function getMeService(userId: string) {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error('Utilisateur introuvable');
  }

  return user;
}

export async function updateUserService(id: string, data: any) {
  const user = await updateUser(id, data);

  if (!user) {
    throw new Error('User not found');
  }

  delete user.hash_password;

  return user;
}

export async function deleteUserService(id: string) {
  const user = await deleteUser(id);

  if (!user) {
    throw new Error('User not found');
  }

  return { message: 'User deleted successfully' };
}