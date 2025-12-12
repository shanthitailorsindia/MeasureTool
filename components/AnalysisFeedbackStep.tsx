import React from 'react';
import { EditIcon, ArrowRightIcon } from './IconComponents';

interface AnalysisFeedbackStepProps {
  isAnalyzing: boolean;
  analysisResult: string;
  onEdit: () => void;
  onProceed: () => void;
  appMode: 'measurementTool' | 'orderForm';
}

const AnalysisFeedbackStep: React.FC<AnalysisFeedbackStepProps> = ({ isAnalyzing, analysisResult, onEdit, onProceed, appMode }) => {
  const proceedButtonText = appMode === 'orderForm' ? 'Proceed to Final Details' : 'Proceed to Summary';
  
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg text-center animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Tailor's Feedback</h2>

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center min-h-[150px]">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-gray-200 rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Analyzing measurements...</p>
        </div>
      )}

      {!isAnalyzing && analysisResult && (
        <div>
          <div className="mt-4 mb-8 p-4 bg-indigo-50 rounded-lg text-left">
            <p className="text-indigo-800 whitespace-pre-wrap">{analysisResult}</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <EditIcon className="w-5 h-5" />
              Edit Measurements
            </button>
            <button
              onClick={onProceed}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {proceedButtonText}
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisFeedbackStep;