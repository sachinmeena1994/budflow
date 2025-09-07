// src/services/computeFlags.ts
import type { WorkEntryRow } from "./workEntries";
import { normalizeWorkType } from "./workEntries";

export type FlagLevel = "red" | "orange";

export type FlaggedWorker = {
  id: string;             // tech id (or fallback to work_entry_id)
  name: string;           // resolved via nameMap if provided
  workType: string;       // "Hand Trim"
  gph: number;            // grams per hour from the picked row
  targetGph: number;      // 180
  premiumPercent: number; // Premium Retention % from the picked row
  flagLevel: FlagLevel;
  flagReason: string;     // "Below 20% of target" | "At / below target"
  created_at?: string | null; // latest created_at (fallback approved_at) for that tech
};

export type ComputeFlagsOptions = {
  siteId?: string;                  // optional site filter
  startISO?: string;                // inclusive lower bound (ISO)
  endISO?: string;                  // inclusive upper bound (ISO)
  nameMap?: Record<string, string>; // techId -> display name
  // kept for compatibility; unused now that we read stored columns
  minMinutesForRate?: number;
};

const TARGET_HAND = 180;

/* ---------------- helpers ---------------- */

const n = (v: any): number | undefined => {
  const num = Number(v);
  return Number.isFinite(num) ? num : undefined;
};

// Case/spacing/format-insensitive key lookup
function firstNumByInsensitiveKey(
  payload: Record<string, any>,
  candidates: string[],
  fallback = 0
): number {
  const norm = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
  const map = new Map<string, any>();
  for (const k of Object.keys(payload)) map.set(norm(k), payload[k]);

  for (const cand of candidates) {
    const v = map.get(norm(cand));
    const num = n(v);
    if (Number.isFinite(num)) return num!;
  }
  return fallback;
}

function withinRange(ts: string | null | undefined, start?: number, end?: number) {
  if (!ts) return true;
  const t = Date.parse(ts);
  if (!Number.isFinite(t)) return true;
  if (start !== undefined && t < start) return false;
  if (end !== undefined && t > end) return false;
  return true;
}

/* ---------------- stored column keys ---------------- */

// Hand Trim KPI column for worker rate:
const HAND_GPH_KEYS = [
  "Total Grams/Hr",
  "total grams/hr",
  "total_grams_per_hour",
  "total_grams_hr",
  "gph",
];

// Hand Trim stored Premium Retention %:
const HAND_PREMIUM_RETENTION_KEYS = [
  "Premium Retention %",
  "premium retention %",
  "premium_retention_percent",
  "premium_retention_pct",
  "premium_retention_%",
];

/* ---------------- classification ---------------- */

function classifyDelta(deltaPct: number): { level: FlagLevel | null; reason: string } {
  // deltaPct = ((value - target) / target) * 100
  if (deltaPct <= -20) {
    return { level: "red", reason: "20% below target" };
  } else if (deltaPct <= 0) {
    return { level: "orange", reason: "At or below target" };
  } else {
    return { level: null, reason: "" }; // green (not flagged)
  }
}


/* ---------------- main (latest-row-per-tech, no aggregation) ---------------- */

