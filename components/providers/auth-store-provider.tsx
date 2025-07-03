// components/providers/auth-store-provider.tsx
"use client";

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function AuthStoreProvider({ children }: { children: ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize auth data when app loads
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}