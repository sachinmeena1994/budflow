import React from "react";
import { WorkTypeField, ColumnContext } from "../types";
import { renderInput } from "../renderInput";
import { getValueFromEntryPayload } from "@/utils/value-utils";
import { populateAllCalculatedValues } from "@/utils/formula-utils";
import { formatDateForDisplay } from "@/utils/date-formatting";
import { getOptionLabel } from "./utils";

/**
 * Renders cell content for editing mode
 */
export const renderEditingCell = (
  field: WorkTypeField,
  row: any,
  context: ColumnContext
) => {
  const rowId = row.original.id || row.original.work_entry_id;
  const { workType, tempRow } = context;

  const basePayload =
    context.editingId === rowId && tempRow
      ? { ...row.original.entry_payload, ...tempRow.entry_payload }
      : row.original.entry_payload;

  const enhancedPayload = populateAllCalculatedValues(workType, basePayload);

  let value = getValueFromEntryPayload(
    { ...row.original, entry_payload: enhancedPayload },
    field.field_key
  );

  if (
    field.field_key === "target" &&
    (value === null || value === undefined || value === "")
  ) {
    value = 180;
  }

  return (
    <div className="w-28 min-h-[32px] flex items-center px-1">
      {field.calculated ? (
        <span className="text-xs italic text-muted-foreground">
          {value !== null
            ? typeof value === "number"
              ? value.toFixed(2)
              : String(value)
            : "-"}
        </span>
      ) : (
        renderInput(field.field_key, field.type, row.original, {
          ...context,
          disabled: field.calculated,
        })
      )}
    </div>
  );
};

/**
 * Renders cell content for display mode (date fields)
 */
export const renderDateCell = (value: any) => {
  if (!value)
    return (
      <div className="w-28 min-h-[32px] flex items-center px-1">
        <span className="text-xs">-</span>
      </div>
    );

  return (
    <div className="w-28 min-h-[32px] flex items-center px-1">
      <span className="text-xs">{formatDateForDisplay(value)}</span>
    </div>
  );
};

/**
 * Renders cell content for display mode (number fields)
 */
export const renderNumberCell = (value: any) => {
  return (
    <div className="w-24 min-h-[32px] flex items-center px-1">
      <span className="text-xs font-mono">
        {value !== null
          ? typeof value === "number"
            ? value.toFixed(2)
            : String(value)
          : "-"}
      </span>
    </div>
  );
};

/**
 * Renders cell content for display mode (multi-select fields)
 */
export const renderMultiSelectCell = (field: WorkTypeField, value: any) => {
  if (!Array.isArray(value)) {
    return (
      <div className="w-28 min-h-[32px] flex items-center px-1">
        <span className="text-xs">-</span>
      </div>
    );
  }

  const labels = value.map((v) => getOptionLabel(field, v)).filter(Boolean);

  return (
    <div className="w-28 min-h-[32px] flex items-center px-1">
      <div className="flex flex-wrap gap-1">
        {labels.map((label, i) => (
          <span
            key={i}
            className="inline-block px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * Renders cell content for display mode (default/text fields)
 */
export const renderDefaultCell = (field: WorkTypeField, value: any) => {
  const displayValue =
    field.type === "select" ? getOptionLabel(field, value) : value ?? "-";

  return (
    <div className="w-28 min-h-[32px] flex items-center px-1">
      <span
        className={`text-xs ${
          field.calculated ? "italic text-gray-500" : ""
        }`}
      >
        {displayValue}
      </span>
    </div>
  );
};
