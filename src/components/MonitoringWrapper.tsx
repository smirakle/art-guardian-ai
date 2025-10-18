import { useEffect } from 'react';
import { usePerformanceBudget } from '@/hooks/usePerformanceBudget';
import { useAlertSystem } from '@/hooks/useAlertSystem';

interface MonitoringWrapperProps {
  children: React.ReactNode;
  componentName: string;
  budgets?: {
    pageLoad?: number;
    apiCall?: number;
    databaseQuery?: number;
    componentRender?: number;
  };
}

export const MonitoringWrapper = ({ 
  children, 
  componentName, 
  budgets 
}: MonitoringWrapperProps) => {
  const { budgets: activeBudgets } = usePerformanceBudget(budgets);
  const { sendSystemAlert } = useAlertSystem();

  useEffect(() => {
    // Track component mount
    console.log(`[Monitoring] ${componentName} mounted with budgets:`, activeBudgets);
    
    // Optional: Send alert on mount for critical components
    if (componentName.includes('Admin') || componentName.includes('Critical')) {
      sendSystemAlert(`${componentName} loaded`, 'info');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentName]);

  return <>{children}</>;
};
