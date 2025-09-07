
import { WorkTypeField } from "../types";
import { getValueFromEntryPayload } from "@/utils/value-utils";
import { populateAllCalculatedValues } from "@/utils/formula-utils";

/**
 * Converts various input formats to ISO date string
 */
export const toIsoDate = (input: any): string => {
  if (!input) return "";
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}/.test(input)) return input.slice(0, 10);
  if (typeof input === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(input)) {
    const [m, d, y] = input.split("/").map(Number);
    const dt = new Date(y, m - 1, d);
    return isNaN(+dt) ? "" : dt.toISOString().slice(0, 10);
  }
  const dt = input instanceof Date ? input : new Date(input);
  return isNaN(+dt) ? "" : dt.toISOString().slice(0, 10);
};

/**
 * Normalizes filter values to string for comparison
 */
export const normalizeFilterValueToString = (fv: any): string => {
  if (fv == null) return "";
  if (typeof fv === "string" || typeof fv === "number" || typeof fv === "boolean") {
    return String(fv);
  }
  if (Array.isArray(fv)) {
    return fv.map(normalizeFilterValueToString).join(" ");
  }
  if (typeof fv === "object") {
    if ("value" in fv) return normalizeFilterValueToString((fv as any).value);
    if ("label" in fv) return normalizeFilterValueToString((fv as any).label);
    try { return JSON.stringify(fv); } catch { return ""; }
  }
  return "";
};

/**
 * Gets option label from field options
 */
export const getOptionLabel = (field: WorkTypeField, value: any): string => {
  const opts = field?.options?.options;
  if (!opts) return value ?? "";
  if (Array.isArray(opts) && opts.length && typeof opts[0] === "object") {
    const hit = (opts as Array<{ value: any; label: string }>).find(o => o.value === value);
    return hit?.label ?? String(value ?? "");
  }
  return String(value ?? "");
};

/**
 * Static field keys that should be filtered out from dynamic columns
 */
export const STATIC_FIELD_KEYS = [
  "task_id", "work_type", "site_id", "technician_refs", "approval_status",
  "date", "comment", "grams_per_hour", "strain", "created_by", "has_history"
];

/**
 * Filters and sorts fields for dynamic column generation
 */
export const filterAndSortFields = (fields: WorkTypeField[]): WorkTypeField[] => {
  return Array.from(new Map(fields.map(f => [f.field_key, f])).values())
    .filter(f => !STATIC_FIELD_KEYS.includes(f.field_key))
    .sort((a, b) => (a.calculated === b.calculated)
      ? (a.order_index ?? 0) - (b.order_index ?? 0)
      : (a.calculated ? 1 : -1));
};

/**
 * Creates accessor function for dynamic columns
 */
export const createDynamicAccessorFn = (field: WorkTypeField, workType: string) => {
  return (row: any) => {
    const payload = row?.entry_payload ?? {};
    const enhanced = populateAllCalculatedValues(workType, payload);
    const raw = getValueFromEntryPayload({ ...row, entry_payload: enhanced }, field.field_key);

    switch (field.type) {
      case "date":
        return toIsoDate(raw);
      case "number":
        return typeof raw === "number" ? raw : Number(raw ?? 0);
      case "select":
        return getOptionLabel(field, raw);
      case "multi-select":
        return Array.isArray(raw)
          ? raw.map(v => getOptionLabel(field, v)).filter(Boolean).join(", ")
          : "";
      default:
        return raw ?? "";
    }
  };
};
