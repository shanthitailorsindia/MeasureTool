import React from 'react';
import type { MeasurementWithValue } from '../types';
import { EditIcon, RulerIcon, ArrowRightIcon } from './IconComponents';

interface MeasurementReviewStepProps {
  measurements: MeasurementWithValue[];
  onEdit: (index: number) => void;
  onConfirmAndAnalyze: () => void;
  onPrev: () => void;
}

const MeasurementReviewStep: React.FC<MeasurementReviewStepProps> = ({ measurements, onEdit, onConfirmAndAnalyze, onPrev }) => {
  const groupedMeasurements = measurements.reduce((acc, m) => {
    if (!acc[m.category]) {
      acc[m.category] = [];
    }
    acc[m.category].push(m);
    return acc;
  }, {} as Record<string, MeasurementWithValue[]>);

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg animate-fade-in">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <RulerIcon className="w-8 h-8 text-indigo-700" />
            <h2 className="text-2xl font-bold text-gray-800">Review Measurements</h2>
        </div>
      
      <p className="text-gray-600 mb-6">
        Please confirm all measurements are correct before proceeding.
      </p>

      <div className="space-y-6 mb-8">
        {Object.keys(groupedMeasurements).map((category) => {
          const items = groupedMeasurements[category];
          return (
            <div key={category} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-indigo-700 mb-3 border-b border-gray-200 pb-2">{category}</h3>
              <ul className="space-y-3">
                {items.map((m) => {
                  const originalIndex = measurements.findIndex(orig => orig.id === m.id);
                  return (
                    <li
                      key={m.id}
                      className="flex items-center justify-between bg-white p-3 rounded shadow-sm"
                    >
                      <div>
                        <span className="font-semibold text-gray-700">{m.name}:</span>
                        <span className="ml-2 text-lg font-mono text-indigo-600">{m.value || 'N/A'} in</span>
                      </div>
                      <button
                        onClick={() => onEdit(originalIndex)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                        aria-label={`Edit ${m.name}`}
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onPrev}
          className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
            Back
        </button>
        <button
          onClick={onConfirmAndAnalyze}
          className="flex items-center gap-2 px-6 py-3 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Confirm & Analyze Measurements
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MeasurementReviewStep;
