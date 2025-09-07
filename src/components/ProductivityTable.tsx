import React, { useMemo, useState, useCallback } from "react";
import { useProductivityColumns } from "@/hooks/useProductivityColumns";
import { DataTableWithQuery } from "@/components/table/DataTableWithQuery";
import { TableRowAction, TableBulkAction } from "@/types/table";
import { WorkTypeEntryWithHistory } from "@/hooks/productivity/types";
import { TableQueryResult } from "@/types/table";
import { RowSelectionState } from "@tanstack/react-table";
import { useRBAC } from "@/context/RBACContext";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { AuditHistoryModalNew } from "@/components/audit/AuditHistoryModalNew";

type Perms = {
  view?: boolean;
  add?: boolean;
  edit?: boolean;
  delete?: boolean;
  viewHistory?: boolean;
};

interface ProductivityTableProps {
  // data & render
  queryResult: TableQueryResult<WorkTypeEntryWithHistory>;
  selectedWorkType: string;
  perms: Perms;

  // manager actions (side effects live here; UI state is owned by table)
  startEdit: (entry: WorkTypeEntryWithHistory) => void;
  saveEdit: () => Promise<void> | void;
  cancelEdit: () => void;
  handleDelete: (id: string) => Promise<void> | void;
  loadEntries: () => Promise<void> | void;
handleDeleteMany?: (ids: string[], opts?: { silent?: boolean }) => Promise<void>;
  // helpers
  refreshApprovalBadge: () => Promise<void> | void;
  downloadCSV?: (rows: WorkTypeEntryWithHistory[]) => void;

  // edit snapshot
  editingId: string | null;
  tempRow: WorkTypeEntryWithHistory | null;
}

