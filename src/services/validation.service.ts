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
      commentaire,
      ip,
      user_agent
    } = data;

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
    if (!operation) throw new Error('Opération introuvable');

    const oldStatus = operation.statut;

    if (oldStatus === 'REJETE' || oldStatus === 'EXECUTE') {
      throw new Error('Opération déjà terminée');
    }

    let newStatus = oldStatus;

    // 🔥 logique métier
    if (decision === 'APPROUVE') {
      if (operation_type === 'TRANSFERT_CLIENT') {
        newStatus = 'VALIDE'; // ✅ jamais EXECUTE ici
      }

      if (operation_type === 'TRANSFERT_CAISSE') {
        if (niveau === 'N2') newStatus = 'EXECUTE';
        else newStatus = 'VALIDE';
      }
    }

    if (decision === 'REJETE') {
      newStatus = 'REJETE';
    }

    await client.query(
      `UPDATE ${table}
       SET statut = $1
       WHERE id = $2`,
      [newStatus, reference_id]
    );

    // ❌ AUCUNE ACTION CASH POUR TRANSFERT CLIENT

    // 🔁 transfert caisse uniquement
    if (newStatus === 'EXECUTE' && operation_type === 'TRANSFERT_CAISSE') {
      const montant = Number(operation.montant);

      await client.query(
        `UPDATE caisse SET solde = solde - $1 WHERE id = $2`,
        [montant, operation.caisse_source_id]
      );

      await client.query(
        `UPDATE caisse SET solde = solde + $1 WHERE id = $2`,
        [montant, operation.caisse_destination_id]
      );
    }

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

    await client.query('COMMIT');

    await logAudit({
      user_id: validated_by,
      action: 'VALIDATE',
      table_name: operation_type,
      code_reference: reference_id,
      old_data: { statut: oldStatus },
      new_data: { statut: newStatus },
      ip_address: ip,
      user_agent
    });

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
