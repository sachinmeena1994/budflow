import React from "react";
import { format } from "date-fns";
import { ColumnContext } from "../types";
import { useProductivityForm } from "@/context/ProductivityFormContext";

const isBlank = (v: any) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "");

function coalesceField(row: any, key: string) {
  const top = row?.[key];
  const payload = row?.entry_payload?.[key];
  if (!isBlank(top)) return top;
  if (!isBlank(payload)) return payload;
  return "";
}

function formatWholeNumberField(fieldKey: string, value: any) {
  const WHOLE_NUMBER_FIELDS = new Set(["grams_per_hour", "plants_per_hour"]);
  if (WHOLE_NUMBER_FIELDS.has(fieldKey) && typeof value === "number" && !isNaN(value)) {
    return Math.round(value).toString();
  }
  if (
    WHOLE_NUMBER_FIELDS.has(fieldKey) &&
    typeof value === "string" &&
    value.trim() !== "" &&
    !isNaN(Number(value))
  ) {
    return String(Math.round(Number(value)));
  }
  return value ?? "";
}

interface ViewCellProps {
  rowId: string;
  fieldKey: string;
  fieldType: string;
  context: ColumnContext;
  row: Record<string, any>;
}

export const ViewCell = ({
  rowId,
  fieldKey,
  fieldType,
  context,
  row,
}: ViewCellProps) => {
  const { siteOptions, batchOptions, technicianOptions, strainOptions, userOptions } =
    context;
    
  const { getCellValue } = useProductivityForm();
  
  // Get value from store or row data
  const value = getCellValue(rowId, fieldKey) || 
    (row?.entry_payload?.[fieldKey] ?? row?.[fieldKey] ?? "");

  const displayValue = (label: string) => (
    <span className="text-xs leading-5 whitespace-pre-wrap break-words break-all max-w-[28rem] ">{label ?? ""}</span>
  );

  // 🔹 Handle by type first
  switch (fieldType) {
    case "number":
      return displayValue(formatWholeNumberField(fieldKey, value));

    case "date": {
      const dateVal =
        value ||
        row.entry_payload?.[fieldKey] ||
        row[fieldKey] ||
        row.created_at ||
        "";
      return displayValue(dateVal ? format(new Date(dateVal), "MM/dd/yyyy") : "");
    }

    case "multi-select": {
      const ids =
        Array.isArray(row[fieldKey]) && row[fieldKey].length > 0
          ? row[fieldKey]
          : Array.isArray(row.entry_payload?.[fieldKey])
          ? row.entry_payload[fieldKey]
          : [];

      return (
        <div className="flex flex-wrap gap-1">
          {ids.map((id: string) => (
            <span key={id} className="text-xs bg-gray-100 px-2 py-1 rounded">
              {technicianOptions.find((t) => t.id === id)?.name || id}
            </span>
          ))}
        </div>
      );
    }

    case "select": {
      if (fieldKey === "site_id") {
        const siteId = coalesceField(row, "site_id");
        return displayValue(
          siteOptions.find((s) => s.id === String(siteId))?.label || "No Site"
        );
      }
      if (fieldKey === "strain") {
        const strainId =
          row.entry_payload?.strain || row.strain || value || "";
        return displayValue(
          strainOptions.find((s) => s.id === strainId)?.name || ""
        );
      }
      if (fieldKey === "batch_ref") {
        return displayValue(
          batchOptions.find((b) => b.id === String(value))?.product_name ||
            "No Batch"
        );
      }
      if (fieldKey === "created_by") {
        return displayValue(
          userOptions.find((u) => u.id === String(value))?.name || "Admin User"
        );
      }
      return displayValue(value);
    }

    case "text":
    default:
      return displayValue(value ?? "");
  }
};
