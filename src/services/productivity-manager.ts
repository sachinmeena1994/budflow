
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { WorkTypeEntry } from "@/components/inventory/workType";
import { generateNextTaskId } from "@/utils/taskIdGenerator";

const currentUserId = "b9647e6b-3ab2-4cbe-ad1f-f86d666567d6";

export interface WorkTypeEntryWithHistory extends WorkTypeEntry {
  has_history: boolean;
  site_name?: string;
  batch_name?: string;
  technician_names?: string;
}

export interface AuditLog {
  id: string;
  entity_id: string;
  user_id: string;
  action: string;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  timestamp: string;
  version: number;
}

export class ProductivityManager {
  private static instance: ProductivityManager;

  public static getInstance(): ProductivityManager {
    if (!ProductivityManager.instance) {
      ProductivityManager.instance = new ProductivityManager();
    }
    return ProductivityManager.instance;
  }

  async loadEntries(selectedWorkType: string): Promise<WorkTypeEntryWithHistory[]> {
    try {
      // Fetch entries from work_entries table
      const { data: entriesData, error: entriesError } = await supabase
        .from("work_entries")
        .select("*");

      if (entriesError) {
        console.error("Failed to fetch entries:", entriesError);
        throw entriesError;
      }

      if (!entriesData || entriesData.length === 0) return [];

      // Fetch reference data
      const [sitesRes, batchesRes, techsRes] = await Promise.all([
        supabase.from("sites").select("id, site_alias"),
        supabase.from("batch").select("id, name"),
        supabase.from("technicians").select("id, name"),
      ]);

      const siteMap = Object.fromEntries((sitesRes.data || []).map(s => [s.id, s.site_name]));
      const batchMap = Object.fromEntries((batchesRes.data || []).map(b => [b.id, b.name]));
      const techMap = Object.fromEntries((techsRes.data || []).map(t => [t.id, t.name]));

      // Check which entries have audit history using task_id (work_entry_id)
      const entryIds = entriesData.map(e => e.server_task_id);
      const { data: auditData } = await supabase
        .from("audit_logs")
        .select("task_id")
        .in("task_id", entryIds);

      const entriesWithHistory = new Set(auditData?.map(a => a.task_id) || []);

      // Enrich entries
      const enrichedEntries = entriesData.map(entry => ({
        ...entry,
        work_type: entry.work_type_code, // Map work_type_code to work_type for compatibility
        id: entry.work_entry_id, // Add id field for UI compatibility
        ...(entry.entry_payload || {}),
        site_name: siteMap[entry.site_id] || "Unknown Site",
        batch_name: batchMap[entry.batch_ref] || "Unknown Batch",
        technician_names: (entry.technician_refs || [])
          .map((id: string) => techMap[id] || "Unknown")
          .join(", "),
        has_history: entriesWithHistory.has(entry.server_task_id),
      }));

      console.log(enrichedEntries, entriesWithHistory,"verify")
      return selectedWorkType === "all"
        ? enrichedEntries
        : enrichedEntries.filter(entry => entry.work_type_code === selectedWorkType);
    } catch (error) {
      console.error("Error loading entries:", error);
      throw error;
    }
  }

  async getNextTaskId(): Promise<string> {
    return await generateNextTaskId();
  }

  async addEntry(entry: WorkTypeEntry): Promise<void> {
    try {
      const dbEntry = this.cleanObject({ ...entry });
      const { error } = await supabase.from("work_entries").insert(dbEntry);

      if (error) {
        console.error("Failed to add entry:", error);
        throw error;
      }

      await this.logAuditEvent({ 
        entityId: entry.work_entry_id, 
        action: "add", 
        newData: dbEntry 
      });
    } catch (error) {
      console.error("Error adding entry:", error);
      throw error;
    }
  }

