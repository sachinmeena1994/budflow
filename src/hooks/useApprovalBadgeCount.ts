
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ApprovalBadgeCount {
  count: number;
  isLoading: boolean;
  refreshCount: () => Promise<void>;
}

export function useApprovalBadgeCount(): ApprovalBadgeCount {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = async () => {
    try {
     
      const { count: pendingCount, error } = await supabase
        .from('work_entries')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'Submitted');

      if (error) {
 
        setCount(0);
      } else {
     
        setCount(pendingCount || 0);
      }
    } catch (error) {

      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCount = async () => {
    await fetchCount();
  };

  useEffect(() => {
    // Initial fetch
    fetchCount();

    const subscription = supabase
      .channel('approval-badge-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_entries',
          filter: 'approval_status=eq.Submitted'
        },
        (payload) => {

          fetchCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    count,
    isLoading,
    refreshCount
  };
}
