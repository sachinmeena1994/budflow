import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/organisms/PageHeader";
import { ApprovalsTable } from "@/components/ApprovalsTable";
import { EntryDetailsModal } from "@/components/EntryDetailsModal";
import { ApprovalActionsDialog } from "@/components/ApprovalActionsDialog";
import { CheckCircle, XCircle, Eye, Download, Trash, AlertTriangle } from "lucide-react";
import { useApprovalsManagerTable } from "@/hooks/useApprovalsManagerTable";
import { ApprovalEntry } from "@/hooks/use-approvals-manager";
import { TableRowAction, TableBulkAction } from "@/types/table";
import { toast } from "sonner";
import { useMarket } from "@/context/MarketContext";
import { useFilteredEntries } from "@/hooks/useFilteredEntries";
import { usePermission } from "@/hooks/usePermission"; // boolean-returning hook
import { Unauthorized401 } from "@/components/shared/Unauthorized401";
import { useWorkTypeOptions } from "@/hooks/useWorkTypeOptions";
import { useAuditLookupOptions } from "@/hooks/useAuditLookupOptions";
import { createFieldFormatter } from "@/hooks/useAuditHistory";
import { useCsvExporter } from "@/hooks/useCsvExporter";


export default function ApprovalCenter() {
  const [selectedEntry, setSelectedEntry] = useState<ApprovalEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRows, setSelectedRows] = useState<ApprovalEntry[]>([]);
  const [approvalAction, setApprovalAction] = useState<{
    type: "approve" | "reject" | null;
    entry: ApprovalEntry | null;
  }>({ type: null, entry: null });


  const {
  siteOptions: siteOpts,
  strainOptions: strainOpts,
  technicianOptions: techOpts,
  userOptions: userOpts,
  batchOptions: batchOpts,
} = useAuditLookupOptions();

const csvFormatter = useMemo(
  () =>
    createFieldFormatter({
      siteOptions: siteOpts,
      strainOptions: strainOpts,
      technicianOptions: techOpts,
      userOptions: userOpts,
      batchOptions: batchOpts,
    }),
  [siteOpts, strainOpts, techOpts, userOpts, batchOpts]
);

  
  // permissions (returns boolean)
  const canViewApprovalPage = usePermission({ action: "view-approval-page" });
  const canApprove = usePermission({ action: "approve" });
  const canReject = usePermission({ action: "reject" });
  const canViewDetails = usePermission({ action: "view-entry-details" });
const { workTypeFieldMap, isLoading: wtLoading } = useWorkTypeOptions();
  // Use the table-friendly hook (returns queryResult)
  const { queryResult, approveEntry, rejectEntry, deleteEntry, refetch } =
    useApprovalsManagerTable();

  const { currentMarket, sites } = useMarket();

  // Client-side filter by market code (keeps UI fast, no refetch loop)
  const filteredEntries = useFilteredEntries(
    queryResult.data ?? [],
    "all",
    sites,
    currentMarket?.code || ""
  );

  console.log("filteredEntries approval",filteredEntries)

  const handleApprove = (entry: ApprovalEntry) => {
    if (!canApprove) return toast.error("You don’t have permission to approve.");
    setApprovalAction({ type: "approve", entry });
  };

  const handleReject = (entry: ApprovalEntry) => {
    if (!canReject) return toast.error("You don’t have permission to reject.");
    setApprovalAction({ type: "reject", entry });
  };

  const handleConfirmAction = async (entryId: string, comment?: string) => {
    try {
      if (approvalAction.type === "approve") {
        if (!canApprove) return toast.error("You don’t have permission to approve.");
        await approveEntry(entryId, comment);
      } else if (approvalAction.type === "reject") {
        if (!canReject) return toast.error("You don’t have permission to reject.");
        await rejectEntry(entryId, comment);
      }
      refetch();
    } catch {
      toast.error(`Failed to ${approvalAction.type} entry`);
    } finally {
      setApprovalAction({ type: null, entry: null });
    }
  };



  const handleViewDetails = (entry: ApprovalEntry) => {
    if (!canViewDetails) return toast.error("You don’t have permission to view details.");
    setSelectedEntry(entry);
    setShowDetails(true);
  };


