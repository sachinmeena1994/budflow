import { useEffect, useMemo, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useEntryFetch } from "./useEntryFetch";
import { useEntryActions } from "./useEntryActions";
import { useProductivityUIState } from "./useProductivityUIState";
import { WorkTypeEntryWithHistory } from "./types";
import { toast } from "sonner";
import { useMarket } from "@/context/MarketContext";
import { useWorkTypeOptions } from "../useWorkTypeOptions";
import {
  getFormulaDependencies,
  toSnakeCase,
  formulaMap,
  populateAllCalculatedValues,
} from "@/utils/formula-utils";
import { showValidationToast } from "@/utils/showValidationToast";
import { useAuth } from "@/context/AuthContext";
import { useProductivityForm } from "@/context/ProductivityFormContext";

const SYSTEM_USER_ID = "b9647e6b-3ab2-4cbe-ad1f-f86d666567d6";

/* ---------- validation helpers (unchanged) ---------- */
const isProvided = (v: any) =>
  !(v === undefined || v === null || (typeof v === "string" && v.trim() === ""));

const numberInvalid = (v: any, required: boolean) => {
  if (!isProvided(v)) return required;
  const n = Number(v);
  if (Number.isNaN(n)) return true;
  return required ? n <= 0 : n < 0;
};

function requiredMessage(
  field: { label?: string; type?: string } | undefined,
  value: any,
  fallbackKey?: string
) {
  const label = field?.label || fallbackKey || "This field";
  const kind =
    Array.isArray(value) ? "array"
    : typeof value === "string" ? "string"
    : field?.type === "number" || typeof value === "number" ? "number"
    : "other";

  if (kind === "number") return `${label} is required and must be greater than 0`;
  if (kind === "array")  return `${label} is required (select at least one)`;
  return `${label} is required`;
}

function validateWorkEntry(entry: WorkTypeEntryWithHistory, allFields: any[]): string[] {
  const errors: string[] = [];
  const reported = new Set<string>();
  const skip = new Set(["first4_of_bt", "retention_percentage", "approval_status", "site_id", "sample_bag_mass"]);

  const fields = Array.isArray(allFields)
    ? allFields.filter(f => f.work_type?.toLowerCase() === entry.work_type_code?.toLowerCase())
    : [];

  if (!entry.site_id && !reported.has("site_id")) {
    errors.push("Site is required");
    reported.add("site_id");
  }

  if ((entry.work_type_code || "").toLowerCase() === "harvest") {
    const teamSize = entry.entry_payload?.team_size;
    if (!teamSize || Number(teamSize) <= 0) {
      errors.push("Team size is required and must be greater than 0");
      reported.add("team_size");
    }
  } else if ((entry.work_type_code || "").toLowerCase() !== "breakdown") {
    if ((!entry.technician_refs || entry.technician_refs.length === 0) && !reported.has("technician_refs")) {
      errors.push("Technician must be selected");
      reported.add("technician_refs");
    }
  }

  const payload = entry.entry_payload || {};
  if (!payload.strain && !reported.has("strain")) {
    errors.push("Strain is required");
    reported.add("strain");
  }

  const required = fields.filter(f => f.required && !f.calculated);
  for (const field of required) {
    if (reported.has(field.field_key) || skip.has(field.field_key)) continue;
    const value = payload[field.field_key];
    let invalid = false;

    if (field.type === "number") invalid = numberInvalid(value, true);
    else if (Array.isArray(value)) invalid = value.length === 0;
    else if (typeof value === "string") invalid = value.trim() === "";
    else invalid = value === undefined || value === null;

    if (invalid) {
      errors.push(requiredMessage(field, value, field.field_key));
      reported.add(field.field_key);
    }
  }

  const calculated = fields.filter(f => f.calculated);
  for (const field of calculated) {
    const formulaKey = `${entry.work_type_code}:${field.field_key}`;
    const formula = formulaMap[formulaKey];
    if (!formula) continue;

    for (const dep of getFormulaDependencies(formula)) {
      const depDef = fields.find(f => f.field_key === dep);
      if (depDef?.calculated || reported.has(dep) || skip.has(dep)) continue;

      const snakeKey = toSnakeCase(dep);
      const depValue = payload[dep] ?? payload[snakeKey];
      const requiredDep = !!depDef?.required;

      let invalid = false;
      if (depDef?.type === "number") invalid = numberInvalid(depValue, requiredDep);
      else if (Array.isArray(depValue)) invalid = requiredDep ? depValue.length === 0 : false;
      else if (typeof depValue === "string") invalid = requiredDep ? depValue.trim() === "" : false;
      else invalid = requiredDep ? depValue === undefined || depValue === null : false;

      if (invalid) {
        errors.push(requiredMessage(depDef ?? { label: dep, type: typeof depValue }, depValue, dep));
        reported.add(dep);
      }
    }
  }

  return errors;
}

