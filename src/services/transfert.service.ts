import { db } from '../database/connection.js';
import { logAudit } from '../utils/auditLogger.js';

import {
  getAllTransferts,
  getAllTransfertsToProcess,
  getTransfertsByAgence,
  getTransfertsByAgent,
  getTransfertsByCaissier,
  getTransfertsCaisseToProcess,
  getTransfertsCaisseToProcessByCaisses
} from '../repositories/transfert.repository.js';

/**
 * =========================================
 * 🔥 CREATE TRANSFERT CAISSE
 * =========================================
 */
export async function transfertCaisseService(
  data: any
) {
  const client =
    await db.connect();

  try {
    await client.query(
      'BEGIN'
    );

    const {
      caisse_source_id,
      caisse_destination_id,
      montant,
      devise,
      date_operation,
      created_by,
      ip,
      user_agent
    } = data;

    /**
     * =========================
     * VALIDATION
     * =========================
     */
    if (
      !caisse_source_id ||
      !caisse_destination_id ||
      montant <= 0
    ) {
      throw new Error(
        'Invalid data'
      );
    }

    if (
      caisse_source_id ===
      caisse_destination_id
    ) {
      throw new Error(
        'Même caisse interdite'
      );
    }

    /**
     * =========================
     * LOCK DES CAISSES
     * =========================
     */
    const sourceRes =
      await client.query(
        `
        SELECT *
        FROM caisse
        WHERE id = $1
        FOR UPDATE
        `,
        [caisse_source_id]
      );

    const destRes =
      await client.query(
        `
        SELECT *
        FROM caisse
        WHERE id = $1
        FOR UPDATE
        `,
        [caisse_destination_id]
      );

    const source =
      sourceRes.rows[0];

    const dest =
      destRes.rows[0];

    if (!source || !dest) {
      throw new Error(
        'Caisse introuvable'
      );
    }

    if (
      source.state !==
        'OUVERTE' ||
      dest.state !==
        'OUVERTE'
    ) {
      throw new Error(
        'Caisse non ouverte'
      );
    }

    if (
      source.solde <
      montant
    ) {
      throw new Error(
        'Solde insuffisant'
      );
    }

    /**
     * =========================
     * INSERT
     * =========================
     */
    const transfertRes =
      await client.query(
        `
        INSERT INTO transfert_caisse
        (
          caisse_source_id,
          caisse_destination_id,
          montant,
          devise,
          date_operation,
          created_by,
          statut
        )
        VALUES
        (
          $1,$2,$3,$4,$5,$6,'INITIE'
        )
        RETURNING *
        `,
        [
          caisse_source_id,
          caisse_destination_id,
          montant,
          devise,
          date_operation ||
            new Date(),
          created_by
        ]
      );

    const transfert =
      transfertRes.rows[0];

    await client.query(
      'COMMIT'
    );

    /**
     * =========================
     * AUDIT APRÈS COMMIT
     * =========================
     */
    await logAudit({
      user_id:
        created_by,
      action: 'CREATE',
      table_name:
        'transfert_caisse',
      code_reference:
        transfert.id,
      new_data:
        transfert,
      ip_address: ip,
      user_agent
    });

    return transfert;

  } catch (
    error: unknown
  ) {
    await client.query(
      'ROLLBACK'
    );

    throw error;

  } finally {
    client.release();
  }
}

/**
 * =========================================
 * 🔍 GET TRANSFERTS
 * sécurisé par rôle
 * =========================================
 */
export async function getTransfertsService(
  user: any,
  limit: number,
  offset: number,
  filters: {
    devise?: string;
    statut?: string;
    date_operation?: string;
  }
) {
  const role =
    user.role_name?.toUpperCase();

  const agenceId =
    user.agence_id;

  /**
   * 🔴 ADMIN → tout
   */
  if (role === 'ADMIN') {
    return await getAllTransferts(
      limit,
      offset,
      filters
    );
  }

  /**
   * 🟡 N+1 / N+2 → agence
   */
  if (
    role === 'N+1' ||
    role === 'N+2'
  ) {
    if (!agenceId) {
      throw new Error(
        'Agence utilisateur manquante'
      );
    }

    return await getTransfertsByAgence(
      agenceId,
      limit,
      offset,
      filters
    );
  }

  /**
   * 🟢 CAISSIER
   */
  if (
    role === 'CAISSIER'
  ) {
    return await getTransfertsByCaissier(
      user.id,
      limit,
      offset,
      filters
    );
  }

  throw new Error(
    'Accès refusé'
  );
}

/**
 * =========================================
 * 🔍 GET MES TRANSFERTS
 * created_by
 * =========================================
 */
export async function getMyTransfertsService(
  user: any,
  limit: number,
  offset: number,
  filters: {
    devise?: string;
    statut?: string;
    date_operation?: string;
  }
) {
  if (!user?.id) {
    throw new Error(
      'Utilisateur non authentifié'
    );
  }

  return await getTransfertsByAgent(
    user.id,
    limit,
    offset,
    filters
  );
}

/**
 * =========================================
 * 🔥 GET TRANSFERTS À TRAITER
 * INITIE + VALIDE
 * =========================================
 */
export async function getTransfertsCaisseToProcessService(
  user: any,
  limit: number,
  offset: number
) {
  if (!user?.id) {
    throw new Error(
      'Utilisateur non authentifié'
    );
  }

  const role =
    user.role_name?.toUpperCase();

  /**
   * 🔴 ADMIN → tout
   */
  if (role === 'ADMIN') {
    return await getAllTransfertsToProcess(
      limit,
      offset
    );
  }

  /**
   * 🟡 N+1 / N+2 → agence
   */
  if (
    role === 'N+1' ||
    role === 'N+2'
  ) {
    if (!user.agence_id) {
      throw new Error(
        'Agence utilisateur manquante'
      );
    }

    return await getTransfertsCaisseToProcess(
      user.agence_id,
      limit,
      offset
    );
  }

  /**
   * 🟢 CAISSIER
   * seulement ses caisses
   */
  const caisseRes =
    await db.query(
      `
      SELECT id
      FROM caisse
      WHERE agent_id = $1
      `,
      [user.id]
    );

  /**
   * 🔥 FIX TS
   * explicit any
   */
  const caisseIds =
    caisseRes.rows.map(
      (c: any) => c.id
    );

  /**
   * pas de throw ici
   */
  if (
    caisseIds.length === 0
  ) {
    return {
      data: [],
      total: 0
    };
  }

  return await getTransfertsCaisseToProcessByCaisses(
    caisseIds,
    limit,
    offset
  );
}