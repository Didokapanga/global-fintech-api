import { db } from '../database/connection.js';
import bcrypt from 'bcrypt';
import { generateCode } from '../utils/codeGenerator.js';
import { createTransfertClientTx } from '../repositories/transfertClient.repository.js';
import { logAudit } from '../utils/auditLogger.js';


export async function createTransfertClientService(data: any) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const {
      caisse_id,
      montant,
      devise,
      type_piece,
      numero_piece
    } = data;

    if (!montant || montant <= 0) {
      throw new Error('Montant invalide');
    }

    if (!type_piece || !numero_piece) {
      throw new Error('Pièce d’identité requise');
    }

    // 🔍 caisse lock
    const caisseRes = await client.query(
      `SELECT * FROM caisse WHERE id = $1 FOR UPDATE`,
      [caisse_id]
    );

    const caisse = caisseRes.rows[0];

    if (!caisse || caisse.state !== 'OUVERTE') {
      throw new Error('Caisse non disponible');
    }

    if (caisse.solde < montant) {
      throw new Error('Solde insuffisant');
    }

    // 🔐 code secret
    const code = generateCode();
    const hash = await bcrypt.hash(code, 10);

    const code_reference = 'REF' + Date.now();

    // 🔻 débit caisse
    await client.query(
      `UPDATE caisse SET solde = solde - $1 WHERE id = $2`,
      [montant, caisse_id]
    );

    // 💾 insertion via repo
    const transfert = await createTransfertClientTx(client, {
      ...data,
      type_piece,
      numero_piece,
      montant,
      devise,
      frais: data.frais ?? 0,
      commission: data.commission ?? 0,
      code_secret_hash: hash,
      code_reference
    });

    // 📊 ledger SORTIE
    await client.query(
      `INSERT INTO ledger
      (type_operation, montant, devise, sens, caisse_id, reference_id, reference_type)
      VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        'TRANSFERT_CLIENT',
        montant,
        devise,
        'SORTIE',
        caisse_id,
        transfert.id,
        'TRANSFERT_CLIENT'
      ]
    );

    await logAudit({
      user_id: data.created_by,
      action: 'CREATE',
      table_name: 'transfert_client',
      code_reference: transfert.code_reference,
      new_data: transfert,
      ip_address: data.ip,
      user_agent: data.user_agent
    });

    await client.query('COMMIT');

    return {
      transfert,
      code_secret: code // ⚠️ une seule fois
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}