/* ---------- main hook ---------- */
export function useProductivityManager(selectedWorkType: string) {
  const [entries, setEntries] = useState<WorkTypeEntryWithHistory[]>([]);

  const { currentSite } = useMarket();
  const { user: authUser } = useAuth();
  const { rawFields } = useWorkTypeOptions();

  const { fetchedEntries, isLoading, refetch } = useEntryFetch(selectedWorkType);
  const { handleAdd, handleEdit, handleDelete ,handleDeleteMany} = useEntryActions(selectedWorkType);

  const {
    editing_id,
    temp_row,
    validationErrors,
    showValidationAlert,
    generateTempId,
    startEdit,
    validateCurrentEntry,
    resetEditState,
    closeValidationAlert,
    setTempRow,
    setEditingId,
  } = useProductivityUIState(selectedWorkType);

  const { getCellValue, setCellValue, clearCells, seedRow, clearRow } = useProductivityForm();

  /* -------- stable helpers -------- */

  const primeStoreFromEntry = useCallback((rowId: string, entry: WorkTypeEntryWithHistory) => {
    if (!rowId || !entry) return;
    const payload = entry.entry_payload ?? {};

    if (typeof seedRow === "function") {
      seedRow(rowId, {
        site_id: entry.site_id ?? "",
        technician_refs: entry.technician_refs ?? [],
        ...payload,
      });
    } else {
      setCellValue(rowId, "site_id", entry.site_id ?? "");
      setCellValue(rowId, "technician_refs", entry.technician_refs ?? []);
      Object.keys(payload).forEach(k => setCellValue(rowId, k, (payload as any)[k]));
    }
  }, [seedRow, setCellValue]);

const normalizeUuidArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.filter(Boolean) as string[];
  if (v == null || v === "") return [];
  return [String(v)];
};

