// hooks/useFilteredEntries.ts
import { useMemo } from "react";
import { WorkTypeEntryWithHistory } from "@/hooks/productivity/types";
import { SiteOption } from "@/context/MarketContext";

export function useFilteredEntries(
  entries: WorkTypeEntryWithHistory[],
  selectedWorkType: string,
  siteOptions: SiteOption[],
  currentMarketCode: string
) {
  return useMemo(() => {


    const currentMarketSiteIds = siteOptions
      .filter(site => site.market_code === currentMarketCode)
      .map(site => site.id);


    const filtered = entries.filter(entry =>
      !entry.site_id || currentMarketSiteIds.includes(entry.site_id)
    );

    const workTypeFiltered =
      selectedWorkType.toLowerCase() === "all"
        ? filtered
        : filtered.filter(entry => {
            const entryType = (entry.work_type_code || "").toLowerCase();
            const selected = selectedWorkType.toLowerCase();
            const matches = entryType === selected;

            if (!matches) {
        
            }

            return matches;
          });

    const sorted = workTypeFiltered.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return sorted;
  }, [entries, selectedWorkType, siteOptions, currentMarketCode]);
}
