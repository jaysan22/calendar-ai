
import React from 'react';
import { TimeFlowProvider } from '../context/TimeFlowContext';
import Dashboard from '../components/Dashboard';

const Index = () => {
  return (
    <TimeFlowProvider>
      <div className="min-h-screen bg-gray-50">
        <Dashboard />
      </div>
    </TimeFlowProvider>
  );
};

export default Index;
