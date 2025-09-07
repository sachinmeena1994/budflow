
import { WorkTypeEntry } from "@/components/inventory/workType";

export interface WorkTypeEntryWithHistory extends WorkTypeEntry {
  has_history: boolean;
  site_name?: string;
  batch_name?: string;
  technician_names?: string;
  created_by_name?: string;
}

export interface WorkTypeField {
  id: string;
  work_type: string;
  field_key: string;
  label: string;
  type: string;
  required: boolean;
  calculated: boolean;
  options?: any;
  order_index?: number;
}

export interface ColumnContext {
  workType: string;
  editingId: string | null;
  tempRow: Record<string, any> | null;
  handleInputChange: (fieldKey: string, value: any) => void;
  onEdit: (entry: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onHistory: (id: string) => void;
  onAddToUnapproved: (id: string) => void;
siteOptions: { id: string; label: string }[];
  batchOptions: { id: string; product_name: string }[];
  technicianOptions: { id: string; name: string }[];
  strainOptions: { id: string; name: string }[];
  userOptions: { id: string; name: string }[];
  isAddingNew: boolean;
  newEntryRef?: React.RefObject<HTMLInputElement>;
  setHistoryModalOpen: (state: { open: boolean; taskId: string }) => void;
  workTypeFields?: Array<{
   field_key: string;
   label: string;
   type: string; // "text" | "number" | "select" | "calculated" ...
   required: boolean;
   calculated: boolean;
   options?: { options?: string[] } | null;
 }>;
}

export interface RenderInputOptions {
  editingId: string | null;
  getTempRow: () => Record<string, any> | null;
  handleInputChange: (fieldKey: string, value: any) => void;
  siteOptions: { id: string; name: string }[];
  batchOptions: { id: string; product_name: string }[];
  technicianOptions: { id: string; name: string }[];
  strainOptions: { id: string; name: string }[];
  userOptions: { id: string; name: string }[];
  isAddingNew: boolean;
  newEntryRef?: React.RefObject<HTMLInputElement>;
}
