
import { WorkTypeEntry } from "@/components/inventory/workType";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function useValidation(selectedWorkType: string) {
  const validateEntry = (entry: WorkTypeEntry): ValidationResult => {
    const errors: string[] = [];

    // Required: work_type_code
    if (!entry.work_type_code || entry.work_type_code.trim() === "") {
      errors.push("Work type is required");
    }

    // Required: site_id
    if (!entry.site_id) {
      errors.push("Site is required");
    }

    // Required: entry_payload must contain at least one meaningful field
    if (!entry.entry_payload || typeof entry.entry_payload !== 'object') {
      errors.push("Entry data is required");
    } else {
      const payload = entry.entry_payload;
      
      // Simple check: if entry_payload has at least one non-empty value
      const hasAnyData = Object.values(payload).some(value => {
        return value !== undefined && value !== null && value !== '' && value !== 0;
      });

      if (!hasAnyData) {
        errors.push("At least one field must be filled");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  return {
    validateEntry,
  };
}
