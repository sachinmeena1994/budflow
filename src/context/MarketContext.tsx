import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
} from "react";
import { ImportStatusType, mockMarketImportStatus } from "@/utils/import-status";
import { supabase } from "@/integrations/supabase/client";

export interface Market {
  id: string;
  name: string;
  code: string;
  seedToSaleSystem?: "metrc" | "biotrack" | "mjfreeway";
  importStatus?: ImportStatusType;
}

export interface InventoryLocation {
  id: string;
  name: string;
  marketId: string;
}

export interface SiteOption {
  id: string;
  site_alias: string;
  market: string;
  market_code: string;
  active: boolean;
  site_name: string;
}

export interface MarketContextType {
  currentMarket: Market;
  setCurrentMarket: (market: Market) => void;
  currentSite: SiteOption | null;
  markets: Market[];
  inventoryLocations: InventoryLocation[];
  sites: SiteOption[];
}

const MarketContext = createContext<MarketContextType>({
  currentMarket: { id: "", name: "", code: "" },
  setCurrentMarket: () => {},
  currentSite: null,
  markets: [],
  inventoryLocations: [],
  sites: [],
});

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [currentMarket, setCurrentMarket] = useState<Market>({ id: "", name: "", code: "" });
  const [currentSite, setCurrentSite] = useState<SiteOption | null>(null);

  // Fetch active sites
  useEffect(() => {
    const fetchSites = async () => {
      const { data, error } = await supabase
        .from("sites")
        .select("id, site_name, market, market_code, active,site_alias")
        .eq("active", true);

      if (error) {
        console.error("Error fetching active sites:", error);
      } else {
        setSites(data || []);
      }
    };

    fetchSites();
  }, []);

  // Build unique markets
  const markets: Market[] = useMemo(() => {
    const uniqueMarkets = new Map<string, Market>();
    sites.forEach((site) => {
      if (!uniqueMarkets.has(site.market_code)) {
        uniqueMarkets.set(site.market_code, {
          id: site.market_code,
          name: site.market,
          code: site.market_code,
          importStatus: mockMarketImportStatus[site.market_code] || "idle",
        });
      }
    });
    return Array.from(uniqueMarkets.values());
  }, [sites]);

  // Create inventory locations
  const inventoryLocations: InventoryLocation[] = useMemo(() => {
    return sites.map((site) => ({
      id: site.id,
      name: site.site_alias,
      marketId: site.market_code,
    }));
  }, [sites]);

  // When markets are available, set the first market
  useEffect(() => {
    if (markets.length > 0 && !currentMarket.id) {
      setCurrentMarket(markets[0]);
    }
  }, [markets]);

  // When current market changes, update current site
  useEffect(() => {
    if (currentMarket.code) {
      const siteInMarket = sites.find(site => site.market_code === currentMarket.code);
      if (siteInMarket) {
        setCurrentSite(siteInMarket);
      }
    }
  }, [currentMarket, sites]);

  const value: MarketContextType = {
    currentMarket,
    setCurrentMarket,
    currentSite,
    markets,
    inventoryLocations,
    sites, 
  };


  return (
    <MarketContext.Provider value={value}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
