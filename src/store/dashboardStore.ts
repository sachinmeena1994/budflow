// store/dashboardStore.ts
import { create } from 'zustand';
import { format, subDays } from 'date-fns';

export type DateKey = 'today' | 'yesterday' | `date:${string}`;

interface DashboardState {
  selectedDate: DateKey;
  selectedMarket: string | null;
  isLoading: boolean;
}

interface DashboardActions {
  setSelectedDate: (date: DateKey) => void;
  setSelectedMarket: (market: string | null) => void;
  setIsLoading: (val: boolean) => void;
}

export const useDashboardStore = create<DashboardState & DashboardActions>((set, get) => ({
  selectedDate: 'today',
  selectedMarket: null,
  isLoading: false,

  setSelectedDate: (date) => {
    if (get().selectedDate !== date) set({ selectedDate: date });
  },
  setSelectedMarket: (market) => {
    if (get().selectedMarket !== market) set({ selectedMarket: market });
  },
  setIsLoading: (val) => {
    if (get().isLoading !== val) set({ isLoading: val });
  },
}));

// ---------- robust date helpers (internal) ----------
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
  // YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isFinite(dt.getTime()) ? dt : null;
}
function safeDateFromMDY(mdy: string): Date | null {
  // MM/DD/YYYY
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(mdy)) return null;
  const [m, d, y] = mdy.split('/').map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isFinite(dt.getTime()) ? dt : null;
}

/** Converts DateKey -> one-day ISO range.
 * Supports:
 * - "today"
 * - "yesterday"
 * - "date:YYYY-MM-DD"
 * - "date:MM/DD/YYYY" (emitted by getDateOptions)
 */
export function dateKeyToRange(selectedDate: DateKey): { startISO: string; endISO: string } {
  const now = new Date();

  if (selectedDate === 'today') {
    return {
      startISO: atStartOfDay(now).toISOString(),
      endISO: atEndOfDay(now).toISOString(),
    };
  }

  if (selectedDate === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return {
      startISO: atStartOfDay(y).toISOString(),
      endISO: atEndOfDay(y).toISOString(),
    };
  }

  if (typeof selectedDate === 'string' && selectedDate.startsWith('date:')) {
    const raw = selectedDate.slice(5).trim(); // after "date:"
    const parsed =
      safeDateFromYMD(raw) ??
      safeDateFromMDY(raw) ??
      (Number.isFinite(new Date(raw).getTime()) ? new Date(raw) : null);

    if (parsed) {
      return {
        startISO: atStartOfDay(parsed).toISOString(),
        endISO: atEndOfDay(parsed).toISOString(),
      };
    }

    console.warn('[Dashboard] Unrecognized date format:', raw, '→ falling back to today');
    return {
      startISO: atStartOfDay(now).toISOString(),
      endISO: atEndOfDay(now).toISOString(),
    };
  }

  // final fallback
  return {
    startISO: atStartOfDay(now).toISOString(),
    endISO: atEndOfDay(now).toISOString(),
  };
}

// ---------- date dropdown options (unchanged behavior) ----------
export const getDateOptions = (): { value: DateKey; label: string }[] => {
  const today = new Date();
  const opts: { value: DateKey; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
  ];
  for (let i = 2; i <= 6; i++) {
    const d = subDays(today, i);
    const formatted = format(d, 'MM/dd/yyyy'); // emits MM/DD/YYYY
    opts.push({ value: `date:${formatted}` as DateKey, label: formatted });
  }
  return opts;
};
