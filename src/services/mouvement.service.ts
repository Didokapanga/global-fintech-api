import { db } from '../database/connection.js';
import { createLedgerEntry } from '../repositories/ledger.repository.js';
import {
  getAllMouvementsPaginated,
  getMouvementsByAgence
} from '../repositories/mouvement.repository.js';
import { logAudit } from '../utils/auditLogger.js';
import { generateReference } from '../utils/codeGenerator.js';

/**
 * =========================================
 * CREATE MOUVEMENT
 * date_operation envoyé depuis le body
 * =========================================
 */
export async function createMouvementService(data: any) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const {
      caisse_id,
      montant,
      type_mouvement,
      devise,
      date_operation, // 🔥 ajouté
      created_by,
      ip,
      user_agent
    } = data;

    // =========================
    // VALIDATION
    // =========================
    if (!caisse_id || !montant || montant <= 0) {
      throw new Error('Invalid data');
    }

    if (!type_mouvement) {
      throw new Error('type_mouvement requis');
    }

    if (!devise) {
      throw new Error('devise requise');
    }

    // 🔥 fallback intelligent
    const finalDateOperation =
      date_operation || new Date().toISOString().split('T')[0];

    // =========================
    // LOCK CAISSE
    // =========================
    const caisseRes = await client.query(
      `SELECT * FROM caisse WHERE id = $1 FOR UPDATE`,
      [caisse_id]
    );

    const caisse = caisseRes.rows[0];

    if (!caisse) {
      throw new Error('Caisse not found');
    }

    if (caisse.state !== 'OUVERTE') {
      throw new Error('Caisse non ouverte');
    }

    // =========================
    // LOGIQUE MOUVEMENT
    // =========================
    const isSortie =
      type_mouvement === 'RETRAIT_SORTIE' ||
      type_mouvement === 'TRANSFERT_SORTIE';

    const soldeChange = isSortie
      ? -Number(montant)
      : Number(montant);

    if (isSortie && Number(caisse.solde) < Number(montant)) {
      throw new Error('Solde insuffisant');
    }

    // =========================
    // UPDATE SOLDE
    // =========================
    await client.query(
      `UPDATE caisse
       SET solde = solde + $1
       WHERE id = $2`,
      [soldeChange, caisse_id]
    );

    // =========================
    // CODE REFERENCE
    // =========================
    const code_reference = generateReference('MVT');

    // =========================
    // INSERT MOUVEMENT
    // 🔥 date_operation ajouté
    // =========================
    const mouvementRes = await client.query(
      `
      INSERT INTO mouvement_caisse
      (
        caisse_id,
        type_mouvement,
        montant,
        devise,
        statut,
        code_reference,
        created_by,
        date_operation
      )
      VALUES
      (
        $1,$2,$3,$4,'EXECUTE',$5,$6,$7
      )
      RETURNING *
      `,
      [
        caisse_id,
        type_mouvement,
        montant,
        devise,
        code_reference,
        created_by,
        finalDateOperation
      ]
    );

    const mouvement = mouvementRes.rows[0];

    // =========================
    // LEDGER
    // =========================
    await client.query(
      `
      INSERT INTO ledger
      (
        type_operation,
        montant,
        devise,
        sens,
        caisse_id,
        reference_id,
        reference_type
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7
      )
      `,
      [
        type_mouvement,
        montant,
        devise,
        isSortie ? 'SORTIE' : 'ENTREE',
        caisse_id,
        mouvement.id,
        'MOUVEMENT_CAISSE'
      ]
    );

    await client.query('COMMIT');

    // =========================
    // AUDIT
    // =========================
    await logAudit({
      user_id: created_by,
      action: 'CREATE',
      table_name: 'mouvement_caisse',
      code_reference,
      new_data: mouvement,
      ip_address: ip,
      user_agent
    });

    return mouvement;

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;

  } finally {
    client.release();
  }
}

/**
 * =========================================
 * 🔹 ADMIN ONLY
 * + filtres
 * =========================================
 */
export async function getAllMouvementsService(
  page: number,
  limit: number,
  filters: {
    type_mouvement?: string;
    devise?: string;
    statut?: string;
    date_operation?: string;
  }
) {
  return await getAllMouvementsPaginated(
    page,
    limit,
    filters
  );
}

/**
 * =========================================
 * 🔹 PAR AGENCE
 * + filtres
 * =========================================
 */
export async function getMouvementsByAgenceService(
  agence_id: string,
  page = 1,
  limit = 10,
  filters: {
    type_mouvement?: string;
    devise?: string;
    statut?: string;
    date_operation?: string;
  }
) {
  if (!agence_id) {
    throw new Error('agence_id requis');
  }

  const offset = (page - 1) * limit;

  return await getMouvementsByAgence(
    agence_id,
    limit,
    offset,
    filters
  );
}