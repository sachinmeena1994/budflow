
import { useState, useCallback } from 'react';
import { ProductivityData } from '../components/molecules/ProductivityRow/ProductivityRow';

export const useProductivityManager = () => {
  const [data, setData] = useState<ProductivityData[]>([
    {
      id: '1',
      date: '2024-01-15',
      hours: 8.5,
      productivity: 12.3,
      workType: 'harvest',
      notes: 'Good weather conditions',
    },
    {
      id: '2',
      date: '2024-01-16',
      hours: 7.0,
      productivity: 10.1,
      workType: 'harvest',
      notes: 'Some equipment delays',
    },
    {
      id: '3',
      date: '2024-01-17',
      hours: 6.5,
      productivity: 8.7,
      workType: 'machine',
      notes: 'Routine maintenance',
    },
  ]);

  const addEntry = useCallback((newEntry: Omit<ProductivityData, 'id'>) => {
    const id = Date.now().toString();
    setData(prev => [...prev, { ...newEntry, id }]);
  }, []);

  const editEntry = useCallback((id: string, updatedEntry: Omit<ProductivityData, 'id'>) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...updatedEntry, id } : item
    ));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
  }, []);

  return {
    data,
    addEntry,
    editEntry,
    deleteEntry,
  };
};
