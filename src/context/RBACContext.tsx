import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMarket } from '@/context/MarketContext';
import { supabase } from '@/integrations/supabase/client';

export type PermissionMap = Record<string, boolean>;

type Role = {
  role_id: string;
  role_code: string;
  role_name?: string | null;
  active: boolean;
};

export interface RBACContextType {
  roleCode?: string | null;
    role?: Role | null;
  permissions: PermissionMap;
  isLoading: boolean;
  error: string | null;
  refetchPermissions: () => Promise<void>;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const useRBAC = (): RBACContextType => {
  const ctx = useContext(RBACContext);
  if (!ctx) throw new Error('useRBAC must be used within an RBACProvider');
  return ctx;
};

// --- light row typings to keep TS happy ---
type UserRoleMappingRow = {
  role_id: string;
  market_code: string;
  active: boolean;
  created_at: string;
};
type RoleRow = {
  role_code: string;
  active: boolean;
};
type PermissionActionRow = {
  role_id: string;
  action_code: string;
  is_allowed: boolean;
  active: boolean;
};

// simple in-memory cache for this session
const memCache = new Map<
  string,
  { role?: Role | null; roleCode?: string | null; permissions: PermissionMap }
>();
// tiny helper so we can toggle logs via localStorage
const rbLog = (...args: any[]) => {
  // enable with: localStorage.setItem('RBAC_DEBUG','1')
  if (typeof window !== 'undefined' && window.localStorage?.getItem('RBAC_DEBUG') === '1') {
    // eslint-disable-next-line no-console
    console.log('[RBAC]', ...args);
  }
};

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { currentMarket } = useMarket();

  const [permissions, setPermissions] = useState<PermissionMap>({});
  const [roleCode, setRoleCode] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = user?.id && currentMarket?.code ? `${user.id}:${currentMarket.code}` : '';

const fetchPermissions = useCallback(async () => {

  if (!user?.id || !currentMarket?.code) {
    console.log("RBAC → No user or market, clearing state");
    setPermissions({});
    setRoleCode(null);
    setIsLoading(false);
    setError(null);
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    // Cache check
    if (cacheKey && memCache.has(cacheKey)) {
      console.log("RBAC → Cache hit", memCache.get(cacheKey));
      const cached = memCache.get(cacheKey)!;
      setPermissions(cached.permissions);
        setRole(cached.role ?? null);
      setRoleCode(cached.roleCode ?? null);
      setIsLoading(false);
      return;
    }
    console.log("RBAC → Cache miss");

    // 1) user_role_mapping
    const { data: mappings, error: mapErr } = await supabase
      .from<UserRoleMappingRow>('user_role_mapping')
      .select('role_id, market_code, active, created_at')
      .eq('user_id', user.id)
      .eq('market_code', currentMarket.code)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    console.log("RBAC → user_role_mapping result", mappings);
    if (mapErr) throw mapErr;
    if (!mappings?.length) {
      console.log("RBAC → No mapping found");
      setPermissions({});
      setRoleCode(null);
      setIsLoading(false);
      return;
    }

    const roleId = mappings[0].role_id;
    console.log("RBAC → roleId", roleId);

    // 2) roles
    const { data: role, error: roleErr } = await supabase
      .from<RoleRow>('roles')
      .select('role_code,label,active')
      .eq('role_id', roleId)
      .eq('active', true)
      .single();

    console.log("RBAC → role result", role);
    if (roleErr) throw roleErr;
    if (!role) {
      console.log("RBAC → Role not found");
      setPermissions({});
      setRoleCode(null);
      setIsLoading(false);
      return;
    }

    // 3) permission_action
    const { data: actions, error: actErr } = await supabase
      .from<PermissionActionRow>('permission_action')
      .select('action_code, is_allowed, active, role_id')
      .eq('role_id', roleId)
      .eq('active', true)
      // .eq('is_allowed', true);

    console.log("RBAC → permission_action result", actions);
    if (actErr) throw actErr;

    const perms: PermissionMap = {};
    for (const a of actions ?? []) {
        if (a.action_code) {
    perms[a.action_code] = !!a.is_allowed; // preserve true/false from DB
  }
    }
    setPermissions(perms);
    setRole(role); 
    setRoleCode(role.role_code ?? null);

    if (cacheKey) memCache.set(cacheKey, { role:role,roleCode: role.role_code ?? null, permissions: perms });
  } catch (e: any) {
    console.log("RBAC → ERROR", e);
    setError(e?.message ?? 'Failed to load permissions');
    setPermissions({});
    setRoleCode(null);
  } finally {
    setIsLoading(false);
  }
}, [user?.id, currentMarket?.code, cacheKey]);


  const refetchPermissions = useCallback(async () => {
    rbLog('refetchPermissions() called, evicting cacheKey', cacheKey);
    if (cacheKey) memCache.delete(cacheKey);
    await fetchPermissions();
  }, [cacheKey, fetchPermissions]);

  useEffect(() => {
    rbLog('useEffect → fetchPermissions() due to deps change', {
      userId: user?.id,
      market: currentMarket?.code,
      cacheKey
    });
    fetchPermissions();
  }, [fetchPermissions]);

  const value: RBACContextType = {
    role,
    roleCode,
    permissions,
    isLoading,
    error,
    refetchPermissions,
  };

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};
