import React from "react";
import { ColumnContext } from "../types";
import { DateInput } from "./DateInput";
import { SearchableSelectInput } from "./ProductivitySelect";
import { ControlledInput } from "./ControlledInput";

interface EditCellProps {
  rowId: string;
  fieldKey: string;
  fieldType: string;
  context: ColumnContext;
  autoFocus?: boolean;
}

export const EditCell: React.FC<EditCellProps> = ({
  rowId,
  fieldKey,
  fieldType,
  context,
  autoFocus = false,
}) => {
  const {
    siteOptions,
    batchOptions,
    technicianOptions,
    strainOptions,
    workTypeFields,
  } = context;

  const def = workTypeFields?.find((f) => f.field_key === fieldKey);
  const isReadOnlyField = ["work_entry_id", "approval_status", "grams_per_hour"].includes(
    fieldKey
  );

  // 1️⃣ Date field
  if (fieldType === "date") {
    return (
      <DateInput
        rowId={rowId}
        fieldKey={fieldKey}
        isReadOnly={isReadOnlyField}
        disableFuture
        autoFocus={autoFocus}
      />
    );
  }

  // 2️⃣ Select fields
  if (fieldType === "select") {
    // Special cases
    if (fieldKey === "site_id") {
      return (
        <SearchableSelectInput
          rowId={rowId}
          fieldKey={fieldKey}
          options={siteOptions.map((s) => ({
            value: s.id,
            label: s.label || s.name || s.id,
          }))}
          placeholder="Select site"
          searchPlaceholder="Search sites..."
          emptyText="No sites found."
          isReadOnly={isReadOnlyField}
        />
      );
    }
    
    if (fieldKey === "strain") {
      return (
        <SearchableSelectInput
          rowId={rowId}
          fieldKey={fieldKey}
          options={strainOptions.map((s) => ({ value: s.id, label: s.name }))}
          placeholder="Select strain"
          searchPlaceholder="Search strains..."
          emptyText="No strains found."
          isReadOnly={isReadOnlyField}
        />
      );
    }

    // Generic DB-driven select
    if (!isReadOnlyField && def?.options?.options) {
      const genericOptions = def.options.options.map((opt: string) => ({
        value: opt,
        label: opt,
      }));
      return (
        <SearchableSelectInput
          rowId={rowId}
          fieldKey={fieldKey}
          options={genericOptions}
          placeholder={`Select ${def.label || fieldKey}`}
          isReadOnly={isReadOnlyField}
        />
      );
    }
  }

  // 3️⃣ Multi-select fields
  if (fieldType === "multi-select" && fieldKey === "technician_refs") {
    return (
      <SearchableSelectInput
        rowId={rowId}
        fieldKey={fieldKey}
        options={technicianOptions.map((t) => ({ value: t.id, label: t.name }))}
        placeholder="Select technician"
        searchPlaceholder="Search technicians..."
        emptyText="No technicians found."
        isReadOnly={isReadOnlyField}
      />
    );
  }

  // 4️⃣ Fallback: InputField (works for text, number, etc.)
  return (
    <ControlledInput
      rowId={rowId}
      fieldKey={fieldKey}
      fieldType={fieldType}
      isReadOnly={isReadOnlyField}
      autoFocus={autoFocus}
    />
  );
};