  async editEntry(id: string, updatedEntry: WorkTypeEntry): Promise<void> {
    try {
      // Clean the entry to only include valid database columns
      const dbEntry = this.cleanEditData(updatedEntry);

      // Get old data for audit log
      const { data: oldData, error: fetchError } = await supabase
        .from("work_entries")
        .select("*")
        .eq("work_entry_id", id)
        .single();

      if (fetchError) {
        console.warn("Could not fetch old data:", fetchError.message);
      }

      const { error } = await supabase
        .from("work_entries")
        .update(dbEntry)
        .eq("work_entry_id", id);

      if (error) {
        console.error("❌ Failed to update entry:", error);
        throw error;
      }

      await this.logAuditEvent({
        entityId: id,
        action: "edit",
        oldData,
        newData: dbEntry,
      });
    } catch (error) {
      console.error("Error editing entry:", error);
      throw error;
    }
  }

  async deleteEntry(id: string): Promise<void> {
    try {
      // Get entry data before deletion for audit log
      const { data: entryData, error: fetchError } = await supabase
        .from("work_entries")
        .select("*")
        .eq("work_entry_id", id)
        .single();

      if (fetchError) {
        console.warn("Could not fetch entry data:", fetchError.message);
      }

      const { error } = await supabase
        .from("work_entries")
        .delete()
        .eq("work_entry_id", id);

      if (error) {
        console.error("❌ Failed to delete entry:", error);
        throw error;
      }

      await this.logAuditEvent({
        entityId: id,
        action: "delete",
        oldData: entryData,
      });
    } catch (error) {
      console.error("Error deleting entry:", error);
      throw error;
    }
  }

  async getAuditLogs(entryId: string): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("task_id", entryId) // Use task_id instead of entity_id
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Failed to fetch audit logs:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      throw error;
    }
  }

  createNewEntry(workType: string): WorkTypeEntry {
    const today = new Date().toISOString().split("T")[0];
    
    return {
      work_entry_id: `temp-${Date.now()}`,
      work_type_code: workType,
      work_type: workType, // Add for compatibility
      site_id: null,
      batch_ref: null,
      approval_status: "Draft",
      created_by: currentUserId,
      created_at: new Date().toISOString(),
      entry_payload: {},
      technician_refs: [],
    };
  }

  private cleanObject(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(obj).filter(([key, value]) => value !== undefined && value !== null)
    );
  }

  // Clean edit data to only include valid database columns
  private cleanEditData(entry: any) {
    const validColumns = {
      work_entry_id: entry.work_entry_id,
      work_type_code: entry.work_type_code || entry.work_type,
      site_id: entry.site_id,
      batch_ref: entry.batch_ref,
      technician_refs: entry.technician_refs,
      approval_status: entry.approval_status,
      created_by: entry.created_by,
      created_at: entry.created_at,
      approved_by: entry.approved_by,
      approved_at: entry.approved_at,
      archived_at: entry.archived_at,
      entry_payload: entry.entry_payload,
    };

    // Remove undefined values
    return Object.fromEntries(
      Object.entries(validColumns).filter(([_, value]) => value !== undefined)
    );
  }

  private async logAuditEvent({ 
    entityId, 
    action, 
    oldData = null, 
    newData = null 
  }: {
    entityId: string;
    action: "add" | "edit" | "delete";
    oldData?: Record<string, any> | null;
    newData?: Record<string, any> | null;
  }): Promise<void> {
    try {
      // Get existing audit logs count for version numbering
      const { data: logs, error: countError } = await supabase
        .from("audit_logs")
        .select("log_id")
        .eq("task_id", entityId)
        .order("timestamp", { ascending: false });

      if (countError) {
        console.error("Failed to get audit logs count:", countError);
      }

      const version = (logs?.length || 0) + 1;

      const { error } = await supabase.from("audit_logs").insert({
        log_id: uuidv4(),
        entity_id: currentUserId, // Use current user ID for entity_id
        entity_type: "work_entry",
        task_id: entityId, // Use work_entry_id as task_id for proper linking
        actor_id: currentUserId,
        action,
        changes: {
          oldData,
          newData,
          version,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });

      if (error) {
        console.error("Failed to write audit log", error);
        throw error;
      }

      console.log(`✅ Audit log created: ${action} on ${entityId} (v${version})`);
    } catch (error) {
      console.error("Error logging audit event:", error);
      // Don't throw here to avoid breaking the main operation
    }
  }
}
