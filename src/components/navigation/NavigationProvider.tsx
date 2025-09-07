import React, { createContext, useContext, useMemo } from 'react';
import { useApprovalBadgeCount } from '@/hooks/useApprovalBadgeCount';
import { usePermission } from '@/hooks/usePermission';
import { 
  BarChart3, 
  ClipboardList, 
  CheckSquare, 
  Users, 
  Settings,
  type LucideIcon
} from 'lucide-react';

// Define each nav item
export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: {
    text: string | number;
    className?: string;
  };
  permission?: string;
  hidden?: boolean;
}

// Grouped nav structure
export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

interface NavigationContextType {
  mainNavigation: NavigationGroup[];
  footerNavigation: NavigationItem[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 🔐 Permission mocks (replace with usePermission() hooks)
  const canViewDashboard = true;
  const canViewProductivity = true;
  const canViewApprovals = true;
  const canManageUsers = true;
  const canManageSettings = true;
const canViewDashboard_ = usePermission({ action: 'view-dashboard' });
  /**
   *   const canViewDashboard = usePermission({ action: 'view-dashboard' });
  const canViewProductivity = usePermission({ action: 'view-productivity' });
  const canViewApprovals = usePermission({ action: 'view-approval-center' });
  const canManageUsers = usePermission({ action: 'manage-users' });
  const canManageSettings = usePermission({ action: 'manage-settings' });

   */

  // 🔴 Approval badge count (hook)
  const { count: approvalCount } = useApprovalBadgeCount();

  // 🧭 Main sidebar navigation (grouped)
  const mainNavigation: NavigationGroup[] = useMemo(() => [
    {
      label: "Core",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: BarChart3,
          permission: 'view-dashboard',
          hidden: !canViewDashboard
        },
        {
          title: "Productivity",
          url: "/productivity",
          icon: ClipboardList,
          permission: 'view-productivity',
          hidden: !canViewProductivity
        },
        {
          title: "Approval Center",
          url: "/approval-center",
          icon: CheckSquare,
          permission: 'view-approval-center',
          badge: approvalCount > 0 ? {
            text: approvalCount,
            className: "bg-red-500 text-white"
          } : undefined,
          hidden: !canViewApprovals
        }
      ].filter(item => !item.hidden)
    },
    // {
    //   label: "Admin",
    //   items: [
    //     {
    //       title: "User Management",
    //       url: "/users",
    //       icon: Users,
    //       permission: 'manage-users',
    //       hidden: !canManageUsers
    //     }
    //   ].filter(item => !item.hidden)
    // }
  ], [
    canViewDashboard,
    canViewProductivity,
    canViewApprovals,
    canManageUsers,
    approvalCount
  ]);

  // ⚙️ Footer navigation (flat)
  const footerNavigation: NavigationItem[] = useMemo(() => [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      permission: 'manage-settings',
      hidden: !canManageSettings
    }
  ].filter(item => !item.hidden), [canManageSettings]);

  // Provide context
  const value = {
    mainNavigation,
    footerNavigation
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
