
export interface PermissionMap {
  [action: string]: boolean;
}

export interface CachedPermissions {
  permissions: PermissionMap;
  expiresAt: number;
}

export interface RBACContextType {
  permissions: PermissionMap;
  isLoading: boolean;
  error: string | null;
  refetchPermissions: () => Promise<void>;
}

export interface UsePermissionParams {
  action: string;
  market?: string;
}
