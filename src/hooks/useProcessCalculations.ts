
import { useEffect } from 'react';
import { UseFormSetValue, FieldValues } from 'react-hook-form';

type ProcessType = "harvest" | "hand" | "machine" | "breakdown";

export const useProcessCalculations = (
  processType: ProcessType | null,
  watchedValues: FieldValues,
  setValue: UseFormSetValue<FieldValues>,
  isActive: boolean
) => {
  useEffect(() => {
    if (!processType || !isActive) return;

    switch (processType) {
      case 'harvest':
      case 'machine':
        const teamSize = watchedValues.teamSize || 0;
        const durationHours = watchedValues.durationHours || 0;
        const numberOfPlants = watchedValues.numberOfPlants || 0;
        
        setValue('laborHours', teamSize * durationHours);
        setValue('plantsPerHour', durationHours > 0 ? numberOfPlants / durationHours : 0);
        setValue('gramsPerHour', 0);
        break;
        
      case 'hand':
        const totalTimeMinutes = watchedValues.totalTimeMinutes || 0;
        const totalPremium = watchedValues.totalPremium || 0;
        
        setValue('gramsPerHour', totalTimeMinutes > 0 ? (totalPremium * 60) / totalTimeMinutes : 0);
        setValue('premiumGramsPerHour', totalTimeMinutes > 0 ? (totalPremium * 60) / totalTimeMinutes : 0);
        setValue('retentionPercentage', 85);
        setValue('variance', 0);
        break;
        
      case 'breakdown':
        const totalAs = watchedValues.totalAs || 0;
        const totalBs = watchedValues.totalBs || 0;
        const total = totalAs + totalBs;
        const startTime = watchedValues.startTime;
        const stopTime = watchedValues.stopTime;
        
        setValue('aPercentage', total > 0 ? (totalAs / total) * 100 : 0);
        setValue('bPercentage', total > 0 ? (totalBs / total) * 100 : 0);
        setValue('averageRate', 0);
        setValue('totalFlowerMass', totalAs + totalBs);
        
        if (startTime && stopTime) {
          const start = new Date(`1970-01-01T${startTime}:00`);
          const stop = new Date(`1970-01-01T${stopTime}:00`);
          const diffHours = (stop.getTime() - start.getTime()) / (1000 * 60 * 60);
          setValue('totalTime', diffHours);
        }
        break;
    }
  }, [watchedValues, processType, isActive, setValue]);
};
