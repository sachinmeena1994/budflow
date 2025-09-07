// hooks/useDashboardData.ts
import { useEffect, useRef, useState, useCallback } from "react";
import type { DateKey } from "@/store/dashboardStore";
import { computeFlaggedWorkers } from "@/services/computeFlags";
import { fetchApprovedWorkEntries } from "@/services/workEntries";
import { computeKpisFromEntries } from "@/services/computeKPI";

import {
  computeTrendSeries,
  type TrendSeries,
} from "@/services/computeTrends";

import {
  computeTopPerformers,
  type TopPerformer,
} from "@/services/computeTopPerformer";

export type WorkType = "breakdown" | "handTrim" | "harvest" | "machine";
export type PerformanceData = {
  trendData: Record<WorkType, TrendSeries>;
  workTypeTargets: Record<WorkType, { label: string; target: number; unit: string }>;
};

type Args = {
  selectedDate: DateKey;
  siteId?: string | null;
};

/* ---------- date helpers ---------- */
function atStartOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function atEndOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function safeDateFromYMD(ymd: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isFinite(dt.getTime()) ? dt : null;
}
function safeDateFromMDY(mdy: string): Date | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(mdy)) return null;
  const [m, d, y] = mdy.split("/").map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isFinite(dt.getTime()) ? dt : null;
}

/** KPI cards → single day range (driven by selectedDate) */
function dateKeyToRange(selectedDate: DateKey): { startISO: string; endISO: string } {
  const now = new Date();

  if (selectedDate === "today") {
    return { startISO: atStartOfDay(now).toISOString(), endISO: atEndOfDay(now).toISOString() };
  }
  if (selectedDate === "yesterday") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return { startISO: atStartOfDay(y).toISOString(), endISO: atEndOfDay(y).toISOString() };
  }

  if (typeof selectedDate === "string" && selectedDate.startsWith("date:")) {
    const raw = selectedDate.slice(5).trim();
    const parsed =
      safeDateFromYMD(raw) ??
      safeDateFromMDY(raw) ??
      (Number.isFinite(new Date(raw).getTime()) ? new Date(raw) : null);

    if (parsed) {
      return { startISO: atStartOfDay(parsed).toISOString(), endISO: atEndOfDay(parsed).toISOString() };
    }

    console.warn("[useDashboardData] Unrecognized date format:", raw, "→ falling back to today");
    return { startISO: atStartOfDay(now).toISOString(), endISO: atEndOfDay(now).toISOString() };
  }

  return { startISO: atStartOfDay(now).toISOString(), endISO: atEndOfDay(now).toISOString() };
}

/** ALWAYS last 7 days ending today (for Trends + Flags + Top) */
function last7DaysEndingToday(): {
  windowDays: number;
  endDay: Date;
  range: { startISO: string; endISO: string };
} {
  const endDay = atStartOfDay(new Date()); // today
  const start7 = new Date(endDay);
  start7.setDate(endDay.getDate() - 6);
  return {
    windowDays: 7,
    endDay,
    range: {
      startISO: atStartOfDay(start7).toISOString(),
      endISO: atEndOfDay(endDay).toISOString(),
    },
  };
}

export const useDashboardData = ({ selectedDate, siteId }: Args) => {
  const [kpiData, setKpiData] =
    useState<ReturnType<typeof computeKpisFromEntries>["kpiData"] | null>(null);
  const [flaggedWorkers, setFlaggedWorkers] =
    useState<ReturnType<typeof computeFlaggedWorkers>>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      /* ---------- KPI (single day; follows selectedDate) ---------- */
      const kpiDayRange = dateKeyToRange(selectedDate);
      const entriesForKpiDay = await fetchApprovedWorkEntries({
        siteId: siteId ?? undefined,
        range: kpiDayRange,
      });
      const { kpiData } = computeKpisFromEntries(entriesForKpiDay, kpiDayRange);

      /* ---------- 7-day window (fixed, ending today) ---------- */
      const { windowDays, endDay, range: weekRange } = last7DaysEndingToday();
      const entries7 = await fetchApprovedWorkEntries({
        siteId: siteId ?? undefined,
        range: weekRange,
      });

      // Trends (7 days)
      const trendData: PerformanceData["trendData"] = {
        breakdown: computeTrendSeries(entries7, "breakdown", { windowDays, endDay }),
        handTrim:  computeTrendSeries(entries7, "hand",       { windowDays, endDay }),
        harvest:   computeTrendSeries(entries7, "harvest",    { windowDays, endDay }),
        machine:   computeTrendSeries(entries7, "machine",    { windowDays, endDay }),
      };
      const workTypeTargets: PerformanceData["workTypeTargets"] = {
        breakdown: { label: "Breakdown", target: 1800, unit: "g/hr" },
        handTrim:  { label: "Hand Trim", target: 180,  unit: "g/hr" },
        harvest:   { label: "Harvest",   target: 20,   unit: "plants/hr" },
        machine:   { label: "Machine",   target: 4500, unit: "g/hr" },
      };

      // Flagged workers (7 days)
      const flagged = computeFlaggedWorkers(entries7, {
        siteId: siteId ?? undefined,
        startISO: weekRange.startISO,
        endISO: weekRange.endISO,
        minMinutesForRate: 0,
      });

      // Top performers (7 days)
      const top5 = computeTopPerformers(entries7, { workType: "hand", limit: 5 });

      if (!mountedRef.current) return;
      setKpiData(kpiData ?? null);
      setFlaggedWorkers(flagged ?? []);
      setPerformanceData({ trendData, workTypeTargets });
      setTopPerformers(top5);
    } catch (e) {
      if (!mountedRef.current) return;
      console.error("[useDashboardData] load error:", e);
      setError(e);
      setKpiData(null);
      setFlaggedWorkers([]);
      setPerformanceData(null);
      setTopPerformers([]);
    } finally {
      if (!mountedRef.current) return;
      setIsLoading(false);
    }
  }, [selectedDate, siteId]);

  useEffect(() => { load(); }, [load]);

  const refetch = useCallback(() => load(), [load]);

  return { kpiData, flaggedWorkers, performanceData, topPerformers, isLoading, error, refetch };
};
