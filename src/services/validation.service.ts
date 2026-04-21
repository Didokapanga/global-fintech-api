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

    // 🔒 LOCK opération
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
    // 🔥 LOGIQUE MÉTIER
    // =====================================================

    if (decision === 'APPROUVE') {

      // =========================
      // 🟢 TRANSFERT CLIENT
      // =========================
      if (operation_type === 'TRANSFERT_CLIENT') {

        // ❌ interdiction auto-validation
        if (operation.created_by === validated_by) {
          throw new Error('Un agent ne peut pas valider son propre transfert');
        }

        // 🔐 sécurité rôle (optionnel mais recommandé)
        if (!['ADMIN', 'N+1', 'N+2'].includes(user_agent.role_name)) {
          throw new Error('Accès refusé');
        }

        if (oldStatus !== 'INITIE') {
          throw new Error('Transfert déjà traité');
        }

        newStatus = 'VALIDE';
      }

      // =========================
      // 🔵 TRANSFERT CAISSE (DOUBLE VALIDATION)
      // =========================
      if (operation_type === 'TRANSFERT_CAISSE') {

        // 🔍 récupérer agents des caisses
        const sourceRes = await client.query(
          `SELECT agent_id FROM caisse WHERE id = $1`,
          [operation.caisse_source_id]
        );

        const destRes = await client.query(
          `SELECT agent_id FROM caisse WHERE id = $1`,
          [operation.caisse_destination_id]
        );

        const sourceAgent = sourceRes.rows[0]?.agent_id;
        const destAgent = destRes.rows[0]?.agent_id;

        if (!sourceAgent || !destAgent) {
          throw new Error('Agents de caisse introuvables');
        }

        // ❌ sécurité : même agent interdit
        if (sourceAgent === destAgent) {
          throw new Error('Même agent interdit pour double validation');
        }

        // 🔥 N1 → SOURCE
        if (niveau === 'N1') {

          if (validated_by !== sourceAgent) {
            throw new Error('Seul le caissier source peut valider N1');
          }

          if (oldStatus !== 'INITIE') {
            throw new Error('Déjà validé au niveau 1');
          }

          newStatus = 'VALIDE';
        }

        // 🔥 N2 → DESTINATION
        if (niveau === 'N2') {

          if (validated_by !== destAgent) {
            throw new Error('Seul le caissier destination peut valider N2');
          }

          if (oldStatus !== 'VALIDE') {
            throw new Error('Validation N1 requise avant N2');
          }

          newStatus = 'EXECUTE';
        }
      }
    }

    // =========================
    // ❌ REJET
    // =========================
    if (decision === 'REJETE') {
      newStatus = 'REJETE';
    }

    // =====================================================
    // 🔄 UPDATE STATUT
    // =====================================================
    await client.query(
      `UPDATE ${table}
       SET statut = $1
       WHERE id = $2`,
      [newStatus, reference_id]
    );

    // =====================================================
    // 💰 EXECUTION (TRANSFERT CAISSE UNIQUEMENT)
    // =====================================================
    if (newStatus === 'EXECUTE' && operation_type === 'TRANSFERT_CAISSE') {
      const montant = Number(operation.montant);

      // 🔻 débit source
      await client.query(
        `UPDATE caisse SET solde = solde - $1 WHERE id = $2`,
        [montant, operation.caisse_source_id]
      );

      // 🔺 crédit destination
      await client.query(
        `UPDATE caisse SET solde = solde + $1 WHERE id = $2`,
        [montant, operation.caisse_destination_id]
      );
    }

    // =====================================================
    // 📝 LOG VALIDATION
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

    // =====================================================
    // 🔐 AUDIT
    // =====================================================
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