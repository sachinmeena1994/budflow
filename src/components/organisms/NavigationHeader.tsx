
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NavItem } from "@/components/molecules/NavItem";
import { Heading2 } from "@/components/atoms/Typography";
import { 
  Home, 
  PlusCircle, 
  BarChart3, 
  Settings, 
  User,
  Menu,
  X 
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { icon: Home, label: "Dashboard", id: "dashboard" },
  { icon: PlusCircle, label: "New Entry", id: "entry" },
  { icon: BarChart3, label: "Reports", id: "reports" },
  { icon: Settings, label: "Settings", id: "settings" },
];

export const NavigationHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GTI</span>
            </div>
            <Heading2 className="hidden sm:block">BudFlow</Heading2>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activeItem === item.id}
                onClick={() => setActiveItem(item.id)}
                className="px-4"
              />
            ))}
          </nav>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden transition-all duration-300 overflow-hidden",
          isMenuOpen ? "max-h-64 pb-4" : "max-h-0"
        )}>
          <Card className="mt-2 p-2">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <NavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={activeItem === item.id}
                  onClick={() => {
                    setActiveItem(item.id);
                    setIsMenuOpen(false);
                  }}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </header>
  );
};
