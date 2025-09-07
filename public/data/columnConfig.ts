
export interface ColumnConfig {
  id: string;
  header: string;
  width: string;
  type: 'text' | 'number' | 'date' | 'time' | 'select' | 'calculated' | 'badge' | 'workType' | 'status';
  options?: Array<{ value: string; label: string }>;
  calculated?: boolean;
  hideForWorkTypes?: string[];
}

export const processColumnConfigs = {
  harvest: [
    { id: 'taskId', header: 'Task ID', width: 'w-[100px]', type: 'text' },
    { id: 'date', header: 'Date', width: 'w-[120px]', type: 'date' },
    { id: 'workType', header: 'Work Type', width: 'w-[120px]', type: 'workType' },
    { id: 'batch', header: 'Batch', width: 'w-[140px]', type: 'select' },
    { id: 'site', header: 'Site', width: 'w-[100px]', type: 'select' },
    { id: 'status', header: 'Status', width: 'w-[100px]', type: 'status' },
    { id: 'harvestDate', header: 'Harvest Date', width: 'w-[160px]', type: 'date' },
    { id: 'harvestType', header: 'Harvest Type', width: 'w-[160px]', type: 'select' },
    { id: 'strain', header: 'Strain', width: 'w-[120px]', type: 'select' },
    { id: 'numberOfPlants', header: 'Plants', width: 'w-[100px]', type: 'number' },
    { id: 'teamSize', header: 'Team Size', width: 'w-[120px]', type: 'number' },
    { id: 'durationHours', header: 'Duration', width: 'w-[120px]', type: 'number' },
    { id: 'laborHours', header: 'Labor Hours', width: 'w-[140px]', type: 'calculated', calculated: true },
    { id: 'plantsPerHour', header: 'Plants/Hr', width: 'w-[140px]', type: 'calculated', calculated: true },
    { id: 'comment', header: 'Comment', width: 'w-[150px]', type: 'text' }
  ] as ColumnConfig[],
  
  hand: [
    { id: 'taskId', header: 'Task ID', width: 'w-[100px]', type: 'text' },
    { id: 'technician', header: 'Technician', width: 'w-[140px]', type: 'select' },
    { id: 'date', header: 'Date', width: 'w-[120px]', type: 'date' },
    { id: 'workType', header: 'Work Type', width: 'w-[120px]', type: 'workType' },
    { id: 'batch', header: 'Batch', width: 'w-[140px]', type: 'select' },
    { id: 'site', header: 'Site', width: 'w-[100px]', type: 'select' },
    { id: 'status', header: 'Status', width: 'w-[100px]', type: 'status' },
    { id: 'first4OfBT', header: 'First 4 BT', width: 'w-[140px]', type: 'text' },
    { id: 'totalTimeMinutes', header: 'Time (min)', width: 'w-[140px]', type: 'number' },
    { id: 'totalPremium', header: 'Premium', width: 'w-[120px]', type: 'number' },
    { id: 'gramsPerHour', header: 'Grams/Hr', width: 'w-[140px]', type: 'calculated', calculated: true },
    { id: 'premiumGramsPerHour', header: 'Premium G/Hr', width: 'w-[160px]', type: 'calculated', calculated: true },
    { id: 'retentionPercentage', header: 'Retention %', width: 'w-[140px]', type: 'calculated', calculated: true },
    { id: 'target', header: 'Target', width: 'w-[100px]', type: 'select' },
    { id: 'variance', header: 'Variance', width: 'w-[120px]', type: 'calculated', calculated: true },
    { id: 'qualityGrade', header: 'Quality', width: 'w-[120px]', type: 'select' },
    { id: 'comment', header: 'Comment', width: 'w-[150px]', type: 'text' }
  ] as ColumnConfig[],
  
  machine: [
    { id: 'taskId', header: 'Task ID', width: 'w-[100px]', type: 'text' },
    { id: 'technician', header: 'Technician', width: 'w-[140px]', type: 'select' },
    { id: 'date', header: 'Date', width: 'w-[120px]', type: 'date' },
    { id: 'workType', header: 'Work Type', width: 'w-[120px]', type: 'workType' },
    { id: 'batch', header: 'Batch', width: 'w-[140px]', type: 'select' },
    { id: 'site', header: 'Site', width: 'w-[100px]', type: 'select' },
    { id: 'status', header: 'Status', width: 'w-[100px]', type: 'status' },
    { id: 'numberOfPlants', header: 'Plants', width: 'w-[100px]', type: 'number' },
    { id: 'teamSize', header: 'Team Size', width: 'w-[120px]', type: 'number' },
    { id: 'durationHours', header: 'Duration', width: 'w-[120px]', type: 'number' },
    { id: 'laborHours', header: 'Labor Hours', width: 'w-[140px]', type: 'calculated', calculated: true },
    { id: 'plantsPerHour', header: 'Plants/Hr', width: 'w-[140px]', type: 'calculated', calculated: true },
    { id: 'gramsPerHour', header: 'Grams/Hr', width: 'w-[140px]', type: 'calculated', calculated: true },
    { id: 'comment', header: 'Comment', width: 'w-[150px]', type: 'text' }
  ] as ColumnConfig[],
  
  breakdown: [
    { id: 'taskId', header: 'Task ID', width: 'w-[100px]', type: 'text' },
    { id: 'technician', header: 'Technician', width: 'w-[140px]', type: 'select' },
    { id: 'date', header: 'Date', width: 'w-[120px]', type: 'date' },
    { id: 'workType', header: 'Work Type', width: 'w-[120px]', type: 'workType' },
    { id: 'batch', header: 'Batch', width: 'w-[140px]', type: 'select' },
    { id: 'site', header: 'Site', width: 'w-[100px]', type: 'select' },
    { id: 'status', header: 'Status', width: 'w-[100px]', type: 'status' },
    { id: 'totalAs', header: 'Total As', width: 'w-[120px]', type: 'number' },
    { id: 'totalBs', header: 'Total Bs', width: 'w-[120px]', type: 'number' },
    { id: 'aPercentage', header: 'A%', width: 'w-[100px]', type: 'calculated', calculated: true },
    { id: 'bPercentage', header: 'B%', width: 'w-[100px]', type: 'calculated', calculated: true },
    { id: 'averageRate', header: 'Avg Rate', width: 'w-[140px]', type: 'calculated', calculated: true },
    { id: 'buckedMass', header: 'Bucked Mass', width: 'w-[140px]', type: 'number' },
    { id: 'sampleBagMass', header: 'Sample Mass', width: 'w-[160px]', type: 'number' },
    { id: 'floorExtractMass', header: 'Floor Extract', width: 'w-[160px]', type: 'number' },
    { id: 'stemWasteMass', header: 'Stem Waste', width: 'w-[160px]', type: 'number' },
    { id: 'totalFlowerMass', header: 'Total Flower', width: 'w-[160px]', type: 'calculated', calculated: true },
    { id: 'startTime', header: 'Start', width: 'w-[120px]', type: 'time' },
    { id: 'stopTime', header: 'Stop', width: 'w-[120px]', type: 'time' },
    { id: 'totalTime', header: 'Total Time', width: 'w-[140px]', type: 'calculated', calculated: true },
    { id: 'comment', header: 'Comment', width: 'w-[150px]', type: 'text' }
  ] as ColumnConfig[]
};
