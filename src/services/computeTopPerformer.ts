// src/services/computeTopPerformers.ts
import type { WorkEntryRow } from "./workEntries";
import { normalizeWorkType, payloadDateISO } from "./workEntries";

export type WorkTypeKey = "breakdown" | "hand" | "harvest" | "machine";

export const WORKTYPE_TARGET: Record<
  WorkTypeKey,
  { target: number; unit: string; label: string }
> = {
  breakdown: { target: 1800, unit: "g/hr",      label: "Breakdown" },
  hand:      { target:  180, unit: "g/hr",      label: "Hand Trim" },
  harvest:   { target:   20, unit: "plants/hr", label: "Harvest" },
  machine:   { target: 4500, unit: "g/hr",      label: "Machine" },
};

export type TopPerformer = {
  techId: string;
  name: string;
  workType: WorkTypeKey;
  value: number;      // g/hr or plants/hr
  unit: string;
  target: number;
  deltaAbs: number;   // value - target
  deltaPct: number;   // ((value - target) / target) * 100
  /** Most recent contributing date (ISO). Prefers payload date -> approved_at -> created_at */
  created_at?: string | null;
};

type ComputeOpts = {
  workType?: WorkTypeKey;            // default: "hand"
  limit?: number;                    // default: 5
  nameMap?: Record<string, string>;  // optional id -> display name
  startISO?: string;                 // inclusive lower bound (ISO) – pass start of 7-day window
  endISO?: string;                   // inclusive upper bound (ISO) – pass end of 7-day window
};

/* ---------------- helpers ---------------- */

const round = (x: number, d = 1) => Math.round(x * Math.pow(10, d)) / Math.pow(10, d);

const n = (v: any) => {
  const num = Number(v);
  return Number.isFinite(num) ? num : undefined;
};

