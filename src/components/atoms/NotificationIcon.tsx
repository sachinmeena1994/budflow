
import React from 'react';
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationIconProps {
  hasNotifications?: boolean;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({ 
  hasNotifications = true 
}) => {
  return (
    <Button variant="ghost" size="icon" className="relative w-8 h-8">
      <Bell className="h-4 w-4" />
      {hasNotifications && (
        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-cannabis-500" />
      )}
    </Button>
  );
};
