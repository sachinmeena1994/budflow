// src/services/workEntries.ts
import { supabase } from "@/integrations/supabase/client";

export type WorkEntryRow = {
  work_entry_id: string;
  work_type_code: string;
  technician_refs: string[] | null;
  entry_payload: string | Record<string, any>;
  approval_status: "Approved" | "Submitted" | "Rejected";
  approved_at: string | null;
  created_at: string;
  site_id: string | null;
};

export type DateRange = { startISO: string; endISO: string };

export function normalizeWorkType(code: string | null | undefined) {
  const c = (code || "").trim().toLowerCase();
  if (c.startsWith("hand")) return "hand";
  if (c.startsWith("break")) return "breakdown";
  if (c.startsWith("harv")) return "harvest";
  if (c.startsWith("mach")) return "machine";
  return c;
}

export function ensureISO(d: string | Date) {
  return (typeof d === "string" ? new Date(d) : d).toISOString();
}

export function payloadDateISO(payload: any): string | null {
  const raw = payload?.date;
  if (!raw) return null;
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
}

function parsePayload(p: WorkEntryRow["entry_payload"]) {
  if (!p) return {};
  if (typeof p === "string") {
    try { return JSON.parse(p); } catch { return {}; }
  }
  return p;
}

/**
 * Fetch Approved work entries, scoped by site & date.
 * Date filter is applied to approved_at primarily, falling back to created_at.
 */
export async function fetchApprovedWorkEntries(params: {
  siteId?: string | null;
  range: DateRange;
}): Promise<WorkEntryRow[]> {
  const { siteId, range } = params;

  let q = supabase
    .from("work_entries")
    .select("*")
    .eq("approval_status", "Approved")
    .gte("approved_at", range.startISO)
    .lt("approved_at", range.endISO);

  if (siteId) q = q.eq("site_id", siteId);

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((r) => ({
    ...r,
    entry_payload: parsePayload(r.entry_payload),
  })) as WorkEntryRow[];
}
