import React from 'react';
import { NewCustomerFlyer } from '@/components/marketing/NewCustomerFlyer';

export default function MarketingFlyer() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketing Materials</h1>
        <p className="text-muted-foreground">5x7 inch flyer for new customer acquisition</p>
      </div>
      <NewCustomerFlyer />
    </div>
  );
}
