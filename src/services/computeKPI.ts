// src/services/computeKpis.ts
import type { WorkEntryRow, DateRange } from "./workEntries";
import { normalizeWorkType } from "./workEntries";

export const TARGETS = {
  breakdown: 1800,  // g/hr
  hand: 180,        // g/hr
  harvest: 20,      // plants/hr
  machine: 4500,    // g/hr
  abRatio: 70,      // %
  premiumRetention: 80, // %
};

export type KPIData = {
  breakdown: { value: number; target: number };
  handTrim:  { value: number; target: number };
  harvest:   { value: number; target: number };
  machine:   { value: number; target: number };
  abRatio:   { value: number; target: number };
  premiumRetention: { value: number; target: number };
  flaggedWorkers:   { value: number; target: number };
};

export type FlaggedWorker = {
  id: string;
  name: string;
  workType: string;
  gph: number;
  targetGph: number;
  premiumPercent: number;
  flagLevel: "red" | "orange";
  flagReason: string;
};

export function computeKpisFromEntries(rows: WorkEntryRow[], _range: DateRange) {
  // Aggregates for formula-based KPIs (original behavior)
  let breakdownFlowerMass = 0;
  let breakdownLaborMins  = 0;
  let breakdownTotalA     = 0;
  let breakdownTotalB     = 0;

  let handTotalUntrimmed  = 0;
  let handTotalPremium    = 0;
  let handLaborMins       = 0;

  let machineFinishedW    = 0;
  let machineLaborMins    = 0;

  let harvestPlants       = 0;
  let harvestLaborHours   = 0;

  // Per-tech Hand aggregates for flagged workers
  const perTechHand = new Map<string, { grams: number; hours: number }>();

  for (const r of rows) {
    if (!r || r.approval_status !== "Approved") continue;

    const wt = normalizeWorkType(r.work_type_code);
    const p  = ((r.entry_payload || {}) as Record<string, any>) ?? {};

    if (wt === "breakdown") {
      const { value: flowerMass } = firstNumWithKey(p, [
        "total_flower_mass",
        "output_weight", "trim_weight", "wet_weight_grams", "weight",
      ], 0);
      const { value: mins } = firstNumWithKey(p, [
        "total_time",
        "total_labor_mins", "total_time_minutes", "labor_minutes"
      ], 0);

      const { value: aVal } = firstNumWithKey(p, [
        "total_as",
        "total_a", "quality_a", "a_weight", "grade_a", "a"
      ], 0);
      const { value: bVal } = firstNumWithKey(p, [
        "total_bs",
        "total_b", "quality_b", "b_weight", "grade_b", "b"
      ], 0);

      breakdownFlowerMass += flowerMass;
      breakdownLaborMins  += mins;
      breakdownTotalA     += aVal;
      breakdownTotalB     += bVal;

    } else if (wt === "machine") {
      const { value: finished } = firstNumWithKey(p, [
        "output_weight",
        "finished_trim_weight", "trim_weight",
      ], 0);
      const { value: mins } = firstNumWithKey(p, [
        "total_labor_mins",
        "total_time_minutes", "labor_minutes"
      ], 0);

      machineFinishedW += finished;
      machineLaborMins += mins;

    } else if (wt === "hand") {
      const { value: untrimmed } = firstNumWithKey(p, [
        "total_untrimmed",
        "total_weight", "wet_weight_grams"
      ], 0);
      const { value: premium } = firstNumWithKey(p, [
        "total_premium",
        "premium_weight"
      ], 0);
      const { value: mins } = firstNumWithKey(p, [
        "total_time_minutes",
        "total_labor_mins", "labor_minutes"
      ], 0);

      handTotalUntrimmed += untrimmed;
      handTotalPremium   += premium;
      handLaborMins      += mins;

      // Per-tech Hand GPH for flagging — prefer finished grams if present, else untrimmed
      const { value: outW } = firstNumWithKey(p, [
        "output_weight", "trim_weight", "weight", "wet_weight_grams"
      ], untrimmed);

      const techId =
        (Array.isArray(r.technician_refs) && r.technician_refs[0]) || r.work_entry_id;

      const prev = perTechHand.get(techId) || { grams: 0, hours: 0 };
      prev.grams += outW;
      prev.hours += mins / 60;
      perTechHand.set(techId, prev);

    } else if (wt === "harvest") {
      const { value: plants } = firstNumWithKey(p, [
        "number_of_plants",
        "total_plants", "plants"
      ], 0);
      const { value: hrs } = firstNumWithKey(p, [
        "labor_hours",
        "duration_hours",
      ], 0);

      harvestPlants     += plants;
      harvestLaborHours += hrs;
    }
  }

  // Compute KPI rates from aggregated numerators/denominators
  const breakdownGPH = minutesToPerHour(breakdownFlowerMass, breakdownLaborMins);
  const handGPH      = minutesToPerHour(handTotalUntrimmed,  handLaborMins);
  const machineGPH   = minutesToPerHour(machineFinishedW,    machineLaborMins);
  const harvestPH    = perHour(harvestPlants, harvestLaborHours);

  const abRatioPct =
    breakdownTotalA + breakdownTotalB > 0
      ? (breakdownTotalA / (breakdownTotalA + breakdownTotalB)) * 100
      : 0;

  const premiumRetentionPct =
    handTotalUntrimmed > 0 ? (handTotalPremium / handTotalUntrimmed) * 100 : 0;

  // Flagged workers (Hand) — classify per tech vs TARGETS.hand
  const flaggedWorkers: FlaggedWorker[] = Array.from(perTechHand.entries())
    .map(([id, agg]) => {
      const gph = agg.hours > 0 ? agg.grams / agg.hours : 0;
      const deltaPct = TARGETS.hand > 0 ? ((gph - TARGETS.hand) / TARGETS.hand) * 100 : 0;
      let flag: "red" | "orange" | null = null;
      if (deltaPct <= -20) flag = "red";
      else if (deltaPct <= 0) flag = "orange";
      return { id, gph, deltaPct, flag };
    })
    .filter((x) => x.flag)
    .sort((a, b) => a.deltaPct - b.deltaPct)
    .map((x) => ({
      id: x.id,
      name: x.id,
      workType: "Hand Trim",
      gph: round(x.gph),
      targetGph: TARGETS.hand,
      premiumPercent: round(premiumRetentionPct), // dashboard showed overall premium %
      flagLevel: x.flag as "red" | "orange",
      flagReason: x.flag === "red" ? "Below -20% of target" : "Below target",
    }));

  const kpiData: KPIData = {
    breakdown:        { value: round(breakdownGPH),        target: TARGETS.breakdown },
    handTrim:         { value: round(handGPH),             target: TARGETS.hand },
    harvest:          { value: round(harvestPH),           target: TARGETS.harvest },
    machine:          { value: round(machineGPH),          target: TARGETS.machine },
    abRatio:          { value: round(abRatioPct),          target: TARGETS.abRatio },
    premiumRetention: { value: round(premiumRetentionPct), target: TARGETS.premiumRetention },
    flaggedWorkers:   { value: flaggedWorkers.length,      target: 5 },
  };

  return { kpiData, flaggedWorkers };
}

/* ---------------- helpers ---------------- */

function n(v: any): number | undefined {
  const num = Number(v);
  return Number.isFinite(num) ? num : undefined;
}

function perHour(numerator: number, hours: number) {
  return hours > 0 ? numerator / hours : 0;
}

function minutesToPerHour(total: number, minutes: number) {
  return minutes > 0 ? (total / minutes) * 60 : 0;
}

function round(x: number, d = 1) {
  const m = Math.pow(10, d);
  return Math.round(x * m) / m;
}

/** returns { value, key } of the first numeric key found; else {fallback, ""} */
function firstNumWithKey(p: Record<string, any>, keys: string[], fallback = 0): { value: number; key: string } {
  for (const k of keys) {
    const v = n(p[k]);
    if (Number.isFinite(v)) return { value: v!, key: k };
  }
  return { value: fallback, key: "" };
}
