import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkTypeEntryWithHistory } from "./types";
import { useMarket } from "@/context/MarketContext";

export function useEntryFetch(selectedWorkType: string) {
  const [fetchedEntries, setFetchedEntries] = useState<WorkTypeEntryWithHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentSite } = useMarket();

  const fetchEntries = async () => {
    if (!currentSite?.id) return { data: [], error: null };

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("work_entries")
        .select("*")
        .eq("site_id", currentSite.id)
        .order("created_at", { ascending: false });

      if (selectedWorkType !== "all") {
        query = query.ilike("work_type_code", selectedWorkType);
      }

      const { data: entriesData, error: entriesError } = await query;

      if (entriesError) throw entriesError;

      if (!entriesData || entriesData.length === 0) {
        setFetchedEntries([]);
        return { data: [], error: null };
      }

      const workEntryIds = entriesData.map(entry => entry.work_entry_id);

      let auditData = [];
      if (workEntryIds.length > 0) {
        const { data: auditResult } = await supabase
          .from("audit_logs")
          .select("task_id")
          .in("task_id", workEntryIds);
        auditData = auditResult || [];
      }

      const entriesWithHistory = new Set(auditData.map(log => log.task_id));

      const transformedEntries: WorkTypeEntryWithHistory[] = entriesData.map(entry => ({
        ...entry,
        id: entry.work_entry_id,
        work_type: entry.work_type_code,
        has_history: entriesWithHistory.has(entry.work_entry_id),
        entry_payload: entry.entry_payload || {},
      }));

      setFetchedEntries(transformedEntries);
      return { data: transformedEntries, error: null };
    } catch (err) {
      console.error("❌ Error fetching entries:", err);
      const message = err instanceof Error ? err.message : "Failed to fetch entries";
      setError(message);
      return { data: [], error: message };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentSite?.id) {
      fetchEntries();
    }
  }, [selectedWorkType, currentSite?.id]);

  return {
    fetchedEntries,
    isLoading,
    error,
    refetch: fetchEntries,
  };
}
