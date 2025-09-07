import React,{ useMemo, useState, useCallback } from "react";
import { useStaticColumns } from "@/hooks/productivity/columns/staticColumns/index";
import { dynamicColumns } from "@/hooks/productivity/columns/dynamicColumns";
import { AuditHistoryModalNew } from "@/components/audit/AuditHistoryModalNew";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMarket } from "@/context/MarketContext";
import { useProductivityForm } from "@/context/ProductivityFormContext";

interface UseProductivityColumnsProps {
  workType: string;
  editingId: string | null;
  tempRow: Record<string, any> | null;
  onInputChange: (fieldKey: string, value: any) => void;
  onEdit: (entry: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onHistory: (id: string) => void;
  isAddingNew?: boolean;
  newEntryRef?: React.RefObject<HTMLInputElement>;
  perms?: {
    view?: boolean;
    add?: boolean;
    edit?: boolean;
    delete?: boolean;
    viewHistory?: boolean;
  };
}

export function useProductivityColumns({
  workType,
  editingId,
  tempRow,
  onInputChange,
  onEdit,
  onDelete,
  onHistory,
  isAddingNew = false,
  newEntryRef,
  perms = {}
}: UseProductivityColumnsProps) {
  const [historyModalOpen, setHistoryModalOpen] = useState<{
    open: boolean;
    taskId: string;
    serverTaskId: string;
  }>({ open: false, taskId: "",serverTaskId:"" });

  const { currentSite } = useMarket()

  // Sync central store with props
  const { setEditingId, setTempRow } = useProductivityForm();
  
  React.useEffect(() => {
    setEditingId(editingId);
  }, [editingId, setEditingId]);
  
  React.useEffect(() => {
    setTempRow(tempRow);
  }, [tempRow, setTempRow]);

  

const siteOptions = useMemo(() => {
  if (!currentSite) return [];
  return [
    {
      id: currentSite.id,
      label: currentSite.site_alias,
    },
  ];
}, [currentSite]);
  const { data: batchOptions = [] } = useQuery({
    queryKey: ["batch"],
    queryFn: async () => {
      const { data } = await supabase.from("batches").select("id, name").order("name");
      return data?.map(batch => ({ id: batch.id, product_name: batch.name })) || [];
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

const { data: technicianOptions = [] } = useQuery({
  queryKey: ["employees", "active", "withSite"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("employee_id, full_name")
      .eq("employment_status", "active")
      .not("site_id", "is", null)
      .order("full_name");

    if (error) {
      console.error("Error fetching technician options:", error);
      return [];
    }

    return (data || []).map(emp => ({
      id: emp.employee_id,
      name: emp.full_name,
    }));
  },
});


const { data: strainOptions = [] } = useQuery({
  queryKey: ["strain"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("strain")
      .select("id, name")
      .order("name")
      .filter("permissions_json->>visible", "eq", "true"); // 👈 filter only visible strains

    if (error) {
      console.error("Error fetching strains:", error);
      return [];
    }

    return data || [];
  },
  staleTime: 30 * 60 * 1000, // 30 minutes
  gcTime: 60 * 60 * 1000,    // 60 minutes
});


  const { data: userOptions = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await supabase.from("users").select("id, full_name").order("full_name");
      return data?.map(user => ({ id: user.id, name: user.full_name })) || [];
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
// inside your useQuery for workTypeFields
const safeParse = (v: any) => {
  if (!v) return undefined;
  if (Array.isArray(v) || typeof v === "object") return v;
  try { return JSON.parse(v); } catch { return v; }
};

const { data: workTypeFields = [], isLoading: isLoadingFields } = useQuery({
  queryKey: ["work-type-fields", workType],
  queryFn: async () => {
    if (workType === "all") return [];
    const { data } = await supabase
      .from("work_type_fields")
      .select("*")
      .eq("work_type", workType)
      .order("order_index")
      .limit(100);

    if (!data) return [];

    // remove hand-trim field, and PARSE options + normalize type
    const filtered = workType.toLowerCase() === "hand trim"
      ? data.filter(f => f.field_key !== "retention_percentage")
      : data;

    return filtered.map((f: any) => ({
      ...f,
      type: String(f.type || "").toLowerCase(),     // "select", "number", etc.
      options: safeParse(f.options),                 // <-- IMPORTANT
    }));
  },
  enabled: workType !== "all",
  staleTime: 30 * 60 * 1000,
  gcTime: 60 * 60 * 1000,
});



  
  // Stable callback functions
  const handleHistory = useCallback((work_entry_id: string) => {
    onHistory(work_entry_id);
  }, [onHistory]);

  const handleAddToUnapproved = useCallback((id: string) => {

  }, []);

  const stableInputChange = useCallback((fieldKey: string, value: any) => {
    onInputChange(fieldKey, value);
  }, [onInputChange]);

  // Create context - remove handleInputChange since it's now handled by the store
  const context = useMemo(() => ({
    workType,
    editingId,
    tempRow,
    handleInputChange: stableInputChange, // Keep for compatibility but cells use store directly
    onEdit,
    onDelete,
    onHistory: handleHistory,
    onAddToUnapproved: handleAddToUnapproved,
    siteOptions,
    batchOptions,
    technicianOptions,
    strainOptions,
    userOptions,
    isAddingNew,
    newEntryRef,
    setHistoryModalOpen,
    workTypeFields
  }), [
    workType, editingId, tempRow, stableInputChange, onEdit, onDelete,
    handleHistory, handleAddToUnapproved,
    siteOptions, batchOptions, technicianOptions,
    strainOptions, userOptions, isAddingNew, newEntryRef, workTypeFields
  ]);

  const baseColumns = useStaticColumns(context)
  const columns = useMemo(() => {
    return [
      ...baseColumns,
      ...dynamicColumns(workTypeFields, context),
    ];
  }, [context, workTypeFields]);

const historyModal = (
  <AuditHistoryModalNew
    isOpen={historyModalOpen.open}
    onClose={() => setHistoryModalOpen({ open: false, taskId: "",serverTaskId:"" })}
    entryId={historyModalOpen.taskId}
    siteOptions={siteOptions}
    strainOptions={strainOptions}
    technicianOptions={technicianOptions}
    userOptions={userOptions}
    batchOptions={batchOptions}
  />
);

  return {
    columns,
    historyModal,
    workTypeFields,
    isLoadingFields,
  };
}
  