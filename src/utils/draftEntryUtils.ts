
import { ProcessEntry } from '../schemas/processSchemas';

type ProcessType = "harvest" | "hand" | "machine" | "breakdown";

export const createDraftRow = (processType: ProcessType): Omit<ProcessEntry, 'id' | 'taskId'> => {
  const baseEntry = {
    date: new Date().toISOString().split('T')[0],
    operator: '',
    batch: '',
    strain: '',
    processType,
    workType: processType.charAt(0).toUpperCase() + processType.slice(1),
    technician: '',
    site: '',
    status: 'Pending' as const,
    comment: ''
  };

  console.log('Creating draft row for processType:', processType);

  switch (processType) {
    case 'harvest':
    case 'machine':
      return {
        ...baseEntry,
        processType,
        harvestDate: new Date().toISOString().split('T')[0],
        harvestType: '',
        numberOfPlants: 0,
        teamSize: 1,
        durationHours: 1,
        laborHours: 0,
        plantsPerHour: 0,
        gramsPerHour: 0
      } as any;

    case 'hand':
      return {
        ...baseEntry,
        processType,
        first4OfBT: '',
        totalTimeMinutes: 0,
        totalUntrimmed: 0,
        totalPremium: 0,
        totalBMaterial: 0,
        gramsPerHour: 0,
        premiumGramsPerHour: 0,
        retentionPercentage: 0,
        target: '',
        variance: 0,
        qualityGrade: ''
      } as any;

    case 'breakdown':
      return {
        ...baseEntry,
        processType,
        totalAs: 0,
        totalBs: 0,
        aPercentage: 0,
        bPercentage: 0,
        averageRate: 0,
        buckedMass: 0,
        sampleBagMass: 0,
        floorExtractMass: 0,
        stemWasteMass: 0,
        totalFlowerMass: 0,
        startTime: '',
        stopTime: '',
        totalTime: 0
      } as any;

    default:
      return baseEntry as any;
  }
};
