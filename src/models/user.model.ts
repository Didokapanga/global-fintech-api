export interface User {
  id: string; // UUID = string
  role_id: number;
  agence_id: number;
  user_name: string;
  phone: string;
  email: string;
  hash_password: string;
  is_activated: boolean;
  created_at: Date;
  updated_at: Date;
}