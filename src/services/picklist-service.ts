
import { Order } from "@/types/order";

// Define the enhanced Picklist interface
export interface Picklist {
  id: string;
  orderIds: string[];
  inventoryLocation: string;
  dispensaryLocation: string;
  totalItems: number;
  status: "in-progress" | "picked" | "packed" | "cancelled" | "approved" | "shipped";
  deliveryDate?: string;
  lastUpdated: string;
  createdOn: string;
  createdBy: string;
  lastSavedBy?: string;
  lastSavedAt?: string;
}

// Define PicklistItem interface
export interface PicklistItem {
  id: string;
  productName: string;
  batchNumber: string;
  quantityOrdered: number;
  quantityPicked: number;
  expiryDate: string;
  reasonCode?: "inventory-shortage" | "damaged-product" | "batch-not-found" | "lost" | "other";
  otherReason?: string;
  notes?: string; // Add missing notes property
  category: string;
  status: "not-started" | "picked";
}

// Define detailed picklist interface
export interface PicklistDetail extends Picklist {
  items: PicklistItem[];
}

// Centralized mock data for picklists
const mockPicklists: Picklist[] = [
  {
    id: "PL-2025-001",
    orderIds: ["ORD-2025-002"],
    inventoryLocation: "Warehouse B",
    dispensaryLocation: "Green Valley Cannabis Co",
    totalItems: 12,
    status: "in-progress",
    lastUpdated: "2025-01-20T14:30:00Z",
    createdOn: "2025-01-20T09:00:00Z",
    createdBy: "Sarah Johnson",
    lastSavedBy: "Mike Wilson",
    lastSavedAt: "2025-01-20T16:45:00Z",
  },
  {
    id: "PL-2025-002", 
    orderIds: ["ORD-2025-003"],
    inventoryLocation: "Warehouse A",
    dispensaryLocation: "Sunset Wellness Dispensary",
    totalItems: 8,
    status: "picked",
    deliveryDate: "2025-01-25",
    lastUpdated: "2025-01-19T16:15:00Z",
    createdOn: "2025-01-19T11:00:00Z",
    createdBy: "Mike Wilson",
  },
  {
    id: "PL-2025-003",
    orderIds: ["ORD-2025-003"],
    inventoryLocation: "Warehouse C",
    dispensaryLocation: "Sunset Wellness Dispensary",
    totalItems: 6,
    status: "shipped",
    deliveryDate: "2025-01-23",
    lastUpdated: "2025-01-19T17:45:00Z",
    createdOn: "2025-01-19T12:30:00Z",
    createdBy: "John Smith",
  },
];

// Mock items for picklist details
const mockPicklistItems: Record<string, PicklistItem[]> = {
  "PL-2025-001": [
    {
      id: "item-1",
      productName: "Purple Haze 1/8oz",
      batchNumber: "PH-2025-001",
      quantityOrdered: 5,
      quantityPicked: 3,
      expiryDate: "2025-12-15",
      reasonCode: "inventory-shortage",
      category: "Flower",
      status: "picked",
    },
    {
      id: "item-2",
      productName: "OG Kush Vape Cart",
      batchNumber: "OG-2025-045",
      quantityOrdered: 3,
      quantityPicked: 0,
      expiryDate: "2025-05-30",
      category: "Vape",
      status: "not-started",
    },
    {
      id: "item-3",
      productName: "CBD Gummies 10mg",
      batchNumber: "CBD-2025-012",
      quantityOrdered: 4,
      quantityPicked: 4,
      expiryDate: "2025-06-01",
      category: "Edible",
      status: "picked",
    },
  ],
  "PL-2025-002": [
    {
      id: "item-4",
      productName: "Blue Dream 1/4oz",
      batchNumber: "BD-2025-003",
      quantityOrdered: 2,
      quantityPicked: 2,
      expiryDate: "2025-11-20",
      category: "Flower",
      status: "picked",
    },
    {
      id: "item-5",
      productName: "Sour Diesel Pre-rolls",
      batchNumber: "SD-2025-021",
      quantityOrdered: 10,
      quantityPicked: 10,
      expiryDate: "2025-08-15",
      category: "Pre-roll",
      status: "picked",
    },
  ],
  "PL-2025-003": [
    {
      id: "item-6",
      productName: "White Widow Concentrate",
      batchNumber: "WW-2025-007",
      quantityOrdered: 3,
      quantityPicked: 3,
      expiryDate: "2025-09-10",
      category: "Concentrate",
      status: "picked",
    },
  ],
};

