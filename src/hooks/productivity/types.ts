
import { WorkTypeEntry } from "@/components/inventory/workType";

export interface WorkTypeEntryWithHistory extends WorkTypeEntry {
  has_history: boolean;
  site_name?: string;
  batch_name?: string;
  technician_names?: string;
  isNew ?: boolean
}

export interface AuditEventParams {
  entityId: string;
  action: "add" | "edit" | "delete";
  oldData?: Record<string, any> | null;
  newData?: Record<string, any> | null;
  taskId?: string;
}

export interface AuditLogEntry {
  id: string;
  log_id?: string;
  entity_id: string;
  action: string;
  timestamp: string;
  actor_id: string;
  actor_name?: string;
  actorName?: string;
  version: number;
  changes?: Record<string, any>;
}
