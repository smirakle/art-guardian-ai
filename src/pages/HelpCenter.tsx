import React from 'react';
import UserHelpCenter from '@/components/UserHelpCenter';
import { BugReportButton } from '@/components/BugReportButton';

const HelpCenter = () => {
  return (
    <>
      <UserHelpCenter />
      <BugReportButton />
    </>
  );
};

export default HelpCenter;