const readEntryFromStore = useCallback((
  rowId: string,
  base: WorkTypeEntryWithHistory
): WorkTypeEntryWithHistory => {
  const workTypeCode = (base.work_type_code ?? selectedWorkType) as string;

  const site_id = getCellValue(rowId, "site_id", base.site_id ?? null);

  const technician_refsRaw = getCellValue(rowId, "technician_refs", base.technician_refs ?? []);
  const technician_refs = normalizeUuidArray(technician_refsRaw);

  const fieldDefs = Array.isArray(rawFields)
    ? rawFields.filter(f => f.work_type?.toLowerCase() === workTypeCode.toLowerCase())
    : [];

  const nextPayload: Record<string, any> = { ...(base.entry_payload ?? {}) };

  for (const def of fieldDefs) {
    const k = def.field_key;

    let fallback: any;
    if (def.type === "multi-select") fallback = Array.isArray(nextPayload[k]) ? nextPayload[k] : [];
    else if (def.type === "date")   fallback = nextPayload[k] ?? null;  // ✅ null not ""
    else                             fallback = nextPayload[k] ?? "";

    const raw = getCellValue(rowId, k, fallback);
    nextPayload[k] = def.type === "date" ? (raw === "" ? null : raw) : raw;

    if (def.type === "date") {
      console.log(`[readEntryFromStore] DATE "${k}" ->`, nextPayload[k]);
    }
  }

  // ✅ Safety net: include 'date' from the store even if not present in fieldDefs
  if (!fieldDefs.some(f => f.field_key === "date")) {
    const storeDate = getCellValue(rowId, "date", nextPayload["date"] ?? null);
    if (storeDate !== undefined) {
      nextPayload["date"] = storeDate === "" ? null : storeDate;
      console.log("[readEntryFromStore] (fallback) DATE 'date' ->", nextPayload["date"]);
    }
  }

  return { ...base, site_id, technician_refs, entry_payload: nextPayload };
}, [getCellValue, rawFields, selectedWorkType]);


  const clearRowInStore = useCallback((rowId?: string | null) => {
    if (!rowId) return;
    if (typeof clearRow === "function") clearRow(rowId);
    else clearCells();
  }, [clearRow, clearCells]);

  const loadEntries = useCallback(async () => {
    try {
      const { data, error } = await refetch();
      if (error) throw error;
      setEntries((data ?? []).map(e => ({ ...e, id: e.work_entry_id })));
    } catch (err) {
      console.error("Failed to reload entries:", err);
    }
  }, [refetch]);

  /* -------- effects -------- */

  // keep server rows in sync; preserve a temp editing row at the top
  useEffect(() => {
    const serverRows = (fetchedEntries ?? []).map(e => ({ ...e, id: e.work_entry_id }));
    setEntries(prev => {
      const temp = prev.find(e => e.work_entry_id?.startsWith("temp-"));
      return temp ? [temp, ...serverRows] : serverRows;
    });
  }, [fetchedEntries]);

  // When edit begins, prime the store for that row
  useEffect(() => {
    if (editing_id && temp_row) primeStoreFromEntry(editing_id, temp_row);
  }, [editing_id, temp_row, primeStoreFromEntry]);

  /* -------- actions -------- */

  const saveEdit = useCallback(async () => {
    if (!(editing_id && temp_row)) return;

    try {
      // 1) read latest values from store
      const entryFromStore = readEntryFromStore(editing_id, temp_row);

      // 2) validate
      const workTypeCode = (entryFromStore.work_type_code ?? selectedWorkType) as string;
      const fieldDefs = Array.isArray(rawFields)
        ? rawFields.filter(f => f.work_type?.toLowerCase() === workTypeCode.toLowerCase())
        : [];
      const errors = validateWorkEntry(entryFromStore, fieldDefs);
      if (errors.length > 0) {
        showValidationToast(errors);
        return;
      }

      // 3) compute calculated fields
      const payloadWithCalcs = populateAllCalculatedValues(workTypeCode, entryFromStore.entry_payload || {});
      const cleaned: WorkTypeEntryWithHistory = {
        ...entryFromStore,
        entry_payload: payloadWithCalcs,
        has_history: entryFromStore.has_history ?? false,
      };

      // 4) persist
      if (editing_id.startsWith("temp-")) {
        cleaned.work_entry_id = uuidv4();
        await handleAdd(cleaned);
        toast.success("Entry added successfully");
      } else {
        cleaned.work_entry_id = editing_id;
        await handleEdit(editing_id, cleaned);
        toast.success("Entry updated successfully");
      }

      // 5) refresh + cleanup
      await loadEntries();
      clearRowInStore(editing_id);
      resetEditState();
    } catch (error) {
      console.error("❌ Error saving entry:", error);
      toast.error("Failed to save entry: " + ((error as any)?.message || error));
    }
  }, [
    editing_id,
    temp_row,
    readEntryFromStore,
    selectedWorkType,
    rawFields,
    handleAdd,
    handleEdit,
    loadEntries,
    clearRowInStore,
    resetEditState,
  ]);

  const cancelEdit = useCallback(() => {
    if (editing_id?.startsWith("temp-")) {
      setEntries(prev => prev.filter(e => e.work_entry_id !== editing_id));
    }
    clearRowInStore(editing_id);
    resetEditState();
  }, [editing_id, clearRowInStore, resetEditState]);

  const addNewEntry = useCallback(async (taskId: string) => {
    if (selectedWorkType === "all") return;

    const today = new Date().toISOString().split("T")[0];
    const tempId = generateTempId();

    // defaults from DB fields
    const fieldDefs = Array.isArray(rawFields)
      ? rawFields.filter(f => f.work_type?.toLowerCase() === selectedWorkType.toLowerCase())
      : [];

    const defaultFields: Record<string, any> = {};
    for (const field of fieldDefs) {
      const key = field.field_key;
      if (field.calculated) continue;

      if (field.required) {
        switch (field.type) {
          case "date":
            defaultFields[key] = null;
            break;
          case "multi-select":
            defaultFields[key] = [];
            break;
          case "number":
            defaultFields[key] =
              selectedWorkType === "Hand Trim" && key === "target" ? 180 : null;
            break;
          case "select":
            defaultFields[key] = key === "strain" ? "" : (field.options?.options?.[0] || "");
            break;
          default:
            defaultFields[key] = "";
        }
      } else {
        defaultFields[key] = field.type === "multi-select" ? [] : "";
      }
    }

    const newEntry: WorkTypeEntryWithHistory & { _rid: string } = {
      work_entry_id: tempId,
      id: tempId,
      _rid: String(tempId), // stable row id for react-table
      work_type: selectedWorkType,
      work_type_code: selectedWorkType,
      site_id: currentSite?.id || null,
      batch_ref: null,
      technician_refs: [],
      approval_status: "Draft",
      created_by: authUser?.id ?? SYSTEM_USER_ID,
      created_at: new Date().toISOString(),
      entry_payload: defaultFields,
      has_history: false,
    };

    setEntries(prev => [newEntry, ...prev]);
    setEditingId(tempId);
    setTempRow(newEntry);
    primeStoreFromEntry(tempId, newEntry);
  }, [
    selectedWorkType,
    generateTempId,
    rawFields,
    currentSite?.id,
    authUser?.id,
    setEditingId,
    setTempRow,
    primeStoreFromEntry,
  ]);

  /* -------- API -------- */
  return {
    entries,
    isLoading,

    // edit snapshot
    editing_id,
    temp_row,

    // (optional) UI validation state
    validationErrors,
    showValidationAlert,
    closeValidationAlert,
    validateCurrentEntry,

    // CRUD (side-effects)
    handleDelete,
    handleAdd,
    handleEdit,
handleDeleteMany,
    // editing controls
    startEdit,
    saveEdit,
    cancelEdit,
    addNewEntry,


    // data refresh
    loadEntries,
  };
}