export const ProductivityTable: React.FC<ProductivityTableProps> = ({
  queryResult,
  selectedWorkType,
  perms,
  startEdit,
  saveEdit,
  cancelEdit,
  handleDelete,
  loadEntries,
  refreshApprovalBadge,
  downloadCSV,
handleDeleteMany,
  editingId,
  tempRow,
}) => {
  const { roleCode } = useRBAC();

  // local UI state
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    entryId: string | null;
    taskId: string | null;
  }>({ isOpen: false, entryId: null, taskId: null });
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // stable helpers
  const getRowId = useCallback((row: WorkTypeEntryWithHistory) => {
    return String((row as any)._rid || row.work_entry_id || (row as any).id);
  }, []);

  const isApprovedEntry = useCallback(
    (entry?: WorkTypeEntryWithHistory | null) =>
      (entry?.approval_status ?? "").toLowerCase() === "approved",
    []
  );

  const findEntryById = useCallback(
    (id: string) => (queryResult?.data ?? []).find(e => getRowId(e) === String(id) || e.work_entry_id === String(id)),
    [queryResult?.data, getRowId]
  );

  const onDeleteClick = useCallback(
    (id: string) => {
      const entry = findEntryById(String(id));
      if (!entry || isApprovedEntry(entry)) return;

      setDeleteConfirmation({
        isOpen: true,
        entryId: entry.work_entry_id ?? String(id),
        taskId: (entry as any)?.task_id ?? null,
      });
    },
    [findEntryById, isApprovedEntry]
  );

  const onHistoryClick = useCallback((id: string) => {
    setSelectedEntryId(String(id));
    setHistoryModalOpen(true);
  }, []);

  const onEditClick = useCallback((row: WorkTypeEntryWithHistory) => {
      startEdit(row);
  }, [startEdit]);

  const allowColumnVisibility = useMemo(
    () => !["worker", "team_leader"].includes((roleCode ?? "").toLowerCase()),
    [roleCode]
  );

  // columns recompute only when these change
  const { columns } = useProductivityColumns({
    workType: selectedWorkType,
    editingId,
    tempRow,
    onEdit: onEditClick,
    onDelete: onDeleteClick,
    onHistory: onHistoryClick,
    perms,
  });

  
  
  const allowedRowActions = useMemo<TableRowAction<WorkTypeEntryWithHistory>[]>(() => {
    const base: TableRowAction<WorkTypeEntryWithHistory>[] = [
      { id: "edit", label: "Edit", onClick: (row) => onEditClick(row) },
      { id: "delete", label: "Delete", onClick: (row) => onDeleteClick(getRowId(row)) },
      { id: "history", label: "History", onClick: (row) => onHistoryClick(getRowId(row)) },
    ];
    return base.filter((a) => {
      if (a.id === "edit")    return !!perms.edit;
      if (a.id === "delete")  return !!perms.delete;
      if (a.id === "history") return !!perms.viewHistory;
      return true;
    });
  }, [perms.edit, perms.delete, perms.viewHistory, onEditClick, onDeleteClick, onHistoryClick, getRowId]);

  // derive selected IDs/rows from table selection state
  const selectedIds = useMemo(() => {
    return new Set(Object.keys(rowSelection).filter((k) => (rowSelection as any)[k]));
  }, [rowSelection]);

  const getSelectedRows = useCallback(() => {
    const data = queryResult?.data ?? [];
    if (!selectedIds.size) return [];
    return data.filter((r) => selectedIds.has(getRowId(r)));
  }, [queryResult?.data, selectedIds, getRowId]);

  const hasApprovedInSelection = useMemo(() => {
    const rows = getSelectedRows();
    return rows.some(isApprovedEntry);
  }, [getSelectedRows, isApprovedEntry]);

  const hasAnyDeletableSelected = useMemo(() => {
    const rows = getSelectedRows();
    return rows.some((r) => !isApprovedEntry(r));
  }, [getSelectedRows, isApprovedEntry]);

  // Build bulk actions using derived selection
  const bulkBase: TableBulkAction<WorkTypeEntryWithHistory>[] = useMemo(() => {
    const list: TableBulkAction<WorkTypeEntryWithHistory>[] = [];

    if (perms.view && downloadCSV) {
      list.push({
        id: "export",
        label: "Download CSV",
        onClick: () => {
          const rows = getSelectedRows();
          downloadCSV(rows);
        },
        isDisabled: () => selectedIds.size === 0,
      });
    }

    if (perms.delete) {
      list.push(
     // inside bulkBase useMemo -> replace ONLY the "delete" action object
{
  id: "delete",
  label: "Delete Selected",
  onClick: async () => {
    const rows = getSelectedRows();
    if (!rows.length || !handleDeleteMany) return;

    // ❗️Send ALL selected ids (approved + deletable). The hook will delete what it can
    // and report "Skipped X approved & Y missing" correctly.
    const ids = rows.map((r) => String(r.work_entry_id ?? getRowId(r)));
    await handleDeleteMany(ids);

    // refresh + clear selection
    await loadEntries();
    await refreshApprovalBadge();
    setRowSelection({});
  },
  // keep the UX guard so the button enables only if something can be deleted
  isDisabled: () => selectedIds.size === 0 || !hasAnyDeletableSelected,
}

    );
    }

    return list;
  }, [
    perms.view,
    perms.delete,
    downloadCSV,
    getSelectedRows,
    selectedIds.size,
    hasAnyDeletableSelected,
    handleDeleteMany,
    loadEntries,
    refreshApprovalBadge,
    getRowId,
    isApprovedEntry,
  ]);

  const showSaveFooter = Boolean(editingId);
  const saveFooter = showSaveFooter ? (
    <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50">
      <Button onClick={() => void saveEdit()} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
        <Check className="h-4 w-4 mr-1" />
        Save
      </Button>
      <Button onClick={cancelEdit} variant="outline" size="sm">
        <X className="h-4 w-4 mr-1" />
        Cancel
      </Button>
    </div>
  ) : null;

  // delete modal actions (final server-side guard)
  const confirmDelete = useCallback(async () => {
    if (!deleteConfirmation.entryId) return;

    const latest = findEntryById(deleteConfirmation.entryId);
    if (!latest || isApprovedEntry(latest)) {
      // silently close if it somehow became approved
      setDeleteConfirmation({ isOpen: false, entryId: null, taskId: null });
      return;
    }

    await handleDelete(deleteConfirmation.entryId);
    await loadEntries();
    await refreshApprovalBadge();
    setDeleteConfirmation({ isOpen: false, entryId: null, taskId: null });
  }, [deleteConfirmation.entryId, handleDelete, loadEntries, refreshApprovalBadge, findEntryById, isApprovedEntry]);

  const cancelDeleteModal = useCallback(
    () => setDeleteConfirmation({ isOpen: false, entryId: null, taskId: null }),
    []
  );

  return (
    // prevent outer horizontal scroll
    <div className="space-y-4 productivity-table overflow-hidden">
      <div className="relative">
        {/* single horizontal scroll container */}
        <div className="overflow-x-auto overflow-y-hidden">
          <DataTableWithQuery
            queryResult={queryResult}
            columns={columns}
            tableConfig={{
              tableId: `productivity:${selectedWorkType || "all"}`,
              enableFiltering: true,
              enableSorting: true,
              enableColumnVisibility: allowColumnVisibility,
              enablePagination: true,
              enableGlobalFilter: true,
              enableMultiSelect: true,
              getRowId,
              serverSide: false,
              // ensure one scroller shows up when columns overflow
              tableClassName: "min-w-[1200px]",
            }}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            actions={{
              bulkActions: bulkBase,
              showRowActionsColumn: allowedRowActions.length > 0 && !editingId,
            }}
          />
        </div>
      </div>

      {saveFooter}

      <DeleteConfirmationModal
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) => !open && cancelDeleteModal()}
        onConfirm={confirmDelete}
        title="Delete Entry"
        description={`Are you sure you want to delete ${
          deleteConfirmation.taskId ? `Task ID: ${deleteConfirmation.taskId}` : "this entry"
        }? This action cannot be undone.`}
      />

      <AuditHistoryModalNew
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        entryId={selectedEntryId || ""}
        title="Task Change History"
      />
    </div>
  );
};
