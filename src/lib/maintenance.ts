import { useState, useEffect } from 'react';

// Maintenance mode utilities
export const MAINTENANCE_MODE_KEY = 'tsmo_maintenance_mode';

export const getMaintenanceMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(MAINTENANCE_MODE_KEY) === 'true';
};

export const setMaintenanceMode = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MAINTENANCE_MODE_KEY, enabled.toString());
  // Dispatch a custom event to notify other components
  window.dispatchEvent(new CustomEvent('maintenanceModeChanged', { 
    detail: { enabled } 
  }));
};

export const useMaintenanceMode = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(getMaintenanceMode());

  useEffect(() => {
    const handleMaintenanceModeChange = (event: CustomEvent) => {
      setIsMaintenanceMode(event.detail.enabled);
    };

    window.addEventListener('maintenanceModeChanged', handleMaintenanceModeChange as EventListener);
    
    return () => {
      window.removeEventListener('maintenanceModeChanged', handleMaintenanceModeChange as EventListener);
    };
  }, []);

  const toggleMaintenanceMode = (enabled: boolean) => {
    setMaintenanceMode(enabled);
    setIsMaintenanceMode(enabled);
  };

  return { isMaintenanceMode, toggleMaintenanceMode };
};