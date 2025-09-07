
export interface Order {
  id: string;
  customer: string;
  date: string;
  status: "Draft" | "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Rejected";
  total: string;
  items?: OrderItem[];
  buyerId?: string;
  salesPersonId?: string;
  inventoryLocationId?: string;
  inventoryLocationName?: string;
  totalBatch?: number;
  totalUnits?: number;
  totalPackageSize?: string;
  license?: string;
  version?: number;
  placedDate?: string;
  revisedDate?: string;
  approvedDate?: string;
  hasValidationErrors?: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  category?: string;
  available?: number;
  outOfStock?: boolean;
  packageSize?: string;
  batchNumber?: string;
  tagNumber?: string;
  caseSize?: number;
  hasValidationErrors?: boolean;
  brand?: string;
  dominance?: string;
  strain?: string;
}
