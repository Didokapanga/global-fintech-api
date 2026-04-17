export interface Caisse {
  id: string;
  agence_id: string;
  agent_id?: string;

  type: 'AGENCE' | 'AGENT';
  devise: string;
  solde: number;

  state: 'OUVERTE' | 'FERMEE' | 'CLOTUREE';

  code_caisse: string;

  is_activated: boolean;

  created_at: Date;
  updated_at: Date;
  last_cloture_at?: Date;
}