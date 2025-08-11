import React from 'react';
import { TaxCalculation } from '@/components/billing/TaxCalculation';

const TaxManagement = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <TaxCalculation />
      </div>
    </div>
  );
};

export default TaxManagement;