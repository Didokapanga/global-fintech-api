import { db } from '../database/connection.js';
import bcrypt from 'bcrypt';

import {
  findTransfertForUpdate,
  findRetraitForUpdate,
  findRetraitByTransfertId,
  findCaisseForUpdate,
  createRetrait,
  updateRetraitStatus,
  debitCaisse,
  updateTransfertToExecuted,
  insertLedger,
  getRetraitsByAgent,
  getRetraitsToValidate
} from '../repositories/retrait.repository.js';

import { logAudit } from '../utils/auditLogger.js';

/**
 * =========================================
 * 🔥 NORMALIZE FUNCTION
 * FIX BUG PIÈCE
 * =========================================
 */
function normalize(value: any): string {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '')
    .toUpperCase();
}

/**
 * =========================================
 * INITIER RETRAIT
 *
 * CAISSIER :
 * → vérifie code + pièce
 * → crée retrait INITIE
 *
 * 🔥 PAS de débit immédiat
 * 🔥 PAS de ledger immédiat
 * 🔥 vérification solde AVANT création
 * 🔥 impossible de créer 2 retraits
 * pour le même transfert
 * =========================================
 */
export async function retraitService(data: any) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const {
      code_reference,
      code_secret,
      caisse_id,
      numero_piece,
      date_operation,
      created_by,
      ip,
      user_agent
    } = data;

    /**
     * ==========================
     * TRANSFERT LOCK
     * ==========================
     */
    const transfert =
      await findTransfertForUpdate(
        client,
        code_reference
      );

    if (!transfert) {
      throw new Error(
        'Transfert introuvable'
      );
    }

    if (transfert.statut === 'INITIE') {
      throw new Error(
        'Transfert non validé'
      );
    }

    if (transfert.statut === 'EXECUTE') {
      throw new Error(
        'Transfert déjà retiré'
      );
    }

    if (transfert.statut !== 'VALIDE') {
      throw new Error(
        'Transfert non disponible'
      );
    }

    /**
     * ==========================
     * 🔥 EMPÊCHER DOUBLE RETRAIT
     * ==========================
     */
    const existingRetrait =
      await findRetraitByTransfertId(
        client,
        transfert.id
      );

    if (existingRetrait) {
      throw new Error(
        'Un retrait existe déjà pour ce transfert'
      );
    }

    /**
     * ==========================
     * CODE SECRET
     * ==========================
     */
    const isValid = await bcrypt.compare(
      code_secret,
      transfert.code_secret_hash
    );

    if (!isValid) {
      throw new Error(
        'Code secret invalide'
      );
    }

    /**
     * ==========================
     * VALIDATION PIÈCE
     * ==========================
     */
    if (!numero_piece) {
      throw new Error(
        'Numéro de pièce requis'
      );
    }

    const inputPiece =
      normalize(numero_piece);

    const storedPiece =
      normalize(
        transfert.dest_numero_piece
      );

    if (inputPiece !== storedPiece) {
      throw new Error(
        'Pièce d’identité invalide'
      );
    }

    /**
     * ==========================
     * CAISSE LOCK
     * ==========================
     */
    const caisse =
      await findCaisseForUpdate(
        client,
        caisse_id
      );

    if (!caisse) {
      throw new Error(
        'Caisse introuvable'
      );
    }

    if (caisse.state !== 'OUVERTE') {
      throw new Error(
        'Caisse non disponible'
      );
    }

    /**
     * ==========================
     * SECURITE METIER
     * ==========================
     */
    if (
      caisse.agence_id !==
      transfert.agence_dest
    ) {
      throw new Error(
        'Retrait non autorisé dans cette agence'
      );
    }

    if (
      caisse.agent_id !== created_by
    ) {
      throw new Error(
        'Retrait autorisé uniquement sur votre caisse'
      );
    }

    /**
     * ==========================
     * 🔥 VÉRIFICATION SOLDE
     * AVANT création du retrait
     * ==========================
     */
    const montant = Number(
      transfert.montant
    );

    if (
      Number(caisse.solde) < montant
    ) {
      throw new Error(
        'Solde insuffisant'
      );
    }

    /**
     * ==========================
     * DATE OPERATION
     * ==========================
     */
    const finalDateOperation =
      date_operation ||
      new Date()
        .toISOString()
        .split('T')[0];

    /**
     * ==========================
     * CREATE RETRAIT INITIE
     * ==========================
     */
    const retrait =
      await createRetrait(
        client,
        {
          agence_id:
            transfert.agence_dest,
          caisse_id,
          transfert_id:
            transfert.id,
          code_secret_hash:
            transfert.code_secret_hash,
          numero_piece,
          montant,
          devise:
            transfert.devise,
          statut: 'INITIE',
          created_by,
          date_operation:
            finalDateOperation
        }
      );

    await client.query('COMMIT');

    /**
     * ==========================
     * AUDIT
     * ==========================
     */
    await logAudit({
      user_id: created_by,
      action: 'CREATE',
      table_name: 'retrait',
      code_reference:
        transfert.code_reference,
      new_data: retrait,
      ip_address: ip,
      user_agent
    });

    return {
      message:
        'Retrait initié avec succès, en attente de validation',
      retrait
    };

  } catch (err) {
    await client.query(
      'ROLLBACK'
    );
    throw err;

  } finally {
    client.release();
  }
}

