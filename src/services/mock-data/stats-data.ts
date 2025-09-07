
// Mock data for application statistics
export const mockStatsData = {
  getStats: (marketId?: string) => {
    // In a real implementation, this would filter by marketId
    return {
      incompleteInventoryCount: 15,
      pendingOrders: 8,
      pendingPicklists: 3,
      isSyncing: Math.random() > 0.7 // Randomly determine sync status for testing
    };
  }
};
