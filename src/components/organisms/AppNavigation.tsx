
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppNavigation() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 mr-2 md:mr-0",
          isCollapsed ? "rotate-180" : ""
        )}
      >
        <SidebarTrigger>
          <Menu className="h-4 w-4" />
        </SidebarTrigger>
      </Button>
    </div>
  );
}
