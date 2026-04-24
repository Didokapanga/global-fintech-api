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
      user_agent,
      user
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

    // =====================================================
    // 🔥 APPROUVE
    // =====================================================
    if (decision === 'APPROUVE') {

      // =========================
      // 🟢 TRANSFERT CLIENT
      // =========================
      if (operation_type === 'TRANSFERT_CLIENT') {

        if (operation.created_by === validated_by) {
          throw new Error('Un agent ne peut pas valider son propre transfert');
        }

        if (!['ADMIN', 'N+1', 'N+2'].includes(user.role_name)) {
          throw new Error('Accès refusé');
        }

        if (oldStatus !== 'INITIE') {
          throw new Error('Transfert déjà traité');
        }

        newStatus = 'VALIDE';
      }

      // =========================
      // 🔵 TRANSFERT CAISSE
      // =========================
      if (operation_type === 'TRANSFERT_CAISSE') {

        const sourceRes = await client.query(
          `SELECT agent_id, agence_id FROM caisse WHERE id = $1`,
          [operation.caisse_source_id]
        );

        const destRes = await client.query(
          `SELECT agent_id, agence_id FROM caisse WHERE id = $1`,
          [operation.caisse_destination_id]
        );

        const source = sourceRes.rows[0];
        const dest = destRes.rows[0];

        if (!source || !dest) {
          throw new Error('Caisse introuvable');
        }

        // 🔥 N1
        if (niveau === 'N1') {

          if (source.agent_id) {
            if (validated_by !== source.agent_id) {
              throw new Error('Seul le propriétaire source peut valider');
            }
          } else {
            if (user.agence_id !== source.agence_id) {
              throw new Error('Validation interdite hors agence');
            }
          }

          if (oldStatus !== 'INITIE') {
            throw new Error('Déjà validé N1');
          }

          newStatus = 'VALIDE';
        }

        // 🔥 N2
        if (niveau === 'N2') {

          if (dest.agent_id) {
            if (validated_by !== dest.agent_id) {
              throw new Error('Seul le propriétaire destination peut valider');
            }
          } else {
            if (user.agence_id !== dest.agence_id) {
              throw new Error('Validation interdite hors agence');
            }
          }

          if (oldStatus !== 'VALIDE') {
            throw new Error('Validation N1 requise');
          }

          newStatus = 'EXECUTE';
        }
      }
    }

    // =====================================================
    // ❌ REJET
    // =====================================================
    if (decision === 'REJETE') {
      newStatus = 'REJETE';
    }

    // =====================================================
    // 🔄 UPDATE
    // =====================================================
    await client.query(
      `UPDATE ${table} SET statut = $1 WHERE id = $2`,
      [newStatus, reference_id]
    );

    // =====================================================
    // 💰 EXECUTION
    // =====================================================
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

    // =====================================================
    // 📝 LOG
    // =====================================================
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