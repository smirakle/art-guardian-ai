import { useEffect } from 'react';
import { useAlertSystem } from './useAlertSystem';

interface PerformanceBudget {
  pageLoad: number; // max ms
  apiCall: number; // max ms
  databaseQuery: number; // max ms
  componentRender: number; // max ms
}

const DEFAULT_BUDGETS: PerformanceBudget = {
  pageLoad: 5000, // Increased from 2000ms to 5000ms for more realistic threshold
  apiCall: 2000, // Increased from 500ms to 2000ms
  databaseQuery: 1000, // Increased from 200ms to 1000ms
  componentRender: 16, // 60fps
};

export const usePerformanceBudget = (budgets: Partial<PerformanceBudget> = {}) => {
  const { sendPerformanceAlert } = useAlertSystem();
  const activeBudgets = { ...DEFAULT_BUDGETS, ...budgets };

  useEffect(() => {
    // Monitor page load performance - only check once after page is fully loaded
    const checkPageLoad = () => {
      if (window.performance && window.performance.timing) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

        if (pageLoadTime > 0 && pageLoadTime > activeBudgets.pageLoad) {
          sendPerformanceAlert('Page Load Time', pageLoadTime, activeBudgets.pageLoad);
        }
      }
    };

    // Wait for page to fully load before checking
    if (document.readyState === 'complete') {
      checkPageLoad();
    } else {
      window.addEventListener('load', checkPageLoad);
      return () => window.removeEventListener('load', checkPageLoad);
    }

  }, [activeBudgets.pageLoad, sendPerformanceAlert]);

  useEffect(() => {
    // Monitor long tasks (tasks that block main thread for > 100ms)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Only alert on very long tasks (> 200ms)
            if (entry.duration > 200) {
              console.warn('Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime,
              });
              
              sendPerformanceAlert('Long Task', entry.duration, 100);
            }
          }
        });

        observer.observe({ entryTypes: ['longtask'] });

        return () => observer.disconnect();
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }
  }, [sendPerformanceAlert]);

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
