// lib/stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authClient } from '@/lib/auth-client';
import { Organization } from 'better-auth/plugins';
import { User, UserRole } from '@/types';


interface AuthState {
  // State
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  lastFetch: number;
  
  // Actions
  setUser: (user: User | null) => void;
  setOrganization: (org: Organization | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Async actions
  fetchSession: () => Promise<void>;
  fetchOrganization: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearAuth: () => void;
}

const AUTH_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      organization: null,
      isLoading: false,
      lastFetch: 0,

      // Synchronous actions
      setUser: (user) => set({ 
        user: user
          ? { 
              ...user, 
              role: user.role  // Default to UserRole.USER if missing
            }
          : null 
      }),
      setOrganization: (org) => set({ organization: org }),
      setLoading: (loading) => set({ isLoading: loading }),

      // Fetch session data
      fetchSession: async () => {
        try {
          const { data } = authClient.useSession();
          set({ 
            user: data?.user
              ? {
                  ...data.user,
                  role: (data.user.role as UserRole), // Provide a default role if missing
                  image: data.user.image ?? undefined, // Ensure image is string or undefined, never null
                  banned: data.user.banned === null ? undefined : data.user.banned, // Ensure banned is boolean or undefined
                  banReason: data.user.banReason === null ? undefined : data.user.banReason, // Ensure banReason is string or undefined
                  banExpires: data.user.banExpires === null ? undefined : data.user.banExpires // Ensure banExpires is Date or undefined
                }
              : null 
          });
        } catch (error) {
          console.error('Failed to fetch session:', error);
          set({ user: null });
        }
      },

      // Fetch organization data
      fetchOrganization: async () => {
        try {
          const { data } = authClient.useActiveOrganization();
          set({ organization: data || null });
        } catch (error) {
          console.error('Failed to fetch organization:', error);
          set({ organization: null });
        }
      },

      // Initialize auth data (with caching)
      initializeAuth: async () => {
        const now = Date.now();
        const { lastFetch, isLoading } = get();
        
        // Skip if recently fetched or already loading
        if (isLoading || (now - lastFetch < AUTH_CACHE_DURATION)) {
          return;
        }

        set({ isLoading: true });
        
        try {
          // Fetch both session and organization in parallel
          await Promise.all([
            get().fetchSession(),
            get().fetchOrganization(),
          ]);
          
          set({ lastFetch: now });
        } catch (error) {
          console.error('Failed to initialize auth:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Clear all auth data
      clearAuth: () => set({ 
        user: null, 
        organization: null, 
        isLoading: false, 
        lastFetch: 0 
      }),
    }),
    {
      name: 'auth-store', // localStorage key
      partialize: (state) => ({
        // Only persist non-sensitive data
        user: state.user,
        organization: state.organization,
        lastFetch: state.lastFetch,
      }),
    }
  )
);