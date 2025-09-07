import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePermission } from '@/hooks/usePermission';

interface ColumnConfig {
  [columnId: string]: {
    visible: boolean;
    width?: number;
    order?: number;
  };
}

interface UseColumnConfigOptions {
  page: string;
  defaultConfig?: ColumnConfig;
}

export const useColumnConfig = ({ page, defaultConfig = {} }: UseColumnConfigOptions) => {
  const { user } = useAuth();
  const canConfigureColumns = usePermission({ action: 'configure-columns' });
  const [columnConfig, setColumnConfig] = useState<ColumnConfig>(defaultConfig);

  const storageKey = `column-config-${user?.id}-${page}`;

  // Load configuration from localStorage on mount
  useEffect(() => {
    if (!user?.id || !canConfigureColumns) return;

    try {
      const savedConfig = localStorage.getItem(storageKey);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setColumnConfig({ ...defaultConfig, ...parsed });
      }
    } catch (error) {
      console.error('Error loading column config:', error);
    }
  }, [user?.id, storageKey, defaultConfig, canConfigureColumns]);

  // Save configuration to localStorage
  const saveColumnConfig = useCallback((newConfig: ColumnConfig) => {
    if (!user?.id || !canConfigureColumns) return;

    try {
      setColumnConfig(newConfig);
      localStorage.setItem(storageKey, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Error saving column config:', error);
    }
  }, [user?.id, storageKey, canConfigureColumns]);

  // Update specific column
  const updateColumn = useCallback((columnId: string, updates: Partial<ColumnConfig[string]>) => {
    const newConfig = {
      ...columnConfig,
      [columnId]: {
        ...columnConfig[columnId],
        ...updates
      }
    };
    saveColumnConfig(newConfig);
  }, [columnConfig, saveColumnConfig]);

  // Reset to default configuration
  const resetColumnConfig = useCallback(() => {
    saveColumnConfig(defaultConfig);
  }, [defaultConfig, saveColumnConfig]);

  return {
    columnConfig,
    updateColumn,
    resetColumnConfig,
    canConfigureColumns,
    hasChanges: JSON.stringify(columnConfig) !== JSON.stringify(defaultConfig)
  };
};