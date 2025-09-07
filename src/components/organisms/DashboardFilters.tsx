import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, RotateCcw, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DashboardFiltersProps {
  filters: {
    sites: string[];
    dateRange: { from: Date; to: Date };
  };
  onFiltersChange: (filters: any) => void;
  sites: string[];
  onRefresh: () => void;
  isLoading: boolean;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  sites,
  onRefresh,
  isLoading
}) => {
  const handleSiteToggle = (site: string) => {
    const newSites = filters.sites.includes(site)
      ? filters.sites.filter(s => s !== site)
      : [...filters.sites, site];
    
    onFiltersChange({
      ...filters,
      sites: newSites.length > 0 ? newSites : [site]
    });
  };

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    onFiltersChange({
      ...filters,
      dateRange: range
    });
  };

  return (
    <div className="flex items-center gap-3">
      {/* Site Selection */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9 border-dashed">
            Sites ({filters.sites.length})
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="end">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Select Sites</h4>
            <div className="space-y-2">
              {sites.map((site) => (
                <label key={site} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.sites.includes(site)}
                    onChange={() => handleSiteToggle(site)}
                    className="rounded border-input"
                  />
                  <span className="text-sm">{site}</span>
                </label>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Date Range Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 w-[240px] justify-start text-left font-normal",
              !filters.dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateRange?.from ? (
              filters.dateRange.to ? (
                <>
                  {format(filters.dateRange.from, "LLL dd")} -{" "}
                  {format(filters.dateRange.to, "LLL dd")}
                </>
              ) : (
                format(filters.dateRange.from, "LLL dd, y")
              )
            ) : (
              "Pick a date range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={filters.dateRange?.from}
            selected={filters.dateRange}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                handleDateRangeChange({ from: range.from, to: range.to });
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {/* Refresh Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
        className="h-9"
      >
        <RotateCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
      </Button>

      {/* Active Filters Display */}
      {filters.sites.length > 1 && (
        <div className="flex items-center gap-1">
          {filters.sites.slice(0, 2).map((site) => (
            <Badge key={site} variant="secondary" className="h-6 text-xs">
              {site}
              <button
                onClick={() => handleSiteToggle(site)}
                className="ml-1 hover:bg-destructive/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.sites.length > 2 && (
            <Badge variant="secondary" className="h-6 text-xs">
              +{filters.sites.length - 2} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;