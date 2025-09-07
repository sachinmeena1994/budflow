
import { PermissionMap, CachedPermissions } from "@/types/rbac";

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export const permissionCache = {
  /**
   * Get cached permissions for a role
   */
  get(role: string): PermissionMap | null {
    if (typeof window === "undefined") {
      return null; // SSR safety
    }

    try {
      const cacheKey = `permissions:${role}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        return null;
      }

      const parsedCache: CachedPermissions = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() > parsedCache.expiresAt) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return parsedCache.permissions;
    } catch (error) {
      console.error("Error reading permission cache:", error);
      return null;
    }
  },

  /**
   * Set cached permissions for a role
   */
  set(role: string, permissions: PermissionMap): void {
    if (typeof window === "undefined") {
      return; // SSR safety
    }

    try {
      const cacheKey = `permissions:${role}`;
      const cachedData: CachedPermissions = {
        permissions,
        expiresAt: Date.now() + CACHE_DURATION
      };

      localStorage.setItem(cacheKey, JSON.stringify(cachedData));
    } catch (error) {
      console.error("Error setting permission cache:", error);
    }
  },

  /**
   * Clear all permission caches
   */
  clearAll(): void {
    if (typeof window === "undefined") {
      return; // SSR safety
    }

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith("permissions:")) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing permission cache:", error);
    }
  },

  /**
   * Clear cache for a specific role
   */
  clear(role: string): void {
    if (typeof window === "undefined") {
      return; // SSR safety
    }

    try {
      const cacheKey = `permissions:${role}`;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error("Error clearing permission cache for role:", error);
    }
  }
};
