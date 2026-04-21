import { db } from '../database/connection.js';
import { createLedgerEntry } from '../repositories/ledger.repository.js';
import { getAllMouvementsPaginated, getMouvementsByAgence } from '../repositories/mouvement.repository.js';
import { logAudit } from '../utils/auditLogger.js';
import { generateReference } from '../utils/codeGenerator.js';

export async function createMouvementService(data: any) {
  const client = await db.connect();
 
  try {
    await client.query('BEGIN');

    const {
      caisse_id,
      montant,
      type_mouvement,
      devise,
      created_by,
      ip,
      user_agent
    } = data;

    if (!caisse_id || !montant || montant <= 0) {
      throw new Error('Invalid data');
    }

    // 🔒 LOCK CAISSE
    const caisseRes = await client.query(
      `SELECT * FROM caisse WHERE id = $1 FOR UPDATE`,
      [caisse_id]
    );

    const caisse = caisseRes.rows[0];

    if (!caisse) throw new Error('Caisse not found');

    if (caisse.state !== 'OUVERTE') {
      throw new Error('Caisse non ouverte');
    }

    const isSortie =
      type_mouvement === 'RETRAIT_SORTIE' ||
      type_mouvement === 'TRANSFERT_SORTIE';

    let soldeChange = isSortie ? -montant : montant;

    if (isSortie && caisse.solde < montant) {
      throw new Error('Solde insuffisant');
    }

    // 💰 UPDATE SOLDE
    await client.query(
      `UPDATE caisse SET solde = solde + $1 WHERE id = $2`,
      [soldeChange, caisse_id]
    );

    // 🔥 CODE AUTO
    const code_reference = generateReference('MVT');

    // 💾 INSERT MOUVEMENT
    const mouvementRes = await client.query(
      `INSERT INTO mouvement_caisse
      (caisse_id, type_mouvement, montant, devise, code_reference, created_by)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [caisse_id, type_mouvement, montant, devise, code_reference, created_by]
    );

    const mouvement = mouvementRes.rows[0];

    // 📊 LEDGER
    await client.query(
      `INSERT INTO ledger
      (type_operation, montant, devise, sens, caisse_id, reference_id, reference_type)
      VALUES ($1,$2,$3,$4,$5,$6,$7)`,
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

    // 🔐 AUDIT
    await logAudit({
      user_id: created_by,
      action: 'CREATE',
      table_name: 'mouvement_caisse',
      code_reference: code_reference,
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

// 🔹 ADMIN ONLY
export async function getAllMouvementsService(page: number, limit: number) {
  return await getAllMouvementsPaginated(page, limit);
}

// 🔹 PAR AGENCE
export async function getMouvementsByAgenceService(
  agence_id: string,
  page = 1,
  limit = 10
) {
  if (!agence_id) {
    throw new Error('agence_id requis');
  }

  const offset = (page - 1) * limit;

  return await getMouvementsByAgence(agence_id, limit, offset);
}
