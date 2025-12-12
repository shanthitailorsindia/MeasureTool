import React from 'react';
import { RulerIcon, DocumentTextIcon } from './IconComponents';

interface ModeSelectionStepProps {
  onSelectMode: (mode: 'measurementTool' | 'orderForm') => void;
}

const ModeSelectionStep: React.FC<ModeSelectionStepProps> = ({ onSelectMode }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome!</h2>
      <p className="text-gray-600 mb-8">Please choose an option to get started.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Option 1: Measurement Tool */}
        <button
          onClick={() => onSelectMode('measurementTool')}
          className="p-6 border-2 border-gray-200 rounded-lg text-left hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="flex items-center gap-4 mb-3">
            <RulerIcon className="w-8 h-8 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-800">Measurement Tool</h3>
          </div>
          <p className="text-gray-600">
            A guided tool to help you take accurate body measurements and send them to the tailor.
          </p>
        </button>

        {/* Option 2: Order Form */}
        <button
          onClick={() => onSelectMode('orderForm')}
          className="p-6 border-2 border-gray-200 rounded-lg text-left hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="flex items-center gap-4 mb-3">
            <DocumentTextIcon className="w-8 h-8 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-800">Full Order Form</h3>
          </div>
          <p className="text-gray-600">
            Take measurements and enter all costume details like colors, pattern, name, and address.
          </p>
        </button>
      </div>
    </div>
  );
};

export default ModeSelectionStep;
