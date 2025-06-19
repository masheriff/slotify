// stores/loading-store.ts
import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  message?: string;
}

interface LoadingStore {
  loadingStates: Record<string, LoadingState>;
  setLoading: (key: string, loading: boolean, message?: string) => void;
  clearLoading: (key: string) => void;
  isLoading: (key: string) => boolean;
  getMessage: (key: string) => string | undefined;
  clearAllLoading: () => void;
}

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