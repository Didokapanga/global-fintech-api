import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser, findUserByUserName } from '../repositories/user.repository.js';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET missing');
}

const JWT_SECRET = process.env.JWT_SECRET;

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
      agence_id: user.agence_id,
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  delete user.hash_password;

  return { token, user };
}