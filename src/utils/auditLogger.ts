import { createAuditLog } from '../repositories/audit.repository.js';

export async function logAudit(data: any) {
  try {
    await createAuditLog({
      user_id: data.user_id,
      action: data.action,
      table_name: data.table_name,
      code_reference: data.code_reference,
      old_data: data.old_data || null,
      new_data: data.new_data || null,
      ip_address: data.ip_address || null,
      user_agent: data.user_agent || null
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}