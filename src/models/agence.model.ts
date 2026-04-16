export interface Agence {
  id: string;
  libelle: string;
  code_agence: string;
  ville: string;
  commune?: string;
  quartier?: string;
  is_activated: boolean;
  created_at: Date;
  updated_at: Date;
}