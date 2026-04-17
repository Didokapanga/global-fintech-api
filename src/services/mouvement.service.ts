import { getCaisseById } from '../repositories/caisse.repository.js';
import { createMouvement, updateCaisseSolde } from '../repositories/mouvement.repository.js';
import { createLedgerEntry } from '../repositories/ledger.repository.js';

export async function createMouvementService(data: any) {
  const { caisse_id, montant, type_mouvement } = data;

  if (!caisse_id || !montant || montant <= 0) {
    throw new Error('Invalid data');
  }

  const caisse = await getCaisseById(caisse_id);

  if (!caisse) {
    throw new Error('Caisse not found');
  }

  if (caisse.state !== 'OUVERTE') {
    throw new Error('Caisse non ouverte');
  }

  let soldeChange = montant;

  // 🔴 SORTIE
  if (
    type_mouvement === 'RETRAIT_SORTIE' ||
    type_mouvement === 'TRANSFERT_SORTIE'
  ) {
    if (caisse.solde < montant) {
      throw new Error('Solde insuffisant');
    }

    soldeChange = -montant;
  }

  // 💾 update solde
  await updateCaisseSolde(caisse_id, soldeChange);

  // 🧾 log mouvement
  const mouvement = await createMouvement(data);

    // 🎯 déterminer sens
    const isSortie =
    type_mouvement === 'RETRAIT_SORTIE' ||
    type_mouvement === 'TRANSFERT_SORTIE';

    await createLedgerEntry({
    type_operation: type_mouvement,
    montant,
    devise: data.devise,
    sens: isSortie ? 'SORTIE' : 'ENTREE',
    caisse_id,
    reference_id: mouvement.id,
    reference_type: 'MOUVEMENT_CAISSE'
    });

    return mouvement;
}
