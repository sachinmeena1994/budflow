import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from '@/context/AuthContext';

export interface ApprovalEntry {
  id: string;
  server_task_id: string;
  task_id: string;
  work_type: string;
  site_id: string;
  batch_product_id: string;
  technician_refs: string[];
  approval_status: string;
  created_by: string;
  created_at: string;
  entry_payload: Record<string, any>;
  approved_by?: string;
  approved_at?: string;
}

export type ApproveRejectOpts = { silent?: boolean };

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  if (data?.user?.id) return data.user.id;

  try {
    const raw = localStorage.getItem("loggedUser");
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.id) return String(u.id);
    }
  } catch {}
  return null;
}

async function nextAuditVersion(taskId: string): Promise<number> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("log_id")
    .eq("task_id", taskId);

  if (error) {
    console.warn("audit version lookup failed:", error.message);
    return 1;
  }
  return (data?.length ?? 0) + 1;
}

export function useApprovalsManager(onCountChange?: (count: number) => void) {
    const { user } = useAuth();
  const [entries, setEntries] = useState<ApprovalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updateEntries = (updated: ApprovalEntry[]) => {
    setEntries(updated);
    onCountChange?.(updated.length);
  };

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_entries')
        .select('*')
        .eq('approval_status', 'Submitted')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted: ApprovalEntry[] = (data || []).map(entry => ({
        id: entry.work_entry_id,
        server_task_id: entry.server_task_id || entry.task_id || entry.work_entry_id,
        task_id: entry.task_id || entry.work_entry_id,
        work_type: entry.work_type_code || '',
        site_id: entry.site_id || '',
        batch_product_id: entry.batch_ref || '',
        technician_refs: entry.technician_refs || [],
        approval_status: entry.approval_status || 'Draft',
        created_by: entry.created_by || '',
        created_at: entry.created_at || '',
        approved_by: entry.approved_by || '',
        approved_at: entry.approved_at || '',
        entry_payload: (entry.entry_payload as Record<string, any>) || {},
      }));

      updateEntries(formatted);
    } catch (error) {
      console.error('Error fetching approval entries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch approval entries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

const approveEntry = async (entryIds: string | string[], comment?: string, opts?: ApproveRejectOpts) => {
  const ids = Array.isArray(entryIds) ? Array.from(new Set(entryIds)) : [entryIds];
  if (!ids.length) return;

  try {
    const actorId = user?.id
    const { data: rows, error } = await supabase
      .from("work_entries")
      .select("*")
      .in("work_entry_id", ids);

    if (error) throw error;

    const now = new Date().toISOString();
    const updates = rows.map(r => ({
      ...r,
      approval_status: "Approved",
      approved_at: now,
      approved_by: actorId,
      entry_payload: { ...(r.entry_payload ?? {}), approval_comment: comment ?? null }
    }));

    await supabase.from("work_entries").upsert(updates, { onConflict: "work_entry_id" });

    // --- Single query for audit versions ---
    const { data: existingLogs, error: logErr } = await supabase
      .from("audit_logs")
  .select("task_id")
  .in("task_id", ids)

    if (logErr) console.warn("audit lookup error:", logErr.message);

    const versionMap: Record<string, number> = {};
    existingLogs?.forEach((row: any) => {
      versionMap[row.task_id] = (row.count ?? 0) + 1;
    });

    const auditLogs = updates.map((newRow, i) => ({
      log_id: uuidv4(),
      entity_id:  newRow.work_entry_id,
      entity_type: "work_entry",
      task_id: newRow.server_task_id,
      actor_id: actorId,
      action: "approve",
      changes: {
        oldData: rows[i],
        newData: newRow,
        version: versionMap[newRow.work_entry_id] ?? 1,
        timestamp: now,
        description: "approve performed",
      },
      timestamp: now,
    }));

    await supabase.from("audit_logs").insert(auditLogs);

    updateEntries(prev => prev.filter(e => !ids.includes(e.id)));
    if (!opts?.silent) {
      toast({
        title: "Approved",
        description: `${ids.length} entr${ids.length > 1 ? "ies" : "y"} approved successfully`,
      });
    }
  } catch (err) {
    console.error("Error approving:", err);
    toast({
      title: "Error",
      description: "Failed to approve",
      variant: "destructive",
    });
  }
};

const rejectEntry = async (entryIds: string | string[], reason?: string, opts?: ApproveRejectOpts) => {
  const ids = Array.isArray(entryIds) ? Array.from(new Set(entryIds)) : [entryIds];
  if (!ids.length) return;

  try {
   const actorId = user?.id
    const { data: rows, error } = await supabase
      .from("work_entries")
      .select("*")
      .in("work_entry_id", ids);

    if (error) throw error;

    const now = new Date().toISOString();
    const updates = rows.map(r => ({
      ...r,
      approval_status: "Rejected",
      approved_at: now,
      approved_by: actorId,
      entry_payload: { ...(r.entry_payload ?? {}), approval_comment: reason ?? null }
    }));

    await supabase.from("work_entries").upsert(updates, { onConflict: "work_entry_id" });

    // --- Single query for audit versions ---
    const { data: existingLogs, error: logErr } = await supabase
      .from("audit_logs")
  .select("task_id")
  .in("task_id", ids)

    if (logErr) console.warn("audit lookup error:", logErr.message);

    const versionMap: Record<string, number> = {};
    existingLogs?.forEach((row: any) => {
      versionMap[row.task_id] = (row.count ?? 0) + 1;
    });

    const auditLogs = updates.map((newRow, i) => ({
      log_id: uuidv4(),
      entity_id:  newRow.work_entry_id,
      entity_type: "work_entry",
      task_id: newRow.server_task_id,
      actor_id: actorId,
      action: "reject",
      changes: {
        oldData: rows[i],
        newData: newRow,
        version: versionMap[newRow.work_entry_id] ?? 1,
        timestamp: now,
        description: "reject performed",
      },
      timestamp: now,
    }));

    await supabase.from("audit_logs").insert(auditLogs);

    updateEntries(prev => prev.filter(e => !ids.includes(e.id)));
    if (!opts?.silent) {
      toast({
        title: "Rejected",
        description: `${ids.length} entr${ids.length > 1 ? "ies" : "y"} rejected successfully`,
      });
    }
  } catch (err) {
    console.error("Error rejecting:", err);
    toast({
      title: "Error",
      description: "Failed to reject",
      variant: "destructive",
    });
  }
};



  const deleteEntry = async (entryIds: string | string[]) => {
    const ids = Array.isArray(entryIds) ? Array.from(new Set(entryIds)) : [entryIds];
    if (!ids.length) return;

    try {
      const { data: currentRows, error: fetchErr } = await supabase
        .from("work_entries")
        .select("work_entry_id, server_task_id, work_type_code, site_id, entry_payload")
        .in("work_entry_id", ids);

      if (fetchErr) throw fetchErr;

      const { error: delErr } = await supabase
        .from("work_entries")
        .delete()
        .in("work_entry_id", ids);

      if (delErr) throw delErr;

      if (currentRows?.length) {
        const now = new Date().toISOString();
 const auditLogs = currentRows.map((row) => ({
  log_id: uuidv4(),
  entity_id: "system",
  entity_type: "work_entry",
  task_id: row.work_entry_id,
  actor_id: "system",
  action: "delete",
  changes: {
    oldData: row,
    newData: null,
    version: 1, // or compute separately if needed
    timestamp: now,
    description: "delete performed",
  },
  timestamp: now,
}));
;

   await supabase.from("audit_logs").insert(auditLogs);
      }

      updateEntries(prev => prev.filter(e => !ids.includes(e.id)));
      toast({
        title: "Deleted",
        description: `${ids.length} entr${ids.length > 1 ? "ies" : "y"} deleted successfully`
      });
    } catch (error) {
      console.error("Error deleting entries:", error);
      toast({
        title: "Error",
        description: "Failed to delete entries",
        variant: "destructive",
      });
    }
  };

  const refetch = async () => {
    await fetchEntries();
  };

  useEffect(() => {
    fetchEntries();

    const channel = supabase
      .channel('approval-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'work_entries', filter: 'approval_status=eq.Submitted' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const e = payload.new as any;
            updateEntries(prev => [{
              id: e.work_entry_id,
              server_task_id: e.server_task_id || e.task_id || e.work_entry_id,
              task_id: e.task_id || e.work_entry_id,
              work_type: e.work_type_code || '',
              site_id: e.site_id || '',
              batch_product_id: e.batch_ref || '',
              technician_refs: e.technician_refs || [],
              approval_status: e.approval_status || 'Draft',
              created_by: e.created_by || '',
              created_at: e.created_at || '',
              entry_payload: e.entry_payload || {},
            }, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const e = payload.new as any;
            if (e.approval_status !== 'Submitted') {
              updateEntries(prev => prev.filter(x => x.id !== e.work_entry_id));
            }
          } else if (payload.eventType === 'DELETE') {
            const e = payload.old as any;
            updateEntries(prev => prev.filter(x => x.id !== e.work_entry_id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return {
    entries,
    isLoading,
    approveEntry,
    rejectEntry,
    deleteEntry,
    refetch,
  };
}
