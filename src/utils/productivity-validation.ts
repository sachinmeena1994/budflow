import { WorkTypeEntry } from "@/components/inventory/workType";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateProductivityEntry(
  entry: Record<string, any>, 
  workType: string
): ValidationResult {
  const errors: string[] = [];

  
  const commonRequiredFields = ["task_id", "date", "work_type", "status"];

  // Work type-specific required fields
  const workTypeRequiredFields: Record<string, string[]> = {
    harvest: ["site", ],
    machine: ["technician", "site", ],
    hand: ["technician", ],
    breakdown: ["technician", "site"],
  };


  const requiredFields = [
    ...commonRequiredFields,
    ...(workTypeRequiredFields[workType.toLowerCase()] || [])
  ];

  // ✅ Field-by-field check
  requiredFields.forEach(field => {
    const value = entry[field];
    console.log(value)
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      const displayName =
        field === "batchProduct" ? "Batch/Product" :
        field === "taskId" ? "Task ID" :
        field.charAt(0).toUpperCase() + field.slice(1);

      errors.push(`${displayName} is required`);
    }
  });

  return {
    isValid:true,
    errors,
  };
}
