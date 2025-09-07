
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon;
  label?: string;
  type?: string; // Add missing type property
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  onClick?: () => void;
  className?: string;
}

export const IconButton = ({ 
  icon: Icon, 
  label, 
  variant = "default", 
  size = "default",
  onClick,
  className 
}: IconButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn("flex items-center gap-2", className)}
    >
      <Icon className="h-4 w-4" />
      {label && <span>{label}</span>}
    </Button>
  );
};
