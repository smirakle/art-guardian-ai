import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type InterfaceMode = 'beginner' | 'advanced';

interface UserPreferences {
  interfaceMode: InterfaceMode;
  setInterfaceMode: (mode: InterfaceMode) => void;
  isAdmin: boolean;
  isLoadingRole: boolean;
}

const UserPreferencesContext = createContext<UserPreferences | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [interfaceMode, setInterfaceModeState] = useState<InterfaceMode>('beginner');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoadingRole(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) throw error;
        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setIsLoadingRole(false);
      }
    };

    checkAdminRole();
  }, [user]);

  // Load preference from localStorage
  useEffect(() => {
    if (!user) {
      setInterfaceModeState('beginner');
      return;
    }

    const savedMode = localStorage.getItem('tsmo-interface-mode') as InterfaceMode;
    
    // If user is not admin, force beginner mode
    if (!isAdmin && savedMode === 'advanced') {
      setInterfaceModeState('beginner');
      localStorage.setItem('tsmo-interface-mode', 'beginner');
      return;
    }

    if (savedMode === 'beginner' || savedMode === 'advanced') {
      setInterfaceModeState(savedMode);
    }
  }, [user, isAdmin]);

  const setInterfaceMode = (mode: InterfaceMode) => {
    // Only allow admin to switch to advanced mode
    if (mode === 'advanced' && !isAdmin) {
      toast.error('Advanced mode is only available to administrators');
      return;
    }

    setInterfaceModeState(mode);
    localStorage.setItem('tsmo-interface-mode', mode);
  };

  return (
    <UserPreferencesContext.Provider value={{ interfaceMode, setInterfaceMode, isAdmin, isLoadingRole }}>
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
