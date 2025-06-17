
import React from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface InstallStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}

interface InstallProgressProps {
  steps: InstallStep[];
}

const getStepIcon = (status: InstallStep['status']) => {
  switch (status) {
    case 'running':
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
  }
};

const InstallProgress = ({ steps }: InstallProgressProps) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Progresso da Instalação</h3>
      {steps.map((step) => (
        <div key={step.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          {getStepIcon(step.status)}
          <div className="flex-1">
            <div className="font-medium">{step.name}</div>
            {step.message && (
              <div className={`text-sm ${
                step.status === 'error' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {step.message}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InstallProgress;
