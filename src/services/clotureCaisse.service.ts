import { db } from '../database/connection.js';
import {
  findCaisseForUpdate,
  createCloture,
  closeCaisse,
  updateClotureStatus
} from '../repositories/clotureCaisse.repository.js';
import { logAudit } from '../utils/auditLogger.js';

export async function clotureCaisseService(data: any) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const { caisse_id, solde_physique, ecart, created_by } = data;

    const caisse = await findCaisseForUpdate(client, caisse_id);

    if (!caisse) {
      throw new Error('Caisse introuvable');
    }

    if (caisse.state !== 'OUVERTE') {
      throw new Error('Caisse déjà fermée');
    }

    const solde_systeme = Number(caisse.solde);
    const solde_physique_num = Number(solde_physique);

    if (isNaN(solde_physique_num)) {
      throw new Error('Solde physique invalide');
    }

    // ✅ logique flexible
    let ecartFinal: number;

    if (ecart !== undefined && ecart !== null) {
      ecartFinal = Number(ecart);

      if (isNaN(ecartFinal)) {
        throw new Error('Ecart invalide');
      }
    } else {
      ecartFinal = solde_physique_num - solde_systeme;
    }

    const cloture = await createCloture(client, {
      caisse_id,
      solde_systeme,
      solde_physique: solde_physique_num,
      ecart: ecartFinal,
      devise: caisse.devise,
      created_by
    });

       await logAudit({
        user_id: created_by,
        action: 'CREATE',
        table_name: 'cloture_caisse',
        code_reference: cloture.id,
        new_data: cloture
      });

    await closeCaisse(client, caisse_id);

    await client.query('COMMIT');

    return {
      message: 'Clôture effectuée',
      cloture
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

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