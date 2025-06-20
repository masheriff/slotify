// lib/with-loading.ts
import { useLoadingStore } from '@/stores/loading-store';

// For client-side usage (in components)
export function withLoading<T extends any[], R>(
  action: (...args: T) => Promise<R>,
  loadingKey: string,
  loadingMessage?: string
) {
  return async (...args: T): Promise<R> => {
    const { setLoading, clearLoading } = useLoadingStore.getState();
    
    try {
      setLoading(loadingKey, true, loadingMessage);
      const result = await action(...args);
      return result;
    } catch (error) {
      throw error;
    } finally {
      clearLoading(loadingKey);
    }
  };
}

// For server actions (functional approach)
export function createLoadingAction<T extends any[], R>(
  action: (...args: T) => Promise<R>,
  options?: {
    loadingKey?: string;
    loadingMessage?: string;
  }
) {
  return async function wrappedAction(...args: T): Promise<R> {
    // This will be handled by the client-side form submission
    // The actual loading state management happens in the form component
    return await action(...args);
  };
}

// Hook for manual loading control
export function useLoadingControl() {
  const setLoading = useLoadingStore((state) => state.setLoading);
  const clearLoading = useLoadingStore((state) => state.clearLoading);
  const isLoading = useLoadingStore((state) => state.isLoading);
  const getMessage = useLoadingStore((state) => state.getMessage);
  
  const startLoading = (key: string, message?: string) => {
    setLoading(key, true, message);
  };
  
  const stopLoading = (key: string) => {
    clearLoading(key);
  };
  
  const withLoadingState = async <T>(
    key: string,
    action: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    try {
      startLoading(key, message);
      const result = await action();
      return result;
    } finally {
      stopLoading(key);
    }
  };
  
  return {
    startLoading,
    stopLoading,
    isLoading,
    getMessage,
    withLoadingState,
  };
}