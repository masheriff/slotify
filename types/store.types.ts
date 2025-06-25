export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface LoadingStore {
  loadingStates: Record<string, LoadingState>;
  setLoading: (key: string, loading: boolean, message?: string) => void;
  clearLoading: (key: string) => void;
  isLoading: (key: string) => boolean;
  getMessage: (key: string) => string | undefined;
  clearAllLoading: () => void;
}




