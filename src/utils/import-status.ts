export enum ImportStatus {
  IDLE = 'IDLE',
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN-PROGRESS',
  DISCARDED = 'DISCARDED',
  FETCH_COMPLETED = 'FETCH-COMPLETED',
  FAILED = 'FAILED',
  COMMITTED = 'COMMITTED',
}

export type ImportStatusType =
  | 'IDLE'
  | 'DRAFT'
  | 'IN-PROGRESS'
  | 'FETCH-COMPLETED'
  | 'COMMITTED'
  | 'FAILED'
  | 'DISCARDED';

// Mock import status for different markets
export const mockMarketImportStatus: Record<string, ImportStatusType> = {
  IL: ImportStatus.IDLE,
  CA: ImportStatus.IN_PROGRESS,
  CO: ImportStatus.FETCH_COMPLETED,
  WA: ImportStatus.IDLE,
  OR: ImportStatus.COMMITTED,
  MA: ImportStatus.IDLE,
  NV: ImportStatus.IDLE,
};
