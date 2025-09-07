
import { useCallback } from "react";
import { generateNextTaskId } from "@/utils/taskIdGenerator";

export function useTaskIdGenerator() {
  const generateNextTaskIdFromDB = useCallback(async (): Promise<string> => {
    return await generateNextTaskId();
  }, []);

  return { generateNextTaskIdFromDB };
}
