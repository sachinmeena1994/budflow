// useStaticColumns.ts
import { useMemo } from "react";
import { TableColumn } from "@/types/table";
import { ColumnContext } from "../types";
import { usePermission } from "@/hooks/usePermission";
import { createSelectionColumn } from "./selectionColumn";
import { createActionsColumn } from "./actionsColumn";
import { createHistoryColumn } from "./historyColumn";
import { createMetadataColumns } from "./metadataColumns";

type AnyRow = Record<string, any>;

function withId<T extends AnyRow>(col: TableColumn<T>, id: string): TableColumn<T> {
  return { ...col, id };
}

export function useStaticColumns(context: ColumnContext): TableColumn<AnyRow>[] {
  const canEdit = usePermission({ action: "edit-productivity-entry" });
  const canDelete = usePermission({ action: "delete-productivity-entry" });
  const canViewHistory = usePermission({ action: "view-productivity-history" });

  return useMemo(() => {
    const cols: TableColumn<AnyRow>[] = [];

    // Fixed structural columns with FIXED ids
    cols.push(withId(createSelectionColumn(), "rowSelect"));

    if (canEdit || canDelete) {
      const actions = createActionsColumn(context, canEdit, canDelete);
      if (actions) cols.push(withId(actions, "actions"));
    }

    if (canViewHistory) {
      const history = createHistoryColumn(context, canViewHistory);
      if (history) cols.push(withId(history, "history"));
    }

    // Meta after structural
    const metaCols = createMetadataColumns(context).map((c, i) => ({
      ...c,
      id: c.id ?? `meta_${i}`,
    }));
    cols.push(...metaCols);

    return cols;
  }, [context, canEdit, canDelete, canViewHistory]);
}
