
import { toIsoDate, normalizeFilterValueToString } from "./utils";

/**
 * Date filter function for dynamic columns
 */
export const createDateFilterFn = () => {
  return (row: any, columnId: string, filterValue: any) => {
    const iso = (row.getValue(columnId) as string) || "";
    if (!filterValue) return true;

    if (typeof filterValue === "object" && (filterValue.from || filterValue.to)) {
      const fromIso = filterValue.from ? toIsoDate(filterValue.from) : "";
      const toIso = filterValue.to ? toIsoDate(filterValue.to) : "";
      if (fromIso && iso < fromIso) return false;
      if (toIso && iso > toIso) return false;
      return true;
    }
    const want = toIsoDate(filterValue);
    return !want || iso.includes(want);
  };
};

/**
 * Text/select filter function for dynamic columns
 */
export const createTextFilterFn = () => {
  return (row: any, columnId: string, filterValue: any) => {
    if (!filterValue) return true;
    // ignore special add-row placeholder if present
    if ((row.original as any)?.__isAddRow) return true;

    const cellValue = String(row.getValue(columnId) ?? "").toLowerCase().trim();
    const search = normalizeFilterValueToString(filterValue).toLowerCase().trim();
    return cellValue.includes(search);
  };
};
