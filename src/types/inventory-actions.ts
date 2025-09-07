export type InventoryAction = 'commit' | 'discard';

export interface InventoryActionPayload {
  action: InventoryAction;
  userId: string;
  marketCode: string;
}
