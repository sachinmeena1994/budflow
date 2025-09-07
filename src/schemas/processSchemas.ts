import { z } from "zod";

// Base schema with common fields
const baseSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  date: z.string().min(1, "Date is required"),
  operator: z.string().min(1, "Operator is required"),
  // batch: z.string().min(1, "Batch is required"),
  strain: z.string().min(1, "Strain is required"),
  status: z.string().min(1, "Status is required"),
});

// Harvest Trim Schema
export const harvestTrimSchema = baseSchema.extend({
  processType: z.literal("harvest"),
  site: z.string().min(1, "Site is required"),
  harvestDate: z.string().min(1, "Harvest date is required"),
  harvestType: z.string().min(1, "Harvest type is required"),
  numberOfPlants: z.number().min(1, "Number of plants must be at least 1"),
  teamSize: z.number().min(1, "Team size must be at least 1"),
  durationHours: z.number().min(0.1, "Duration must be at least 0.1 hours"),
  laborHours: z.number().optional(), // auto-calculated
  plantsPerHour: z.number().optional(), // auto-calculated
  gramsPerHour: z.number().optional(), // auto-calculated
});

// Machine Trim Schema (inherits from harvest)
export const machineTrimSchema = harvestTrimSchema.extend({
  processType: z.literal("machine"),
});

// Hand Trim Schema
export const handTrimSchema = baseSchema.extend({
  processType: z.literal("hand"),
  first4OfBT: z.string().min(1, "Last 4 of BT is required"),
  totalTimeMinutes: z.number().min(1, "Total time must be at least 1 minute"),
  totalUntrimmed: z.number().optional(), // auto-calculated
  totalPremium: z.number().min(0, "Total premium cannot be negative"),
  totalBMaterial: z.number().optional(), // auto-calculated
  gramsPerHour: z.number().optional(), // auto-calculated
  premiumGramsPerHour: z.number().optional(), // auto-calculated
  retentionPercentage: z.number().optional(), // auto-calculated
  target: z.string().min(1, "Target is required"),
  variance: z.number().optional(), // auto-calculated
  qualityGrade: z.string().min(1, "Quality grade is required"),
});

// Breakdown Trim Schema
export const breakdownTrimSchema = baseSchema.extend({
  processType: z.literal("breakdown"),
  totalAs: z.number().min(0, "Total As cannot be negative"),
  totalBs: z.number().min(0, "Total Bs cannot be negative"),
  aPercentage: z.number().optional(), // auto-calculated
  bPercentage: z.number().optional(), // auto-calculated
  averageRate: z.number().optional(), // auto-calculated
  buckedMass: z.number().min(0, "Bucked mass cannot be negative"),
  sampleBagMass: z.number().min(0, "Sample bag mass cannot be negative"),
  floorExtractMass: z.number().min(0, "Floor extract mass cannot be negative"),
  stemWasteMass: z.number().min(0, "Stem waste mass cannot be negative"),
  totalFlowerMass: z.number().optional(), // auto-calculated
  startTime: z.string().min(1, "Start time is required"),
  stopTime: z.string().min(1, "Stop time is required"),
  totalTime: z.number().optional(), // auto-calculated
  comment: z.string().optional(),
});

export type HarvestTrimEntry = z.infer<typeof harvestTrimSchema>;
export type MachineTrimEntry = z.infer<typeof machineTrimSchema>;
export type HandTrimEntry = z.infer<typeof handTrimSchema>;
export type BreakdownTrimEntry = z.infer<typeof breakdownTrimSchema>;

export type ProcessEntry = HarvestTrimEntry | MachineTrimEntry | HandTrimEntry | BreakdownTrimEntry;

export const getSchemaByProcessType = (processType: string) => {
  switch (processType) {
    case "harvest":
      return harvestTrimSchema;
    case "machine":
      return machineTrimSchema;
    case "hand":
      return handTrimSchema;
    case "breakdown":
      return breakdownTrimSchema;
    default:
      return baseSchema;
  }
};
