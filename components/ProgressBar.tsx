
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  // Ensure current doesn't exceed total for percentage calculation
  const boundedCurrent = Math.min(current, total);
  const percentage = total > 0 ? ((boundedCurrent + 1) / total) * 100 : 0;
  
  const currentStepDisplay = current >= total ? total : current + 1;
  const stepText = current >= total ? 'Final Details' : `Step ${currentStepDisplay} of ${total}`;

  return (
    <div>
        <div className="flex justify-between mb-1 text-sm font-medium text-gray-600">
            <span>{stepText}</span>
            <span>{Math.round(percentage)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
            ></div>
        </div>
    </div>
  );
};

export default ProgressBar;
