import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export function useAuditLogger() {
  const { user } = useAuth();


  const logAction = async (
    action: string,
    entityOrRows:
      | string
      | Array<{ taskId: string; oldData: any; newData?: any }>,
    taskId?: string,
    changes?: Record<string, any>
  ) => {
    try {
      const currentUserId = user?.id;

      const { data: userData } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", currentUserId)
        .maybeSingle();

      const actorName = userData?.full_name || "System User";
      const now = new Date().toISOString();

      if (Array.isArray(entityOrRows)) {
        if (entityOrRows.length === 0) return [];

        const auditRows = entityOrRows.map(({ taskId, oldData, newData }) => ({
          action: action.toLowerCase(),
          entity_id: currentUserId,
          entity_type: "work_entry",
          task_id: taskId,
          changes: {
            oldData,
            newData: newData ?? null,
            description: `${action} performed by ${actorName}`,
            timestamp: now,
          },
          actor_id: currentUserId,
          timestamp: now,
        }));

        const { data, error } = await supabase
          .from("audit_logs")
          .insert(auditRows);

        if (error) {
          console.error("❌ Failed to create bulk audit logs:", error);
          throw error;
        }

        return data;
      }

      const auditLogEntry = {
        action: action.toLowerCase(),
        entity_id: currentUserId,
        entity_type: "work_entry",
        task_id: taskId as string,
        changes: {
          ...(changes || {}),
          description: `${action} performed by ${actorName}`,
          timestamp: now,
        },
        actor_id: currentUserId,
        timestamp: now,
      };

      const { data, error } = await supabase
        .from("audit_logs")
        .insert(auditLogEntry)
        .select()
        .single();

      if (error) {
        console.error("❌ Failed to create audit log:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("❌ Failed to log action:", error);
      throw error;
    }
  };

  return { logAction };
}
