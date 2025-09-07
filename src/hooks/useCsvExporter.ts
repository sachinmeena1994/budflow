// /hooks/useCsvExporter.ts
import { useMemo } from "react";
import { toast } from "sonner";
import { useWorkTypeOptions } from "@/hooks/useWorkTypeOptions";
import { useAuditLookupOptions } from "@/hooks/useAuditLookupOptions";
import { createFieldFormatter } from "@/hooks/useAuditHistory";

type ColumnSpec = { key: string; header: string };

type CsvExporterConfig<Row> = {
  filenamePrefix?: string;
  baseColumns?: ColumnSpec[];
  excludeKeysFromDynamic?: string[];
  getPayload?: (row: Row) => Record<string, any> | undefined;
  getWorkType?: (row: Row) => string | undefined;
  valueForKey?: (row: Row, key: string) => any;
};

function escapeCSV(val: string) {
  return val.includes(",") || val.includes('"') || val.includes("\n")
    ? `"${val.replace(/"/g, '""')}"`
    : val;
}

function coerceDate(val: any) {
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  }
  return val;
}

export function useCsvExporter<Row = any>(userCfg?: CsvExporterConfig<Row>) {
  const {
    siteOptions: siteOpts,
    strainOptions: strainOpts,
    technicianOptions: techOpts,
    userOptions: userOpts,
    batchOptions: batchOpts,
  } = useAuditLookupOptions();

  const { workTypeFieldMap } = useWorkTypeOptions();

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

  const cfg: Required<CsvExporterConfig<Row>> = {
    filenamePrefix: userCfg?.filenamePrefix ?? "export",
    baseColumns:
      userCfg?.baseColumns ??
      ([ 
        { key: "server_task_id", header: "Task ID" },
        { key: "work_type", header: "Work Type" },
        { key: "site_id", header: "Site ID" },
        { key: "batch_product_id", header: "Batch/Product" },
        { key: "approval_status", header: "Status" },
        { key: "created_by", header: "Created By" },
        { key: "created_at", header: "Created At" },
      ] as ColumnSpec[]),
    excludeKeysFromDynamic:
      userCfg?.excludeKeysFromDynamic ?? [
        "server_task_id",
        "work_type",
        "work_type_code",
        "site",
        "site_id",
        "batch",
        "batch_product_id",
        "created_by",
        "created_at",
        "approval_status",
        "work_entry_id",
        "task_id",
        "id",
      ],
    getPayload: userCfg?.getPayload ?? ((row: any) => row?.entry_payload ?? {}),
    getWorkType:
      userCfg?.getWorkType ??
      ((row: any) => {
        const payload = (row?.entry_payload ?? {}) as Record<string, any>;
        return row?.work_type || row?.work_type_code || payload?.work_type || payload?.work_type_code;
      }),
    valueForKey:
      userCfg?.valueForKey ??
      ((row: any, key: string) => {
        if (key === "server_task_id") {
          return (
            row?.server_task_id ??
            row?.task_id ??
            row?.id ??
            row?.work_entry_id ??
            row?.entry_payload?.server_task_id
          );
        }
        let v = row?.[key];
        if (v === undefined) {
          const payload = (row?.entry_payload ?? {}) as Record<string, any>;
          v = payload?.[key];
        }
        return v;
      }),
  };

  const downloadCSV = (rows: Row[]) => {
    if (!rows?.length) {
      toast.error("No data to export");
      return;
    }

    const dynamicMap = new Map<string, ColumnSpec>();
    const baseKeys = new Set(cfg.baseColumns.map((c) => c.key));

    for (const row of rows) {
      const wt = cfg.getWorkType(row);
      if (!wt) continue;
      const fields = workTypeFieldMap[wt] ?? [];
      for (const f of fields) {
        const key = String(f.field_key);
        if (!dynamicMap.has(key) && !baseKeys.has(key) && !cfg.excludeKeysFromDynamic.includes(key)) {
          dynamicMap.set(key, { key, header: String(f.label ?? key) });
        }
      }
    }

    const dynamicColumns = Array.from(dynamicMap.values());
    const columns = [...cfg.baseColumns, ...dynamicColumns];

    const header = columns.map((c) => c.header).join(",");

    const body = rows
      .map((row) =>
        columns
          .map((c) => {
            let v = cfg.valueForKey(row, c.key);
            v = coerceDate(v);
            v = csvFormatter(v, c.key);
            if (Array.isArray(v)) v = v.join(" | ");
            if (c.key === "server_task_id" && v) v = String(v).toUpperCase();
            const s = v == null ? "" : String(v);
            return escapeCSV(s);
          })
          .join(",")
      )
      .join("\n");

    const csv = header + "\n" + body;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cfg.filenamePrefix}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.success(`Successfully exported ${rows.length} entries to CSV`);
  };

  return { downloadCSV };
}
