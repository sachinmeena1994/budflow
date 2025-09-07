
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { WorkTypeEntry } from "@/components/inventory/workType";
import { useValidation } from "./useValidation";
import { getCalculatedFields } from "@/utils/productivity-calculations";

export function useProductivityUIState(selectedWorkType: string) {
  const { validateEntry } = useValidation(selectedWorkType);
  const [editing_id, setEditingId] = useState<string | null>(null);
  const [temp_row, setTempRow] = useState<WorkTypeEntry | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [tempIdCounter, setTempIdCounter] = useState(0);
  const { toast } = useToast();

  // Get temp row function
  const getTempRow = () => temp_row;

  const generateTempId = () => {
    setTempIdCounter(prev => prev + 1);
    return `temp-${tempIdCounter + 1}`;
  };

  const startEdit = useCallback((row: WorkTypeEntry) => {
    // Ensure ID is consistent for edit checks
    const cleanedRow = {
      ...row,
      id: row.work_entry_id, 
      entry_payload: row.entry_payload ?? {},
      // Set status to "Submitted" when starting to edit an existing entry
      approval_status: row.work_entry_id?.startsWith("temp-") ? row.approval_status : "Submitted"
    };

    setEditingId(row.work_entry_id);
    setTempRow(cleanedRow);
    setValidationErrors([]);
    setShowValidationAlert(false);
  }, []);

  const validateCurrentEntry = () => {
    if (!temp_row) {
      setValidationErrors([]);
      setShowValidationAlert(false);
      return { isValid: false, errors: [] };
    }

    const validation = validateEntry(temp_row);

    if (!validation?.isValid) {
      const errorMessages = Array.isArray(validation.errors)
        ? validation.errors.map(e => typeof e === "string" ? e : (e as any)?.message || "Unknown error")
        : ["Validation failed."];

      setValidationErrors(errorMessages);
      setShowValidationAlert(true);

      toast({
        title: "Validation failed",
        description: "Please fix the highlighted fields and try again.",
        variant: "destructive",
      });

      return { isValid: false, errors: errorMessages };
    }

    setValidationErrors([]);
    setShowValidationAlert(false);
    return { isValid: true, errors: [] };
  };

  const resetEditState = useCallback(() => {
    setEditingId(null);
    setTempRow(null);
    setValidationErrors([]);
    setShowValidationAlert(false);
  }, []);

  const closeValidationAlert = () => {
    setShowValidationAlert(false);
    setValidationErrors([]);
  };

  return {
    editing_id,
    temp_row,
    validationErrors,
    showValidationAlert,
    generateTempId,
    // handleInputChange,
    startEdit,
    validateCurrentEntry,
    resetEditState,
    closeValidationAlert,
    setTempRow,
    setEditingId,
    getTempRow,
  };
}
