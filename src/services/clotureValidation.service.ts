import { db } from '../database/connection.js';
import {
  updateClotureStatus,
  findCaisseForUpdate
} from '../repositories/clotureCaisse.repository.js';

export async function validateClotureService(data: any) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const { cloture_id, decision, validated_by } = data;

    // 🔍 récupérer cloture
    const res = await client.query(
      `SELECT * FROM cloture_caisse WHERE id = $1 FOR UPDATE`,
      [cloture_id]
    );

    const cloture = res.rows[0];

    if (!cloture) {
      throw new Error('Clôture introuvable');
    }

    if (cloture.statut !== 'INITIE') {
      throw new Error('Déjà traitée');
    }

    let newStatus = 'INITIE';

    if (decision === 'APPROUVE') {
      newStatus = 'VALIDE';
    }

    if (decision === 'REJETE') {
      newStatus = 'REJETE';
    }

    const updated = await updateClotureStatus(
      client,
      cloture_id,
      newStatus,
      validated_by
    );

    await client.query('COMMIT');

    return {
      message: 'Clôture validée',
      cloture: updated
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}