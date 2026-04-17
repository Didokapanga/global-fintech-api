import { db } from '../database/connection.js';
import bcrypt from 'bcrypt';

import {
  findTransfertForUpdate,
  findCaisseForUpdate,
  creditCaisse,
  updateTransfertToExecuted,
  insertLedger,
  createRetrait
} from '../repositories/retrait.repository.js';
import { logAudit } from '../utils/auditLogger.js';

export async function retraitService(data: any) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const { code_reference, code_secret, caisse_id, created_by } = data;

    // 🔍 transfert
    const transfert = await findTransfertForUpdate(client, code_reference);

    if (!transfert) {
      throw new Error('Transfert introuvable');
    }

    if (transfert.statut !== 'INITIE') {
      throw new Error('Transfert déjà utilisé ou invalide');
    }

    // 🔐 vérifier code
    const isValid = await bcrypt.compare(
      code_secret,
      transfert.code_secret_hash
    );

    if (!isValid) {
      throw new Error('Code secret invalide');
    }

    // 🔍 caisse
    const caisse = await findCaisseForUpdate(client, caisse_id);

    if (!caisse || caisse.state !== 'OUVERTE') {
      throw new Error('Caisse non disponible');
    }

    const montant = Number(transfert.montant);

    // 💾 ENREGISTRER RETRAIT (IMPORTANT)
    const retrait = await createRetrait(client, {
      agence_id: transfert.agence_dest,
      caisse_id,
      transfert_id: transfert.id,
      code_secret_hash: transfert.code_secret_hash,
      numero_piece: transfert.numero_piece,
      montant,
      devise: transfert.devise,
      created_by
    });

    // 💰 crédit caisse
    await creditCaisse(client, caisse_id, montant);

    // 🔄 statut transfert
    await updateTransfertToExecuted(client, transfert.id);

    // 📊 ledger CORRIGÉ
    await insertLedger(client, {
      type_operation: 'RETRAIT', // ✅ CORRECTION
      montant,
      devise: transfert.devise,
      sens: 'ENTREE',
      caisse_id,
      reference_id: retrait.id, // ✅ IMPORTANT
      reference_type: 'RETRAIT'
    });

    await logAudit({
      user_id: created_by,
      action: 'EXECUTE',
      table_name: 'retrait',
      code_reference: transfert.code_reference,
      new_data: retrait
    });

    await client.query('COMMIT');

    return {
      message: 'Retrait effectué avec succès',
      montant
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}