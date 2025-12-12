
import React from 'react';
import type { CustomerDetails, CostumeSpecs, ColorChoice } from '../types';
import { ArrowLeftIcon, ArrowRightIcon } from './IconComponents';

interface DetailsStepProps {
  customerDetails: CustomerDetails;
  costumeSpecs: CostumeSpecs;
  onCustomerDetailsChange: (field: keyof CustomerDetails, value: string) => void;
  onCostumeSpecsChange: (field: keyof Omit<CostumeSpecs, 'colorChoices' | 'blouseType'>, value: string) => void;
  onBlouseTypeChange: (value: 'kids' | 'adult' | '') => void;
  onColorChoiceChange: (index: number, field: keyof Omit<ColorChoice, 'id'>, value: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

const DetailsStep: React.FC<DetailsStepProps> = ({
  customerDetails,
  costumeSpecs,
  onCustomerDetailsChange,
  onCostumeSpecsChange,
  onBlouseTypeChange,
  onColorChoiceChange,
  onPrev,
  onNext,
}) => {

  const isFormValid = () => {
    // Basic validation: check if required fields are filled.
    return customerDetails.name && customerDetails.email && customerDetails.phone && customerDetails.street && customerDetails.city;
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">Final Details</h2>
      
      {/* Costume Specifications */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-indigo-700 mb-4">Costume Specifications</h3>
        <div className="space-y-4">
          {costumeSpecs.colorChoices.map((choice, index) => (
            <div key={choice.id} className="p-4 border rounded-lg bg-gray-50">
              <label className="block font-semibold text-gray-600 mb-2">Choice {index + 1}</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Dress Colour" value={choice.dress} onChange={e => onColorChoiceChange(index, 'dress', e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm" />
                <input type="text" placeholder="Saree Colour" value={choice.saree} onChange={e => onColorChoiceChange(index, 'saree', e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm" />
                <input type="text" placeholder="Border Colour" value={choice.border} onChange={e => onColorChoiceChange(index, 'border', e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm" />
              </div>
            </div>
          ))}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Pattern" value={costumeSpecs.pattern} onChange={e => onCostumeSpecsChange('pattern', e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm" />
            <select value={costumeSpecs.blouseType} onChange={e => onBlouseTypeChange(e.target.value as 'kids' | 'adult' | '')} className="w-full p-2 border-gray-300 rounded-md shadow-sm bg-white">
              <option value="">Select Blouse Type</option>
              <option value="kids">Kids Blouse</option>
              <option value="adult">Adult Blouse</option>
            </select>
          </div>
          <textarea placeholder="Special Instructions (if any)" value={costumeSpecs.specialInstructions} onChange={e => onCostumeSpecsChange('specialInstructions', e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm" rows={3}></textarea>
        </div>
      </section>

      {/* Customer Details */}
      <section>
        <h3 className="text-xl font-semibold text-indigo-700 mb-4">Customer Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Customer Name (Parent/Guardian)*" value={customerDetails.name} onChange={e => onCustomerDetailsChange('name', e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm" />
          <input type="tel" placeholder="Phone Number*" value={customerDetails.phone} onChange={e => onCustomerDetailsChange('phone', e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm" />
          <input type="email" placeholder="Email Address*" value={customerDetails.email} onChange={e => onCustomerDetailsChange('email', e.target.value)} className="md:col-span-2 w-full p-2 border-gray-300 rounded-md shadow-sm" />
          <input type="text" placeholder="Street Address*" value={customerDetails.street} onChange={e => onCustomerDetailsChange('street', e.target.value)} className="md:col-span-2 w-full p-2 border-gray-300 rounded-md shadow-sm" />
          <input type="text" placeholder="City*" value={customerDetails.city} onChange={e => onCustomerDetailsChange('city', e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm" />
          <input type="text" placeholder="Postal Code" value={customerDetails.postalCode} onChange={e => onCustomerDetailsChange('postalCode', e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm" />
          <input type="text" placeholder="State / Province" value={customerDetails.state} onChange={e => onCustomerDetailsChange('state', e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm" />
          <input type="text" placeholder="Country" value={customerDetails.country} onChange={e => onCustomerDetailsChange('country', e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm" />
        </div>
      </section>

      <div className="mt-8 flex justify-between items-center">
        <button onClick={onPrev} className="flex items-center gap-2 px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
          <ArrowLeftIcon className="w-5 h-5" /> Previous
        </button>
        <button onClick={onNext} disabled={!isFormValid()} className="flex items-center gap-2 px-6 py-3 font-bold text-white bg-indigo-600 rounded-lg disabled:bg-indigo-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors">
          Review Order <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DetailsStep;
