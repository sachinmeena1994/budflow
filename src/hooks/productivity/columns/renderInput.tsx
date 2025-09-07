import React from "react";
import { ColumnContext } from "./types";
import { EditCell } from "./components/EditCell";
import { ViewCell } from "./components/ViewCell";


export function renderInput(
  fieldKey: string,
  fieldType: string,
  row: Record<string, any>,
  context: ColumnContext
) {
  const { editingId } = context;
  const rowId = row.work_entry_id || row.id || "temp-new";
  const isEditing = editingId === rowId;

  if (isEditing) {
    return (
      <EditCell
        rowId={rowId}
        fieldKey={fieldKey}
        fieldType={fieldType}
        context={context}
        autoFocus={false}
      />
    );
  } else {
    return (
      <ViewCell
        rowId={rowId}
        fieldKey={fieldKey}
        fieldType={fieldType}
        context={context}
        row={row}
      />
    );
  }
}
