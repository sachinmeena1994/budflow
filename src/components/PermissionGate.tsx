import React from 'react';
import { usePermission } from '@/hooks/usePermission';

interface PermissionGateProps {
  action: string;
  market?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * PermissionGate component that conditionally renders children based on user permissions
 * Hides content completely if user doesn't have permission (doesn't just disable)
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  action,
  market,
  children,
  fallback = null
}) => {
  const hasPermission = usePermission({ action, market });

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};