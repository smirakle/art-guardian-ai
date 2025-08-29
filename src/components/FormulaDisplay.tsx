import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface FormulaDisplayProps {
  title?: string;
  formula: string;
  description?: string;
  variables?: Array<{
    symbol: string;
    description: string;
  }>;
}

const FormulaDisplay = ({ title, formula, description, variables }: FormulaDisplayProps) => {
  return (
    <Card className="my-4 bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        {title && (
          <h4 className="font-semibold text-blue-900 mb-2">{title}</h4>
        )}
        
        <div className="bg-white rounded-lg p-3 border border-blue-100 overflow-x-auto">
          <div className="text-sm font-mono text-blue-800 break-all whitespace-pre-wrap">
            {formula}
          </div>
        </div>
        
        {description && (
          <p className="text-sm text-blue-700 mt-2">{description}</p>
        )}
        
        {variables && variables.length > 0 && (
          <div className="mt-3">
            <h5 className="text-sm font-medium text-blue-900 mb-1">Where:</h5>
            <ul className="text-xs text-blue-700 space-y-1">
              {variables.map((variable, index) => (
                <li key={index}>
                  <code className="font-mono bg-blue-100 px-1 rounded">{variable.symbol}</code> = {variable.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FormulaDisplay;