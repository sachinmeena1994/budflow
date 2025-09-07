
import React ,{useEffect} from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useMarket } from "@/context/MarketContext";
import { cn } from "@/lib/utils";
import { useEntryFetch } from "@/hooks/productivity/useEntryFetch";
interface MarketSelectorProps {
  isCollapsed?: boolean;
}

export const MarketSelector: React.FC<MarketSelectorProps> = ({ isCollapsed = false }) => {
  const { 
    currentMarket, 
    setCurrentMarket, 
    markets ,
    currentSite
  } = useMarket();

    const { fetchedEntries, isLoading, refetch } = useEntryFetch("All");

      useEffect(() => {
    if (currentMarket) {
      refetch();

    }
  }, [currentMarket]);

     
  
 return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn("h-7 gap-1 text-xs", isCollapsed && "w-7 px-0 justify-center")}
        >
          <span>{currentMarket.code}</span>
          {!isCollapsed && <ChevronDown className="h-3 w-3 opacity-70" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuLabel>Markets</DropdownMenuLabel>
        {markets.map((market) => (
          <DropdownMenuItem
            key={market.id}
            onClick={() => setCurrentMarket(market)}
            className="flex items-center justify-between"
          >
            <span>{market.name}</span>
            {currentMarket.id === market.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

};
