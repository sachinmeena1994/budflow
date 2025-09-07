// src/services/computeTrends.ts
import type { WorkEntryRow } from "./workEntries";
import { normalizeWorkType, payloadDateISO } from "./workEntries";

export type WorkTypeKey = "breakdown" | "hand" | "harvest" | "machine";

export type TrendPoint = {
  date: string;   // YYYY-MM-DD (local)
  value: number;  // daily rate (g/hr or plants/hr)
  target: number;
};

export type TrendSeries = TrendPoint[];

/**
 * Targets are for display/benchmarking only.
 * - Breakdown g/hr = (sum total_flower_mass / sum labor_minutes) * 60
 * - Hand g/hr      = (sum total_untrimmed   / sum labor_minutes) * 60
 * - Machine g/hr   = (sum output_weight     / sum labor_minutes) * 60
 * - Harvest p/hr   =  sum plants / sum labor_hours
 */
export const TARGETS: Record<WorkTypeKey, number> = {
  breakdown: 1800,
  hand: 180,
  harvest: 20,
  machine: 4500,
};

/* ---------------- helpers ---------------- */

const round = (x: number, d = 1) => {
  const m = Math.pow(10, d);
  return Math.round(x * m) / m;
};

function ymdLocal(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function n(v: any): number | undefined {
  const num = Number(v);
  return Number.isFinite(num) ? num : undefined;
}

/** Case-sensitive key lookup with ordered fallbacks (original style). */
function firstNum(p: Record<string, any>, keys: string[], fallback = 0): number {
  for (const k of keys) {
    const v = n(p?.[k]);
    if (Number.isFinite(v)) return v!;
  }
  return fallback;
}

const perHour = (num: number, hrs: number) => (hrs > 0 ? num / hrs : 0);
const minutesToPerHour = (total: number, mins: number) =>
  mins > 0 ? (total / mins) * 60 : 0;

/* ---------------- main ---------------- */

/**
 * Build a daily series for a given work type using aggregated components:
 * - Breakdown/Hand/Machine: compute g/hr from (sum grams / sum minutes) * 60
 * - Harvest: compute plants/hr from (sum plants / sum hours)
 *
 * Notes:
 * - Approved rows only.
 * - Day bucket: payload.date (preferred) -> approved_at -> created_at (local YYYY-MM-DD).
 * - Uses schema-first keys with sensible fallbacks (case-sensitive, ordered).
 */
export function computeTrendSeries(
  rows: WorkEntryRow[],
  workType: WorkTypeKey,
  options?: { windowDays?: number; endDay?: Date }
): TrendSeries {
  const windowDays = options?.windowDays ?? 7;
  const end = options?.endDay ? new Date(options.endDay) : new Date();
  end.setHours(0, 0, 0, 0);

  // Build continuous day buckets
  const days: string[] = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    days.push(ymdLocal(d));
  }

  type Agg = {
    sumMins: number;   // for breakdown/hand/machine
    sumHrs: number;    // for harvest
    sumWeight: number; // grams (breakdown/hand/machine)
    sumPlants: number; // plants (harvest)
  };

  const byDay = new Map<string, Agg>();
  for (const d of days) {
    byDay.set(d, { sumMins: 0, sumHrs: 0, sumWeight: 0, sumPlants: 0 });
  }

  for (const r of rows) {
    if (!r || r.approval_status !== "Approved") continue;
    const wt = normalizeWorkType(r.work_type_code) as WorkTypeKey;
    if (wt !== workType) continue;

    const p = ((r.entry_payload || {}) as Record<string, any>) ?? {};

    // choose bucket date: payload.date -> approved_at -> created_at
    const iso = payloadDateISO(p) ?? r.approved_at ?? r.created_at;
    const dt = new Date(iso);
    if (!Number.isFinite(dt.getTime())) continue;
    const bucket = ymdLocal(dt);
    if (!byDay.has(bucket)) continue;

    const agg = byDay.get(bucket)!;

    if (wt === "breakdown") {
      // grams from several possible fields; minutes likewise
      const grams = firstNum(p, ["total_flower_mass", "output_weight", "trim_weight", "wet_weight_grams", "weight"], 0);
      const mins  = firstNum(p, ["total_time", "total_labor_mins", "total_time_minutes", "labor_minutes"], 0);
      agg.sumWeight += grams;
      agg.sumMins   += mins;

    } else if (wt === "hand") {
      const grams = firstNum(p, ["total_untrimmed", "total_weight", "wet_weight_grams"], 0);
      const mins  = firstNum(p, ["total_time_minutes", "total_labor_mins", "labor_minutes"], 0);
      agg.sumWeight += grams;
      agg.sumMins   += mins;

    } else if (wt === "machine") {
      const grams = firstNum(p, ["output_weight", "finished_trim_weight", "trim_weight"], 0);
      const mins  = firstNum(p, ["total_labor_mins", "total_time_minutes", "labor_minutes"], 0);
      agg.sumWeight += grams;
      agg.sumMins   += mins;

    } else if (wt === "harvest") {
      const plants = firstNum(p, ["number_of_plants", "total_plants", "plants"], 0);
      const hrs    = firstNum(p, ["labor_hours", "duration_hours", "hours"], 0);
      agg.sumPlants += plants;
      agg.sumHrs    += hrs;
    }
  }

  const target = TARGETS[workType];

  const series: TrendSeries = days.map((day) => {
    const a = byDay.get(day)!;
    let value = 0;

    if (workType === "harvest") {
      value = perHour(a.sumPlants, a.sumHrs);
    } else {
      value = minutesToPerHour(a.sumWeight, a.sumMins);
    }

    return { date: day, value: round(value), target };
  });

  return series;
}
