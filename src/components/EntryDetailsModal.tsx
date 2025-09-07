import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApprovalEntry } from "@/hooks/use-approvals-manager";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFieldFormatter } from "@/hooks/useAuditHistory";
import { useAuditLookupOptions } from "@/hooks/useAuditLookupOptions";
import { useWorkTypeOptions } from "@/hooks/useWorkTypeOptions";

// ------------------------- helpers -------------------------

const EXCLUDE_KEYS = new Set(["retention_percentage","grams_per_hour","labor_hours"]);

const ORDER = [
  "server_task_id",
  "work_type_code",
  "work_type",
  "date",
  "site_id",
  "strain",
  "technician_refs",
  "batch_ref",
  "total_plants",
  "team_size",
  "plants_per_hour",
  "first4_of_bt",
  "premium_retention_percentage",
  "input_weight",
  "output_weight",
  "trimmed_percentage",
  "grams_per_operator_hour",
  "duration_hours",
  "labor_minutes",
  "sample_bag_mass",
  "wet_weight",
  "wet_weight_grams",
  "output_weight_grams",
  "comment",
  "created_by",
  "created_at",
  "approved_by",
  "approved_at",
];

function sortKeys(keys: string[]) {
  return keys.sort((a, b) => {
    const ai = ORDER.indexOf(a);
    const bi = ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
}

// ------------------------- component -------------------------

interface EntryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: ApprovalEntry | null;
}

export const EntryDetailsModal: React.FC<EntryDetailsModalProps> = ({
  isOpen,
  onClose,
  entry,
}) => {
  if (!entry) return null;

  const {
    siteOptions,
    strainOptions,
    userOptions,
    technicianOptions,
    batchOptions,
  } = useAuditLookupOptions();

  const { rawFields } = useWorkTypeOptions();
  console.log("entry",entry)
  // ✅ build a label lookup from rawFields
  const fieldLabels = useMemo(() => {
    const map: Record<string, string> = {};
    rawFields.forEach((f) => {
      if (f.field_key && f.label) {
        map[f.field_key] = f.label;
      }
    });
    return map;
  }, [rawFields]);

  const formatValue = useMemo(() => {
    const formatter = createFieldFormatter({
      siteOptions,
      strainOptions,
      technicianOptions,
      userOptions,
      batchOptions,
    });

    return (value: any, key?: string): string => {
      if (key === "server_task_id") return value ? String(value).toUpperCase() : "-";

      if (key === "first4_of_bt") {
        if (typeof value === "string" && value.length >= 4) {
          return value.slice(-4); // last 4 chars
        }
        return String(value ?? "-");
      }

      if (["work_type_code", "work_type"].includes(key ?? "")) {
        return typeof value === "string"
          ? value.charAt(0).toUpperCase() + value.slice(1)
          : String(value ?? "-");
      }

      if (value === null || value === undefined) return "N/A";
      if (typeof value === "boolean") return value ? "Yes" : "No";
      if (typeof value === "number" && !Number.isInteger(value)) {
        return value.toFixed(2);
      }

      if (key === "site_id") {
        const site = siteOptions.find((s) => String(s.id) === String(value));
        return site ? site.label : String(value);
      }

      if (key === "strain") {
        const strain = strainOptions.find((s) => String(s.id) === String(value));
        return strain ? strain.name : String(value);
      }

     if (key === "technician_refs") {
  const toId = (v: any): string => {
    if (typeof v === "string") return v.trim();
    if (typeof v === "number") return String(v);
    if (v && typeof v === "object" && v.id) return String(v.id);
    return "";
  };

  const lookupName = (id: string): string => {
    const hit = technicianOptions.find(t => String(t.id) === id);
    return hit ? hit.name : id; 
  };

  if (Array.isArray(value)) {
    return value.map(v => lookupName(toId(v))).join(", ");
  }
  return lookupName(toId(value));
}


      if (Array.isArray(value)) {
        return value.map((id) => formatter(id, key ?? "")).join(", ");
      }

      return formatter(value, key ?? "");
    };
  }, [siteOptions, strainOptions, technicianOptions, userOptions, batchOptions]);

  // ✅ labelFor always uses rawFields labels
  const labelFor = (key: string) => {
    if (fieldLabels[key]) return fieldLabels[key];
    return key.replace(/_/g, " ");
  };

  const basicInfo = [
    { label: "Task ID", value: formatValue(entry.server_task_id, "server_task_id") },
    { label: "Work Type", value: formatValue(entry.work_type, "work_type") },
    { label: "Site", value: formatValue(entry.site_id, "site_id") },
    { label: "Batch/Product", value: formatValue(entry.batch_product_id, "batch_ref") },
    { label: "Status", value: formatValue(entry.approval_status) },
    { label: "Created By", value: formatValue(entry.created_by, "created_by") },
    { label: "Created At", value: new Date(entry.created_at).toLocaleString() },
    {
      label: "Technicians",
      value: formatValue(entry.technician_refs || [], "technician_refs"),
    },
  ];

  const visibleBasicInfo = basicInfo.filter((item) => {
    const s = String(item.value ?? "").trim();
    return s !== "" && s.toLowerCase() !== "n/a" && s !== "-";
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[92vw] max-h-[85vh] p-0 overflow-hidden">
        <div className="flex h-full max-h-[85vh] flex-col">
          <DialogHeader className="px-6 py-4 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              Entry Details - {entry.server_task_id?.toUpperCase?.()}
              <Badge variant={entry.approval_status === "Approved" ? "default" : "secondary"}>
                {entry.approval_status}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-auto px-6 pb-6">
            <div className="space-y-6">
              {visibleBasicInfo.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {visibleBasicInfo.map((item, index) => (
                        <div key={index} className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">
                            {item.label}
                          </label>
                          <div className="text-sm whitespace-pre-wrap break-words break-all">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {entry.entry_payload && Object.keys(entry.entry_payload).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Entry Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {sortKeys(Object.keys(entry.entry_payload))
                        .filter((key) => {
                          if (EXCLUDE_KEYS.has(key)) return false;
                          const value = entry.entry_payload[key];
                          if (value === null || value === undefined) return false;
                          if (typeof value === "string" && value.trim() === "") return false;
                          if (Array.isArray(value) && value.length === 0) return false;
                          return true;
                        })
                        .map((key) => {
                          const value = entry.entry_payload[key];
                          const formatted = formatValue(value, key);
                          if (typeof formatted === "string" && formatted.trim() === "") return null;
                          if (formatted.toLowerCase?.() === "n/a" || formatted === "-") return null;
                          return (
                            <div key={key} className="space-y-1">
                              <label className="text-sm font-medium text-muted-foreground capitalize">
                                {labelFor(key)}
                              </label>
                              <div className="text-sm whitespace-pre-wrap break-words break-all">
                                {formatted}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
