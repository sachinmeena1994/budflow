
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Bell } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const handleMicrosoftLogin = () => {

  };

  const handleLogout = () => {

  };

  // Mock user data - will be replaced with actual Microsoft auth
  const user = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    avatar: null,
    initials: 'JD'
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-8 w-8" />
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-foreground">
              🌿 Harvest Harmony Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 relative hover:bg-muted transition-colors duration-200"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
              3
            </span>
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full hover:ring-2 hover:ring-primary/20 transition-all duration-200"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar || undefined} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer hover:bg-muted transition-colors duration-200">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-muted transition-colors duration-200">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Microsoft Login Button (shown when not logged in) */}
          {false && ( // This will be conditionally shown based on auth state
            <Button
              onClick={handleMicrosoftLogin}
              className="bg-[#0078d4] hover:bg-[#106ebe] text-white transition-colors duration-200"
              size="sm"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23" fill="currentColor">
                <path d="M1 1h10v10H1z" />
                <path d="M12 1h10v10H12z" />
                <path d="M1 12h10v10H1z" />
                <path d="M12 12h10v10H12z" />
              </svg>
              Sign in with Microsoft
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
