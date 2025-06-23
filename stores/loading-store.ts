// stores/loading-store.ts
import { LoadingStore } from '@/types';
import { create } from 'zustand';

export const useLoadingStore = create<LoadingStore>((set, get) => ({
  loadingStates: {},
  
  setLoading: (key: string, loading: boolean, message?: string) =>
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: {
          isLoading: loading,
          message: loading ? message : undefined,
        },
      },
    })),
  
  clearLoading: (key: string) =>
    set((state) => {
      const newStates = { ...state.loadingStates };
      delete newStates[key];
      return { loadingStates: newStates };
    }),
  
  isLoading: (key: string) => {
    const state = get().loadingStates[key];
    return state?.isLoading ?? false;
  },
  
  getMessage: (key: string) => {
    const state = get().loadingStates[key];
    return state?.message;
  },
  
  clearAllLoading: () =>
    set({ loadingStates: {} }),
}));