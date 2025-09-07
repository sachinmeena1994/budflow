import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WorkTypeSchemaField {
  field_key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'dropdown' | 'date' | 'time';
  data_type: 'string' | 'number' | 'boolean' | 'date';
  options?: Record<string, any>;
  calculated?: boolean;
  required?: boolean;
  order?: number;
}

export interface WorkTypeSchema {
  work_type_code: string;
  schema_json: WorkTypeSchemaField[];
  ui_config?: Record<string, any>;
}

export const useWorkTypeFieldSchema = (workType: string) => {
  const [fields, setFields] = useState<WorkTypeSchemaField[]>([]);
  const [uiConfig, setUiConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workType || workType === "all") {
      setFields([]);
      setUiConfig({});
      setLoading(false);
      return;
    }

    setLoading(true);
    (supabase as any)
      .from("work_type_schema_contracts")
      .select("schema_json, ui_config")
      .eq("work_type_code", workType)
      .single()
      .then(({ data, error }: any) => {
        if (error) {
          console.error("Error loading work type schema:", error);
          setFields([]);
          setUiConfig({});
        } else {
          const schemaFields = (data?.schema_json as WorkTypeSchemaField[]) || [];
          // Sort by order field if available
          const sortedFields = schemaFields.sort((a, b) => (a.order || 0) - (b.order || 0));
          setFields(sortedFields);
          setUiConfig(data?.ui_config || {});
        }
        setLoading(false);
      });
  }, [workType]);

  return { fields, uiConfig, loading };
};