/** Case/spacing-insensitive lookup of numeric payload fields */
function firstNumByInsensitiveKey(
  payload: Record<string, any>,
  candidates: string[],
  fallback = NaN
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

/** Ordered, case-sensitive lookup (for formula fallbacks) */
function firstNum(payload: Record<string, any>, keys: string[], fallback = 0): number {
  for (const k of keys) {
    const v = n(payload[k]);
    if (Number.isFinite(v)) return v!;
  }
  return fallback;
}

const perHour = (num: number, hrs: number) => (hrs > 0 ? num / hrs : 0);
const minutesToPerHour = (total: number, mins: number) => (mins > 0 ? (total / mins) * 60 : 0);

function withinRange(tsISO: string | null | undefined, start?: number, end?: number) {
  if (!tsISO) return true;
  const t = Date.parse(tsISO);
  if (!Number.isFinite(t)) return true;
  if (start !== undefined && t < start) return false;
  if (end !== undefined && t > end) return false;
  return true;
}

/* ---------------- stored rate keys per work type ---------------- */

const RATE_KEYS: Record<WorkTypeKey, string[]> = {
  breakdown: [
    "Grams / Labor Hour",
    "grams / labor hour",
    "grams_per_labor_hour",
    "gph",
    "grams_per_hour",
  ],
  hand: [
    "Total Grams/Hr",
    "total grams/hr",
    "total_grams_per_hour",
    "gph",
    "grams_per_hour",
  ],
  harvest: [
    "Plants / Labor Hour",
    "plants / labor hour",
    "plants_per_labor_hour",
    "plants_per_hour",
  ],
  machine: [
    "Grams per Operator Hour",
    "grams per operator hour",
    "finished_grams_per_hour",
    "total_grams_per_hour",
    "gph",
  ],
};

/* ---------------- main ---------------- */

/**
 * Computes per-tech average rate over the provided date range.
 * - Considers only "Approved" rows.
 * - Aggregates across the range (e.g., last 7 days), not per day.
 * - Prefers stored per-hour rate columns; falls back to KPI formulas when missing.
 * - Returns top N above target.
 * - Adds most recent contributing date (ISO) per tech: payload.date -> approved_at -> created_at.
 * - Emits console logs showing filtering, aggregation, and final results.
 */
export function computeTopPerformers(
  rows: WorkEntryRow[],
  opts: ComputeOpts = {}
): TopPerformer[] {
  const workType: WorkTypeKey = opts.workType ?? "hand";
  const limit = opts.limit ?? 5;
  const nameMap = opts.nameMap ?? {};
  const start = opts.startISO ? Date.parse(opts.startISO) : undefined;
  const end   = opts.endISO   ? Date.parse(opts.endISO)   : undefined;

  console.groupCollapsed("[TopPerformers] computeTopPerformers");
  console.log("Work type:", workType, "Target:", WORKTYPE_TARGET[workType]);
  console.log("Rows in:", rows.length, "Range:", { startISO: opts.startISO, endISO: opts.endISO });

  type Agg = {
    // preferred: direct rate fields
    sumRate: number;   // Σ stored rate
    cntRate: number;   // count of stored rate rows
    // fallback accumulators for rows with no stored rate
    sumNum: number;    // numerator (grams or plants)
    sumMins: number;   // minutes (for non-harvest)
    sumHrs: number;    // hours (for harvest)
    // most recent contributing ISO date
    latestISO: string | null;
    latestTs: number; // Date.parse(latestISO)
  };

  const perTech = new Map<string, Agg>();

  for (const r of rows) {
    if (!r || r.approval_status !== "Approved") {
      console.log("skip row: not approved", r?.work_entry_id);
      continue;
    }

    const wt = normalizeWorkType(r.work_type_code) as WorkTypeKey;
    if (wt !== workType) {
      // console.log("skip row: different workType", r.work_entry_id, wt);
      continue;
    }

    const p: Record<string, any> = r.entry_payload || {};

    // choose contributing date (ISO) for range filter & latest tracking
    const iso = payloadDateISO(p) ?? (r as any).approved_at ?? (r as any).created_at ?? null;
    if (!withinRange(iso, start, end)) {
      console.log("skip row: out of range", r.work_entry_id, { iso });
      continue;
    }
    const ts = iso ? Date.parse(iso) : NaN;

    // prefer stored rate columns
    const directRate = firstNumByInsensitiveKey(p, RATE_KEYS[wt], NaN);

    // identify the tech row owner
    const techId =
      (Array.isArray(r.technician_refs) && r.technician_refs[0]) || r.work_entry_id;

    const agg =
      perTech.get(techId) ??
      {
        sumRate: 0,
        cntRate: 0,
        sumNum: 0,
        sumMins: 0,
        sumHrs: 0,
        latestISO: null,
        latestTs: -Infinity,
      };

    if (Number.isFinite(directRate)) {
      agg.sumRate += Number(directRate);
      agg.cntRate += 1;
      console.log("row accepted (direct rate)", {
        techId,
        iso,
        directRate,
        sumRate: agg.sumRate,
        cntRate: agg.cntRate,
      });
    } else {
      // fallback to KPI formulas just for rows missing the stored rate
      if (wt === "breakdown") {
        const grams = firstNum(p, ["total_flower_mass", "output_weight", "trim_weight", "wet_weight_grams", "weight"], 0);
        const mins  = firstNum(p, ["total_time", "total_labor_mins", "total_time_minutes", "labor_minutes"], 0);
        agg.sumNum  += grams;
        agg.sumMins += mins;
        console.log("row accepted (fallback breakdown)", { techId, iso, grams, mins, sumNum: agg.sumNum, sumMins: agg.sumMins });
      } else if (wt === "hand") {
        const grams = firstNum(p, ["total_untrimmed", "total_weight", "wet_weight_grams"], 0);
        const mins  = firstNum(p, ["total_time_minutes", "total_labor_mins", "labor_minutes"], 0);
        agg.sumNum  += grams;
        agg.sumMins += mins;
        console.log("row accepted (fallback hand)", { techId, iso, grams, mins, sumNum: agg.sumNum, sumMins: agg.sumMins });
      } else if (wt === "machine") {
        const grams = firstNum(p, ["output_weight", "finished_trim_weight", "trim_weight"], 0);
        const mins  = firstNum(p, ["total_labor_mins", "total_time_minutes", "labor_minutes"], 0);
        agg.sumNum  += grams;
        agg.sumMins += mins;
        console.log("row accepted (fallback machine)", { techId, iso, grams, mins, sumNum: agg.sumNum, sumMins: agg.sumMins });
      } else if (wt === "harvest") {
        const plants = firstNum(p, ["number_of_plants", "total_plants", "plants"], 0);
        const hrs    = firstNum(p, ["labor_hours", "duration_hours", "hours"], 0);
        agg.sumNum  += plants;
        agg.sumHrs  += hrs;
        console.log("row accepted (fallback harvest)", { techId, iso, plants, hrs, sumNum: agg.sumNum, sumHrs: agg.sumHrs });
      }
    }

    // track the most recent contributing date
    if (Number.isFinite(ts) && ts > agg.latestTs) {
      agg.latestTs = ts;
      agg.latestISO = iso;
    }

    perTech.set(techId, agg);
  }

  const { target, unit } = WORKTYPE_TARGET[workType];

  const out: TopPerformer[] = Array.from(perTech.entries())
    .map(([techId, a]) => {
      // choose value: avg stored rate > computed from accumulators
      let value = 0;
      if (a.cntRate > 0) {
        value = a.sumRate / a.cntRate;
      } else {
        value =
          workType === "harvest"
            ? perHour(a.sumNum, a.sumHrs)
            : minutesToPerHour(a.sumNum, a.sumMins);
      }

      const deltaAbs = value - target;
      const deltaPct = target > 0 ? (deltaAbs / target) * 100 : 0;

      const row: TopPerformer = {
        techId,
        name: nameMap[String(techId)] ?? String(techId),
        workType,
        value: round(value),
        unit,
        target,
        deltaAbs: round(deltaAbs),
        deltaPct: round(deltaPct, 1),
        created_at: a.latestISO ?? null,
      };

      console.log("agg result per tech", { techId, ...row, rawAgg: a });
      return row;
    })
    .filter((x) => x.deltaAbs > 0) // only above target
    .sort((a, b) => b.deltaAbs - a.deltaAbs)
    .slice(0, limit);

  console.table(out);
  console.groupEnd();

  return out;
}
