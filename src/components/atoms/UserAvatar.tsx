
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  name: string | undefined;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, className }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Avatar className={className}>
      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
        {name ? getInitials(name) : 'GV'}
      </AvatarFallback>
    </Avatar>
  );
};
