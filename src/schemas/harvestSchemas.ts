
import { z } from 'zod';

export const harvestSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  input_weight: z.number().min(0, 'Input weight must be positive'),
  trim_weight: z.number().min(0, 'Trim weight must be positive').optional(),
  wet_weight: z.number().min(0, 'Wet weight must be positive').optional(),
  total_plants: z.number().min(1, 'Total plants must be at least 1').optional(),
  team_size: z.number().min(1, 'Team size must be at least 1').optional(),
  duration_hours: z.number().min(0, 'Duration must be positive').optional(),
  comment: z.string().optional(),
});

export type HarvestData = z.infer<typeof harvestSchema>;
