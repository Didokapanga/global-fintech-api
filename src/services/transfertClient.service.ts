import { db } from '../database/connection.js';
import bcrypt from 'bcrypt';
import { generateCode } from '../utils/codeGenerator.js';

import {
  createTransfertClientTx,
  getTransfertsClientByAgence,
  getTransfertsClientByAgent,
  getTransfertsClientToValidate,
  getTransfertsClientToWithdraw
} from '../repositories/transfertClient.repository.js';

import { logAudit } from '../utils/auditLogger.js';

/**
 * ==============================
 * CREATE TRANSFERT CLIENT
 * 🔥 date_operation envoyé depuis le body
 * ==============================
 */
export async function createTransfertClientService(data: any) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const {
      caisse_id,
      montant,
      devise,
      date_operation,

      // expéditeur
      exp_nom,
      exp_postnom,
      exp_prenom,
      exp_phone,
      exp_type_piece,
      exp_numero_piece,

      // destinataire
      dest_nom,
      dest_postnom,
      dest_prenom,
      dest_phone,
      dest_type_piece,
      dest_numero_piece
    } = data;

    /**
     * ==========================
     * VALIDATION
     * ==========================
     */
    if (!montant || Number(montant) <= 0) {
      throw new Error('Montant invalide');
    }

    if (!date_operation) {
      throw new Error('date_operation est requis');
    }

    if (!exp_nom || !exp_phone) {
      throw new Error('Infos expéditeur requises');
    }

    if (!exp_type_piece || !exp_numero_piece) {
      throw new Error('Pièce expéditeur requise');
    }

    if (!dest_nom || !dest_phone) {
      throw new Error('Infos destinataire requises');
    }

    if (!dest_type_piece || !dest_numero_piece) {
      throw new Error('Pièce destinataire requise');
    }

    /**
     * ==========================
     * LOCK CAISSE
     * ==========================
     */
    const caisseRes = await client.query(
      `
      SELECT *
      FROM caisse
      WHERE id = $1
      FOR UPDATE
      `,
      [caisse_id]
    );

    const caisse = caisseRes.rows[0];

    if (!caisse || caisse.state !== 'OUVERTE') {
      throw new Error('Caisse non disponible');
    }

    /**
     * ==========================
     * CODE SECRET
     * ==========================
     */
    const code = generateCode();
    const hash = await bcrypt.hash(code, 10);
    const code_reference = 'REF' + Date.now();

    /**
     * ==========================
     * CASH ENTRE EN CAISSE
     * ==========================
     */
    await client.query(
      `
      UPDATE caisse
      SET solde = solde + $1
      WHERE id = $2
      `,
      [montant, caisse_id]
    );

    /**
     * ==========================
     * INSERT TRANSFERT
     * ==========================
     */
    const transfert = await createTransfertClientTx(client, {
      ...data,
      code_secret_hash: hash,
      code_reference,
      statut: 'INITIE',
      date_operation
    });

    /**
     * ==========================
     * LEDGER
     * ==========================
     */
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
        'TRANSFERT_CLIENT',
        montant,
        devise,
        'ENTREE',
        caisse_id,
        transfert.id,
        'TRANSFERT_CLIENT'
      ]
    );

    await client.query('COMMIT');

    const {
      code_secret_hash,
      ...safeTransfert
    } = transfert;

    /**
     * ==========================
     * AUDIT
     * ==========================
     */
    await logAudit({
      user_id: data.created_by,
      action: 'CREATE',
      table_name: 'transfert_client',
      code_reference,
      new_data: safeTransfert,
      ip_address: data.ip,
      user_agent: data.user_agent
    });

    return {
      transfert: safeTransfert,
      code_secret: code
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;

  } finally {
    client.release();
  }
}

/**
 * ==============================
 * GET BY AGENCE
 * + filtres :
 * - statut
 * - date_operation
 * ==============================
 */
export async function getTransfertClientByAgenceService(
  agence_id: string,
  limit: number,
  offset: number,
  filters: {
    statut?: string;
    date_operation?: string;
  }
) {
  return await getTransfertsClientByAgence(
    agence_id,
    limit,
    offset,
    filters
  );
}

/**
 * ==============================
 * GET BY AGENT
 * + filtres :
 * - statut
 * - date_operation
 * ==============================
 */
export async function getTransfertClientByAgentService(
  user_id: string,
  limit: number,
  offset: number,
  filters: {
    statut?: string;
    date_operation?: string;
  }
) {
  return await getTransfertsClientByAgent(
    user_id,
    limit,
    offset,
    filters
  );
}

/**
 * ==============================
 * TO VALIDATE
 * + filtres :
 * - statut
 * - date_operation
 * ==============================
 */
export async function getTransfertsClientToValidateService(
  user: any,
  limit: number,
  offset: number,
  filters: {
    statut?: string;
    date_operation?: string;
  }
) {
  if (!user?.agence_id) {
    throw new Error('Agence utilisateur manquante');
  }

  return await getTransfertsClientToValidate(
    user.agence_id,
    limit,
    offset,
    filters
  );
}

/**
 * ==============================
 * TO WITHDRAW
 * + filtres :
 * - statut
 * - date_operation
 * ==============================
 */
export async function getTransfertsClientToWithdrawService(
  user: any,
  limit: number,
  offset: number,
  filters: {
    statut?: string;
    date_operation?: string;
  }
) {
  if (!user?.agence_id) {
    throw new Error('Agence utilisateur manquante');
  }

  return await getTransfertsClientToWithdraw(
    user.agence_id,
    limit,
    offset,
    filters
  );
}