
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StatusIndicator = ({ status, size = "md", className }: StatusIndicatorProps) => {
  const baseClasses = "rounded-full";
  
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4"
  };

  const statusClasses = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    info: "bg-blue-500"
  };

  return (
    <div 
      className={cn(
        baseClasses, 
        sizeClasses[size], 
        statusClasses[status], 
        className
      )} 
    />
  );
};
