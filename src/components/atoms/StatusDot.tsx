
import { cn } from "@/lib/utils";

interface StatusDotProps {
  status: "Pending" | "In Progress" | "Completed" | "Delayed" | "On Hold";
  className?: string;
}

export const StatusDot = ({ status, className }: StatusDotProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500";
      case "In Progress":
        return "bg-blue-500";
      case "Pending":
        return "bg-gray-400";
      case "On Hold":
        return "bg-yellow-400";
      case "Delayed":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("w-2 h-2 rounded-full", getStatusColor(status))}></span>
      <span className="text-sm text-gray-700">{status}</span>
    </div>
  );
};
