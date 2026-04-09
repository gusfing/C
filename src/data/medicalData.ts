
export interface Symptom {
  id: string;
  name: string;
  category: 'Cardiac' | 'Skin' | 'Ortho' | 'General' | 'Neurology' | 'ENT' | 'Pediatrics';
  specialist: string;
}

export interface Specialist {
  id: string;
  name: string;
  description: string;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  costMultiplier: number;
}

export const SYMPTOMS: Symptom[] = [
  { id: 'chest-pain', name: 'Chest Pain', category: 'Cardiac', specialist: 'Cardiologist' },
  { id: 'palpitations', name: 'Palpitations', category: 'Cardiac', specialist: 'Cardiologist' },
  { id: 'rash', name: 'Skin Rash', category: 'Skin', specialist: 'Dermatologist' },
  { id: 'itching', name: 'Itching', category: 'Skin', specialist: 'Dermatologist' },
  { id: 'joint-pain', name: 'Joint Pain', category: 'Ortho', specialist: 'Orthopedic Surgeon' },
  { id: 'back-pain', name: 'Back Pain', category: 'Ortho', specialist: 'Orthopedic Surgeon' },
  { id: 'fever', name: 'Fever', category: 'General', specialist: 'General Physician' },
  { id: 'headache', name: 'Headache', category: 'General', specialist: 'General Physician' },
  { id: 'dizziness', name: 'Dizziness', category: 'Neurology', specialist: 'Neurologist' },
  { id: 'numbness', name: 'Numbness', category: 'Neurology', specialist: 'Neurologist' },
  { id: 'sore-throat', name: 'Sore Throat', category: 'ENT', specialist: 'ENT Specialist' },
  { id: 'ear-ache', name: 'Ear Ache', category: 'ENT', specialist: 'ENT Specialist' },
  { id: 'cough-child', name: 'Cough (Child)', category: 'Pediatrics', specialist: 'Pediatrician' },
  { id: 'stomach-pain', name: 'Stomach Pain', category: 'General', specialist: 'General Physician' },
  { id: 'vision-blur', name: 'Blurred Vision', category: 'General', specialist: 'Ophthalmologist' },
  { id: 'hearing-loss', name: 'Hearing Loss', category: 'ENT', specialist: 'ENT Specialist' },
  { id: 'toothache', name: 'Toothache', category: 'General', specialist: 'Dentist' },
  { id: 'anxiety', name: 'Anxiety', category: 'General', specialist: 'Psychiatrist' },
];

export const SPECIALISTS: Specialist[] = [
  { id: 'cardiologist', name: 'Cardiologist', description: 'Specializes in heart and blood vessel disorders.' },
  { id: 'dermatologist', name: 'Dermatologist', description: 'Specializes in skin, hair, and nail conditions.' },
  { id: 'orthopedic', name: 'Orthopedic Surgeon', description: 'Specializes in musculoskeletal system issues.' },
  { id: 'physician', name: 'General Physician', description: 'Provides primary care and treats common illnesses.' },
  { id: 'neurologist', name: 'Neurologist', description: 'Specializes in nervous system disorders.' },
  { id: 'ent', name: 'ENT Specialist', description: 'Specializes in ear, nose, and throat conditions.' },
  { id: 'pediatrician', name: 'Pediatrician', description: 'Specializes in medical care for children.' },
  { id: 'ophthalmologist', name: 'Ophthalmologist', description: 'Specializes in eye and vision care.' },
  { id: 'dentist', name: 'Dentist', description: 'Specializes in oral health.' },
  { id: 'psychiatrist', name: 'Psychiatrist', description: 'Specializes in mental health.' },
];

export const FACILITIES: Facility[] = [
  { id: 'clinic', name: 'Clinic', description: 'Best for mild symptoms and primary consultation.', costMultiplier: 1 },
  { id: 'secondary', name: 'Secondary Hospital', description: 'Equipped for moderate symptoms and basic diagnostic tests.', costMultiplier: 2.5 },
  { id: 'tertiary', name: 'Tertiary Hospital', description: 'Specialized care for severe conditions and complex surgeries.', costMultiplier: 5 },
];

export const BASE_COSTS: Record<string, { min: number; max: number }> = {
  'Cardiologist': { min: 800, max: 1500 },
  'Dermatologist': { min: 500, max: 1000 },
  'Orthopedic Surgeon': { min: 600, max: 1200 },
  'General Physician': { min: 300, max: 600 },
  'Neurologist': { min: 900, max: 1800 },
  'ENT Specialist': { min: 500, max: 900 },
  'Pediatrician': { min: 400, max: 800 },
  'Ophthalmologist': { min: 600, max: 1100 },
  'Dentist': { min: 400, max: 1500 },
  'Psychiatrist': { min: 1000, max: 2500 },
};
