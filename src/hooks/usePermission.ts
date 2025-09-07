
import { useRBAC } from "@/context/RBACContext";
import { useAuth } from "@/context/AuthContext";
import { useMarket } from "@/context/MarketContext";
import { UsePermissionParams } from "@/types/rbac";

export const usePermission = ({ action, market }: UsePermissionParams): boolean => {
  const { permissions, isLoading, error } = useRBAC();
  const { user } = useAuth();
  const { currentMarket } = useMarket();

  // Log warning if action is undefined
  if (!action) {
    console.warn("usePermission: action parameter is required");
    return false;
  }

  // Return false if user is not authenticated
  if (!user) {
    return false;
  }

  // Return false while loading or if there's an error
  if (isLoading || error) {
    return false;
  }

  // Check if action permission exists and is true
  const hasActionPermission = permissions[action] === true;

  // If no market is specified, just check action permission
  if (!market) {
    return hasActionPermission;
  }

  // If market is specified, check if user has access to that market
  // Get user's site market from user metadata or current market context
  const userMarket = user.user_metadata?.site_market || currentMarket?.code;
  const hasMarketAccess = userMarket === market;

  return hasActionPermission && hasMarketAccess;
};
