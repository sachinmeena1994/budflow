import { useMemo } from "react";
import { WorkTypeEntryWithHistory } from "@/hooks/productivity/types";
import { TableRowAction, TableBulkAction } from "@/components/table/types";
import { Edit, Trash, Download } from "lucide-react";
import { toast } from "sonner";

type Options = {
  canEditEntry: boolean;
  canDeleteEntry: boolean;
  startEdit: (row: WorkTypeEntryWithHistory) => void;
  handleDeleteWithConfirmation: (id: string) => void;
  handleDelete: (id: string | string[],  opts?: { silent?: boolean }) => Promise<void>;
  loadEntries: () => Promise<void>;
  refreshCount: () => Promise<void>;
  setSelectedRows: (rows: WorkTypeEntryWithHistory[]) => void;
  downloadCSV: (rows: WorkTypeEntryWithHistory[]) => void;
};

export function useProductivityActions(opts: Options) {
  const {
    canEditEntry,
    canDeleteEntry,
    startEdit,
    handleDeleteWithConfirmation,
    handleDelete,
    loadEntries,
    refreshCount,
    setSelectedRows,
    downloadCSV,
  } = opts;

  const isApproved = (x: { approval_status?: string }) =>
    String(x?.approval_status ?? "").toLowerCase() === "approved";

  const rowActions: TableRowAction<WorkTypeEntryWithHistory>[] = useMemo(() => {
    const actions: TableRowAction<WorkTypeEntryWithHistory>[] = [];

    if (canEditEntry) {
      actions.push({
        id: "edit",
        label: "Edit",
        icon: Edit,
        visible: (row) => !isApproved(row),
        onClick: startEdit,
      });
    }

    if (canDeleteEntry) {
      actions.push({
        id: "delete",
        label: "Delete",
        icon: Trash,
        isDestructive: true,
        onClick: (row) => handleDeleteWithConfirmation(row.work_entry_id),
        visible: (row) => !isApproved(row),
      });
    }

    return actions;
  }, [startEdit, handleDeleteWithConfirmation, canEditEntry, canDeleteEntry]);

  const bulkActions: TableBulkAction<WorkTypeEntryWithHistory>[] = useMemo(
    () => [
      {
        id: "export",
        label: "Download CSV",
        icon: Download,
        onClick: (rows) => {
          downloadCSV(rows);
        },
      },
      {
        id: "delete",
        label: "Delete Selected",
        icon: Trash,
        isDestructive: true,
        isDisabled: (rows) =>
          rows.length === 0 || rows.every((r) => isApproved(r)),
        onClick: async (rows) => {
          if (!rows?.length) {
            toast.error("No rows selected for deletion");
            return;
          }

          // Only delete non-approved rows
          const deletable = rows.filter((r) => !isApproved(r));
          const skipped = rows.length - deletable.length;

          if (deletable.length === 0) {
            toast.error("All selected entries are Approved and cannot be deleted");
            return;
          }

          const ids = deletable.map((r) => r.work_entry_id);

          try {
            await handleDelete(ids, { silent: true });
            await loadEntries();
            await refreshCount();

            if (skipped > 0) {
              toast.success(
                `Deleted ${deletable.length} entr${deletable.length === 1 ? "y" : "ies"}. Skipped ${skipped} approved entr${skipped === 1 ? "y" : "ies"}.`
              );
            } else {
              toast.success(`Successfully deleted ${deletable.length} entr${deletable.length === 1 ? "y" : "ies"}`);
            }

            // Clear selection after bulk action
            setSelectedRows([]);
          } catch (error) {
            console.error("Bulk delete failed:", error);
            toast.error("Failed to delete some entries");
          }
        },
      },
    ],
    [handleDelete, loadEntries, refreshCount, downloadCSV, setSelectedRows]
  );

  return {
    rowActions,
    bulkActions,
  };
}
