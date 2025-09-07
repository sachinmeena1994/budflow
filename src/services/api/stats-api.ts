
import { apiClient } from "./api-client";
import { mockStatsData } from "../mock-data/stats-data";

// Define the structure of app stats
export interface AppStats {
  incompleteInventoryCount: number;
  pendingOrders: number;
  pendingPicklists: number;
  isSyncing: boolean;
}

/**
 * API client for application statistics
 */
export const statsApi = {
  /**
   * Get application statistics
   */
  async getStats(marketId?: string): Promise<AppStats> {
    try {
      // Only use mock data in development or production
      if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
        // For now, we're not filtering by marketId in the mock
        return {
          incompleteInventoryCount: 15,
          pendingOrders: 8,
          pendingPicklists: 3,
          isSyncing: Math.random() > 0.7 // Randomly determine sync status for testing
        };
      }

      // In other environments, call actual API
      const response = await apiClient.mockCall<AppStats>({
        incompleteInventoryCount: 7,
        pendingOrders: 2,
        pendingPicklists: 1,
        isSyncing: false
      });

      return response;
    } catch (error) {
      console.error("Error fetching app stats:", error);
      throw error;
    }
  }
};
