import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminGetApp from '@/components/mobile/AdminGetApp';
import CustomerGetApp from '@/components/mobile/CustomerGetApp';

const GetApp = () => {
  const { user, role } = useAuth();

  // Render admin version for admins, customer version for everyone else
  if (role === 'admin') {
    return <AdminGetApp />;
  }

  return <CustomerGetApp />;
};

export default GetApp;