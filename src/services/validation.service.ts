import { db } from '../database/connection.js';
import { createValidationLog } from '../repositories/validation.repository.js';
import { logAudit } from '../utils/auditLogger.js';

export async function validateOperationService(data: any) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const {
      operation_type,
      reference_id,
      decision,
      niveau,
      validated_by,
      commentaire
    } = data;

    // 🔍 récupérer opération
    const tableMap: any = {
      TRANSFERT_CLIENT: 'transfert_client',
      RETRAIT: 'retrait',
      TRANSFERT_CAISSE: 'transfert_caisse'
    };

    const table = tableMap[operation_type];

    if (!table) throw new Error('Type opération invalide');

    const res = await client.query(
      `SELECT * FROM ${table} WHERE id = $1 FOR UPDATE`,
      [reference_id]
    );

    const operation = res.rows[0];

    if (!operation) {
      throw new Error('Opération introuvable');
    }

    const oldStatus = operation.statut;

    if (oldStatus !== 'INITIE') {
      throw new Error('Opération déjà traitée');
    }

    let newStatus = oldStatus;

    // 🧠 logique validation
    if (decision === 'APPROUVE') {
      newStatus = 'VALIDE';
    }

    if (decision === 'REJETE') {
      newStatus = 'REJETE';
    }

    // 🔄 update statut
    await client.query(
      `UPDATE ${table}
       SET statut = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newStatus, reference_id]
    );

    // 📝 log validation
    await createValidationLog({
      operation_type,
      reference_id,
      validated_by,
      niveau,
      decision,
      commentaire,
      statut_avant: oldStatus,
      statut_apres: newStatus
    });

    await logAudit({
      user_id: validated_by,
      action: 'VALIDATE',
      table_name: operation_type,
      code_reference: reference_id,
      old_data: { statut: oldStatus },
      new_data: { statut: newStatus }
    });

    await client.query('COMMIT');

    return {
      message: 'Validation effectuée',
      statut: newStatus
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}