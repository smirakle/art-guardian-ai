import React from 'react';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * App wrapper with ErrorBoundary for production-grade error handling
 */
const AppWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
};

export default AppWithErrorBoundary;
