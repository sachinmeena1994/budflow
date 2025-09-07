
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NavItem = ({ icon: Icon, label, isActive, onClick, className }: NavItemProps) => {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full justify-start px-3 py-2 h-auto",
        "transition-all duration-200 hover:translate-x-1",
        isActive && "bg-blue-600 text-white shadow-md",
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="font-medium">{label}</span>
    </Button>
  );
};
