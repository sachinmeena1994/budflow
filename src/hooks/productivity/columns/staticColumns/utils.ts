
// Date utilities
export const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export const toIsoDateLocal = (input: any): string => {
  if (!input) return "";

  // already "yyyy-mm-dd"
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}/.test(input)) {
    return input.slice(0, 10);
  }

  // "MM/dd/yyyy"
  if (typeof input === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(input)) {
    const [m, d, y] = input.split("/").map(Number);
    const dt = new Date(y, m - 1, d); // local
    if (!isNaN(+dt)) {
      return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
    }
  }

  // Date or parseable
  const dt = input instanceof Date ? input : new Date(input);
  if (!isNaN(+dt)) {
    return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
  }

  return "";
};

type DateRange = { from?: any; to?: any };

/** Accepts string, Date, or {from,to} and compares local yyyy-mm-dd */
export const dateFilterFn = (row: any, columnId: string, filterValue: any) => {
  const iso = toIsoDateLocal(row.getValue(columnId)); // normalize row value

  if (!filterValue) return true;

  // range: inclusive on both ends
  if (typeof filterValue === "object" && (filterValue.from || filterValue.to)) {
    const { from, to } = filterValue as DateRange;
    const fromIso = from ? toIsoDateLocal(from) : "";
    const toIso = to ? toIsoDateLocal(to) : "";
    if (fromIso && iso < fromIso) return false;
    if (toIso && iso > toIso) return false; // inclusive
    return true;
  }

  // single value
  const want = toIsoDateLocal(filterValue);
  if (!want) return true;
  return iso.includes(want);
};

// Custom filter function for technician names with word-start matching
export const technicianFilterFn = (row: any, columnId: string, filterValue: any, technicianOptions: any[]) => {
  const technicianIds = row.getValue(columnId);
  
  if (!filterValue) return true;
  
  // If filterValue is an array of IDs (from multi-select), use intersection behavior
  if (Array.isArray(filterValue)) {
    if (filterValue.length === 0) return true;
    return Array.isArray(technicianIds) && technicianIds.some(id => filterValue.includes(id));
  }
  
  // If filterValue is a string, use word-start matching
  if (typeof filterValue === "string") {
    const query = filterValue.trim().toLowerCase();
    if (!query) return true;
    
    const queryTokens = query.split(/\s+/);
    
    // Get technician names for the row
    const technicianNames = Array.isArray(technicianIds) 
      ? technicianIds.map(id => {
          const tech = technicianOptions.find(t => t.id === id);
          return tech?.name || "";
        }).filter(Boolean)
      : [];
    
    // Check if any technician name matches the query
    return technicianNames.some(name => {
      const nameTokens = name.toLowerCase().split(/\s+/);
      
      if (queryTokens.length === 1) {
        // Single token: match any name token starting with it
        return nameTokens.some(token => token.startsWith(queryTokens[0]));
      } else {
        // Multi-token: each query token must match the start of corresponding name token (ordered)
        if (queryTokens.length > nameTokens.length) return false;
        
        return queryTokens.every((queryToken, index) => 
          nameTokens[index] && nameTokens[index].startsWith(queryToken)
        );
      }
    });
  }
  
  return true;
};

export const getWorkTypeBadgeStyle = (workType: string) => {
  switch (workType?.toLowerCase()) {
    case "breakdown": return "bg-red-100 text-red-800 border-red-200";
    case "harvest": return "bg-orange-100 text-orange-800 border-orange-200";
    case "hand": return "bg-green-100 text-green-800 border-green-200";
    case "machine": return "bg-blue-100 text-blue-800 border-blue-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getApprovalStatus = (r: any) =>
  String(r?.approval_status ?? r?.entry_payload?.approval_status ?? "").toLowerCase();

export const isApproved = (r: any) => getApprovalStatus(r) === "approved";
