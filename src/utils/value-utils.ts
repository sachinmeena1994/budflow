
export function getValueFromEntryPayload(entry: any, field: string): any {
  if (!entry) return "";
  
  // For fixed columns, return directly from entry
  const fixedColumns = [
    "id", "task_id", "work_type", "site_id", "batch_product_id",
    "technician_refs", "approval_status", "created_by", "created_at"
  ];
  
  if (fixedColumns.includes(field)) {
    return entry[field] || "";
  }
  
  // For dynamic fields, get from entry_payload
  return entry.entry_payload?.[field] || "";
}

export function mapFieldsForSaving(entry: any): any {
  if (!entry) return {};
  
  // Return the entry as-is since it's already in the correct format
  return {
    ...entry,
    entry_payload: entry.entry_payload || {}
  };
}
