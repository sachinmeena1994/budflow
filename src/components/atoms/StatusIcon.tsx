
import React from 'react';
import { AlertCircle, CheckCircle, Clock, Loader2, XCircle, FileX, RefreshCw, Ban } from 'lucide-react';

export type StatusType = 
  | "idle"
  | "processing"
  | "pending"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "importing"
  | "commitPending"
  | "committed"
  | "failed"
  | "cancelling"
  | "cancelled"
  | "completed"
  | "inProgress"
  | "discarded";

interface StatusIconProps {
  status: StatusType;
  size?: number;
  className?: string;
  animated?: boolean;
  withLabel?: boolean;
}

export const StatusIcon: React.FC<StatusIconProps> = ({
  status,
  size = 16,
  className = "",
  animated = false,
  withLabel = false,
}) => {
  // Map status to icon and color
  const getIconAndColor = () => {
    switch (status) {
      case "idle":
        return { icon: <RefreshCw size={size} />, color: "text-gray-500", label: "Idle" };
      case "processing":
      case "importing":
      case "inProgress":
        return { 
          icon: <Loader2 size={size} className={animated ? "animate-spin" : ""} />, 
          color: "text-blue-500", 
          label: "In Progress" 
        };
      case "pending":
      case "commitPending":
        return { icon: <Clock size={size} />, color: "text-amber-500", label: "Pending" };
      case "success":
      case "committed":
      case "completed":
        return { icon: <CheckCircle size={size} />, color: "text-green-500", label: "Completed" };
      case "error":
      case "failed":
        return { icon: <AlertCircle size={size} />, color: "text-red-500", label: "Failed" };
      case "warning":
        return { icon: <AlertCircle size={size} />, color: "text-amber-500", label: "Warning" };
      case "cancelling":
        return { 
          icon: <Ban size={size} className={animated ? "animate-pulse" : ""} />, 
          color: "text-gray-500", 
          label: "Cancelling" 
        };
      case "cancelled":
      case "discarded":
        return { icon: <XCircle size={size} />, color: "text-gray-500", label: "Cancelled" };
      default:
        return { icon: <FileX size={size} />, color: "text-gray-500", label: "Unknown" };
    }
  };

  const { icon, color, label } = getIconAndColor();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className={color}>{icon}</div>
      {withLabel && <span className={`text-sm ${color}`}>{label}</span>}
    </div>
  );
};