/* ---------------- main (aggregate per-tech over range) ---------------- */
export function computeFlaggedWorkers(
  rows: WorkEntryRow[],
  opts: ComputeFlagsOptions = {}
): FlaggedWorker[] {
  const { siteId, startISO, endISO, nameMap } = opts;

  const start = startISO ? Date.parse(startISO) : undefined;
  const end   = endISO   ? Date.parse(endISO)   : undefined;

  console.groupCollapsed("[flags] computeFlaggedWorkers");
  console.log("Input:", { totalRows: rows.length, siteId, startISO, endISO, TARGET_HAND });

  type Agg = {
    sumGph: number;
    sumPrem: number;
    count: number;
    latestTs: number;
    latestISO?: string | null;
  };

  const perTech = new Map<string, Agg>();

  for (const r of rows) {
    // gate checks
    if (!r || r.approval_status !== "Approved") {
      console.log("  ✖ skip: not Approved", { work_entry_id: r?.work_entry_id, approval_status: r?.approval_status });
      continue;
    }
    if (siteId && r.site_id && String(r.site_id) !== String(siteId)) {
      console.log("  ✖ skip: site mismatch", { work_entry_id: r.work_entry_id, rowSite: r.site_id, wantedSite: siteId });
      continue;
    }

    const filterIso = (r as any).approved_at ?? (r as any).created_at ?? null;
    if (!withinRange(filterIso, start, end)) {
      console.log("  ✖ skip: out of range", { work_entry_id: r.work_entry_id, filterIso });
      continue;
    }

    const wt = normalizeWorkType(r.work_type_code);
    if (wt !== "hand") {
      console.log("  ✖ skip: not Hand Trim", { work_entry_id: r.work_entry_id, wt });
      continue;
    }

    // extract stored values
    const payload = ((r.entry_payload || {}) as Record<string, any>) ?? {};
    const gphVal     = firstNumByInsensitiveKey(payload, HAND_GPH_KEYS, NaN);
    const premRetPct = firstNumByInsensitiveKey(payload, HAND_PREMIUM_RETENTION_KEYS, NaN);

    if (!Number.isFinite(gphVal)) {
      console.log("  ✖ skip: no valid GPH in payload", { work_entry_id: r.work_entry_id, HAND_GPH_KEYS, payload });
      continue;
    }

    const gph  = Number(gphVal);
    const prem = Number.isFinite(premRetPct) ? Number(premRetPct) : NaN;

    // row-level math vs target (for visibility)
    const rowDeltaPct = TARGET_HAND > 0 ? ((gph - TARGET_HAND) / TARGET_HAND) * 100 : 0;

    const techId =
      (Array.isArray(r.technician_refs) && r.technician_refs[0]) || r.work_entry_id;

    const orderIso = (r as any).approved_at ?? (r as any).created_at ?? null;
    const orderTs = orderIso ? Date.parse(orderIso) : -Infinity;

    console.log("  ✓ accept row", {
      work_entry_id: r.work_entry_id,
      techId: String(techId),
      gph,
      target: TARGET_HAND,
      "rowDelta%": `${rowDeltaPct.toFixed(1)}%`,
      prem: Number.isFinite(prem) ? prem : "(n/a)",
      dateForOrder: orderIso
    });

    // aggregate
    const agg = perTech.get(String(techId)) ?? {
      sumGph: 0,
      sumPrem: 0,
      count: 0,
      latestTs: -Infinity,
      latestISO: null,
    };

    agg.sumGph += gph;
    if (Number.isFinite(prem)) agg.sumPrem += prem;
    agg.count += 1;

    if (orderTs > agg.latestTs) {
      agg.latestTs = orderTs;
      agg.latestISO = orderIso;
    }

    perTech.set(String(techId), agg);
  }

  // per-tech math summary logs
  console.groupCollapsed("Per-tech aggregates (raw)");
  perTech.forEach((agg, techId) => {
    const avgGph  = agg.count ? agg.sumGph / agg.count : 0;
    const avgPrem = agg.count && agg.sumPrem ? agg.sumPrem / agg.count : NaN;
    const deltaPct = TARGET_HAND > 0 ? ((avgGph - TARGET_HAND) / TARGET_HAND) * 100 : 0;
    console.log(`  tech ${techId}`, {
      samples: agg.count,
      sumGph: agg.sumGph.toFixed(2),
      avgGph: avgGph.toFixed(2),
      target: TARGET_HAND,
      "avgDelta%": `${deltaPct.toFixed(1)}%`,
      avgPremium: Number.isFinite(avgPrem) ? `${avgPrem.toFixed(1)}%` : "(n/a)",
      latestISO: agg.latestISO ?? null,
    });
  });
  console.groupEnd();

  // build flagged list
  const flagged: FlaggedWorker[] = [];
  perTech.forEach((agg, techId) => {
    if (agg.count <= 0) return;
    const avgGph  = agg.sumGph / agg.count;
    const avgPrem = agg.sumPrem > 0 ? agg.sumPrem / agg.count : NaN;

    const deltaPct = TARGET_HAND > 0 ? ((avgGph - TARGET_HAND) / TARGET_HAND) * 100 : 0;
    const { level, reason } = classifyDelta(deltaPct);

    if (!level) {
      console.log("  → not flagged (green)", {
        techId,
        avgGph: avgGph.toFixed(1),
        target: TARGET_HAND,
        "avgDelta%": `${deltaPct.toFixed(1)}%`,
      });
      return;
    }

    const row: FlaggedWorker = {
      id: String(techId),
      name: nameMap?.[String(techId)] ?? String(techId),
      workType: "Hand Trim",
      gph: Math.round(avgGph * 10) / 10,
      targetGph: TARGET_HAND,
      premiumPercent: Number.isFinite(avgPrem) ? Math.round(avgPrem) : 0,
      flagLevel: level,
      flagReason: reason,
      created_at: agg.latestISO ?? null,
    };
    flagged.push(row);

    console.log("  → FLAGGED", {
      techId,
      avgGph: row.gph,
      target: row.targetGph,
      "avgDelta%": `${deltaPct.toFixed(1)}%`,
      level,
      reason,
    });
  });

  // sort and final summary
  flagged.sort((a, b) => {
    const rankA = a.flagLevel === "red" ? 0 : 1;
    const rankB = b.flagLevel === "red" ? 0 : 1;
    if (rankA !== rankB) return rankA - rankB;
    const perfA = (a.gph / a.targetGph) * 100;
    const perfB = (b.gph / b.targetGph) * 100;
    return perfA - perfB;
  });

  const reds = flagged.filter(f => f.flagLevel === "red").length;
  const oranges = flagged.filter(f => f.flagLevel === "orange").length;

  console.log("Final flagged:", { total: flagged.length, reds, oranges, flagged });
  console.groupEnd();

  return flagged;
}