// Centralized picklist service
export const picklistService = {
  // Get all picklists
  getAllPicklists: (): Picklist[] => mockPicklists,
  
  // Get picklists by status
  getPicklistsByStatus: (status: string): Picklist[] => {
    return mockPicklists.filter(picklist => picklist.status === status);
  },

  // Get picklists by order ID
  getPicklistsByOrderId: (orderId: string): Picklist[] => {
    return mockPicklists.filter(picklist => picklist.orderIds.includes(orderId));
  },

  // Get picklist detail by ID
  getPicklistDetail: (picklistId: string): PicklistDetail | null => {
    const picklist = mockPicklists.find(p => p.id === picklistId);
    if (!picklist) return null;

    const items = mockPicklistItems[picklistId] || [];
    return {
      ...picklist,
      items,
    };
  },

  // Calculate completion percentage
  calculateCompletionPercentage: (items: PicklistItem[]): number => {
    if (items.length === 0) return 0;
    const pickedCount = items.filter(item => item.status === "picked").length;
    return Math.round((pickedCount / items.length) * 100);
  },

  // Save progress without final submission
  saveProgress: async (picklistId: string, currentUser: string = "Current User"): Promise<void> => {
    console.log(`Saving progress for picklist ${picklistId} by ${currentUser}`);
    const picklist = mockPicklists.find(p => p.id === picklistId);
    if (picklist) {
      picklist.lastSavedBy = currentUser;
      picklist.lastSavedAt = new Date().toISOString();
      picklist.lastUpdated = new Date().toISOString();
    }
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  // Update picklist status
  updatePicklistStatus: async (picklistId: string, status: Picklist['status'], reasonCode?: string): Promise<void> => {
    console.log(`Updating picklist ${picklistId} to status ${status}`, reasonCode ? `with reason: ${reasonCode}` : '');
    const picklist = mockPicklists.find(p => p.id === picklistId);
    if (picklist) {
      picklist.status = status;
      picklist.lastUpdated = new Date().toISOString();
    }
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  // Update picklist item
  updatePicklistItem: async (picklistId: string, itemId: string, updates: Partial<PicklistItem>): Promise<void> => {
    console.log(`Updating picklist ${picklistId} item ${itemId}:`, updates);
    const items = mockPicklistItems[picklistId];
    if (items) {
      const itemIndex = items.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        const updatedItem = { ...items[itemIndex], ...updates };
        
        // Auto-update status based on quantity picked
        if ('quantityPicked' in updates) {
          updatedItem.status = updatedItem.quantityPicked > 0 ? "picked" : "not-started";
        }
        
        mockPicklistItems[picklistId][itemIndex] = updatedItem;
      }
    }
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  // Check if order has picklists (for determining if "View Picklists" link should show)
  hasPicklistsForOrder: (orderId: string): boolean => {
    return mockPicklists.some(picklist => picklist.orderIds.includes(orderId));
  },

  // Validate picklist items for completion
  validatePicklistItems: (items: PicklistItem[]): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    items.forEach(item => {
      // If picked quantity is less than ordered, reason code is required
      if (item.quantityPicked < item.quantityOrdered && !item.reasonCode) {
        errors[item.id] = "Reason required when picked quantity is less than ordered quantity";
      }
      
      // If reason is "other", otherReason is required
      if (item.reasonCode === "other" && (!item.otherReason || item.otherReason.trim() === '')) {
        errors[item.id] = "Please specify reason when 'Other' is selected";
      }
      
      // Basic validation
      if (item.quantityPicked > item.quantityOrdered) {
        errors[item.id] = "Picked quantity cannot exceed ordered quantity";
      }
      if (item.quantityPicked < 0) {
        errors[item.id] = "Picked quantity cannot be negative";
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};
