
import { supabase } from "@/integrations/supabase/client";

export const generateNextTaskId = async (): Promise<string> => {
  try {
    console.log("🔢 Generating next sequential task ID...");
    
    // Get the highest task_id number from the database
    const { data, error } = await supabase
      .from('work_entries')
      .select('task_id')
      .not('task_id', 'is', null)
      .order('task_id', { ascending: false })
      .limit(1);

    if (error) {
      console.error("❌ Failed to fetch task IDs:", error);
      throw error;
    }

    let nextNumber = 1;
    
    if (data && data.length > 0 && data[0].task_id) {
      // Extract number from TASK-XXX format
      const match = data[0].task_id.match(/TASK-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const taskId = `TASK-${nextNumber.toString().padStart(3, '0')}`;
    console.log("✅ Generated Task ID:", taskId);
    return taskId;
  } catch (error) {
    console.error("❌ Error generating task ID:", error);
    // Fallback to timestamp-based ID
    const fallbackId = `TASK-${Date.now().toString().slice(-3)}`;
    console.log("🔄 Using fallback task ID:", fallbackId);
    return fallbackId;
  }
};
