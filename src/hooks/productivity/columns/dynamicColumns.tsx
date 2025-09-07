
import { TableColumn } from "@/components/table/types";
import { WorkTypeField, ColumnContext } from "./types";
import { createDynamicColumns } from "./dynamic";

/**
 * Main export function for dynamic columns
 * Maintains the same API as before for backward compatibility
 */
export function dynamicColumns(
  fields: WorkTypeField[],
  context: ColumnContext
): TableColumn<Record<string, any>>[] {
  return createDynamicColumns(fields, context);
}
