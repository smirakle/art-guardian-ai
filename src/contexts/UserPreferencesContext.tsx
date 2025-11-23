import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

type InterfaceMode = 'beginner' | 'advanced';

interface UserPreferences {
  interfaceMode: InterfaceMode;
  setInterfaceMode: (mode: InterfaceMode) => void;
}

const UserPreferencesContext = createContext<UserPreferences | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [interfaceMode, setInterfaceModeState] = useState<InterfaceMode>('beginner');

  // Load preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('tsmo-interface-mode') as InterfaceMode;
    if (savedMode === 'beginner' || savedMode === 'advanced') {
      setInterfaceModeState(savedMode);
    }
  }, [user]);

  const setInterfaceMode = (mode: InterfaceMode) => {
    setInterfaceModeState(mode);
    localStorage.setItem('tsmo-interface-mode', mode);
  };

  return (
    <UserPreferencesContext.Provider value={{ interfaceMode, setInterfaceMode }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
}
