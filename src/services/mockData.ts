// Types
export interface Menu {
  id: string;
  location: string;
  status: "active" | "disabled" | "draft";
  lastUpdated: string;
  platform: "Jane" | "Dutchie";
  market: string;
  sourceSystem: string;
}

export interface Product {
  id: string;
  name: string;
  store: string;
  currentPrice: number;
  overridePrice: number | null;
  lastSynced: string;
  status: "active" | "flagged" | "disabled";
  category: string;
}

export interface DashboardStats {
  ordersToday: number;
  activeMenus: number;
  flaggedProducts: number;
  syncStats: {
    date: string;
    success: number;
    failure: number;
  }[];
}

// Mock data
export const mockMenus: Menu[] = [
  {
    id: "m1",
    location: "San Francisco - Soma",
    status: "active",
    lastUpdated: "2025-04-28T08:32:45",
    platform: "Jane",
    market: "California",
    sourceSystem: "Treez",
  },
  {
    id: "m2",
    location: "Oakland - Downtown",
    status: "active",
    lastUpdated: "2025-04-28T10:15:22",
    platform: "Dutchie",
    market: "California",
    sourceSystem: "Flowhub",
  },
  {
    id: "m3",
    location: "Los Angeles - Venice",
    status: "disabled",
    lastUpdated: "2025-04-27T14:22:10",
    platform: "Jane",
    market: "California",
    sourceSystem: "Treez",
  },
  {
    id: "m4",
    location: "Portland - East Side",
    status: "active",
    lastUpdated: "2025-04-28T09:45:33",
    platform: "Dutchie",
    market: "Oregon",
    sourceSystem: "Flowhub",
  },
  {
    id: "m5",
    location: "Denver - Highland",
    status: "draft",
    lastUpdated: "2025-04-26T16:30:00",
    platform: "Jane",
    market: "Colorado",
    sourceSystem: "Treez",
  },
];

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "CBD Oil 1000mg",
    store: "San Francisco - Soma",
    currentPrice: 59.99,
    overridePrice: 54.99,
    lastSynced: "2025-04-28T15:22:10",
    status: "active",
    category: "Tinctures",
  },
  {
    id: "p2",
    name: "Cannabis Gummies 100mg",
    store: "Oakland - Downtown",
    currentPrice: 24.99,
    overridePrice: null,
    lastSynced: "2025-04-28T14:15:00",
    status: "flagged",
    category: "Edibles",
  },
  {
    id: "p3",
    name: "Indica Flower 3.5g",
    store: "San Francisco - Soma",
    currentPrice: 45.0,
    overridePrice: 39.99,
    lastSynced: "2025-04-28T12:30:45",
    status: "active",
    category: "Flower",
  },
  {
    id: "p4",
    name: "Sativa Flower 3.5g",
    store: "Los Angeles - Venice",
    currentPrice: 45.0,
    overridePrice: null,
    lastSynced: "2025-04-27T18:10:22",
    status: "active",
    category: "Flower",
  },
  {
    id: "p5",
    name: "Vape Cartridge 500mg",
    store: "Portland - East Side",
    currentPrice: 35.0,
    overridePrice: 29.99,
    lastSynced: "2025-04-28T11:45:10",
    status: "active",
    category: "Vapes",
  },
  {
    id: "p6",
    name: "Preroll 1g",
    store: "Denver - Highland",
    currentPrice: 12.0,
    overridePrice: 10.0,
    lastSynced: "2025-04-26T09:30:00",
    status: "flagged",
    category: "Pre-rolls",
  },
  {
    id: "p7",
    name: "Chocolate Bar 50mg",
    store: "San Francisco - Soma",
    currentPrice: 18.0,
    overridePrice: null,
    lastSynced: "2025-04-28T16:05:33",
    status: "disabled",
    category: "Edibles",
  },
];

export const mockDashboardStats: DashboardStats = {
  ordersToday: 128,
  activeMenus: 12,
  flaggedProducts: 8,
  syncStats: [
    { date: "2025-04-23", success: 245, failure: 3 },
    { date: "2025-04-24", success: 251, failure: 5 },
    { date: "2025-04-25", success: 244, failure: 2 },
    { date: "2025-04-26", success: 240, failure: 8 },
    { date: "2025-04-27", success: 248, failure: 4 },
    { date: "2025-04-28", success: 252, failure: 6 },
    { date: "2025-04-29", success: 120, failure: 3 },
  ],
};
