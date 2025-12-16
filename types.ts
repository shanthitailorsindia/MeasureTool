
import type React from 'react';

export interface Measurement {
  id: string;
  name: string;
  description: string;
  imageComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  category: string;
  audioTip: string;
  audioUrl?: string; // New field for hardcoded URLs
}

export interface MeasurementWithValue extends Measurement {
  value: string;
}

export interface CustomerDetails {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
  phone: string;
  email: string;
}

export interface ColorChoice {
  id: number;
  dress: string;
  saree: string;
  border: string;
}

export interface CostumeSpecs {
  colorChoices: ColorChoice[];
  pattern: string;
  blouseType: 'kids' | 'adult' | '';
  specialInstructions: string;
}
