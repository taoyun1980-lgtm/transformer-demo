import { create } from 'zustand';

interface TransformerState {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export const useTransformerStore = create<TransformerState>((set) => ({
  currentStep: 1,
  setCurrentStep: (step) => set({ currentStep: step }),
}));