/**
 * =========================================
 * VALIDER RETRAIT
 *
 * N+1 / N+2 / ADMIN
 *
 * APPROUVE :
 * → débit réel caisse
 * → retrait EXECUTE
 * → transfert EXECUTE
 * → ledger
 *
 * REJETE :
 * → retrait REJETE
 * =========================================
 */
export async function validateRetraitService(
  data: any
) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const {
      retrait_id,
      decision,
      validated_by,
      validator_role,
      validator_agence_id,
      ip,
      user_agent
    } = data;

    const retrait =
      await findRetraitForUpdate(
        client,
        retrait_id
      );

    if (!retrait) {
      throw new Error(
        'Retrait introuvable'
      );
    }

    if (retrait.statut !== 'INITIE') {
      throw new Error(
        'Retrait déjà traité'
      );
    }

    /**
     * ==========================
     * SECURITE AGENCE
     * ==========================
     */
    if (
      validator_role !== 'ADMIN' &&
      retrait.agence_id !==
        validator_agence_id
    ) {
      throw new Error(
        'Validation autorisée uniquement dans votre agence'
      );
    }

    /**
     * ==========================
     * REJET
     * ==========================
     */
    if (decision === 'REJETE') {
      const rejected =
        await updateRetraitStatus(
          client,
          retrait_id,
          'REJETE'
        );

      await client.query(
        'COMMIT'
      );

      return {
        message:
          'Retrait rejeté',
        retrait: rejected
      };
    }

    /**
     * ==========================
     * APPROBATION
     * ==========================
     */
    if (decision !== 'APPROUVE') {
      throw new Error(
        'Décision invalide'
      );
    }

    const caisse =
      await findCaisseForUpdate(
        client,
        retrait.caisse_id
      );

    if (!caisse) {
      throw new Error(
        'Caisse introuvable'
      );
    }

    if (
      Number(caisse.solde) <
      Number(retrait.montant)
    ) {
      throw new Error(
        'Solde insuffisant'
      );
    }

    /**
     * vrai débit ici
     */
    await debitCaisse(
      client,
      retrait.caisse_id,
      Number(retrait.montant)
    );

    /**
     * retrait EXECUTE
     */
    const updatedRetrait =
      await updateRetraitStatus(
        client,
        retrait_id,
        'EXECUTE'
      );

    /**
     * transfert EXECUTE
     */
    await updateTransfertToExecuted(
      client,
      retrait.transfert_id
    );

    /**
     * ledger
     */
    await insertLedger(client, {
      type_operation:
        'RETRAIT',
      montant:
        retrait.montant,
      devise:
        retrait.devise,
      sens: 'SORTIE',
      caisse_id:
        retrait.caisse_id,
      reference_id:
        retrait.id,
      reference_type:
        'RETRAIT'
    });

    await client.query(
      'COMMIT'
    );

    await logAudit({
      user_id: validated_by,
      action: 'VALIDATE',
      table_name: 'retrait',
      code_reference:
        retrait.code_reference,
      old_data: {
        statut:
          retrait.statut
      },
      new_data: {
        statut: 'EXECUTE'
      },
      ip_address: ip,
      user_agent
    });

    return {
      message:
        'Retrait validé avec succès',
      retrait:
        updatedRetrait
    };

  } catch (err) {
    await client.query(
      'ROLLBACK'
    );
    throw err;

  } finally {
    client.release();
  }
}

/**
 * =========================================
 * HISTORIQUE RETRAITS
 * =========================================
 */
export async function getRetraitsByAgentService(
  user: any,
  limit: number,
  offset: number,
  filters: {
    statut?: string;
    date_operation?: string;
  }
) {
  if (!user?.id) {
    throw new Error(
      'Utilisateur non authentifié'
    );
  }

  return await getRetraitsByAgent(
    user.id,
    limit,
    offset,
    filters
  );
}

/**
 * =========================================
 * RETRAITS À VALIDER
 *
 * ADMIN :
 * → tous les retraits INITIE
 *
 * N+1 / N+2 :
 * → seulement son agence
 * =========================================
 */
export async function getRetraitsToValidateService(
  user: any,
  limit: number,
  offset: number
) {
  if (!user?.role_name) {
    throw new Error(
      'Utilisateur non authentifié'
    );
  }

  const role =
    user.role_name.toUpperCase();

  const isAdmin =
    role === 'ADMIN';

  if (
    !isAdmin &&
    !user.agence_id
  ) {
    throw new Error(
      'Agence utilisateur manquante'
    );
  }

  return await getRetraitsToValidate(
    isAdmin
      ? null
      : user.agence_id,
    isAdmin,
    limit,
    offset
  );
}