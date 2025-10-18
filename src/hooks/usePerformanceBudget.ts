import { useEffect } from 'react';
import { useAlertSystem } from './useAlertSystem';

interface PerformanceBudget {
  pageLoad: number; // max ms
  apiCall: number; // max ms
  databaseQuery: number; // max ms
  componentRender: number; // max ms
}

const DEFAULT_BUDGETS: PerformanceBudget = {
  pageLoad: 2000,
  apiCall: 500,
  databaseQuery: 200,
  componentRender: 16, // 60fps
};

export const usePerformanceBudget = (budgets: Partial<PerformanceBudget> = {}) => {
  const { sendPerformanceAlert } = useAlertSystem();
  const activeBudgets = { ...DEFAULT_BUDGETS, ...budgets };

  useEffect(() => {
    // Monitor page load performance
    if (window.performance && window.performance.timing) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

      if (pageLoadTime > activeBudgets.pageLoad) {
        sendPerformanceAlert('Page Load Time', pageLoadTime, activeBudgets.pageLoad);
      }
    }

    // Monitor long tasks (tasks that block main thread for > 50ms)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime,
              });
              
              if (entry.duration > activeBudgets.componentRender * 3) {
                sendPerformanceAlert('Long Task', entry.duration, 50);
              }
            }
          }
        });

        observer.observe({ entryTypes: ['longtask'] });

        return () => observer.disconnect();
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }
  }, [activeBudgets, sendPerformanceAlert]);

  const measureApiCall = async <T,>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;

      if (duration > activeBudgets.apiCall) {
        await sendPerformanceAlert(`API Call: ${endpoint}`, duration, activeBudgets.apiCall);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`API call to ${endpoint} failed after ${duration}ms:`, error);
      throw error;
    }
  };

  const measureDatabaseQuery = async <T,>(
    query: () => Promise<T>,
    queryName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await query();
      const duration = performance.now() - startTime;

      if (duration > activeBudgets.databaseQuery) {
        await sendPerformanceAlert(`DB Query: ${queryName}`, duration, activeBudgets.databaseQuery);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`Database query ${queryName} failed after ${duration}ms:`, error);
      throw error;
    }
  };

  return {
    budgets: activeBudgets,
    measureApiCall,
    measureDatabaseQuery,
  };
};
