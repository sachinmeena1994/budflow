
import { supabase } from "@/integrations/supabase/client";

export interface AuditLogEntry {
  table_name: string;
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data?: Record<string, any> | null;
  new_data?: Record<string, any> | null;
  changed_by: string;
  changed_at?: string;
  comment?: string;
}

export async function logAuditChange({
  tableName,
  recordId,
  operation,
  oldData = null,
  newData = null,
  userId,
  comment
}: {
  tableName: string;
  recordId: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  oldData?: Record<string, any> | null;
  newData?: Record<string, any> | null;
  userId: string;
  comment?: string;
}) {
  try {
    const auditEntry: AuditLogEntry = {
      table_name: tableName,
      record_id: recordId,
      operation,
      old_data: oldData,
      new_data: newData,
      changed_by: userId,
      changed_at: new Date().toISOString(),
      comment
    };

    const { error } = await supabase
      .from('audit_logs')
      .insert(auditEntry);

    if (error) {
      console.error('Audit logging failed:', error);
      throw error;
    }

    console.log(`Audit log created: ${operation} on ${tableName} record ${recordId}`);
  } catch (error) {
    console.error('Error in logAuditChange:', error);
    throw error;
  }
}

export async function fetchAuditHistory(tableName: string, recordId: string) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('changed_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch audit history:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching audit history:', error);
    throw error;
  }
}
