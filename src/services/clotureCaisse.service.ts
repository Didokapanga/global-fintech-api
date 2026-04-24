import { db } from '../database/connection.js';

import {
  findCaisseForUpdate,
  findClotureForUpdate,
  createCloture,
  getCloturesToValidate,
  closeAndResetCaisse,
  updateClotureStatus
} from '../repositories/clotureCaisse.repository.js';

import { logAudit } from '../utils/auditLogger.js';

/**
 * =========================================
 * 🔒 CREATE CLOTURE CAISSE
 * =========================================
 */
export async function clotureCaisseService(data: any) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const {
      caisse_id,
      solde_physique,

      // 🔥 nouveaux champs
      motif_ecart,
      observation,
      date_operation,

      created_by,
      ip,
      user_agent
    } = data;

    /**
     * ==========================
     * VALIDATIONS
     * ==========================
     */
    if (!caisse_id) {
      throw new Error('caisse_id requis');
    }

    if (
      solde_physique === undefined ||
      solde_physique === null
    ) {
      throw new Error('solde_physique requis');
    }

    if (!date_operation) {
      throw new Error('date_operation requis');
    }

    /**
     * ==========================
     * LOCK CAISSE
     * ==========================
     */
    const caisse = await findCaisseForUpdate(
      client,
      caisse_id
    );

    if (!caisse) {
      throw new Error('Caisse introuvable');
    }

    if (caisse.state !== 'OUVERTE') {
      throw new Error('Caisse déjà fermée');
    }

    /**
     * ==========================
     * SOLDES
     * ==========================
     */
    const solde_systeme = Number(caisse.solde);
    const solde_physique_num = Number(solde_physique);

    if (isNaN(solde_physique_num)) {
      throw new Error(
        'Solde physique invalide'
      );
    }

    /**
     * ==========================
     * ECART CALCULÉ
     * ==========================
     */
    const ecartFinal =
      solde_physique_num - solde_systeme;

    /**
     * ==========================
     * SI ECART ≠ 0
     * motif obligatoire
     * ==========================
     */
    if (
      ecartFinal !== 0 &&
      !motif_ecart
    ) {
      throw new Error(
        'motif_ecart requis si écart détecté'
      );
    }

    /**
     * ==========================
     * CODE REFERENCE
     * ==========================
     */
    const code_reference =
      `CLT-${Date.now()}`;

    /**
     * ==========================
     * STATUT
     * ==========================
     */
    const statut =
      ecartFinal === 0
        ? 'VALIDE'
        : 'INITIE';

    /**
     * ==========================
     * CREATE CLOTURE
     * ==========================
     */
    const cloture = await createCloture(
      client,
      {
        code_reference,
        caisse_id,

        solde_systeme,
        solde_physique:
          solde_physique_num,
        ecart: ecartFinal,
        devise: caisse.devise,

        motif_ecart,
        observation,

        date_operation,

        statut,
        created_by
      }
    );

    /**
     * ==========================
     * SI PAS D’ECART
     * fermeture immédiate
     * ==========================
     */
    if (statut === 'VALIDE') {
      await closeAndResetCaisse(
        client,
        caisse_id
      );
    }

    await client.query('COMMIT');

    /**
     * ==========================
     * AUDIT
     * ==========================
     */
    await logAudit({
      user_id: created_by,
      action: 'CREATE',
      table_name: 'cloture_caisse',
      code_reference,
      new_data: cloture,
      ip_address: ip,
      user_agent
    });

    return {
      message:
        statut === 'VALIDE'
          ? 'Clôture validée automatiquement'
          : 'Clôture initiée',

      cloture
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;

  } finally {
    client.release();
  }
}

/**
 * =========================================
 * 🔒 GET CLOTURES TO VALIDATE
 *
 * ADMIN → toutes agences
 * N+1 / N+2 → uniquement son agence
 * =========================================
 */
export async function getCloturesToValidateService(
  user: any,
  limit: number,
  offset: number
) {
  if (!user?.id) {
    throw new Error(
      'Utilisateur non authentifié'
    );
  }

  if (
    user.role_name !== 'ADMIN' &&
    !user.agence_id
  ) {
    throw new Error(
      'Agence utilisateur manquante'
    );
  }

  return await getCloturesToValidate(
    user,
    limit,
    offset
  );
}

/**
 * =========================================
 * 🔒 VALIDATE CLOTURE
 * =========================================
 */
export async function validateClotureService(
  data: any
) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const {
      cloture_id,
      decision,
      validated_by,
      validator_role,
      validator_agence_id,
      ip,
      user_agent
    } = data;

    /**
     * ==========================
     * LOCK CLOTURE
     * ==========================
     */
    const cloture =
      await findClotureForUpdate(
        client,
        cloture_id
      );

    if (!cloture) {
      throw new Error(
        'Clôture introuvable'
      );
    }

    if (cloture.statut !== 'INITIE') {
      throw new Error(
        'Clôture déjà traitée'
      );
    }

    /**
     * ==========================
     * SÉCURITÉ AGENCE
     *
     * ADMIN → bypass
     * N+1 / N+2 → même agence
     * ==========================
     */
    if (
      validator_role !== 'ADMIN' &&
      cloture.agence_id !==
        validator_agence_id
    ) {
      throw new Error(
        'Validation autorisée uniquement dans votre agence'
      );
    }

    /**
     * ==========================
     * DECISION
     * ==========================
     */
    let newStatus = 'INITIE';

    if (decision === 'APPROUVE') {
      newStatus = 'VALIDE';
    }

    if (decision === 'REJETE') {
      newStatus = 'REJETE';
    }

    if (
      !['VALIDE', 'REJETE'].includes(
        newStatus
      )
    ) {
      throw new Error(
        'Décision invalide'
      );
    }

    /**
     * ==========================
     * UPDATE STATUT
     * ==========================
     */
    const updated =
      await updateClotureStatus(
        client,
        cloture_id,
        newStatus,
        validated_by
      );

    /**
     * ==========================
     * SI VALIDÉ
     * fermeture réelle
     * ==========================
     */
    if (newStatus === 'VALIDE') {
      await closeAndResetCaisse(
        client,
        cloture.caisse_id
      );
    }

    await client.query('COMMIT');

    /**
     * ==========================
     * AUDIT
     * ==========================
     */
    await logAudit({
      user_id: validated_by,
      action: 'VALIDATE',
      table_name: 'cloture_caisse',
      code_reference:
        cloture.code_reference,
      old_data: {
        statut: cloture.statut
      },
      new_data: {
        statut: newStatus
      },
      ip_address: ip,
      user_agent
    });

    return {
      message:
        'Clôture traitée avec succès',
      cloture: updated
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;

  } finally {
    client.release();
  }
}