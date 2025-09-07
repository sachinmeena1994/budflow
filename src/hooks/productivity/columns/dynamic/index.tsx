
import React from "react";
import { TableColumn } from "@/components/table/types";
import { WorkTypeField, ColumnContext } from "../types";
import { 
  filterAndSortFields, 
  createDynamicAccessorFn 
} from "./utils";
import { createDateFilterFn, createTextFilterFn } from "./filters";
import { 
  renderEditingCell,
  renderDateCell,
  renderNumberCell,
  renderMultiSelectCell,
  renderDefaultCell
} from "./cellRenderers";

/**
 * Creates a single dynamic column definition
 */
const createDynamicColumn = (
  field: WorkTypeField,
  context: ColumnContext
): TableColumn<Record<string, any>> => {
  const { workType, editingId } = context;

  const base: TableColumn<Record<string, any>> = {
    id: field.label, // keep stable id (don't change anything else)
    header: () => (
      <span className="text-xs">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </span>
    ),
    accessorFn: createDynamicAccessorFn(field, workType),
    enableSorting: true,
    enableFiltering: true,
    size: field.type === "text" ? 128 : field.type === "number" ? 96 : 112,

    cell: ({ row }) => {
      const rowId = row.original.id || row.original.work_entry_id;
      const isEditing = editingId === rowId;

      if (isEditing) {
        return renderEditingCell(field, row, context);
      }

      const value = row.getValue(field.label);

      // Handle different field types for display mode
      switch (field.type) {
        case "date":
          return renderDateCell(value);
        case "number":
          return renderNumberCell(value);
        case "multi-select":
          return renderMultiSelectCell(field, value);
        default:
          return renderDefaultCell(field, value);
      }
    },
  };

  // Add appropriate filter functions based on field type
  if (field.type === "date") {
    (base as any).filterFn = createDateFilterFn();
    (base as any).filterType = "date"; // keep date picker UI
  } else if (field.type === "select" || field.type === "multi-select" || field.type === "text") {
    (base as any).filterFn = createTextFilterFn();
  }

  return base;
};

/**
 * Main function to generate dynamic columns
 */
export function createDynamicColumns(
  fields: WorkTypeField[],
  context: ColumnContext
): TableColumn<Record<string, any>>[] {
  const { workType } = context;
  
  if (workType === "all") return [];

  const filteredFields = filterAndSortFields(fields);
  
  return filteredFields.map(field => createDynamicColumn(field, context));
}
