
import React, { useRef, useEffect } from 'react';
import { ArrowRightIcon } from './IconComponents';

interface WelcomeStepProps {
  name: string;
  onNameChange: (name: string) => void;
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ name, onNameChange, onNext }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Let's Get Started</h2>
      <p className="text-gray-600 mb-8">First, please enter the dancer's name to begin.</p>
      
      <div className="max-w-md mx-auto">
         <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Dancer's Name"
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition mb-6"
        />
        <button
          onClick={onNext}
          disabled={!name}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 font-bold text-white bg-indigo-600 rounded-lg disabled:bg-indigo-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Start Measurements
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep;
