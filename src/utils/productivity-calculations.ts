
export interface CalculationInputs {
  total_plants?: number;
  team_size?: number;
  duration_hours?: number;
}

export function calculateGramsPerHour(inputs: CalculationInputs): number {
  const { total_plants = 0, team_size = 0, duration_hours = 0 } = inputs;
  
  // Avoid division by zero
  if (team_size === 0 || duration_hours === 0) {
    return 0;
  }
  
  const effective_hours = team_size * duration_hours;
  return total_plants / effective_hours;
}

export function getCalculatedFields(row: Record<string, any>): Record<string, number> {
  const calculationInputs: CalculationInputs = {
    total_plants: parseFloat(row.entry_payload?.total_plants || row.total_plants || 0),
    team_size: parseFloat(row.entry_payload?.team_size || row.team_size || 0),
    duration_hours: parseFloat(row.entry_payload?.duration_hours || row.duration_hours || 0),
  };

  return {
    grams_per_hour: calculateGramsPerHour(calculationInputs),
  };
}
