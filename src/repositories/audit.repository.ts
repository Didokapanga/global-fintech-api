import { query } from '../database/db.js';

export async function createAuditLog(data: any) {
  await query(
    `INSERT INTO audit_log
    (user_id, action, table_name, code_reference,
     old_data, new_data, ip_address, user_agent)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      data.user_id,
      data.action,
      data.table_name,
      data.code_reference,
      data.old_data,
      data.new_data,
      data.ip_address,
      data.user_agent
    ]
  );
}