import { db } from '../database/connection.js';
import { logAudit } from '../utils/auditLogger.js';

export async function transfertCaisseService(data: any) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const {
      caisse_source_id,
      caisse_destination_id,
      montant,
      devise,
      created_by,
      ip,
      user_agent
    } = data;

    if (!caisse_source_id || !caisse_destination_id || montant <= 0) {
      throw new Error('Invalid data');
    }

    if (caisse_source_id === caisse_destination_id) {
      throw new Error('Même caisse interdite');
    }

    // 🔒 lock
    const sourceRes = await client.query(
      `SELECT * FROM caisse WHERE id = $1 FOR UPDATE`,
      [caisse_source_id]
    );

    const destRes = await client.query(
      `SELECT * FROM caisse WHERE id = $1 FOR UPDATE`,
      [caisse_destination_id]
    );

    const source = sourceRes.rows[0];
    const dest = destRes.rows[0];

    if (!source || !dest) {
      throw new Error('Caisse introuvable');
    }

    if (source.state !== 'OUVERTE' || dest.state !== 'OUVERTE') {
      throw new Error('Caisse non ouverte');
    }

    if (source.solde < montant) {
      throw new Error('Solde insuffisant');
    }

    // 💾 INSERT SEULEMENT 🔥
    const transfertRes = await client.query(
      `INSERT INTO transfert_caisse
      (caisse_source_id, caisse_destination_id, montant, devise, created_by, statut)
      VALUES ($1,$2,$3,$4,$5,'INITIE')
      RETURNING *`,
      [caisse_source_id, caisse_destination_id, montant, devise, created_by]
    );

    const transfert = transfertRes.rows[0];

    await client.query('COMMIT');

    // 🔐 audit AFTER COMMIT
    await logAudit({
      user_id: created_by,
      action: 'CREATE',
      table_name: 'transfert_caisse',
      code_reference: transfert.id,
      new_data: transfert,
      ip_address: ip,
      user_agent
    });

    return transfert;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;

  } finally {
    client.release();
  }
}