// src/services/mock-data/workType-data.ts

export interface WorkTypeEntry {
  id: string;
  taskId: string;
  date: string;
  workType: string;
  technician: string;
  site: string;
  status: string;
  batchProduct?: string;
  [key: string]: string | number | undefined; // Allow dynamic fields
}

const mockEntries: WorkTypeEntry[] = [
  {
    id: "entry-1001",
    taskId: "T-1001",
    date: "2025-06-16",
    workType: "harvest",
    technician: "John Doe",
    site: "Greenhouse A",
    batchProduct: "Batch-01",
    harvestDate: "2025-06-15",
    harvestType: "Full Plant",
    strain: "Strain A",
    numPlants: 25,
    teamSize: 5,
    duration: 3,
    laborHours: 15,
    plantsPerLaborHour: 1.67,
    gramsPerLaborHour: 120.5,
    status: "Completed",
  },
  {
    id: "entry-1002",
    taskId: "T-1002",
    date: "2025-06-15",
    workType: "machine",
    technician: "Alice Smith",
    site: "Field 5",
    batchProduct: "Batch-02",
    trimWeight: 300,
    trimmedPercent: 85,
    startTime: "09:00",
    stopTime: "12:00",
    totalTime: 3,
    employees: 2,
    gramsPerHour: 100,
    gramsPerOperatorHour: 50,
    comment: "Good machine performance",
    status: "In Progress",
  },
  {
    id: "entry-1003",
    taskId: "T-1003",
    date: "2025-06-14",
    workType: "hand",
    technician: "Robert Johnson",
    site: "Processing Room",
    batchProduct: "Batch-03",
    strain: "Strain B",
    first4BT: 1234,
    totalTrimTime: 180,
    totalUntrimmed: 100,
    totalPremium: 80,
    totalBMaterial: 20,
    gramsPerHr: 60,
    premiumGramsPerHr: 40,
    premiumRetention: 75,
    target: "Target A",
    variance: 5,
    qualityGrade: "A",
    status: "Pending",
  },
  {
    id: "entry-1004",
    taskId: "T-1004",
    date: "2025-06-13",
    workType: "breakdown",
    technician: "Emily Davis",
    site: "Machine Bay",
    batchProduct: "Batch-04",
    averageRate: 110,
    totalA: 60,
    aPercent: 50,
    totalB: 60,
    bPercent: 50,
    strain: "Strain C",
    buckedMass: 1000,
    sampleBagMass: 200,
    floorExtractMass: 150,
    stemWasteMass: 50,
    totalFlowerMass: 1200,
    startTime: "10:00",
    stopTime: "14:00",
    totalTime: 4,
    status: "On Hold",
    comments: "Maintenance required",
  },
];


export const mockWorkTypeData = {
  getWorkTypeEntries: async (selectedWorkType: string): Promise<WorkTypeEntry[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulated delay
    return mockEntries;
  },
};
