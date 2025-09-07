
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkTypeField } from '@/types/database';

export const useWorkTypeFields = (workType: string | null) => {
  const [fields, setFields] = useState<WorkTypeField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workType) {
      setFields([]);
      return;
    }

    const fetchFields = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await (supabase as any)
          .from('work_type_fields')
          .select('*')
          .eq('work_type', workType);

        if (error) throw error;

        // Convert schema_json to WorkTypeField format
        const fields = data?.[0]?.schema_json?.fields?.map((field: any, index: number) => ({
          id: `${workType}-${field.key}`,
          field_key: field.key,
          label: field.label,
          type: field.type as "number" | "select" | "text" | "time" | "date" | "dropdown",
          required: field.required || false,
          options: field.options || null,
          data_type: field.type,
          field_order: index,
          calculated: false,
          work_type: workType,
          created_at: new Date().toISOString()
        })) || [];

        setFields(fields);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching work type fields:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, [workType]);

  return { fields, loading, error };
};
