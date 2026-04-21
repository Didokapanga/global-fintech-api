import { db } from '../database/connection.js';
import bcrypt from 'bcrypt';

import {
  findTransfertForUpdate,
  findCaisseForUpdate,
  insertLedger,
  createRetrait,
  getRetraitsByAgent
} from '../repositories/retrait.repository.js';

import { logAudit } from '../utils/auditLogger.js';

export async function retraitService(data: any) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const {
      code_reference,
      code_secret,
      caisse_id,
      created_by,
      ip,
      user_agent
    } = data;

    // 🔍 TRANSFERT (LOCK)
    const transfert = await findTransfertForUpdate(client, code_reference);

    if (!transfert) {
      throw new Error('Transfert introuvable');
    }

    // 🔒 SÉCURITÉ STATUT (ULTRA IMPORTANT)
    if (transfert.statut === 'INITIE') {
      throw new Error('Transfert non validé');
    }

    if (transfert.statut === 'EXECUTE') {
      throw new Error('Transfert déjà retiré');
    }

    if (transfert.statut !== 'VALIDE') {
      throw new Error('Transfert non disponible pour retrait');
    }

    // 🔐 VÉRIFICATION CODE SECRET
    const isValid = await bcrypt.compare(
      code_secret,
      transfert.code_secret_hash
    );

    if (!isValid) {
      throw new Error('Code secret invalide');
    }

    // 🔍 CAISSE (LOCK)
    const caisse = await findCaisseForUpdate(client, caisse_id);

    if (!caisse) {
      throw new Error('Caisse introuvable');
    }

    if (caisse.state !== 'OUVERTE') {
      throw new Error('Caisse non disponible');
    }

    const montant = Number(transfert.montant);

    // =====================================================
    // 🔥 SÉCURITÉS CRITIQUES AJOUTÉES
    // =====================================================

    // 🔒 sécurité agence
    if (caisse.agence_id !== transfert.agence_dest) {
      throw new Error('Retrait non autorisé dans cette agence');
    }

    // 🔒 sécurité agent propriétaire
    if (caisse.agent_id !== created_by) {
      throw new Error('Retrait autorisé uniquement sur votre caisse');
    }

    // 🔒 sécurité solde
    if (caisse.solde < montant) {
      throw new Error('Solde insuffisant');
    }

    // 🔒 double protection statut (anti race condition)
    if (transfert.statut !== 'VALIDE') {
      throw new Error('Transfert déjà traité ou invalide');
    }

    // =====================================================
    // 💾 CRÉER RETRAIT
    // =====================================================
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

    // =====================================================
    // 🔻 DÉBIT CAISSE
    // =====================================================
    await client.query(
      `UPDATE caisse 
       SET solde = solde - $1 
       WHERE id = $2`,
      [montant, caisse_id]
    );

    // =====================================================
    // 🔄 UPDATE STATUT TRANSFERT
    // =====================================================
    await client.query(
      `UPDATE transfert_client
       SET statut = 'EXECUTE',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [transfert.id]
    );

    // =====================================================
    // 📊 LEDGER (SORTIE)
    // =====================================================
    await insertLedger(client, {
      type_operation: 'RETRAIT',
      montant,
      devise: transfert.devise,
      sens: 'SORTIE',
      caisse_id,
      reference_id: retrait.id,
      reference_type: 'RETRAIT'
    });

    await client.query('COMMIT');

    // =====================================================
    // 🔐 AUDIT (APRÈS COMMIT)
    // =====================================================
    const { code_secret_hash, ...safeRetrait } = retrait;

    await logAudit({
      user_id: created_by,
      action: 'EXECUTE',
      table_name: 'retrait',
      code_reference: transfert.code_reference,
      new_data: safeRetrait,
      ip_address: ip,
      user_agent
    });

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

export async function getRetraitsByAgentService(
  user: any,
  limit: number,
  offset: number
) {
  if (!user?.id) {
    throw new Error('Utilisateur non authentifié');
  }

  return await getRetraitsByAgent(user.id, limit, offset);
}