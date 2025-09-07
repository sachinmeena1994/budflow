import { supabase } from "@/integrations/supabase/client";
import { useAuditLogger } from "./useAuditLogger";
import { WorkTypeEntryWithHistory } from "./types";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
export function useEntryActions(selectedWorkType: string) {
  const { logAction } = useAuditLogger();
  const { user } = useAuth();
  const USER_ID = user?.id;
  const deepCopy = (o: any) => JSON.parse(JSON.stringify(o));

  const cleanEditData = (entry: WorkTypeEntryWithHistory) => {
    const allowedFields = [
      "work_entry_id",
      "work_type_code",
      "site_id",
      "batch_ref",
      "technician_refs",
      "approval_status",
      "approved_by",
      "approved_at",
      "archived_at",
      "created_by",
      "created_at",
      "entry_payload",
      "task_id",
    ];

    const cleanedEntry: any = {};
    for (const [key, value] of Object.entries(entry)) {
      if (allowedFields.includes(key)) cleanedEntry[key] = value;
    }

    cleanedEntry.created_by = cleanedEntry.created_by || USER_ID;
    cleanedEntry.entry_payload = cleanedEntry.entry_payload || {};
    cleanedEntry.site_id = cleanedEntry.site_id || null;
    cleanedEntry.work_type_code = cleanedEntry.work_type_code || selectedWorkType;

    return cleanedEntry;
  };

  /** ADD */
  const handleAdd = async (entry: WorkTypeEntryWithHistory) => {
    try {
      const cleanedEntry = cleanEditData(entry);
      cleanedEntry.approval_status = "Submitted";

      // ensure date in payload (normalized to today if missing)
      if (!cleanedEntry.entry_payload?.date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        cleanedEntry.entry_payload = {
          ...cleanedEntry.entry_payload,
          date: format(today, "MM/dd/yyyy"),
        };
      }

      const { data, error } = await supabase
        .from("work_entries")
        .insert(cleanedEntry)
        .select("*")
        .single();
      if (error) throw error;

      await logAction("add", data.work_entry_id, data.server_task_id, {
        oldData: null,
        newData: deepCopy(data),
      });

      return data;
    } catch (error) {
      console.error("❌ Error adding entry:", error);
      throw error;
    }
  };

  /** EDIT */
  const handleEdit = async (entryId: string, updatedEntry: WorkTypeEntryWithHistory) => {
    try {
      const { data: currentEntry } = await supabase
        .from("work_entries")
        .select("*")
        .eq("work_entry_id", entryId)
        .single();

      const cleanedEntry = cleanEditData(updatedEntry);

      if (
        cleanedEntry.approval_status !== "Approved" &&
        cleanedEntry.approval_status !== "Rejected"
      ) {
        cleanedEntry.approval_status = "Submitted";
      }

      const { data, error } = await supabase
        .from("work_entries")
        .update(cleanedEntry)
        .eq("work_entry_id", entryId)
        .select("*")
        .single();
      if (error) throw error;

      await logAction("edit", data.work_entry_id, data.server_task_id, {
        oldData: deepCopy(currentEntry),
        newData: deepCopy(data),
      });

      return { ...data, has_history: true };
    } catch (error) {
      console.error("❌ Error updating entry:", error);
      throw error;
    }
  };

  /**
   * DELETE (single or bulk in one call)
   * - Filters out Approved rows (never deleted)
   * - Logs all deletions in ONE audit call
   */
  const handleDelete = async (entryIds: string | string[], opts?: { silent?: boolean }) => {
    const ids = Array.isArray(entryIds) ? Array.from(new Set(entryIds)) : [entryIds];
    const silent = !!opts?.silent;

    try {
      if (!ids.length) {
        if (!silent) toast.error("No entries selected");
        return;
      }

      // Fetch latest rows to decide what can be deleted and to log old data
      const { data: currentEntries, error: fetchErr } = await supabase
        .from("work_entries")
        .select(
          "work_entry_id, server_task_id, approval_status, work_type_code, site_id, entry_payload"
        )
        .in("work_entry_id", ids);
      if (fetchErr) throw fetchErr;

      const isApproved = (s?: string) => (s ?? "").toLowerCase() === "approved";

      
      const deletable = (currentEntries ?? []).filter(
        (r) => !isApproved(r.approval_status)
      );
      const deletableIds = deletable.map((r) => r.work_entry_id);
      const skippedCount = ids.length - deletableIds.length;

      if (!deletableIds.length) {
        if (!silent) toast.error("All selected entries are Approved and cannot be deleted");
        return;
      }

      // Single round-trip bulk delete
      const { error: delErr } = await supabase
        .from("work_entries")
        .delete()
        .in("work_entry_id", deletableIds);
      if (delErr) throw delErr;

      // Bulk audit log (one call)
      await logAction(
        "delete",
        deletable.map((row) => ({
          taskId: row.server_task_id,
          oldData: deepCopy(row),
          newData: null,
        }))
      );

      if (!silent) {
        if (skippedCount > 0) {
          toast.success(
            `Deleted ${deletableIds.length} entr${deletableIds.length === 1 ? "y" : "ies"}. Skipped ${skippedCount} approved entr${skippedCount === 1 ? "y" : "ies"}.`
          );
        } else {
          toast.success(
            `Successfully deleted ${deletableIds.length} entr${deletableIds.length === 1 ? "y" : "ies"}`
          );
        }
      }
    } catch (error) {
      console.error("❌ Error deleting entry(ies):", error);
      if (!silent) {
        toast.error(
          Array.isArray(entryIds) && entryIds.length > 1
            ? "Failed to delete some entries"
            : "Failed to delete entry"
        );
      }
      throw error;
    }
  };

  // (Optional) alias for clarity where you want explicit bulk semantics
  const handleDeleteMany = async (ids: string[], opts?: { silent?: boolean }) =>
    handleDelete(ids, opts);

  return {
    handleAdd,
    handleEdit,
    handleDelete,      
    handleDeleteMany,  // optional alias
  };
}
