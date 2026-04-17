import { db } from '../database/connection.js';

export async function transfertCaisseService(data: any) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const {
      caisse_source_id,
      caisse_destination_id,
      montant,
      devise
    } = data;

    if (!caisse_source_id || !caisse_destination_id || montant <= 0) {
      throw new Error('Invalid data');
    }

    if (caisse_source_id === caisse_destination_id) {
      throw new Error('Même caisse interdite');
    }

    // 🔍 lock lignes (IMPORTANT anti concurrence)
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

    // 💾 transfert
    const transfertRes = await client.query(
      `INSERT INTO transfert_caisse
      (caisse_source_id, caisse_destination_id, montant, devise)
      VALUES ($1,$2,$3,$4)
      RETURNING *`,
      [caisse_source_id, caisse_destination_id, montant, devise]
    );

    const transfert = transfertRes.rows[0];

    // 🔻 source
    await client.query(
      `UPDATE caisse SET solde = solde - $1 WHERE id = $2`,
      [montant, caisse_source_id]
    );

    // 🔺 destination
    await client.query(
      `UPDATE caisse SET solde = solde + $1 WHERE id = $2`,
      [montant, caisse_destination_id]
    );

    // 📊 ledger source
    await client.query(
      `INSERT INTO ledger
      (type_operation, montant, devise, sens, caisse_id, reference_id, reference_type)
      VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      ['TRANSFERT_CAISSE', montant, devise, 'SORTIE', caisse_source_id, transfert.id, 'TRANSFERT_CAISSE']
    );

    // 📊 ledger destination
    await client.query(
      `INSERT INTO ledger
      (type_operation, montant, devise, sens, caisse_id, reference_id, reference_type)
      VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      ['TRANSFERT_CAISSE', montant, devise, 'ENTREE', caisse_destination_id, transfert.id, 'TRANSFERT_CAISSE']
    );

    await client.query('COMMIT');

    return transfert;

  } catch (error) {
    await client.query('ROLLBACK'); // 🔥 CRITIQUE
    throw error;

  } finally {
    client.release();
  }
}