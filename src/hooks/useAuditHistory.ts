
import { useState, useEffect ,useCallback} from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  id: string;
  actor_name: string;
  version: number;
  log_id: string;
  entity_id: string;
  task_id: string;
  action: string;
  changes: {
    newData?: Record<string, any>;
    oldData?: Record<string, any>;
  };
  timestamp: string;
  actor_id: string;
  users: {
    full_name: string;
  };
}

export interface HistoryDiff {
  field: string;
  oldValue: any;
  newValue: any;
}

export function formatFieldValue(value: any): string {
  if (value === null || value === undefined || value === "") return "-";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

export function createFieldFormatter(options: {
  siteOptions?: { id: string; label: string }[];
  strainOptions?: { id: string; name: string }[];
  technicianOptions?: { id: string; name: string }[];
  userOptions?: { id: string; name: string }[];
  batchOptions?: { id: string; product_name: string }[];
}) {
  return function formatValue(value: any, key: string): string {
    if (value === null || value === undefined || value === "") return "-";

    switch (key) {
      case "site_id":
        return options.siteOptions?.find(s => s.id === value)?.label || value;
      case "strain":
        return options.strainOptions?.find(s => s.id === value)?.name || value;
      case "batch_ref":
        return options.batchOptions?.find(b => b.id === value)?.product_name || value;
      case "technician_refs":
        return Array.isArray(value)
          ? value
              .map(id => options.technicianOptions?.find(t => t.id === id)?.name || id)
              .join(", ")
          : value;
      case "created_by":
      case "approved_by":
        return options.userOptions?.find(u => u.id === value)?.name || value;
      default:
        return typeof value === "object" ? JSON.stringify(value) : String(value);
    }
  };
}



export function getDiffChanges(auditLog: AuditLogEntry): HistoryDiff[] {
  const diffs: HistoryDiff[] = [];
  
  if (!auditLog.changes) return diffs;

  const oldData = auditLog.changes.oldData || {};
  const newData = auditLog.changes.newData || {};

  // Get all unique field names from both old and new data
  const allFields = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

  for (const field of allFields) {
    const oldValue = oldData[field];
    const newValue = newData[field];

    // Only include changes where values are actually different
    if (oldValue !== newValue) {
      diffs.push({
        field,
        oldValue,
        newValue,
      });
    }
  }

  return diffs;
}

export function useAuditHistory(entryId: string) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditHistory = useCallback(async () => {
    if (!entryId) return;
    setIsLoading(true);
    setError(null);
    try {
   const { data, error } = await supabase
  .from("audit_logs")
  .select(`*, users:actor_id ( full_name )`)
  .contains("changes->newData", { work_entry_id: entryId })
  .order("timestamp", { ascending: false });
      if (error) throw error;

      const formattedLogs: AuditLogEntry[] = (data || []).map((log, index) => ({
        id: log.log_id,
        actor_name: log.users?.full_name || "Unknown User",
        version: (data || []).length - index,
        log_id: log.log_id,
        entity_id: log.entity_id,
        task_id: log.task_id || "",
        action: log.action,
        changes: {
          newData: (log.changes as any)?.newData || {},
          oldData: (log.changes as any)?.oldData || {},
        },
        timestamp: log.timestamp,
        actor_id: log.actor_id || "",
        users: { full_name: log.users?.full_name || "Unknown User" },
      }));

      setAuditLogs(formattedLogs);
    } catch (e) {
      console.error("Error fetching audit history:", e);
      setError("Failed to fetch audit history");
    } finally {
      setIsLoading(false);
    }
  }, [entryId]);

  useEffect(() => {
    fetchAuditHistory();
  }, [fetchAuditHistory]);

  return {
    auditLogs,
    isLoading,
    error,
    refetch: fetchAuditHistory, // <- stable now
  };
}

