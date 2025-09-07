
import { useState, useEffect } from "react";
import { statsApi, AppStats } from "@/services/api/stats-api";
import { toast } from "sonner";
import { useMarket } from "@/context/MarketContext";

export const useAppStats = () => {
  const [stats, setStats] = useState<AppStats>({
    incompleteInventoryCount: 0,
    pendingOrders: 0,
    pendingPicklists: 0,
    isSyncing: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Get current market from context
  const { currentMarket } = useMarket();

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await statsApi.getStats(currentMarket.id);
      setStats(data);
    } catch (error) {
      console.error("Failed to load application stats:", error);
      toast.error("Failed to load application statistics");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats when market changes
  useEffect(() => {
    fetchStats();
  }, [currentMarket.id]);

  return {
    stats,
    isLoading,
    fetchStats
  };
};
