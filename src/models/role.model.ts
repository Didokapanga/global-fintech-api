export interface Role {
  id: string; // UUID = string
  role_name: 'CAISSIER' | 'N1' | 'N2';
  is_activated: boolean;
  created_at: Date;
  updated_at: Date;
}