const { downloadCSV } = useCsvExporter<ApprovalEntry>({
  filenamePrefix: "approvals-export",
});


  // --- Row actions (context menu) ---
  const rowActions: TableRowAction<ApprovalEntry>[] = useMemo(() => {
    const actions: (TableRowAction<ApprovalEntry> | null)[] = [
      canViewDetails
        ? {
            id: "view",
            label: "View Details",
            icon: Eye,
            onClick: handleViewDetails,
          }
        : null,
      canApprove
        ? {
            id: "approve",
            label: "Approve",
            icon: CheckCircle,
            onClick: handleApprove,
            isDisabled: row => row.approval_status === "Approved",
          }
        : null,
      canReject
        ? {
            id: "reject",
            label: "Reject",
            icon: XCircle,
            onClick: handleReject,
            isDestructive: true,
            isDisabled: row => row.approval_status === "Rejected",
          }
        : null,
    ];
    return actions.filter(Boolean) as TableRowAction<ApprovalEntry>[];
  }, [canViewDetails, canApprove, canReject]);

const bulkActions: TableBulkAction<ApprovalEntry>[] = useMemo(() => {
  const actions: (TableBulkAction<ApprovalEntry> | null)[] = [
    {
      id: "export",
      label: "Download CSV",
      icon: Download,
      onClick: () => downloadCSV(selectedRows),
    },
    canApprove
      ? {
          id: "bulk_approve",
          label: "Approve Selected",
          icon: CheckCircle,
          onClick: async () => {
            if (!selectedRows.length) return toast.error("No rows selected");

            const already = selectedRows.filter(r => r.approval_status === "Approved").length;
            if (already) return toast.error(`${already} already approved`);

            const ids = selectedRows.map(r => r.id);
            await approveEntry(ids, "Bulk approval", { silent: true });

            toast.success(`Approved ${selectedRows.length} entries`);
            setSelectedRows([]);
            refetch();
          },
        }
      : null,
    canReject
      ? {
          id: "bulk_reject",
          label: "Reject Selected",
          icon: XCircle,
          isDestructive: true,
          onClick: async () => {
            if (!selectedRows.length) return toast.error("No rows selected");

            const already = selectedRows.filter(r => r.approval_status === "Rejected").length;
            if (already) return toast.error(`${already} already rejected`);

            const ids = selectedRows.map(r => r.id);
            await rejectEntry(ids, "Bulk rejection", { silent: true });

            toast.success(`Rejected ${selectedRows.length} entries`);
            setSelectedRows([]);
            refetch();
          },
        }
      : null,
  ];

  return actions.filter(Boolean) as TableBulkAction<ApprovalEntry>[];
}, [selectedRows, approveEntry, rejectEntry, deleteEntry, refetch, canApprove, canReject]);

  return (
    <div className="space-y-6">
    

      {!canViewApprovalPage ? (
        <Unauthorized401 />
      ) : (
        <>
          <PageHeader
        title="Approval Center"
        description="Review and approve productivity entries"
      />
          <ApprovalsTable
            queryResult={{
              ...queryResult,
              data: filteredEntries,
              totalCount: filteredEntries.length,
            }}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewDetails={handleViewDetails}
            onSelectionChange={setSelectedRows}
            selectedRows={selectedRows}
            rowActions={rowActions}
            bulkActions={bulkActions}
            canApprove={canApprove}
            canReject={canReject}
            canViewDetails={canViewDetails}
          />

          <EntryDetailsModal
            isOpen={showDetails}
            onClose={() => setShowDetails(false)}
            entry={selectedEntry}
          />

          <ApprovalActionsDialog
            open={approvalAction.type !== null}
            onOpenChange={(open) =>
              !open && setApprovalAction({ type: null, entry: null })
            }
            action={approvalAction.type}
            entryId={approvalAction.entry?.id || ""}
            taskId={approvalAction.entry?.server_task_id?.toUpperCase() || ""}
            onConfirm={handleConfirmAction}
          />
        </>
      )}
    </div>
  );
}
