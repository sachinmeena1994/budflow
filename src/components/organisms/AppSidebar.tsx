
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useMarket } from "@/context/MarketContext";
import { useAppStats } from "@/hooks/use-app-stats";
import { useApprovalsManager } from "@/hooks/use-approvals-manager";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  LayoutDashboard,
  LogOut,
  Package
} from "lucide-react";
import { useNavigation } from "@/components/navigation/NavigationProvider"

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Logo } from "../atoms/icons/Logo";
import { UserAvatar } from "../atoms/UserAvatar";
import { MarketSelector } from "../molecules/MarketSelector";
import { useRBAC } from "@/context/RBACContext"; 


export function AppSidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  // Get current market
  const { currentMarket } = useMarket();
const { role, roleCode, isLoading: rbacLoading } = useRBAC();

  // Get pending approvals count - this will update in real-time
const [pendingCount, setPendingCount] = useState(0);
useApprovalsManager(setPendingCount); // automatically updates badge count
const { mainNavigation } = useNavigation()
  // const pendingCount = pendingEntries.length;

  const isActivePath = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };


  const displayName =
  (user as any)?.name ??
  (user as any)?.full_name ??
  (user as any)?.email?.split("@")[0] ??
  "User";


const displayRole =role?.label
  // Reorganized menu structure
  const menuGroups = [
    {
      label: "Core",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Productivity",
          url: "/productivity",
          icon: Package,
        },
        {
          title: "Approval Center",
          url: "/approvals",
          icon: CheckCircle,
        },
      ],
    },
    // {
    //   label: "Admin",
    //   items: [
    //     {
    //       title: "Access Control",
    //       url: "/access",
    //       icon: ShieldCheck,
    //       subItems: [{ title: "Users & Roles", url: "/users", icon: Users }],
    //     },
    //   ],
    // },
  ];

  return (
    <Sidebar collapsible="icon">
      <div
        className={cn("flex items-center h-14 px-4 border-b justify-center")}
      >
        <Logo
          collapsed={isCollapsed}
          className={cn(
            "transition-all",
            isCollapsed ? "scale-75" : "h-12 w-auto"
          )}
        />
      </div>
      <SidebarContent>
        {mainNavigation.map((group, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-state={
                        isActivePath(item.url) ? "active" : "inactive"
                      }
                      tooltip={isCollapsed ? item.title : undefined}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4 mr-2" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>

                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2 px-2 py-2">
          <div className={cn(
            "flex gap-2",
            isCollapsed ? "flex-col items-center" : "items-center justify-between"
          )}>
            {isCollapsed ? (
              <>
                <SidebarTrigger className="h-7 w-7" />
                <MarketSelector isCollapsed={true} />
              </>
            ) : (
              <>
                <MarketSelector isCollapsed={false} />
                <SidebarTrigger className="h-7 w-7" />
              </>
            )}
          </div>
          
    {user && (
  <div
    className={cn(
      "flex items-center py-2 px-1 border-t",
      isCollapsed ? "justify-center" : "justify-between"
    )}
  >
    <div className="flex items-center gap-2">
      <UserAvatar name={displayName} className="h-8 w-8" />
      {!isCollapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{displayName}</span>
          {!!displayRole && (
            <span className="text-xs text-muted-foreground">{displayRole}</span>
          )}
        </div>
      )}
    </div>

    {!isCollapsed && (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleLogout}
        title="Logout"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    )}
  </div>
)}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
