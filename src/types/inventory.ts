// Inventory-related types
export interface CaseSizeError {
  id: string;
  tagNumber: string;
  quantity: number;
  standardCaseSize: number;
  market: string;
  errorType: 'case-size';
  name: string;
  batchNumber: string;
  inventoryLocationName: string;
  category: string;
}
