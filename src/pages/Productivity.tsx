// Productivity.tsx
import { ProductivityFormProvider } from "@/context/ProductivityFormContext";
import { Unauthorized401 } from "@/components/shared/Unauthorized401";
import { PageHeader } from "@/components/organisms/PageHeader";
import { ProductivityHeader } from "@/components/productivity/ProductivityHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/hooks/usePermission";
import { useWorkTypeOptions } from "@/hooks/useWorkTypeOptions";
import { useRBAC } from "@/context/RBACContext";
import { useAuth } from "@/context/AuthContext";
import { useMarket } from "@/context/MarketContext";
import { useApprovalBadgeCount } from "@/hooks/useApprovalBadgeCount";
import { useProductivityManager } from "@/hooks/productivity/useProductivityManager";
import { useFilteredEntries } from "@/hooks/useFilteredEntries";
import { useProductivityQuery } from "@/hooks/productivity/useProductivityQuery";
import { useCsvExporter } from "@/hooks/useCsvExporter";
import { WorkTypeEntryWithHistory } from "@/hooks/productivity/types";
import { ProductivityTable } from "@/components/ProductivityTable";
import React from "react";
import { toast } from "sonner";
import { useProductivityStore, type WorkTypeKey  } from "@/store/centralStore";

export default function Productivity() {
  return (
    <ProductivityFormProvider>
      <ProductivityGate />
    </ProductivityFormProvider>
  );
}

function ProductivityGate() {
  const canViewProductivity = usePermission({ action: "view-productivity" });
  if (!canViewProductivity) return <Unauthorized401 />;
  return <ProductivityAllowed />;
}


function ProductivityAllowed() {
  const selectedWorkType = useProductivityStore((s) => s.selectedWorkType);
  const setSelectedWorkType = useProductivityStore((s) => s.setSelectedWorkType);

  const canAddEntry    = usePermission({ action: "add-productivity-page" });
  const canEditEntry   = usePermission({ action: "edit-productivity-entry" });
  const canDeleteEntry = usePermission({ action: "delete-productivity-entry" });
  const canViewEntry   = usePermission({ action: "view-productivity-history" });

  React.useEffect(() => {
    setSelectedWorkType("all" as WorkTypeKey);
  }, [setSelectedWorkType]);


  
  const perms = React.useMemo(
    () => ({
      view: true,
      add: canAddEntry,
      edit: canEditEntry,
      delete: canDeleteEntry,
      viewHistory: canViewEntry,
    }),
    [canAddEntry, canEditEntry, canDeleteEntry, canViewEntry]
  );

  const { workTypeOptions, isLoading: isLoadingWorkTypes } = useWorkTypeOptions();
  const { roleCode } = useRBAC();
  const { user } = useAuth();
  const { currentMarket, sites } = useMarket();
  const { refreshCount } = useApprovalBadgeCount();

  const {
    entries,
    isLoading,
    editing_id,
    temp_row,
    handleDelete,
    startEdit,
    loadEntries,
    saveEdit,
    cancelEdit,
    addNewEntry,
    handleDeleteMany
  } = useProductivityManager(selectedWorkType);

  const siteOptions = React.useMemo(
    () => sites.filter((s) => s.market_code === currentMarket.code),
    [sites, currentMarket.code]
  );

  const filtered = useFilteredEntries(
    entries,
    selectedWorkType,
    siteOptions,
    currentMarket.code
  );


  const queryResult = useProductivityQuery({
    entries: filtered,
    isLoading,
  });

  const { downloadCSV } = useCsvExporter<WorkTypeEntryWithHistory>({
    filenamePrefix: "productivity-export",
  });

  const handleWorkTypeChange = React.useCallback((value: string) => {
    setSelectedWorkType(value as WorkTypeKey);
  }, [setSelectedWorkType]);

  const handleAddNewEntry = React.useCallback(async () => {
    if (selectedWorkType === "all") {
      toast.error("Please select a specific work type to add an entry");
      return;
    }
    await addNewEntry("TASK-X");
  }, [addNewEntry, selectedWorkType]);

  return (
    <div className="space-y-6 w-full max-w-full">
      <PageHeader
        title="Productivity"
        perms={perms}
        description="Manage productivity data entries"
        actions={
          <ProductivityHeader
            selectedWorkType={selectedWorkType}
            onWorkTypeChange={handleWorkTypeChange}
            onAddEntry={handleAddNewEntry}
            isGeneratingTaskId={false}
            workTypeOptions={workTypeOptions}
            perms={perms}
          />
        }
      />

      {isLoadingWorkTypes ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <ProductivityTable
          queryResult={queryResult}
          selectedWorkType={selectedWorkType}
          perms={perms}
          startEdit={startEdit}
          saveEdit={saveEdit}
          cancelEdit={cancelEdit}
          handleDeleteMany={handleDeleteMany}
          handleDelete={handleDelete}
          loadEntries={loadEntries}
          refreshApprovalBadge={refreshCount}
          downloadCSV={downloadCSV}
          editingId={editing_id}
          tempRow={temp_row}
        />
      )}
    </div>
  );
}
