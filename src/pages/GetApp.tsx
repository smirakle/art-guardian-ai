import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminGetApp from '@/components/mobile/AdminGetApp';
import CustomerGetApp from '@/components/mobile/CustomerGetApp';
import { BugReportButton } from '@/components/BugReportButton';

const GetApp = () => {
  const { user, role } = useAuth();

  // Render admin version for admins, customer version for everyone else
  if (role === 'admin') {
    return (
      <>
        <AdminGetApp />
        <BugReportButton />
      </>
    );
  }

  return (
    <>
      <CustomerGetApp />
      <BugReportButton />
    </>
  );
};

export default GetApp;