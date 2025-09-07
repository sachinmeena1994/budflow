// /hooks/useWorkTypeOptions.ts

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useWorkTypeOptions() {
  const { data: workTypeFields = [], isLoading } = useQuery({
    queryKey: ["work-type-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_type_fields")
        .select("*") // Get full details
        .order("order_index", { ascending: true });

      if (error) {
        console.error("❌ Error fetching work type fields:", error);
        return [];
      }

      return data || [];
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  // Extract unique work type options
  const workTypeOptions = Array.from(
    new Map(
      workTypeFields.map(({ work_type }) => [work_type, work_type])
    )
  ).map(([value, label]) => ({ value, label }));

  // Group fields by work type
  const workTypeFieldMap: Record<string, typeof workTypeFields> = {};

  for (const field of workTypeFields) {
    const type = field.work_type;
    if (!workTypeFieldMap[type]) {
      workTypeFieldMap[type] = [];
    }
    workTypeFieldMap[type].push(field);
  }

  return {
    workTypeOptions,        // for dropdowns
    workTypeFieldMap,       // for field rendering/validation
    rawFields: workTypeFields, // full flat list if needed
    isLoading,
  };
}
