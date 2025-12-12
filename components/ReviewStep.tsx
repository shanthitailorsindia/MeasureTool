import React from 'react';
import type { MeasurementWithValue, CustomerDetails, CostumeSpecs } from '../types';
import { EditIcon, UserIcon, DocumentTextIcon, RulerIcon } from './IconComponents';

interface ReviewStepProps {
  dancerName: string;
  measurements: MeasurementWithValue[];
  customerDetails: CustomerDetails;
  costumeSpecs: CostumeSpecs;
  onEdit: (target: { type: 'welcome' | 'measurement' | 'details', index?: number }) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const ReviewSection: React.FC<React.PropsWithChildren<{ title: string; onEdit: () => void; icon: React.ReactNode }>> = ({ title, onEdit, icon, children }) => (
    <div>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
            <div className="flex items-center gap-3">
                {icon}
                <h3 className="text-xl font-semibold text-indigo-700">{title}</h3>
            </div>
            <button
                onClick={onEdit}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                aria-label={`Edit ${title}`}
            >
                <EditIcon className="w-5 h-5" />
            </button>
        </div>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const InfoRow: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="font-semibold text-gray-700">{label}:</span>
        <span className="text-right text-gray-800">{value || 'N/A'}</span>
    </div>
);


const ReviewStep: React.FC<ReviewStepProps> = ({ dancerName, measurements, customerDetails, costumeSpecs, onEdit, onSubmit, isSubmitting }) => {
  const groupedMeasurements = measurements.reduce((acc, m) => {
    if (!acc[m.category]) {
      acc[m.category] = [];
    }
    acc[m.category].push(m);
    return acc;
  }, {} as Record<string, MeasurementWithValue[]>);

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Review Your Full Order</h2>
      <p className="text-gray-600 mb-6">
        Please double-check all details for accuracy before submitting.
      </p>
      
      <div className="space-y-8">
        <ReviewSection title="Customer & Dancer Details" onEdit={() => onEdit({type: 'details'})} icon={<UserIcon className="w-6 h-6 text-indigo-700"/>}>
            <InfoRow label="Dancer" value={dancerName} />
            <InfoRow label="Customer (Parent/Guardian)" value={customerDetails.name} />
            <InfoRow label="Email" value={customerDetails.email} />
            <InfoRow label="Phone" value={customerDetails.phone} />
            <InfoRow label="Address" value={`${customerDetails.street}, ${customerDetails.city}, ${customerDetails.state} ${customerDetails.postalCode}, ${customerDetails.country}`} />
        </ReviewSection>

        <ReviewSection title="Costume Specifications" onEdit={() => onEdit({type: 'details'})} icon={<DocumentTextIcon className="w-6 h-6 text-indigo-700"/>}>
            {costumeSpecs.colorChoices.map((c, i) => (
                (c.dress || c.saree || c.border) && <InfoRow key={c.id} label={`Color Choice ${i+1}`} value={`${c.dress}, ${c.saree}, ${c.border}`} />
            ))}
            <InfoRow label="Pattern" value={costumeSpecs.pattern} />
            <InfoRow label="Blouse Type" value={costumeSpecs.blouseType} />
            <InfoRow label="Special Instructions" value={costumeSpecs.specialInstructions} />
        </ReviewSection>
        
        <ReviewSection title="Body Measurements" onEdit={() => onEdit({type: 'measurement', index: 0})} icon={<RulerIcon className="w-6 h-6 text-indigo-700"/>}>
            {Object.keys(groupedMeasurements).map((category) => {
            const items = groupedMeasurements[category];
            return (
                <div key={category} className="pl-4 border-l-2 border-indigo-100">
                <h4 className="text-lg font-semibold text-gray-600 mb-2">{category}</h4>
                <ul className="space-y-3">
                    {items.map((m) => {
                    const originalIndex = measurements.findIndex(orig => orig.id === m.id);
                    return (
                        <li
                        key={m.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                        <div>
                            <span className="font-semibold text-gray-700">{m.name}:</span>
                            <span className="ml-2 text-lg font-mono text-indigo-600">{m.value || 'N/A'} in</span>
                        </div>
                        <button
                            onClick={() => onEdit({type: 'measurement', index: originalIndex})}
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
        </ReviewSection>
      </div>

      <div className="mt-8">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300 disabled:bg-green-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Complete Order'}
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;
