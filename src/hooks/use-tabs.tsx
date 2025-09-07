import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useTabs(defaultTab: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    // Try to get from URL params first, then localStorage, then default
    const urlTab = searchParams.get('tab');
    if (urlTab) return urlTab;

    // const savedTab = localStorage.getItem('import-result-active-tab');
    return defaultTab;
  });

  // Handle tab change with persistence
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);

    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams);
    if (tabValue === 'inventory-updates') {
      // Remove tab param for default tab
      newSearchParams.delete('tab');
    } else {
      newSearchParams.set('tab', tabValue);
    }
    setSearchParams(newSearchParams);

    // Save to localStorage
    localStorage.setItem('import-result-active-tab', tabValue);
  };

  // Update active tab when URL changes
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
      localStorage.setItem('import-result-active-tab', urlTab);
    }
  }, [searchParams, activeTab]);

  return {
    activeTab,
    handleTabChange,
  };
}
